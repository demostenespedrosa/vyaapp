import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

/**
 * POST /api/webhooks/asaas
 *
 * Recebe eventos do Asaas (ex.: PAYMENT_RECEIVED).
 * Configurar no painel Asaas: Minha Conta → Configurações → Webhooks
 *
 * Env vars:
 *   ASAAS_WEBHOOK_TOKEN — token configurado no painel para validação
 */
export async function POST(req: NextRequest) {
  // ── Validação do token do webhook ───────────────────────────────────────
  const webhookToken = req.headers.get('asaas-access-token');
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;

  // Se o token estiver configurado, valida; caso contrário, aceita em dev
  if (expectedToken && webhookToken !== expectedToken) {
    console.warn('[webhook/asaas] Token inválido recebido.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido.' }, { status: 400 });
  }

  const event = body.event as string;
  const paymentData = body.payment as Record<string, unknown> | undefined;

  console.log(`[webhook/asaas] Evento recebido: ${event}`);

  // ── Só processa confirmação de pagamento ────────────────────────────────
  if (event !== 'PAYMENT_RECEIVED' && event !== 'PAYMENT_CONFIRMED') {
    return NextResponse.json({ received: true, skipped: true });
  }

  if (!paymentData?.id) {
    return NextResponse.json({ error: 'payment.id ausente.' }, { status: 400 });
  }

  const asaasPaymentId = paymentData.id as string;
  const admin = createAdminClient();

  // ── Busca o pacote pelo asaas_payment_id ────────────────────────────────
  const { data: pkg, error: pkgErr } = await admin
    .from('packages')
    .select('id, sender_id, trip_id, price, status')
    .eq('asaas_payment_id', asaasPaymentId)
    .maybeSingle();

  if (pkgErr || !pkg) {
    console.warn(`[webhook/asaas] Pacote não encontrado para payment ${asaasPaymentId}`);
    // Retorna 200 para o Asaas não ficar re-tentando
    return NextResponse.json({ received: true, found: false });
  }

  if (pkg.status !== 'waiting_payment') {
    console.info(`[webhook/asaas] Pacote ${pkg.id} já está em status '${pkg.status}'. Ignorando.`);
    return NextResponse.json({ received: true, already_processed: true });
  }

  // ── Atualiza status do pacote para waiting_pickup ───────────────────────
  const { error: updateErr } = await admin
    .from('packages')
    .update({ status: 'waiting_pickup' })
    .eq('id', pkg.id);

  if (updateErr) {
    console.error('[webhook/asaas] Erro ao atualizar status do pacote:', updateErr);
    return NextResponse.json({ error: 'Erro ao atualizar pacote.' }, { status: 500 });
  }

  // ── Credita o viajante (se houver trip associado) ───────────────────────
  if (pkg.trip_id) {
    // Busca o traveler_id da viagem
    const { data: trip } = await admin
      .from('trips')
      .select('traveler_id')
      .eq('id', pkg.trip_id)
      .maybeSingle();

    if (trip?.traveler_id) {
      // Busca a taxa da plataforma na tabela configs
      const { data: cfgRow } = await admin
        .from('configs')
        .select('value')
        .eq('key', 'platformFeePercent')
        .maybeSingle();

      const platformFeePercent = cfgRow?.value ? Number(cfgRow.value) : 20;
      const travelerAmount = Number(pkg.price) * (1 - platformFeePercent / 100);

      // Chama a função que faz upsert da carteira + registra transação
      const { error: walletErr } = await admin.rpc('upsert_wallet_credit', {
        p_user_id: trip.traveler_id,
        p_amount: Number(travelerAmount.toFixed(2)),
        p_package_id: pkg.id,
      });

      if (walletErr) {
        console.error('[webhook/asaas] Erro ao creditar carteira:', walletErr);
        // Não retorna erro — o status do pacote já foi atualizado com sucesso
      } else {
        console.info(
          `[webhook/asaas] Viajante ${trip.traveler_id} creditado com R$ ${travelerAmount.toFixed(2)}`
        );
      }
    }
  }

  // ── Cria notificação para o remetente ───────────────────────────────────
  await admin.from('notifications').insert({
    user_id: pkg.sender_id,
    title: 'Pagamento Confirmado! 🎉',
    message: 'Seu PIX foi recebido. O viajante está indo buscar seu pacote.',
    type: 'shipment',
  });

  console.info(`[webhook/asaas] Pacote ${pkg.id} processado com sucesso.`);
  return NextResponse.json({ received: true, packageId: pkg.id });
}
