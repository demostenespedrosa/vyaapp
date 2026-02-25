
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Navigation, 
  MapPin, 
  Map as MapIcon, 
  Wallet, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Package, 
  ArrowLeft,
  Truck,
  ArrowRight,
  MoreVertical,
  Calendar,
  Zap,
  User,
  ShieldCheck,
  Coins,
  Route,
  ArrowRightLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TripForm } from "./TripForm";
import { cn } from "@/lib/utils";

interface TravelerTrip {
  id: string;
  origin: string;
  destination: string;
  date: string;
  time: string;
  status: 'scheduled' | 'active' | 'completed';
  packages: Array<{
    id: string;
    item: string;
    sender: string;
    status: string;
    earnings: number;
  }>;
}

export function TravelerView({ initialIsCreating = false }: { initialIsCreating?: boolean }) {
  const [isCreating, setIsCreating] = useState(initialIsCreating);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [selectedTrip, setSelectedTrip] = useState<TravelerTrip | null>(null);
  const [trips, setTrips] = useState<TravelerTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
    const scrollable = document.querySelector('.scrollable-content') as HTMLElement;
    if (scrollable) scrollable.scrollTop = 0;
  }, []);

  useEffect(() => {
    const scrollable = document.querySelector('.scrollable-content') as HTMLElement;
    if (scrollable) scrollable.scrollTop = 0;
  }, [selectedTrip, isCreating]);

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          packages (
            id,
            description,
            status,
            price,
            profiles!packages_sender_id_fkey (full_name)
          )
        `)
        .eq('traveler_id', user.id)
        .order('departure_date', { ascending: true });

      if (error) throw error;

      if (data) {
        const mappedTrips: TravelerTrip[] = data.map(trip => ({
          id: trip.id.substring(0, 8).toUpperCase(),
          origin: `${trip.origin_city}, ${trip.origin_state}`,
          destination: `${trip.destination_city}, ${trip.destination_state}`,
          date: new Date(trip.departure_date).toLocaleDateString('pt-BR'),
          time: trip.departure_time.substring(0, 5),
          status: trip.status as 'scheduled' | 'active' | 'completed',
          packages: trip.packages?.map((pkg: any) => ({
            id: pkg.id.substring(0, 8).toUpperCase(),
            item: pkg.description,
            sender: pkg.profiles?.full_name || 'Remetente',
            status: pkg.status,
            earnings: pkg.price * 0.8 // Assuming 20% platform fee
          })) || []
        }));
        setTrips(mappedTrips);
      }
    } catch (error) {
      console.error("Erro ao buscar viagens:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedTrip) {
    return (
      <div className="fixed inset-0 z-50 bg-background animate-in slide-in-from-right-full duration-300 overflow-y-auto">
        <TripDetail trip={selectedTrip} onBack={() => setSelectedTrip(null)} />
      </div>
    );
  }

  const filteredTrips = trips.filter(t => 
    activeTab === 'active' ? t.status !== 'completed' : t.status === 'completed'
  );

  const activeTrips = trips.filter(t => t.status !== 'completed');
  const totalEarnings = activeTrips.reduce((acc, trip) => acc + trip.packages.reduce((sum, p) => sum + p.earnings, 0), 0);
  const totalPackages = activeTrips.reduce((acc, trip) => acc + trip.packages.length, 0);

  return (
    <div className="space-y-6 page-transition pb-24">
      <Sheet open={isCreating} onOpenChange={setIsCreating}>
        <SheetContent side="bottom" className="h-[90vh] p-0 rounded-t-[2rem] overflow-hidden flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-2 border-b">
            <SheetTitle className="text-xl font-black tracking-tighter text-left">Planejar Viagem</SheetTitle>
            <SheetDescription className="sr-only">Cadastre os detalhes da sua viagem</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <TripForm onComplete={() => { setIsCreating(false); fetchTrips(); }} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Header Nativo de Dashboard */}
      <header className="pt-4 px-2 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Minhas Viagens</h1>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Sua malha logística</p>
          </div>
          <Button 
            onClick={() => setIsCreating(true)}
            size="icon"
            className="h-12 w-12 rounded-full bg-secondary text-white shadow-lg shadow-secondary/20 active:scale-90 transition-all"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* Cards de Resumo (Propósito Maior) */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="rounded-[2rem] border-none bg-green-50 shadow-sm">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <p className="text-3xl font-black text-green-950 tracking-tighter">R$ {totalEarnings.toFixed(0)}</p>
                <p className="text-[10px] font-bold text-green-600/80 uppercase tracking-widest">A Receber</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border-none bg-blue-50 shadow-sm">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-3xl font-black text-blue-950 tracking-tighter">{totalPackages}</p>
                <p className="text-[10px] font-bold text-blue-600/80 uppercase tracking-widest">Pacotes Ativos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      {/* Segmented Control Nativo */}
      <div className="px-2">
        <div className="flex p-1.5 bg-muted/30 rounded-[2rem] backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('active')}
            className={cn(
              "flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-300",
              activeTab === 'active' ? "bg-white shadow-sm text-secondary scale-[0.98]" : "text-muted-foreground/60 hover:text-secondary"
            )}
          >
            Em Aberto
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-300",
              activeTab === 'history' ? "bg-white shadow-sm text-secondary scale-[0.98]" : "text-muted-foreground/60 hover:text-secondary"
            )}
          >
            Histórico
          </button>
        </div>
      </div>

      <div className="space-y-4 px-2">
        {filteredTrips.length > 0 ? (
          filteredTrips.map((trip) => (
            <Card 
              key={trip.id} 
              onClick={() => setSelectedTrip(trip)}
              className="rounded-[2.5rem] border-2 border-muted/50 shadow-sm hover:shadow-md bg-white overflow-hidden active:scale-[0.98] active:bg-muted/30 transition-all duration-300 cursor-pointer"
            >
              <CardContent className="p-5 space-y-4">
                {/* Header do Card */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-12 w-12 rounded-[1.2rem] flex items-center justify-center shrink-0",
                      trip.status === 'active' ? "bg-green-50 text-green-600" : "bg-secondary/10 text-secondary"
                    )}>
                      {trip.status === 'active' ? <Truck className="h-6 w-6" /> : <Calendar className="h-6 w-6" />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{trip.id}</p>
                      <h4 className="text-base font-black text-foreground tracking-tight leading-none mt-1">
                        {trip.date} • {trip.time}
                      </h4>
                    </div>
                  </div>
                  {trip.status === 'active' && (
                    <Badge className="bg-green-500 text-white border-none text-[8px] font-black px-2 py-0.5 animate-pulse shadow-lg shadow-green-200">
                      EM CURSO
                    </Badge>
                  )}
                </div>

                {/* Info Principal */}
                <div className="pl-[3.75rem]">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-2 w-2 rounded-full border-2 border-secondary bg-white" />
                      <div className="w-[1.5px] h-6 bg-gradient-to-b from-secondary to-muted-foreground/20 border-dashed border-l-2" />
                      <MapPin className="h-2 w-2 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-bold text-foreground/80 truncate">{trip.origin}</p>
                      <p className="text-sm font-bold text-foreground/80 truncate">{trip.destination}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex-1 bg-muted/30 rounded-xl p-2.5 flex items-center gap-2">
                      <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-[11px] font-bold truncate">{trip.packages.length} Pacotes</span>
                    </div>
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none text-[10px] font-black px-3 py-1.5 rounded-xl">
                      R$ {trip.packages.reduce((acc, p) => acc + p.earnings, 0).toFixed(2)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-16 text-center space-y-6 animate-in fade-in duration-500">
            <div className="h-24 w-24 bg-muted/20 rounded-[2.5rem] flex items-center justify-center mx-auto relative">
              <MapIcon className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black tracking-tight text-muted-foreground">
                {activeTab === 'active' ? 'Nenhuma viagem agendada' : 'Histórico vazio'}
              </h3>
              <p className="text-xs text-muted-foreground/60 max-w-[200px] mx-auto font-medium">
                {activeTab === 'active' 
                  ? 'Sua próxima oportunidade de lucro começa com uma nova rota.' 
                  : 'Você ainda não concluiu nenhuma viagem.'}
              </p>
            </div>
            {activeTab === 'active' && (
              <Button 
                onClick={() => setIsCreating(true)}
                className="rounded-[1.5rem] h-12 px-8 bg-secondary font-black shadow-lg shadow-secondary/20 active:scale-95 transition-all"
              >
                Planejar Viagem
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TripDetail({ trip, onBack }: { trip: TravelerTrip, onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Fixo */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-muted/30 px-4 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-muted/50 h-10 w-10 active:scale-90 transition-transform shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-black tracking-tight truncate">Manifesto de Viagem</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{trip.id}</p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </header>

      <div className="p-4 space-y-6">
        {/* Hero Card Premium */}
        <Card className="rounded-[2.5rem] border-none bg-gradient-to-br from-secondary via-secondary/90 to-secondary/80 text-white shadow-xl shadow-secondary/20 overflow-hidden relative">
          <div className="absolute -top-10 -right-10 p-12 opacity-10">
            <Navigation className="h-48 w-48 rotate-12" />
          </div>
          <CardContent className="p-8 relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <Badge className="bg-white/20 text-white border-none backdrop-blur-md px-2.5 py-0.5 font-bold text-[9px] tracking-widest uppercase">Lucro Estimado</Badge>
                <h3 className="text-3xl font-black tracking-tighter leading-none mt-2">
                  R$ {trip.packages.reduce((acc, p) => acc + p.earnings, 0).toFixed(2)}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-[1.2rem] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Coins className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div className="flex gap-6 border-t border-white/10 pt-6">
              <div className="space-y-1">
                <p className="text-white/60 text-[9px] font-black uppercase tracking-widest">Partida</p>
                <p className="text-sm font-bold">{trip.date} • {trip.time}</p>
              </div>
              <div className="space-y-1">
                <p className="text-white/60 text-[9px] font-black uppercase tracking-widest">Cargas</p>
                <p className="text-sm font-bold">{trip.packages.length} Volumes</p>
              </div>
            </div>
            
            <div className="bg-black/10 backdrop-blur-md p-4 rounded-[1.5rem] flex items-center gap-3 border border-white/5">
              <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <p className="text-[10px] font-medium leading-tight opacity-90">
                Você tem <strong>{trip.packages.length} reservas</strong> ativas. Colete os códigos de segurança.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Route Timeline */}
        <section className="space-y-4">
          <h4 className="text-lg font-black tracking-tight px-1">Seu Trajeto 🗺️</h4>
          <div className="bg-white p-6 rounded-[2.5rem] border border-muted/50 shadow-sm space-y-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center pt-1">
                <div className="h-4 w-4 rounded-full border-4 border-secondary bg-white ring-4 ring-secondary/5" />
                <div className="w-[2px] h-12 bg-gradient-to-b from-secondary via-secondary/50 to-muted-foreground/20 border-dashed border-l-2" />
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Início</p>
                  <p className="text-base font-black text-foreground">{trip.origin}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Fim</p>
                  <p className="text-base font-black text-foreground">{trip.destination}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-1">
            <div>
              <h4 className="text-lg font-black tracking-tight">Cargas 📦</h4>
            </div>
            <Badge className="bg-secondary/10 text-secondary border-none px-3 py-1 font-black text-[9px] mb-1">
              {trip.packages.length} VOLUMES
            </Badge>
          </div>
          
          <div className="space-y-3">
            {trip.packages.length > 0 ? (
              trip.packages.map((pkg) => (
                <Card key={pkg.id} className="rounded-[2rem] border-none shadow-sm hover:shadow-md bg-white overflow-hidden active:scale-[0.98] transition-all cursor-pointer">
                  <CardContent className="p-0">
                    <div className="p-5 flex justify-between items-center bg-muted/10 border-b border-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-secondary">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-muted-foreground tracking-widest uppercase">{pkg.id}</span>
                          <h5 className="text-sm font-black text-foreground">{pkg.item}</h5>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-secondary">R$ {pkg.earnings.toFixed(2)}</p>
                        <p className="text-[8px] font-black text-muted-foreground uppercase">Seu Lucro</p>
                      </div>
                    </div>

                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                          <AvatarImage src={`https://picsum.photos/seed/${pkg.sender}/100/100`} />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Remetente</p>
                          <p className="text-xs font-bold text-foreground">{pkg.sender}</p>
                        </div>
                      </div>
                      <Badge className={cn(
                        "border-none text-[8px] font-black uppercase px-3 py-1 rounded-full shadow-sm",
                        pkg.status === 'delivered' ? 'bg-green-500 text-white' : 
                        pkg.status === 'transit' ? 'bg-primary text-white' : 'bg-orange-500 text-white'
                      )}>
                        {pkg.status === 'transit' ? 'Na Estrada' : pkg.status === 'waiting_pickup' ? 'Coletar' : 'Entregue'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-12 rounded-[2.5rem] bg-muted/10 border-2 border-dashed border-muted flex flex-col items-center justify-center text-center gap-4">
                <Zap className="h-10 w-10 text-muted-foreground/20 animate-pulse" />
                <div className="space-y-1">
                  <p className="text-sm font-black text-muted-foreground tracking-tight">Viagem sem cargas ainda</p>
                  <p className="text-[10px] text-muted-foreground font-medium max-w-[200px] leading-relaxed">
                    Os remetentes verão sua rota em breve e as reservas brilharão aqui.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Primary Actions */}
        <div className="space-y-3 pt-4">
          <Button className="w-full h-14 rounded-[1.5rem] bg-secondary hover:bg-secondary/90 font-black text-sm gap-2 shadow-lg shadow-secondary/20 active:scale-95 transition-all">
            Iniciar Viagem <Truck className="h-5 w-5" />
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-14 rounded-[1.5rem] border-2 border-muted hover:bg-muted/30 font-bold text-muted-foreground gap-2 transition-all text-xs">
              <Calendar className="h-4 w-4" /> Reagendar
            </Button>
            <Button variant="outline" className="h-14 rounded-[1.5rem] border-2 border-destructive/10 text-destructive hover:bg-destructive/5 font-bold transition-all text-xs">
              Cancelar Rota
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
