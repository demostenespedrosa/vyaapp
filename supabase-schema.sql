-- =====================================================================================
-- VYA APP - SUPABASE DATABASE SCHEMA
-- =====================================================================================
-- Este script cria todas as tabelas, relacionamentos e políticas de segurança (RLS)
-- necessárias para fazer o sistema do Remetente, Viajante e Admin conversarem.
-- =====================================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================================
-- 2. TABELAS PRINCIPAIS
-- =====================================================================================

-- Tabela de Perfis de Usuários (Estende a tabela auth.users do Supabase)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    cpf TEXT UNIQUE,
    phone TEXT,
    role TEXT DEFAULT 'cliente' CHECK (role IN ('cliente', 'admin')),
    avatar_url TEXT,
    rating NUMERIC(3,2) DEFAULT 5.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de Documentos (Para aprovação de CNH/RG no Perfil e Admin)
CREATE TABLE public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('cnh', 'rg')),
    document_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de Veículos (Para a tela de Veículos do Viajante)
CREATE TABLE public.vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Carro', 'Moto', 'Caminhonete')),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    color TEXT NOT NULL,
    plate TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de Viagens (Criadas pelo Viajante no TripForm)
CREATE TABLE public.trips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    traveler_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    origin_city TEXT NOT NULL,
    origin_state TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    destination_state TEXT NOT NULL,
    departure_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    available_capacity TEXT NOT NULL CHECK (available_capacity IN ('P', 'M', 'G')),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'canceled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de Pacotes/Envios (Criados pelo Remetente no PackageForm)
CREATE TABLE public.packages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL, -- Fica NULL até um viajante aceitar
    
    -- Dados do Pacote
    description TEXT NOT NULL,
    size TEXT NOT NULL CHECK (size IN ('P', 'M', 'G')),
    weight_category TEXT,
    
    -- Rota
    origin_address TEXT NOT NULL,
    origin_city TEXT NOT NULL,
    origin_state TEXT NOT NULL,
    destination_address TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    destination_state TEXT NOT NULL,
    
    -- Destinatário
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    recipient_cpf TEXT NOT NULL,
    
    -- Valores e Códigos
    price NUMERIC(10,2) NOT NULL,
    pickup_code TEXT NOT NULL, -- Código gerado para o viajante coletar
    delivery_code TEXT NOT NULL, -- Código gerado para o destinatário receber
    
    -- Status do Fluxo Logístico
    status TEXT DEFAULT 'searching' CHECK (status IN (
        'searching',        -- Remetente criou, aguardando match com viagem
        'waiting_pickup',   -- Viajante aceitou, indo buscar
        'transit',          -- Viajante coletou (usou pickup_code)
        'waiting_delivery', -- Viajante chegou na cidade destino
        'delivered',        -- Entregue (usou delivery_code)
        'canceled'          -- Cancelado
    )),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de Notificações (Para o Admin enviar Push Notifications)
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Se NULL, é para todos
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'system' CHECK (type IN ('system', 'promo', 'alert', 'shipment')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de Cidades (Para o Admin gerenciar cidades atendidas)
CREATE TABLE public.cities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    hubs INTEGER DEFAULT 0,
    lat NUMERIC(10,6),
    lng NUMERIC(10,6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de Rotas (Para o Admin gerenciar rotas predefinidas)
CREATE TABLE public.routes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    distance_km NUMERIC(10,2) NOT NULL,
    average_duration_min INTEGER NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de Transações (Para o Admin gerenciar o financeiro)
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('payment', 'withdrawal')),
    amount NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================================================
-- 3. TRIGGERS E FUNÇÕES AUTOMÁTICAS
-- =====================================================================================

-- Função para criar um perfil automaticamente quando um usuário se cadastra no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário VYA'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'cliente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que escuta a tabela auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers de updated_at
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================================
-- 4. POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- =====================================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Função segura para checar se é admin (evita recursão infinita)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Políticas para Profiles
CREATE POLICY "Usuários podem ver seus próprios perfis" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins podem ver todos os perfis" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para Veículos
CREATE POLICY "Usuários veem seus veículos" ON public.vehicles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins veem todos os veículos" ON public.vehicles FOR SELECT USING (public.is_admin());
CREATE POLICY "Usuários inserem seus veículos" ON public.vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins atualizam status de veículos" ON public.vehicles FOR UPDATE USING (public.is_admin());

-- Políticas para Viagens (Trips)
CREATE POLICY "Todos podem ver viagens ativas" ON public.trips FOR SELECT USING (status IN ('scheduled', 'active'));
CREATE POLICY "Viajantes veem suas próprias viagens" ON public.trips FOR SELECT USING (auth.uid() = traveler_id);
CREATE POLICY "Viajantes criam suas viagens" ON public.trips FOR INSERT WITH CHECK (auth.uid() = traveler_id);
CREATE POLICY "Viajantes atualizam suas viagens" ON public.trips FOR UPDATE USING (auth.uid() = traveler_id);

-- Políticas para Pacotes (Packages)
-- Remetente vê seus pacotes
CREATE POLICY "Remetentes veem seus pacotes" ON public.packages FOR SELECT USING (auth.uid() = sender_id);
-- Viajante vê pacotes atrelados à sua viagem
CREATE POLICY "Viajantes veem pacotes de suas viagens" ON public.packages FOR SELECT USING (
    trip_id IN (SELECT id FROM public.trips WHERE traveler_id = auth.uid())
);
-- Viajantes veem pacotes "searching" (para poderem aceitar)
CREATE POLICY "Viajantes veem pacotes buscando match" ON public.packages FOR SELECT USING (status = 'searching');
-- Remetente cria pacote
CREATE POLICY "Remetentes criam pacotes" ON public.packages FOR INSERT WITH CHECK (auth.uid() = sender_id);
-- Remetente e Viajante (atrelado) podem atualizar o pacote
CREATE POLICY "Atualização de pacotes" ON public.packages FOR UPDATE USING (
    auth.uid() = sender_id OR 
    trip_id IN (SELECT id FROM public.trips WHERE traveler_id = auth.uid())
);

-- Políticas para Notificações
CREATE POLICY "Usuários veem suas notificações" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins criam notificações" ON public.notifications FOR INSERT WITH CHECK (public.is_admin());
