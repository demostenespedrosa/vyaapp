-- =====================================================================================
-- MIGRAÇÃO: Sistema de Avaliações + Reputação
-- Execute este script no Supabase Dashboard → SQL Editor
-- =====================================================================================

-- 1. Adicionar coluna rating_count ao profiles (se ainda não existir)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- 2. Corrigir o default do rating para 0 (novos usuários começam do zero)
ALTER TABLE public.profiles
  ALTER COLUMN rating SET DEFAULT 0;

-- 3. Zerar rating dos usuários sem nenhuma avaliação (opcional — mantém consistência)
-- UPDATE public.profiles SET rating = 0, rating_count = 0 WHERE rating_count = 0;

-- 4. Criar tabela de avaliações
CREATE TABLE IF NOT EXISTS public.ratings (
    id           UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
    from_user_id UUID         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    to_user_id   UUID         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    package_id   UUID         REFERENCES public.packages(id) ON DELETE SET NULL,
    score        INTEGER      NOT NULL CHECK (score BETWEEN 1 AND 5),
    comment      TEXT,
    created_at   TIMESTAMPTZ  DEFAULT NOW(),
    CONSTRAINT no_self_rating CHECK (from_user_id <> to_user_id)
);

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_ratings_to_user   ON public.ratings (to_user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_from_user ON public.ratings (from_user_id);

-- 5. Habilitar RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de segurança
-- Qualquer usuário autenticado pode ver avaliações
CREATE POLICY "Autenticados visualizam avaliações"
  ON public.ratings FOR SELECT
  USING (auth.role() = 'authenticated');

-- Apenas o autor pode inserir (e não pode se autoavaliar — já garantido pelo CHECK)
CREATE POLICY "Usuário avalia outros"
  ON public.ratings FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- 7. Função que recalcula rating e rating_count do usuário avaliado
CREATE OR REPLACE FUNCTION public.recalculate_user_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_score NUMERIC(3,2);
  total     INTEGER;
BEGIN
  SELECT ROUND(AVG(score)::NUMERIC, 2), COUNT(*)
  INTO avg_score, total
  FROM public.ratings
  WHERE to_user_id = NEW.to_user_id;

  UPDATE public.profiles
  SET rating       = COALESCE(avg_score, 0),
      rating_count = COALESCE(total, 0)
  WHERE id = NEW.to_user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger: dispara após cada INSERT em ratings
DROP TRIGGER IF EXISTS on_rating_created ON public.ratings;
CREATE TRIGGER on_rating_created
  AFTER INSERT ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_user_rating();

-- 9. Atualizar a função handle_new_user para garantir rating = 0 em novos cadastros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, rating, rating_count)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário VYA'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'cliente'),
    0,
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
