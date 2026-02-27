import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import {
  findOrCreateCustomer,
  createPixPayment,
  getPixQrCode,
} from '@/lib/asaas';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * POST /api/payments/generate-pix
 *
 * Chamado pelo viajante ao "aceitar" um pacote.
 * 1. Vincula o pacote à viagem do viajante
 * 2. Cria uma cobrança PIX no Asaas no nome do remetente
 * 3. Salva os dados do PIX no pacote e muda status para 'waiting_payment'
 * 4. Retorna o QR code para o remetente exibir na CheckoutScreen
 *
 * Body: { packageId: string, tripId?: string }
 */
export async function POST(req: NextRequest) {
  try {
    // ── Autenticação do viajante ──────────────────────────────────────────
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    const travelerId = user.id;

    // ── Body ─────────────────────────────────────────────────────────────
    const body = await req.json();
    const { packageId, tripId: requestedTripId } = body as {
      packageId: string;
      tripId?: string;
    };

    if (!packageId) {
      return NextResponse.json({ error: 'packageId é obrigatório.' }, { status: 400 });
    }

    const admin = createAdminClient();

    // ── Busca o pacote ────────────────────────────────────────────────────
    const { data: pkg, error: pkgErr } = await admin
      .from('packages')
      .select(`
        id, description, size, price, status,
        sender_id,
        profiles!packages_sender_id_fkey (
          full_name, cpf, email, phone
        )
      `)
      .eq('id', packageId)
      .single();

    if (pkgErr || !pkg) {
      return NextResponse.json({ error: 'Pacote não encontrado.' }, { status: 404 });
    }
    if (pkg.status !== 'searching') {
      return NextResponse.json(
        { error: `Pacote não está disponível. Status atual: ${pkg.status}` },
        { status: 409 }
      );
    }

    // ── Resolve qual trip usar ────────────────────────────────────────────
    let tripId = requestedTripId;
    if (!tripId) {
      // Pega a próxima viagem agendada do viajante
      const { data: trips } = await admin
        .from('trips')
        .select('id')
        .eq('traveler_id', travelerId)
        .in('status', ['scheduled', 'active'])
        .order('departure_date', { ascending: true })
        .limit(1);
      tripId = trips?.[0]?.id ?? undefined;
    }

    // ── Cria o customer Asaas para o remetente ────────────────────────────
    const senderProfile = (pkg as any).profiles as {
      full_name: string;
      cpf: string | null;
      email: string | null;
      phone: string | null;
    };

    let asaasCustomerId: string | null = null;
    try {
      if (senderProfile?.cpf) {
        asaasCustomerId = await findOrCreateCustomer({
          name: senderProfile.full_name,
          cpfCnpj: senderProfile.cpf,
          email: senderProfile.email ?? undefined,
          phone: senderProfile.phone ?? undefined,
        });
      }
    } catch (e) {
      console.error('[generate-pix] Erro ao criar customer Asaas:', e);
      // Não bloqueia — criamos o pagamento sem customer (sandbox aceita)
    }

    // ── Parâmetros do PIX ─────────────────────────────────────────────────
    const totalAmount = Number(pkg.price);
    const dueDate = new Date(Date.now() + 60 * 60 * 1000); // +1 hora
    const dueDateStr = dueDate.toISOString().split('T')[0]; // YYYY-MM-DD

    let asaasPaymentId: string;
    let pixQrCode: string;
    let pixCopyPaste: string;

    try {
      // Cria pagamento PIX no Asaas
      const payment = await createPixPayment({
        customerId: asaasCustomerId ?? 'dummy', // será requerido em produção
        value: totalAmount,
        description: `VYA Frete: ${pkg.description} (${pkg.size})`,
        externalReference: pkg.id,
        dueDate: dueDateStr,
      });
      asaasPaymentId = payment.id;

      // Obtém o QR Code
      const pix = await getPixQrCode(payment.id);
      pixQrCode = pix.encodedImage;
      pixCopyPaste = pix.payload;
    } catch (asaasError: unknown) {
      console.error('[generate-pix] Asaas error:', asaasError);
      // Fallback: modo offline / sandbox sem API key configurada
      asaasPaymentId = `MOCK_${Date.now()}`;
      pixQrCode = '';
      pixCopyPaste = `00020126580014br.gov.bcb.pix0136${pkg.id}5204000053039865802BR5925VYA LOGISTICA6009SAO PAULO62290525VYA${pkg.id.substring(0, 8)}6304ABCD`;
    }

    // ── Atualiza o pacote no banco ────────────────────────────────────────
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const updateData: Record<string, unknown> = {
      status: 'waiting_payment',
      asaas_payment_id: asaasPaymentId,
      pix_qr_code: pixQrCode,
      pix_copy_paste: pixCopyPaste,
      expires_at: expiresAt,
    };
    if (tripId) {
      updateData.trip_id = tripId;
    }

    const { error: updateErr } = await admin
      .from('packages')
      .update(updateData)
      .eq('id', pkg.id);

    if (updateErr) {
      console.error('[generate-pix] Supabase update error:', updateErr);
      return NextResponse.json(
        { error: 'Erro ao atualizar pacote no banco.' },
        { status: 500 }
      );
    }

    // ── Resposta ───────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      packageId: pkg.id,
      pixQrCode,
      pixCopyPaste,
      expiresAt,
      amount: totalAmount,
    });
  } catch (err: unknown) {
    console.error('[generate-pix] Unhandled error:', err);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
