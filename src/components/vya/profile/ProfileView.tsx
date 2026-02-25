"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  User, 
  Shield, 
  Car, 
  ChevronRight, 
  LogOut, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Settings,
  Star,
  HelpCircle,
  FileText,
  Lock,
  Gift,
  Copy,
  Share2,
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  cpf: string;
  phone: string;
  avatar_url?: string;
}

interface ProfileViewProps {
  mode: 'sender' | 'traveler';
  onModeChange: (mode: 'sender' | 'traveler') => void;
  onLogout: () => void;
  initialProfile?: UserProfile | null;
  onProfileUpdate?: (p: UserProfile | null) => void;
}

export function ProfileView({ mode, onModeChange, onLogout, initialProfile, onProfileUpdate }: ProfileViewProps) {
  const [activeScreen, setActiveScreen] = useState<'menu' | 'personal' | 'security' | 'vehicles' | 'ratings' | 'help' | 'terms' | 'privacy' | 'referral'>('menu');
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile ?? null);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      return;
    }
    // Fallback: busca direta se a prop não vier do parent
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, cpf, phone, avatar_url')
        .eq('id', session.user.id)
        .single();
      if (error) console.error('ProfileView: erro ao buscar perfil', error.message);
      if (data) setProfile({ ...data, email: session.user.email || '' });
    })();
  }, [initialProfile]);

  const handleProfileUpdate = (updated: UserProfile) => {
    setProfile(updated);
    onProfileUpdate?.(updated);
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?';

  const renderScreen = () => {
    switch (activeScreen) {
      case 'personal':
        return <PersonalDataScreen onBack={() => setActiveScreen('menu')} profile={profile} onProfileUpdate={handleProfileUpdate} />;
      case 'security':
        return <SecurityScreen onBack={() => setActiveScreen('menu')} />;
      case 'vehicles':
        return <VehiclesScreen onBack={() => setActiveScreen('menu')} />;
      case 'ratings':
        return <RatingsScreen onBack={() => setActiveScreen('menu')} profile={profile} mode={mode} />;
      case 'help':
        return <HelpScreen onBack={() => setActiveScreen('menu')} />;
      case 'terms':
        return <TermsScreen onBack={() => setActiveScreen('menu')} />;
      case 'privacy':
        return <PrivacyScreen onBack={() => setActiveScreen('menu')} />;
      case 'referral':
        return <ReferralScreen onBack={() => setActiveScreen('menu')} profile={profile} />;
      default:
        return (
          <div className="space-y-8 page-transition pb-32 pt-safe-area-top">
            <div className="text-center space-y-4 pt-6">
              <div className="relative inline-block">
                <div className="h-28 w-28 rounded-full bg-primary/10 mx-auto flex items-center justify-center text-primary text-4xl font-bold border-4 border-white shadow-xl">
                  {initials}
                </div>
                <div className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-secondary border-4 border-white flex items-center justify-center text-white shadow-md">
                  ✓
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile?.full_name || 'Carregando...'}</h2>
                <p className="text-sm text-muted-foreground font-medium">
                  {mode === 'traveler' ? 'Nível 5 • Super Viajante' : 'Remetente Frequente'}
                </p>
              </div>
            </div>

            <section className="space-y-3 px-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Painel do Usuário</h3>
              <Card className="rounded-[2.5rem] border-none shadow-sm bg-muted/30">
                <CardContent className="p-2 space-y-2">
                  <div className="flex items-center justify-between p-5 bg-white rounded-[2rem] shadow-sm">
                    <div className="space-y-0.5">
                      <Label className="text-base font-bold">Modo de Uso</Label>
                      <p className="text-xs text-muted-foreground">
                        {mode === 'sender' ? "Você está como Remetente" : "Você está como Viajante"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("text-[10px] font-bold uppercase transition-colors", mode === 'sender' ? 'text-primary' : 'text-muted-foreground')}>Mandar</span>
                      <Switch 
                        checked={mode === 'traveler'} 
                        onCheckedChange={(checked) => onModeChange(checked ? 'traveler' : 'sender')}
                        className="data-[state=checked]:bg-secondary"
                      />
                      <span className={cn("text-[10px] font-bold uppercase transition-colors", mode === 'traveler' ? 'text-secondary' : 'text-muted-foreground')}>Viajar</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-2 px-4">
              <button 
                onClick={() => setActiveScreen('personal')}
                className="w-full flex items-center justify-between p-4 bg-muted/20 rounded-3xl active:scale-[0.98] transition-all hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-500">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm">Meus Dados</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
              </button>

              <button 
                onClick={() => setActiveScreen('security')}
                className="w-full flex items-center justify-between p-4 bg-muted/20 rounded-3xl active:scale-[0.98] transition-all hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-green-50 text-green-500">
                    <Shield className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm">Segurança</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
              </button>

              {mode === 'traveler' && (
                <button 
                  onClick={() => setActiveScreen('vehicles')}
                  className="w-full flex items-center justify-between p-4 bg-muted/20 rounded-3xl active:scale-[0.98] transition-all hover:bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-500">
                      <Car className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm">Meus Veículos</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
                </button>
              )}

              <button className="w-full flex items-center justify-between p-4 bg-muted/20 rounded-3xl active:scale-[0.98] transition-all hover:bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-orange-50 text-orange-500">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm">Pagamentos</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
              </button>

              <button
                onClick={() => setActiveScreen('ratings')}
                className="w-full flex items-center justify-between p-4 bg-muted/20 rounded-3xl active:scale-[0.98] transition-all hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-yellow-50 text-yellow-500">
                    <Star className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm">Minhas Avaliações</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
              </button>

              <button
                onClick={() => setActiveScreen('referral')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl active:scale-[0.98] transition-all hover:from-primary/20 hover:to-secondary/20 border border-primary/10"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-primary text-white">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-sm block">Indique e Ganhe</span>
                    <span className="text-[10px] text-muted-foreground font-medium">Ganhe créditos por cada indicado!</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
              </button>
            </section>

            <section className="space-y-2 px-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Suporte &amp; Informações</h3>

              <button
                onClick={() => setActiveScreen('help')}
                className="w-full flex items-center justify-between p-4 bg-muted/20 rounded-3xl active:scale-[0.98] transition-all hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-500">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm">Ajuda &amp; Suporte</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
              </button>

              <button
                onClick={() => setActiveScreen('terms')}
                className="w-full flex items-center justify-between p-4 bg-muted/20 rounded-3xl active:scale-[0.98] transition-all hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm">Termos de Uso</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
              </button>

              <button
                onClick={() => setActiveScreen('privacy')}
                className="w-full flex items-center justify-between p-4 bg-muted/20 rounded-3xl active:scale-[0.98] transition-all hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm">Proteção de Dados</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
              </button>
              
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-between p-4 bg-red-50 rounded-3xl active:scale-[0.98] transition-all hover:bg-red-100 mt-4"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-white text-destructive">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm text-destructive">Sair da Conta</span>
                </div>
              </button>
            </section>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderScreen()}
    </div>
  );
}

function PersonalDataScreen({ onBack, profile, onProfileUpdate }: { onBack: () => void; profile: UserProfile | null; onProfileUpdate: (p: UserProfile) => void }) {
  const [docStatus, setDocStatus] = useState<'pending' | 'uploaded' | 'approved'>('pending');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('id', profile.id);
    if (!error) {
      onProfileUpdate({ ...profile, full_name: fullName, phone });
      setSavedMsg('Dados salvos com sucesso!');
      setTimeout(() => setSavedMsg(''), 3000);
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background animate-in slide-in-from-right-full duration-300 overflow-y-auto pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-black tracking-tight">Meus Dados</h1>
      </header>

      <div className="p-4 space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
              {profile?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'}
            </div>
            <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md border-2 border-background">
              <Camera className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nome Completo</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-14 rounded-2xl bg-muted/30 border-none font-medium" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">E-mail</Label>
            <Input value={profile?.email || ''} disabled type="email" className="h-14 rounded-2xl bg-muted/30 border-none font-medium opacity-70" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Telefone</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="h-14 rounded-2xl bg-muted/30 border-none font-medium" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">CPF</Label>
            <Input value={profile?.cpf || ''} disabled className="h-14 rounded-2xl bg-muted/30 border-none font-medium opacity-70" />
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold">Documentação</h3>
          <Card className="rounded-3xl border-2 border-dashed bg-muted/10">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              {docStatus === 'pending' ? (
                <>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Envie sua CNH ou RG</p>
                    <p className="text-xs text-muted-foreground mt-1">Necessário para verificação de identidade</p>
                  </div>
                  <Button onClick={() => setDocStatus('uploaded')} className="w-full rounded-2xl h-12 font-bold">
                    Escolher Arquivo
                  </Button>
                </>
              ) : docStatus === 'uploaded' ? (
                <>
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Em Análise</p>
                    <p className="text-xs text-muted-foreground mt-1">Seu documento está sendo verificado pela nossa equipe.</p>
                  </div>
                  <Button variant="outline" onClick={() => setDocStatus('pending')} className="w-full rounded-2xl h-12 font-bold">
                    Enviar Novamente
                  </Button>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Documento Aprovado</p>
                    <p className="text-xs text-muted-foreground mt-1">Sua identidade foi verificada com sucesso.</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {savedMsg && <p className="text-center text-sm text-green-600 font-bold">{savedMsg}</p>}
        <Button onClick={handleSave} disabled={isSaving} className="w-full h-14 rounded-2xl font-bold text-lg mt-8">
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
}

function SecurityScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-background animate-in slide-in-from-right-full duration-300 overflow-y-auto pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-black tracking-tight">Segurança</h1>
      </header>

      <div className="p-4 space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Autenticação</h3>
          
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Senha Atual</Label>
            <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl bg-muted/30 border-none font-medium" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nova Senha</Label>
            <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl bg-muted/30 border-none font-medium" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Confirmar Nova Senha</Label>
            <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl bg-muted/30 border-none font-medium" />
          </div>
          
          <Button className="w-full h-14 rounded-2xl font-bold mt-2">
            Atualizar Senha
          </Button>
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Configurações Adicionais</h3>
          
          <Card className="rounded-3xl border-none bg-muted/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Autenticação em 2 Fatores</Label>
                  <p className="text-xs text-muted-foreground">Maior segurança para sua conta</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Biometria / Face ID</Label>
                  <p className="text-xs text-muted-foreground">Acesso rápido pelo celular</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-8">
          <Button variant="destructive" className="w-full h-14 rounded-2xl font-bold bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none">
            Excluir Minha Conta
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Esta ação é irreversível e apagará todos os seus dados.
          </p>
        </div>
      </div>
    </div>
  );
}

type Vehicle = { id: string; type: string; brand: string; model: string; plate: string; color: string; status: string };

function VehiclesScreen({ onBack }: { onBack: () => void }) {
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setIsLoading(false); return; }
    const { data } = await supabase
      .from('vehicles')
      .select('id, type, brand, model, plate, color, status')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (data) setVehicles(data);
    setIsLoading(false);
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    await supabase.from('vehicles').delete().eq('id', id);
    setVehicles(prev => prev.filter(v => v.id !== id));
    setRemovingId(null);
  };

  if (isAddingVehicle) {
    return (
      <VehicleForm
        onBack={() => setIsAddingVehicle(false)}
        onComplete={() => { setIsAddingVehicle(false); fetchVehicles(); }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background animate-in slide-in-from-right-full duration-300 overflow-y-auto pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-black tracking-tight">Meus Veículos</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-24 rounded-3xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted/40 flex items-center justify-center">
              <Car className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="font-bold text-muted-foreground">Nenhum veículo cadastrado</p>
            <p className="text-xs text-muted-foreground/70">Adicione um veículo para começar a aceitar encomendas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="rounded-3xl border-none bg-muted/20 overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                        <Car className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{vehicle.type}</p>
                        <h3 className="font-bold text-base">{vehicle.brand} {vehicle.model}</h3>
                        <p className="text-xs text-muted-foreground font-medium">{vehicle.plate} • {vehicle.color}</p>
                      </div>
                    </div>
                    {vehicle.status === 'approved' ? (
                      <div className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Aprovado
                      </div>
                    ) : (
                      <div className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Em Análise
                      </div>
                    )}
                  </div>
                  <div className="bg-white/50 px-4 py-3 border-t flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={removingId === vehicle.id}
                      onClick={() => handleRemove(vehicle.id)}
                      className="text-xs font-bold h-8 rounded-xl text-destructive hover:text-destructive"
                    >
                      {removingId === vehicle.id ? 'Removendo...' : 'Remover'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Button
          onClick={() => setIsAddingVehicle(true)}
          className="w-full h-14 rounded-2xl font-bold text-lg border-2 border-dashed border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 shadow-none"
        >
          + Adicionar Novo Veículo
        </Button>
      </div>
    </div>
  );
}

function VehicleForm({ onBack, onComplete }: { onBack: () => void, onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    brand: '',
    model: '',
    color: '',
    plate: ''
  });

  const VEHICLE_TYPES = ['Carro', 'Moto', 'Van', 'Caminhonete', 'Caminhão'];

  const handleNext = async () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { error } = await supabase.from('vehicles').insert({
          user_id: session.user.id,
          type: formData.type,
          brand: formData.brand,
          model: formData.model,
          color: formData.color,
          plate: formData.plate,
          status: 'pending',
        });
        if (error) console.error('VehicleForm: erro ao inserir veículo', error.message);
      }
      setIsSaving(false);
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onBack();
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.type.length > 0;
      case 2: return formData.brand.trim().length > 0;
      case 3: return formData.model.trim().length > 0;
      case 4: return formData.color.trim().length > 0;
      case 5: return formData.plate.trim().length > 0;
      default: return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background animate-in slide-in-from-bottom-full duration-300 flex flex-col overflow-y-auto">
      <header className="px-4 py-4 flex items-center justify-between border-b">
        <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={cn("h-1.5 w-7 rounded-full transition-colors", step >= i ? "bg-primary" : "bg-muted")} />
          ))}
        </div>
        <div className="w-10" />
      </header>

      <div className="flex-1 p-6 flex flex-col">
        <div className="flex-1">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">Que tipo de veículo?</h2>
                <p className="text-muted-foreground text-sm">Selecione o tipo para continuar</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {VEHICLE_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, type })}
                    className={cn(
                      "h-16 rounded-2xl font-bold text-sm border-2 transition-all active:scale-95",
                      formData.type === type
                        ? "border-primary bg-primary text-white shadow-md"
                        : "border-muted bg-muted/20 text-foreground hover:border-primary/40"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">Qual a marca?</h2>
                <p className="text-muted-foreground text-sm">Ex: Honda, Toyota, Volkswagen...</p>
              </div>
              <Input
                autoFocus
                placeholder="Digite a marca"
                className="h-14 rounded-2xl bg-muted/30 border-none font-medium text-lg"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">Qual o modelo?</h2>
                <p className="text-muted-foreground text-sm">Ex: Civic, Corolla, Gol...</p>
              </div>
              <Input
                autoFocus
                placeholder="Digite o modelo"
                className="h-14 rounded-2xl bg-muted/30 border-none font-medium text-lg"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">Qual a cor?</h2>
                <p className="text-muted-foreground text-sm">Ex: Prata, Preto, Branco...</p>
              </div>
              <Input
                autoFocus
                placeholder="Digite a cor"
                className="h-14 rounded-2xl bg-muted/30 border-none font-medium text-lg"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">Qual a placa?</h2>
                <p className="text-muted-foreground text-sm">Digite a placa do veículo</p>
              </div>
              <Input
                autoFocus
                placeholder="ABC-1234"
                className="h-14 rounded-2xl bg-muted/30 border-none font-medium text-lg uppercase"
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
              />
              <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4 text-xs text-orange-700 font-medium">
                Após o cadastro, seu veículo passará por análise antes de aparecer como disponível.
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 pb-safe-area-bottom pb-24">
          <Button
            className="w-full h-14 rounded-2xl font-bold text-lg"
            onClick={handleNext}
            disabled={!isStepValid() || isSaving}
          >
            {step === 5 ? (isSaving ? 'Salvando...' : 'Concluir Cadastro') : 'Próximo'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Tela: Avaliações ────────────────────────────────────────────────────────

interface RatingRow {
  id: string;
  score: number;
  comment: string | null;
  created_at: string;
  profiles: { full_name: string; avatar_url: string | null } | null;
}

interface RatingsScreenProps {
  onBack: () => void;
  profile: UserProfile | null;
  mode: 'sender' | 'traveler';
}

function RatingsScreen({ onBack, profile, mode }: RatingsScreenProps) {
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) { setIsLoading(false); return; }
    (async () => {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          id,
          score,
          comment,
          created_at,
          profiles!ratings_from_user_id_fkey (full_name, avatar_url)
        `)
        .eq('to_user_id', profile.id)
        .order('created_at', { ascending: false });
      if (!error && data) setRatings(data as unknown as RatingRow[]);
      setIsLoading(false);
    })();
  }, [profile?.id]);

  // Estatísticas calculadas dos dados reais
  const totalRatings = ratings.length;
  const averageScore = totalRatings > 0
    ? parseFloat((ratings.reduce((acc, r) => acc + r.score, 0) / totalRatings).toFixed(1))
    : 0;
  const breakdown = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: ratings.filter(r => r.score === stars).length,
  }));

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const getInitials = (name: string | undefined) =>
    (name ?? '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-background animate-in slide-in-from-right-full duration-300 overflow-y-auto pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-black tracking-tight">Minhas Avaliações</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* Resumo */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100 rounded-3xl p-6">
          <div className="flex items-center gap-6">
            <div className="text-center min-w-[80px]">
              {isLoading ? (
                <div className="h-12 w-12 mx-auto rounded-full bg-yellow-100 animate-pulse" />
              ) : (
                <>
                  <div className="text-5xl font-black text-yellow-500">
                    {totalRatings === 0 ? '—' : averageScore.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map(s => (
                      <Star
                        key={s}
                        className={cn(
                          "h-4 w-4",
                          totalRatings > 0 && s <= Math.round(averageScore)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-yellow-200"
                        )}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-medium">
                    {totalRatings === 0 ? 'Sem avaliações ainda' : `${totalRatings} avaliação${totalRatings > 1 ? 'ões' : ''}`}
                  </div>
                </>
              )}
            </div>

            {!isLoading && totalRatings > 0 && (
              <div className="flex-1 space-y-1">
                {breakdown.map(({ stars, count }) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-3">{stars}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                    <div className="flex-1 bg-yellow-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${(count / totalRatings) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground w-4 text-right">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lista */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {mode === 'traveler' ? 'Avaliações de Remetentes' : 'Avaliações de Viajantes'}
          </h3>

          {isLoading && (
            <div className="space-y-3">
              {[0,1,2].map(i => (
                <div key={i} className="bg-muted/20 rounded-3xl p-4 h-20 animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && totalRatings === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center">
                <Star className="h-8 w-8 text-yellow-300" />
              </div>
              <div className="font-bold text-base">Nenhuma avaliação ainda</div>
              <p className="text-sm text-muted-foreground max-w-[240px]">
                Sua reputação é construída conforme você realiza entregas. As avaliações aparecerão aqui.
              </p>
            </div>
          )}

          {!isLoading && ratings.map(r => {
            const name = r.profiles?.full_name ?? 'Usuário';
            return (
              <div key={r.id} className="bg-muted/20 rounded-3xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                      {getInitials(name)}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{name.split(' ')[0]} {name.split(' ').at(-1)?.charAt(0) ?? ''}.</div>
                      <div className="text-[11px] text-muted-foreground">{formatDate(r.created_at)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={cn("h-3.5 w-3.5", s <= r.score ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground opacity-30")} />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Tela: Ajuda ─────────────────────────────────────────────────────────────

function HelpScreen({ onBack }: { onBack: () => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Como funciona o VYA?',
      answer: 'O VYA conecta remetentes (quem precisa enviar encomendas) com viajantes (quem já vai fazer uma viagem). O remetente publica o pacote e o viajante aceita carregar durante sua viagem, recebendo uma remuneração por isso.',
    },
    {
      question: 'Como funciona o pagamento?',
      answer: 'O pagamento é feito antecipadamente pela plataforma. O valor fica retido até que a entrega seja confirmada pelo destinatário. Após a confirmação, o valor é liberado para o viajante em até 1 dia útil.',
    },
    {
      question: 'O que acontece se minha encomenda for perdida ou danificada?',
      answer: 'Caso tenha contratado o seguro na hora do envio, você será reembolsado conforme as condições do seguro. Recomendamos sempre adicionar o seguro para encomendas de valor.',
    },
    {
      question: 'Quanto tempo demora a entrega?',
      answer: 'O prazo depende da viagem do viajante selecionado. Você pode ver a data estimada antes de confirmar o envio. Geralmente as entregas acontecem entre 1 e 3 dias.',
    },
    {
      question: 'Posso cancelar uma entrega?',
      answer: 'Sim, você pode cancelar antes que o viajante inicie a viagem, sem custo. Após o início da viagem, o cancelamento pode ter custos conforme nossa política.',
    },
    {
      question: 'Como verificar minha conta?',
      answer: 'Acesse Perfil → Minha Segurança para verificar seu e-mail, telefone e enviar seus documentos de identidade. Contas verificadas têm mais confiança na plataforma.',
    },
    {
      question: 'Quais tipos de itens posso enviar?',
      answer: 'Itens legais e não perigosos. É proibido enviar drogas, armas, explosivos, animais vivos, líquidos inflamáveis ou qualquer item que viole a legislação brasileira.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background animate-in slide-in-from-right-full duration-300 overflow-y-auto pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-black tracking-tight">Ajuda & Suporte</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* Contato rápido */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Fale Conosco</h3>
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-4 p-4 bg-green-50 border border-green-100 rounded-3xl active:scale-[0.98] transition-all"
          >
            <div className="p-2.5 rounded-2xl bg-green-500 text-white">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-sm">WhatsApp</div>
              <div className="text-xs text-muted-foreground">Resposta em até 30 minutos</div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
          </a>
          <a
            href="mailto:suporte@vyaapp.com"
            className="w-full flex items-center gap-4 p-4 bg-muted/20 rounded-3xl active:scale-[0.98] transition-all"
          >
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-500">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-sm">E-mail</div>
              <div className="text-xs text-muted-foreground">suporte@vyaapp.com</div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
          </a>
        </div>

        {/* FAQ */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Perguntas Frequentes</h3>
          {faqs.map((faq, i) => (
            <div key={i} className="bg-muted/20 rounded-3xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-bold text-sm pr-4">{faq.question}</span>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform", openIndex === i && "rotate-180")} />
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tela: Termos de Uso ─────────────────────────────────────────────────────

function TermsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-background animate-in slide-in-from-right-full duration-300 overflow-y-auto pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-black tracking-tight">Termos de Uso</h1>
      </header>

      <div className="p-4 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p className="text-xs text-muted-foreground">Última atualização: 01 de junho de 2025</p>

        {[
          {
            title: '1. Aceitação dos Termos',
            body: 'Ao criar uma conta e utilizar o VYA, você concorda com estes Termos de Uso. Se não concordar com qualquer parte dos termos, não poderá acessar o serviço.',
          },
          {
            title: '2. Descrição do Serviço',
            body: 'O VYA é uma plataforma tecnológica que conecta remetentes e viajantes para o transporte de encomendas. O VYA não é uma transportadora e não se responsabiliza pela guarda física das encomendas, atuando apenas como intermediário.',
          },
          {
            title: '3. Cadastro e Conta',
            body: 'Para usar o VYA, você deve ter pelo menos 18 anos, fornecer informações verdadeiras e manter seus dados atualizados. Você é responsável pela segurança da sua senha e por toda atividade em sua conta.',
          },
          {
            title: '4. Responsabilidades do Remetente',
            body: 'O remetente garante que os itens enviados são lícitos, não perigosos e descritos com precisão. É proibido enviar qualquer item que viole a legislação brasileira. O remetente é responsável pela embalagem adequada.',
          },
          {
            title: '5. Responsabilidades do Viajante',
            body: 'O viajante se compromete a transportar apenas encomendas aceitas pela plataforma, inspecionar visualmente antes de aceitar e entregar no prazo combinado. O viajante não pode subcontratar entregas.',
          },
          {
            title: '6. Pagamentos e Taxas',
            body: 'O pagamento é processado pela plataforma e retido até confirmação da entrega. O VYA cobra uma taxa de serviço sobre cada transação, conforme exibido antes da confirmação.',
          },
          {
            title: '7. Cancelamentos',
            body: 'Cancelamentos antes do início da viagem são gratuitos. Após o início, podem incidir multas conforme a política vigente. O VYA se reserva o direito de cancelar transações suspeitas.',
          },
          {
            title: '8. Limitação de Responsabilidade',
            body: 'O VYA não se responsabiliza por danos diretos ou indiretos decorrentes do uso da plataforma, exceto nos casos previstos em lei. Nossa responsabilidade é limitada ao valor da transação.',
          },
          {
            title: '9. Modificações',
            body: 'O VYA pode alterar estes termos a qualquer momento. Alterações entraram em vigor imediatamente após publicação. O uso contínuo da plataforma constitui aceitação dos novos termos.',
          },
          {
            title: '10. Foro',
            body: 'Fica eleito o foro da Comarca de São Paulo - SP para dirimir quaisquer controvérsias decorrentes destes termos, com renúncia a qualquer outro, por mais privilegiado que seja.',
          },
        ].map(({ title, body }) => (
          <section key={title} className="space-y-2">
            <h2 className="font-black text-foreground text-sm">{title}</h2>
            <p>{body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

// ─── Tela: Proteção de Dados ─────────────────────────────────────────────────

function PrivacyScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-background animate-in slide-in-from-right-full duration-300 overflow-y-auto pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-black tracking-tight">Proteção de Dados</h1>
      </header>

      <div className="p-4 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="h-5 w-5 text-blue-500" />
            <span className="font-bold text-blue-700 text-sm">Conformidade com a LGPD</span>
          </div>
          <p className="text-xs text-blue-600">
            O VYA está em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). 
            Seus dados são tratados com segurança e transparência.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">Última atualização: 01 de junho de 2025</p>

        {[
          {
            title: 'Quais dados coletamos?',
            body: 'Coletamos dados de identificação (nome, CPF, e-mail, telefone), dados de localização para rotas, dados de pagamento (processados por parceiros certificados), fotos de perfil e documentos para verificação de identidade.',
          },
          {
            title: 'Como usamos seus dados?',
            body: 'Usamos seus dados para: (i) fornecer e melhorar nossos serviços; (ii) verificar sua identidade e prevenir fraudes; (iii) processar pagamentos; (iv) comunicação sobre pedidos e atualizações; (v) cumprir obrigações legais.',
          },
          {
            title: 'Com quem compartilhamos?',
            body: 'Compartilhamos dados apenas com: parceiros de pagamento (para processar transações), autoridades regulatórias (quando exigido por lei) e outros usuários da plataforma (somente dados necessários para a entrega).',
          },
          {
            title: 'Por quanto tempo armazenamos?',
            body: 'Dados de conta são mantidos enquanto você tiver uma conta ativa. Dados de transações são retidos por 5 anos conforme exigência fiscal. Dados de verificação de identidade por 2 anos após encerramento da conta.',
          },
          {
            title: 'Seus direitos (LGPD)',
            body: 'Você tem direito a: confirmar o tratamento de dados, acessar seus dados, corrigir dados incompletos, solicitar portabilidade, revogar consentimento, solicitar exclusão de dados desnecessários e se opor ao tratamento.',
          },
          {
            title: 'Segurança dos dados',
            body: 'Utilizamos criptografia TLS em todas as comunicações, armazenamento seguro em nuvem com certificação SOC 2, autenticação multifator e monitoramento contínuo contra acessos não autorizados.',
          },
          {
            title: 'Cookies e rastreamento',
            body: 'Usamos cookies essenciais para o funcionamento do app e cookies de análise (com seu consentimento) para melhorar a experiência. Você pode gerenciar suas preferências nas configurações do dispositivo.',
          },
          {
            title: 'Encarregado (DPO)',
            body: 'Nosso Encarregado de Proteção de Dados pode ser contactado pelo e-mail: privacidade@vyaapp.com. Responderemos às suas solicitações em até 15 dias úteis.',
          },
        ].map(({ title, body }) => (
          <section key={title} className="space-y-2">
            <h2 className="font-black text-foreground text-sm">{title}</h2>
            <p>{body}</p>
          </section>
        ))}

        <div className="pt-2">
          <a
            href="mailto:privacidade@vyaapp.com"
            className="w-full flex items-center gap-4 p-4 bg-muted/20 rounded-3xl active:scale-[0.98] transition-all"
          >
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-500">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-sm">Exercer meus direitos</div>
              <div className="text-xs text-muted-foreground">privacidade@vyaapp.com</div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Tela: Indique e Ganhe ───────────────────────────────────────────────────

interface ReferralRow {
  id: string;
  status: 'pending' | 'credited';
  bonus_amount: number;
  created_at: string;
  credited_at: string | null;
  profiles: { full_name: string } | null; // referred user
}

function ReferralScreen({ onBack, profile }: { onBack: () => void; profile: UserProfile | null }) {
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!profile?.id) { setIsLoading(false); return; }
    (async () => {
      // Carrega o referral_code do próprio perfil
      const { data: prof } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', profile.id)
        .single();

      const code = prof?.referral_code ?? null;
      setReferralCode(code);

      // Se não tem código, gera via RPC
      if (!code) {
        setIsGenerating(true);
        const { data: newCode } = await supabase
          .rpc('generate_referral_code', { user_id: profile.id });
        if (newCode) setReferralCode(newCode);
        setIsGenerating(false);
      }

      // Carrega as indicações feitas por este usuário
      const { data: refs } = await supabase
        .from('referrals')
        .select(`
          id,
          status,
          bonus_amount,
          created_at,
          credited_at,
          profiles!referrals_referred_id_fkey (full_name)
        `)
        .eq('referrer_id', profile.id)
        .order('created_at', { ascending: false });

      if (refs) setReferrals(refs as unknown as ReferralRow[]);
      setIsLoading(false);
    })();
  }, [profile?.id]);

  const referralLink = referralCode
    ? `https://vyaapp.com/convite/${referralCode}`
    : '';

  const totalCredited = referrals
    .filter(r => r.status === 'credited')
    .reduce((acc, r) => acc + r.bonus_amount, 0);

  const pendingCount = referrals.filter(r => r.status === 'pending').length;

  const handleCopy = (text: string, label: string) => {
    copyToClipboard(text).then(() => {
      toast({ title: `${label} copiado!`, description: 'Compartilhe com seus amigos.' });
    }).catch(() => {
      toast({ variant: 'destructive', title: 'Erro ao copiar', description: 'Não foi possível copiar o código.' });
    });
  };

  const handleShare = async () => {
    if (!referralLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'VYA - Envio inteligente entre cidades',
          text: `Use meu código ${referralCode} e ganhe desconto no primeiro envio!`,
          url: referralLink,
        });
        return;
      } catch { /* fallback */ }
    }
    handleCopy(referralLink, 'Link');
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const getInitials = (name: string | undefined) =>
    (name ?? '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-background animate-in slide-in-from-right-full duration-300 overflow-y-auto pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-black tracking-tight">Indique e Ganhe</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* Banner com totais reais */}
        <div className="bg-gradient-to-br from-primary to-primary/70 rounded-3xl p-6 text-white space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <div className="font-black text-lg">R$ 5,00 por indicado!</div>
              <div className="text-white/80 text-xs">A cada amigo que fizer o primeiro envio</div>
            </div>
          </div>
          {/* Stats */}
          {!isLoading && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/15 rounded-2xl p-3 text-center">
                <div className="font-black text-xl">
                  {totalCredited.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <div className="text-white/70 text-[11px] mt-0.5">Total Ganho</div>
              </div>
              <div className="bg-white/15 rounded-2xl p-3 text-center">
                <div className="font-black text-xl">{referrals.length}</div>
                <div className="text-white/70 text-[11px] mt-0.5">
                  {referrals.length === 1 ? 'Indicação' : 'Indicações'}
                </div>
              </div>
            </div>
          )}
          <p className="text-white/70 text-xs leading-relaxed">
            Compartilhe seu código e ganhe créditos para cada amigo que se cadastrar e realizar o primeiro envio.
          </p>
        </div>

        {/* Código */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Seu Código de Indicação</h3>
          {isLoading || isGenerating ? (
            <div className="bg-muted/20 rounded-3xl p-4 h-20 animate-pulse" />
          ) : (
            <div className="bg-muted/20 rounded-3xl p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-black text-2xl tracking-widest text-primary">
                  {referralCode ?? '—'}
                </div>
                {referralLink && (
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{referralLink}</div>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => referralCode && handleCopy(referralCode, 'Código')}
                disabled={!referralCode}
                className="rounded-2xl h-11 w-11 flex-shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Button
            className="w-full h-14 rounded-2xl font-bold text-base gap-2"
            onClick={handleShare}
            disabled={!referralCode || isLoading}
          >
            <Share2 className="h-5 w-5" />
            Compartilhar Link
          </Button>
        </div>

        {/* Como funciona */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Como Funciona</h3>
          {[
            { step: '1', text: 'Compartilhe seu código ou link com amigos' },
            { step: '2', text: 'Seu amigo se cadastra usando seu código' },
            { step: '3', text: 'Ele realiza o primeiro envio pelo VYA' },
            { step: '4', text: 'Você recebe R$ 5,00 em créditos!' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                {step}
              </div>
              <span className="text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>

        {/* Histórico real */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Suas Indicações</h3>

          {isLoading && (
            <div className="space-y-2">
              {[0,1].map(i => (
                <div key={i} className="bg-muted/20 rounded-3xl h-16 animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && referrals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Gift className="h-7 w-7 text-primary/40" />
              </div>
              <div className="font-bold text-sm">Nenhuma indicação ainda</div>
              <p className="text-xs text-muted-foreground max-w-[220px]">
                Compartilhe seu código e acompanhe aqui as indicações confirmadas.
              </p>
            </div>
          )}

          {!isLoading && referrals.map(r => {
            const name = r.profiles?.full_name ?? 'Usuário';
            const isCredited = r.status === 'credited';
            return (
              <div key={r.id} className="flex items-center justify-between bg-muted/20 rounded-3xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                    {getInitials(name)}
                  </div>
                  <div>
                    <div className="font-bold text-sm">
                      {name.split(' ')[0]} {name.split(' ').at(-1)?.charAt(0) ?? ''}.
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {isCredited && r.credited_at
                        ? `Creditado em ${formatDate(r.credited_at)}`
                        : `Aguardando desde ${formatDate(r.created_at)}`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-primary">
                    {r.bonus_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className={cn(
                    "text-[11px] font-medium",
                    isCredited ? 'text-green-500' : 'text-yellow-500'
                  )}>
                    {isCredited ? '✓ Creditado' : '⏳ Pendente'}
                  </div>
                </div>
              </div>
            );
          })}

          {!isLoading && pendingCount > 0 && (
            <p className="text-[11px] text-muted-foreground text-center">
              {pendingCount} indicação{pendingCount > 1 ? 'ões' : ''} aguardando o primeiro envio do indicado
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
