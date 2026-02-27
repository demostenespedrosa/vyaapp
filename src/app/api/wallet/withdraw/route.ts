import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createClient } from '@supabase/supabase-js';
import { createTransfer } from '@/lib/asaas';
import { cookies } from 'next/headers';

/**
 * POST /api/wallet/withdraw
 *
 * Solicita saque do saldo disponível para a chave PIX cadastrada no perfil.
 * O viajante deve ter 'pix_key' e 'pix_key_type' preenchidos no perfil.
 *
 * Body: { pixKey?: string, pixKeyType?: 'CPF'|'CNPJ'|'EMAIL'|'PHONE'|'EVP' }
 * (se não informados, usa os dados do perfil)
 */
export async function POST(req: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Cookie: cookieStore.toString() } },
  });
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const admin = createAdminClient();

  // ── Busca a carteira do usuário ──────────────────────────────────────────
  const { data: wallet, error: walletErr } = await admin
    .from('wallets')
    .select('id, available_balance')
    .eq('user_id', user.id)
    .maybeSingle();

  if (walletErr || !wallet) {
    return NextResponse.json({ error: 'Carteira não encontrada.' }, { status: 404 });
  }

  const available = Number(wallet.available_balance);
  if (available <= 0) {
    return NextResponse.json(
      { error: 'Saldo disponível insuficiente para saque.' },
      { status: 422 }
    );
  }

  // ── Busca chave PIX do perfil ou do body ─────────────────────────────────
  let pixKey: string | null = null;
  let pixKeyType: string | null = null;

  try {
    const body = await req.json();
    pixKey = body.pixKey ?? null;
    pixKeyType = body.pixKeyType ?? null;
  } catch {
    // Body vazio — usa dados do perfil
  }

  if (!pixKey || !pixKeyType) {
    const { data: profile } = await admin
      .from('profiles')
      .select('cpf, email, phone')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.cpf) {
      pixKey = profile.cpf.replace(/\D/g, '');
      pixKeyType = 'CPF';
    } else if (profile?.email) {
      pixKey = profile.email;
      pixKeyType = 'EMAIL';
    } else if (profile?.phone) {
      pixKey = profile.phone;
      pixKeyType = 'PHONE';
    }
  }

  if (!pixKey || !pixKeyType) {
    return NextResponse.json(
      { error: 'Chave PIX não configurada no perfil. Informe pixKey e pixKeyType.' },
      { status: 422 }
    );
  }

  // ── Zera saldo disponível (optimistic lock) ──────────────────────────────
  const { error: debitErr } = await admin
    .from('wallets')
    .update({ available_balance: 0 })
    .eq('id', wallet.id)
    .eq('available_balance', available); // garante que não houve mudança concorrente

  if (debitErr) {
    return NextResponse.json(
      { error: 'Conflito ao processar saque. Tente novamente.' },
      { status: 409 }
    );
  }

  // ── Registra a transação de saque (PENDING) ──────────────────────────────
  const { data: txRecord, error: txErr } = await admin
    .from('wallet_transactions')
    .insert({
      wallet_id: wallet.id,
      amount: available,
      type: 'WITHDRAWAL',
      status: 'PENDING',
      description: `Saque PIX para ${pixKey}`,
    })
    .select('id')
    .single();

  if (txErr) {
    // Desfaz o débito do saldo
    await admin
      .from('wallets')
      .update({ available_balance: available })
      .eq('id', wallet.id);
    return NextResponse.json({ error: 'Erro ao registrar transação.' }, { status: 500 });
  }

  // ── Dispara a transferência no Asaas ─────────────────────────────────────
  try {
    await createTransfer({
      value: available,
      pixAddressKey: pixKey,
      pixAddressKeyType: pixKeyType as 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP',
      description: `Repasse VYA — Saque #${txRecord.id.substring(0, 8)}`,
    });

    // Marca transação como COMPLETED
    await admin
      .from('wallet_transactions')
      .update({ status: 'COMPLETED' })
      .eq('id', txRecord.id);

    return NextResponse.json({
      success: true,
      amount: available,
      message: `Saque de R$ ${available.toFixed(2)} iniciado com sucesso.`,
    });
  } catch (asaasError: unknown) {
    console.error('[withdraw] Asaas transfer error:', asaasError);

    // Reverte saldo e marca transação como FAILED
    await admin
      .from('wallets')
      .update({ available_balance: available })
      .eq('id', wallet.id);

    await admin
      .from('wallet_transactions')
      .update({ status: 'FAILED' })
      .eq('id', txRecord.id);

    return NextResponse.json(
      {
        error: 'Falha ao processar transferência PIX. Saldo restaurado.',
        details: String(asaasError),
      },
      { status: 502 }
    );
  }
}
