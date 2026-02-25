-- =====================================================================================
-- MIGRAÇÃO: Sistema de Indicação (Indique e Ganhe)
-- Execute no Supabase Dashboard → SQL Editor
-- =====================================================================================

-- 1. Adicionar colunas ao profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles (referral_code);

-- 2. Criar tabela de indicações
CREATE TABLE IF NOT EXISTS public.referrals (
    id           UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id  UUID         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_id  UUID         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status       TEXT         NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'credited')),
    bonus_amount NUMERIC(10,2) NOT NULL DEFAULT 5.00,
    credited_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  DEFAULT NOW(),
    CONSTRAINT no_self_referral  CHECK (referrer_id <> referred_id),
    CONSTRAINT unique_referral   UNIQUE (referrer_id, referred_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals (referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals (referred_id);

-- 3. Habilitar RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Usuário vê suas próprias indicações (como quem indicou)
CREATE POLICY "Referrer vê suas indicações"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

-- Usuário insere indicações de si mesmo
CREATE POLICY "Sistema insere indicações"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

-- Admin atualiza status (credited)
CREATE POLICY "Admin atualiza indicações"
  ON public.referrals FOR UPDATE
  USING (public.is_admin());

-- 4. Função para gerar código único de indicação
CREATE OR REPLACE FUNCTION public.generate_referral_code(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  attempts INT := 0;
BEGIN
  LOOP
    -- 8 chars alfanuméricos em maiúsculo, excluindo caracteres ambíguos (0, O, I, L)
    code := upper(substring(replace(replace(replace(replace(
      encode(gen_random_bytes(6), 'base64'),
      '0', 'A'), 'O', 'B'), 'I', 'C'), 'L', 'D')
    FROM 1 FOR 8));

    -- Verifica unicidade
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code) THEN
      UPDATE public.profiles SET referral_code = code WHERE id = user_id;
      RETURN code;
    END IF;

    attempts := attempts + 1;
    IF attempts > 10 THEN
      RAISE EXCEPTION 'Não foi possível gerar código único após 10 tentativas';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Atualizar handle_new_user para gerar referral_code e registrar indicação
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  code          TEXT;
  referrer_row  public.profiles%ROWTYPE;
BEGIN
  -- Gera código de indicação único
  LOOP
    code := upper(substring(replace(replace(replace(replace(
      encode(gen_random_bytes(6), 'base64'),
      '0', 'A'), 'O', 'B'), 'I', 'C'), 'L', 'D')
    FROM 1 FOR 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code);
  END LOOP;

  -- Insere o perfil
  INSERT INTO public.profiles (id, full_name, email, role, rating, rating_count, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário VYA'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'cliente'),
    0,
    0,
    code
  )
  ON CONFLICT (id) DO NOTHING;

  -- Se veio com referral_code de quem indicou, registra a indicação
  IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
    SELECT * INTO referrer_row
    FROM public.profiles
    WHERE referral_code = upper(trim(NEW.raw_user_meta_data->>'referral_code'))
    LIMIT 1;

    IF referrer_row.id IS NOT NULL THEN
      -- Vincula o referred_by no novo perfil
      UPDATE public.profiles
      SET referred_by = referrer_row.id
      WHERE id = NEW.id;

      -- Cria a linha de indicação como 'pending'
      INSERT INTO public.referrals (referrer_id, referred_id, status, bonus_amount)
      VALUES (referrer_row.id, NEW.id, 'pending', 5.00)
      ON CONFLICT (referrer_id, referred_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Função + trigger: credita o bônus quando o indicado completa o primeiro envio
CREATE OR REPLACE FUNCTION public.credit_referral_on_first_delivery()
RETURNS TRIGGER AS $$
DECLARE
  ref_row public.referrals%ROWTYPE;
BEGIN
  -- Só age quando o status muda para 'delivered'
  IF NEW.status <> 'delivered' OR OLD.status = 'delivered' THEN
    RETURN NEW;
  END IF;

  -- Verifica se é o primeiro pacote entregue deste remetente
  IF (SELECT COUNT(*) FROM public.packages
      WHERE sender_id = NEW.sender_id AND status = 'delivered') > 1 THEN
    RETURN NEW;
  END IF;

  -- Busca indicação pendente para este usuário (como indicado)
  SELECT r.* INTO ref_row
  FROM public.referrals r
  JOIN public.profiles p ON p.id = NEW.sender_id
  WHERE r.referred_id = NEW.sender_id
    AND r.status = 'pending'
  LIMIT 1;

  IF ref_row.id IS NOT NULL THEN
    -- Credita a indicação
    UPDATE public.referrals
    SET status      = 'credited',
        credited_at = NOW()
    WHERE id = ref_row.id;

    -- Cria transação de crédito para o indicador
    INSERT INTO public.transactions (user_id, type, amount, status)
    VALUES (ref_row.referrer_id, 'payment', ref_row.bonus_amount, 'completed');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_package_delivered ON public.packages;
CREATE TRIGGER on_package_delivered
  AFTER UPDATE OF status ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.credit_referral_on_first_delivery();

-- 7. Gerar referral_code para usuários existentes que não têm
DO $$
DECLARE
  u RECORD;
  code TEXT;
BEGIN
  FOR u IN SELECT id FROM public.profiles WHERE referral_code IS NULL LOOP
    LOOP
      code := upper(substring(replace(replace(replace(replace(
        encode(gen_random_bytes(6), 'base64'),
        '0', 'A'), 'O', 'B'), 'I', 'C'), 'L', 'D')
      FROM 1 FOR 8));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code);
    END LOOP;
    UPDATE public.profiles SET referral_code = code WHERE id = u.id;
  END LOOP;
END;
$$;
