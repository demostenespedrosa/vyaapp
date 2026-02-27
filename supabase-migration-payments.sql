-- =====================================================================================
-- VYA APP - MIGRATION: SISTEMA DE PAGAMENTOS PIX (Asaas)
-- =====================================================================================
-- Execute este script no SQL Editor do Supabase APÓS o schema principal.
-- =====================================================================================

-- 1. ALTERAR A TABELA packages
-- -----------------------------------------------------------------------

-- Adicionar colunas de pagamento (IF NOT EXISTS para idempotência)
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS asaas_payment_id TEXT;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS pix_qr_code      TEXT;    -- imagem base64
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS pix_copy_paste   TEXT;    -- string copia-e-cola
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS expires_at        TIMESTAMPTZ; -- exp. do PIX (1h)

-- Recriar a CHECK constraint de status para incluir 'waiting_payment'
ALTER TABLE public.packages DROP CONSTRAINT IF EXISTS packages_status_check;
ALTER TABLE public.packages ADD CONSTRAINT packages_status_check CHECK (status IN (
    'searching',        -- Remetente criou, aguardando match
    'waiting_payment',  -- Viajante aceitou, aguardando pagamento do remetente
    'waiting_pickup',   -- PIX confirmado, viajante indo buscar
    'transit',          -- Em trânsito (usou pickup_code)
    'waiting_delivery', -- Chegou na cidade destino
    'delivered',        -- Entregue (usou delivery_code)
    'canceled'          -- Cancelado
));

-- 2. CRIAR TABELA wallets (carteira interna por usuário)
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wallets (
    id                UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id           UUID          REFERENCES public.profiles(id) ON DELETE CASCADE,
    pending_balance   NUMERIC(10,2) DEFAULT 0 NOT NULL,   -- Pagos mas em custódia
    available_balance NUMERIC(10,2) DEFAULT 0 NOT NULL,   -- Disponível para saque
    total_earned      NUMERIC(10,2) DEFAULT 0 NOT NULL,   -- Acumulado histórico
    created_at        TIMESTAMPTZ   DEFAULT NOW(),
    CONSTRAINT wallets_user_id_unique UNIQUE(user_id)
);

-- 3. CRIAR TABELA wallet_transactions (extrato detalhado)
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id          UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_id   UUID          REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
    package_id  UUID          REFERENCES public.packages(id) ON DELETE SET NULL,
    amount      NUMERIC(10,2) NOT NULL,
    type        TEXT          NOT NULL CHECK (type IN ('CREDIT', 'WITHDRAWAL')),
    status      TEXT          NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    description TEXT,
    created_at  TIMESTAMPTZ   DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id       ON public.wallets (user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet_id   ON public.wallet_transactions (wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_package_id  ON public.wallet_transactions (package_id);
CREATE INDEX IF NOT EXISTS idx_packages_asaas_id     ON public.packages (asaas_payment_id);

-- 4. ROW LEVEL SECURITY
-- -----------------------------------------------------------------------
ALTER TABLE public.wallets              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions  ENABLE ROW LEVEL SECURITY;

-- Wallets: usuário vê e atualiza apenas a sua própria carteira
CREATE POLICY "Usuário vê própria carteira"
    ON public.wallets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuário atualiza própria carteira"
    ON public.wallets FOR UPDATE
    USING (auth.uid() = user_id);

-- Wallet transactions: usuário vê apenas as transações da sua carteira
CREATE POLICY "Usuário vê próprias transações"
    ON public.wallet_transactions FOR SELECT
    USING (wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid()));

-- Admin pode ver tudo
CREATE POLICY "Admin vê todas as carteiras"
    ON public.wallets FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admin vê todas as transações"
    ON public.wallet_transactions FOR SELECT
    USING (public.is_admin());

-- 5. FUNÇÃO: upsert_wallet_credit (service-role usa para creditar viajante)
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.upsert_wallet_credit(
    p_user_id   UUID,
    p_amount    NUMERIC,
    p_package_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_wallet_id UUID;
BEGIN
    -- Garante que a carteira existe
    INSERT INTO public.wallets (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = p_user_id;

    -- Adiciona ao pending_balance e ao total_earned
    UPDATE public.wallets
    SET pending_balance = pending_balance + p_amount,
        total_earned    = total_earned    + p_amount
    WHERE id = v_wallet_id;

    -- Registra a transação
    INSERT INTO public.wallet_transactions (wallet_id, package_id, amount, type, status, description)
    VALUES (v_wallet_id, p_package_id, p_amount, 'CREDIT', 'PENDING', 'Repasse de frete recebido');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNÇÃO: release_pending_to_available (chamada após período de custódia)
-- -----------------------------------------------------------------------
-- Exemplo de uso manual pelo admin: SELECT public.release_funds('<wallet_id>');
CREATE OR REPLACE FUNCTION public.release_pending_to_available(p_wallet_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.wallets
    SET available_balance = available_balance + pending_balance,
        pending_balance   = 0
    WHERE id = p_wallet_id;

    UPDATE public.wallet_transactions
    SET status = 'COMPLETED'
    WHERE wallet_id = p_wallet_id
      AND type = 'CREDIT'
      AND status = 'PENDING';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
