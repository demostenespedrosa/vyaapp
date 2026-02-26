"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAppContext } from "@/contexts/AppContext";
import { dataCache } from "@/lib/dataCache";
import { 
  Package, 
  Zap, 
  ChevronRight, 
  MapPin,
  ArrowRight,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Clock,
  Coins,
  LocateFixed,
  Route,
  ShieldCheck,
  Search,
  Truck,
  Plus,
  Calculator,
  HelpCircle,
  History,
  Wallet
} from "lucide-react";
import { NotificationBell } from "@/components/vya/shared/NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface HomeDashboardProps {
  mode: 'sender' | 'traveler';
  onAction?: () => void;
}

interface ActiveShipment {
  id: string;
  status: string;
  destination: string;
  progress: number;
}

interface AvailablePackage {
  id: string;
  size: string;
  earnings: number;
  from: string;
  to: string;
  item: string;
  time: string;
  urgency: 'high' | 'medium' | 'low';
  distance: string;
}

interface NextTrip {
  origin: string;
  destination: string;
  date: string;
  time: string;
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Agora mesmo';
  if (mins < 60) return `Há ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Há ${hrs}h`;
  return `Há ${Math.floor(hrs / 24)}d`;
}

export function HomeDashboard({ mode, onAction }: HomeDashboardProps) {
  // Perfil vem do contexto global — sem fetch extra
  const { profile, userId, configs } = useAppContext();

  const [activeShipment, setActiveShipment] = useState<ActiveShipment | null>(null);
  const [availablePackages, setAvailablePackages] = useState<AvailablePackage[]>([]);
  const [nextTrip, setNextTrip] = useState<NextTrip | null>(null);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayDeliveries, setTodayDeliveries] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const cacheKey = `home:${mode}:${userId}`;
    const cached = dataCache.get<{ activeShipment: ActiveShipment | null; availablePackages: AvailablePackage[]; nextTrip: NextTrip | null; todayEarnings: number; todayDeliveries: number }>(cacheKey, 45_000);
    if (cached) {
      setActiveShipment(cached.activeShipment);
      setAvailablePackages(cached.availablePackages);
      setNextTrip(cached.nextTrip);
      setTodayEarnings(cached.todayEarnings);
      setTodayDeliveries(cached.todayDeliveries);
      setIsLoading(false);
      return;
    }
    fetchData();
  }, [mode, userId]);

  const fetchData = async () => {
    if (!userId) return;
    setIsLoading(true);

    // Variáveis locais para poder salvar no cache após os fetches
    let newActiveShipment: ActiveShipment | null = null;
    let newAvailablePackages: AvailablePackage[] = [];
    let newNextTrip: NextTrip | null = null;
    let newTodayEarnings = 0;
    let newTodayDeliveries = 0;

    try {
      if (mode === 'sender') {
        // Envio ativo mais recente
        const statusProgress: Record<string, number> = {
          searching: 15, waiting_pickup: 40, transit: 65, waiting_delivery: 90,
        };
        const { data: pkgs } = await supabase
          .from('packages')
          .select('id, status, destination_city, destination_state, updated_at')
          .eq('sender_id', userId)
          .not('status', 'in', '("delivered","canceled")')
          .order('created_at', { ascending: false })
          .limit(1);
        if (pkgs && pkgs.length > 0) {
          const p = pkgs[0];
          newActiveShipment = {
            id: 'VY-' + p.id.substring(0, 5).toUpperCase(),
            status: p.status,
            destination: `${p.destination_city}, ${p.destination_state}`,
            progress: statusProgress[p.status] || 50,
          };
        }
      } else {
        // Próxima viagem do viajante
        const { data: trips } = await supabase
          .from('trips')
          .select('origin_city, origin_state, destination_city, destination_state, departure_date, departure_time')
          .eq('traveler_id', userId)
          .eq('status', 'scheduled')
          .order('departure_date', { ascending: true })
          .limit(1);
        if (trips && trips.length > 0) {
          const t = trips[0];
          newNextTrip = {
            origin: `${t.origin_city}, ${t.origin_state}`,
            destination: `${t.destination_city}, ${t.destination_state}`,
            date: new Date(t.departure_date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }),
            time: t.departure_time.substring(0, 5),
          };
        }

        // Ganhos e entregas hoje
        const today = new Date().toISOString().split('T')[0];
        const { data: todayPkgs } = await supabase
          .from('packages')
          .select('price')
          .eq('status', 'delivered')
          .gte('updated_at', `${today}T00:00:00`);
        if (todayPkgs) {
          newTodayEarnings = todayPkgs.reduce((acc, p) => acc + (p.price * (1 - configs.platformFeePercent / 100)), 0);
          newTodayDeliveries = todayPkgs.length;
        }

        // Pacotes disponíveis (searching)
        const { data: available } = await supabase
          .from('packages')
          .select('id, description, size, price, origin_city, origin_state, destination_city, destination_state, created_at')
          .eq('status', 'searching')
          .order('created_at', { ascending: false })
          .limit(5);
        if (available) {
          newAvailablePackages = available.map((pkg, i) => ({
            id: 'VY-' + pkg.id.substring(0, 4).toUpperCase(),
            size: pkg.size,
            earnings: pkg.price * 0.8,
            from: `${pkg.origin_city}, ${pkg.origin_state}`,
            to: `${pkg.destination_city}, ${pkg.destination_state}`,
            item: pkg.description,
            time: relativeTime(pkg.created_at),
            urgency: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
            distance: '',
          }));
        }
      }

      // Atualiza state e cache com os mesmos valores locais
      setActiveShipment(newActiveShipment);
      setNextTrip(newNextTrip);
      setAvailablePackages(newAvailablePackages);
      setTodayEarnings(newTodayEarnings);
      setTodayDeliveries(newTodayDeliveries);

      dataCache.set(`home:${mode}:${userId}`, {
        activeShipment: newActiveShipment,
        availablePackages: newAvailablePackages,
        nextTrip: newNextTrip,
        todayEarnings: newTodayEarnings,
        todayDeliveries: newTodayDeliveries,
      });
    } catch (e) {
      console.error('HomeDashboard fetchData error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const firstName = profile?.full_name?.split(' ')[0] || '...';
  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'U')}&background=random&size=128`;
  const avatarFallback = profile?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

  return (
    <div className="space-y-6 page-transition pb-24">
      {/* Header Nativo */}
      <header className="flex justify-between items-center pt-4 px-1">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/10 shadow-sm">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Bem-vindo de volta</p>
            <h1 className="text-xl font-black text-foreground tracking-tight leading-none">{firstName}</h1>
          </div>
        </div>
        <NotificationBell />
      </header>

      {mode === 'sender' ? (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Ação Principal - Novo Envio */}
          <Card 
            onClick={onAction}
            className="rounded-[2.5rem] border-none bg-primary text-white shadow-xl shadow-primary/20 overflow-hidden relative group cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="absolute -right-6 -top-6 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Package className="h-32 w-32 rotate-12" />
            </div>
            <CardContent className="p-6 relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight">Novo Envio</h2>
                <p className="text-primary-foreground/80 text-sm font-medium">Para onde vamos mandar hoje?</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white text-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Status Rápido (Se houver envio ativo) */}
          {activeShipment && (
            <div className="space-y-3 px-1">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Acompanhamento em tempo real</h3>
              <Card className="rounded-[2rem] border-none bg-white shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Truck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{activeShipment.id}</p>
                        <p className="text-sm font-black">A caminho de {activeShipment.destination}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                      <span>Progresso</span>
                      <span className="text-primary">{activeShipment.progress}% concluído</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${activeShipment.progress}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Grid de Acesso Rápido (Estilo App Nativo) */}
          <div className="grid grid-cols-4 gap-4 px-2 pt-2">
            {[
              { icon: Search, label: "Rastrear", color: "text-blue-500", bg: "bg-blue-50" },
              { icon: Calculator, label: "Simular", color: "text-orange-500", bg: "bg-orange-50" },
              { icon: History, label: "Histórico", color: "text-brand-purple", bg: "bg-brand-purple/10" },
              { icon: HelpCircle, label: "Ajuda", color: "text-green-500", bg: "bg-green-50" },
            ].map((item, i) => (
              <button key={i} className="flex flex-col items-center gap-2 active:scale-90 transition-transform group">
                <div className={cn("h-14 w-14 rounded-[1.2rem] flex items-center justify-center shadow-sm group-hover:shadow-md transition-all", item.bg, item.color)}>
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Banner Promocional / Dica */}
          <div className="pt-4">
            <Card className="rounded-[2rem] border-none bg-gradient-to-r from-brand-pink/15 to-primary/5 p-6 flex items-center gap-4 relative overflow-hidden">
              <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                <Sparkles className="h-6 w-6 text-brand-pink fill-current" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black tracking-tight">Indique e Ganhe</h4>
                <p className="text-[11px] text-muted-foreground font-medium leading-tight">
                  Ganhe R$ 10 de desconto no próximo envio indicando um amigo.
                </p>
              </div>
            </Card>
          </div>

        </section>
      ) : (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Próxima Viagem Planejada */}
          <Card className="rounded-[2.5rem] border-none bg-brand-purple text-white shadow-xl shadow-brand-purple/20 overflow-hidden relative mx-1">
            <div className="absolute -right-6 -top-6 p-8 opacity-10">
              <Route className="h-32 w-32 rotate-12 fill-current" />
            </div>
            <CardContent className="p-6 relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Badge className="bg-white/20 text-white border-none backdrop-blur-md px-2.5 py-0.5 font-bold text-[9px] tracking-widest uppercase">Próxima Viagem</Badge>
                  <h2 className="text-2xl font-black tracking-tight mt-1">{nextTrip ? `${nextTrip.date}, ${nextTrip.time}` : 'Nenhuma agendada'}</h2>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Truck className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="flex items-center gap-3 pt-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-2 w-2 rounded-full border-2 border-white bg-transparent" />
                  <div className="w-[1.5px] h-4 bg-white/30 border-dashed border-l-2" />
                  <MapPin className="h-2 w-2 text-white/70" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-bold text-white/90 leading-none">{nextTrip?.origin || '—'}</p>
                  <p className="text-sm font-bold text-white/90 leading-none">{nextTrip?.destination || '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo Rápido */}
          <div className="grid grid-cols-2 gap-3 px-1">
            <Card className="rounded-[2rem] border-none bg-green-50 shadow-sm">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-green-600/80 uppercase tracking-widest">Ganhos Hoje</p>
                  <p className="text-2xl font-black text-green-950 tracking-tighter">R$ {todayEarnings.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-[2rem] border-none bg-blue-50 shadow-sm">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-600/80 uppercase tracking-widest">Entregas</p>
                  <p className="text-2xl font-black text-blue-950 tracking-tighter">{todayDeliveries} Concluída{todayDeliveries !== 1 ? 's' : ''}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grid de Acesso Rápido */}
          <div className="grid grid-cols-4 gap-4 px-2 pt-2">
            {[
              { icon: Route, label: "Rotas", color: "text-blue-500", bg: "bg-blue-50" },
              { icon: Wallet, label: "Ganhos", color: "text-green-500", bg: "bg-green-50" },
              { icon: Truck, label: "Veículo", color: "text-orange-500", bg: "bg-orange-50" },
              { icon: HelpCircle, label: "Suporte", color: "text-brand-purple", bg: "bg-brand-purple/10" },
            ].map((item, i) => (
              <button key={i} className="flex flex-col items-center gap-2 active:scale-90 transition-transform group">
                <div className={cn("h-14 w-14 rounded-[1.2rem] flex items-center justify-center shadow-sm group-hover:shadow-md transition-all", item.bg, item.color)}>
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Oportunidades (Pacotes Compatíveis) */}
          <div className="space-y-4 pt-4 px-1">
            <div className="flex justify-between items-end px-1">
              <div>
                <h3 className="text-xl font-black tracking-tighter">Pacotes Compatíveis 📦</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Para sua viagem de hoje</p>
              </div>
              <Badge variant="secondary" className="bg-brand-purple/10 text-brand-purple border-none px-3 py-1 font-black text-[9px] mb-1">
                {availablePackages.length} MATCHES
              </Badge>
            </div>
            
            {availablePackages.length > 0 ? (
              <div className="space-y-4">
                {availablePackages.map((pkg) => (
                  <Card key={pkg.id} className="rounded-[2.5rem] border-2 border-brand-purple/10 shadow-lg hover:shadow-xl bg-white overflow-hidden active:scale-[0.98] active:bg-muted/30 transition-all duration-300 cursor-pointer">
                    <CardContent className="p-0">
                      {/* Header do Card de Oportunidade */}
                      <div className="bg-brand-purple/5 px-6 py-4 flex justify-between items-center border-b border-brand-purple/10">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-purple">
                            <Coins className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-brand-purple uppercase tracking-widest opacity-80">Ganho Líquido</p>
                            <h4 className="text-xl font-black text-brand-purple tracking-tight">R$ {pkg.earnings.toFixed(2)}</h4>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={cn(
                            "border-none text-[8px] font-black px-2.5 py-1 rounded-full",
                            pkg.urgency === 'high' ? 'bg-red-500 text-white shadow-md shadow-red-200' : 'bg-brand-purple/20 text-brand-purple'
                          )}>
                            {pkg.urgency === 'high' ? 'IMEDIATO' : 'NORMAL'}
                          </Badge>
                          <p className="text-[9px] text-muted-foreground font-bold mt-1 uppercase tracking-tighter flex items-center justify-end gap-1">
                            <Clock className="h-3 w-3" /> {pkg.time}
                          </p>
                        </div>
                      </div>

                      {/* Rota */}
                      <div className="p-6 space-y-5">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center gap-1">
                            <div className="h-3 w-3 rounded-full border-2 border-brand-purple bg-white" />
                            <div className="w-[2px] h-8 bg-gradient-to-b from-brand-purple to-muted-foreground/20 border-dashed border-l-2" />
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div>
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Coleta</p>
                              <p className="text-sm font-bold text-foreground">{pkg.from}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Entrega</p>
                              <p className="text-sm font-bold text-foreground">{pkg.to}</p>
                            </div>
                          </div>
                          <div className="bg-muted/30 px-3 py-2 rounded-xl text-center border border-muted-foreground/5">
                            <p className="text-[9px] font-black text-muted-foreground uppercase mb-0.5">Distância</p>
                            <p className="text-xs font-black text-foreground">{pkg.distance}</p>
                          </div>
                        </div>

                        {/* Botão de Aceite */}
                        <Button className="w-full h-14 rounded-[1.2rem] bg-brand-purple hover:bg-brand-purple/90 font-black text-sm gap-2 shadow-lg shadow-brand-purple/20 active:scale-95 transition-all">
                          Aceitar Pacote <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="h-16 w-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-bold text-muted-foreground">Buscando pacotes para sua rota...</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
