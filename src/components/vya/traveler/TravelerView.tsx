
"use client";

import { useState } from "react";
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

const MOCK_TRIPS: TravelerTrip[] = [
  {
    id: 'T-9921',
    origin: 'Caruaru, PE',
    destination: 'Recife, PE',
    date: 'Hoje',
    time: '14:30',
    status: 'active',
    packages: [
      { id: 'VY-982', item: 'Smartphone Samsung', sender: 'Lucas S.', status: 'transit', earnings: 18.50 },
      { id: 'VY-441', item: 'Caixa de Doces', sender: 'Maria F.', status: 'waiting_pickup', earnings: 32.20 }
    ]
  },
  {
    id: 'T-8812',
    origin: 'Recife, PE',
    destination: 'Caruaru, PE',
    date: 'Amanhã',
    time: '08:00',
    status: 'scheduled',
    packages: []
  },
  {
    id: 'T-1029',
    origin: 'São Paulo, SP',
    destination: 'Campinas, SP',
    date: '15 Mai',
    time: '10:00',
    status: 'completed',
    packages: [
      { id: 'VY-102', item: 'Notebook Dell', sender: 'Ricardo G.', status: 'delivered', earnings: 45.00 }
    ]
  }
];

export function TravelerView({ initialIsCreating = false }: { initialIsCreating?: boolean }) {
  const [isCreating, setIsCreating] = useState(initialIsCreating);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [selectedTrip, setSelectedTrip] = useState<TravelerTrip | null>(null);

  if (isCreating) {
    return (
      <div className="space-y-6 page-transition">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full bg-muted h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold">Planejar Viagem</h2>
        </div>
        <TripForm onComplete={() => setIsCreating(false)} />
      </div>
    );
  }

  if (selectedTrip) {
    return <TripDetail trip={selectedTrip} onBack={() => setSelectedTrip(null)} />;
  }

  const filteredTrips = MOCK_TRIPS.filter(t => 
    activeTab === 'active' ? t.status !== 'completed' : t.status === 'completed'
  );

  return (
    <div className="space-y-8 page-transition pb-32">
      <header className="flex justify-between items-end pt-2 px-1">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Minhas Viagens</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Sua malha logística ativa</p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="rounded-[1.5rem] h-14 px-6 bg-secondary hover:bg-secondary/90 shadow-xl shadow-secondary/20 gap-2 font-black text-sm active:scale-95 transition-all"
        >
          <Plus className="h-5 w-5" /> Nova Viagem
        </Button>
      </header>

      <div className="flex p-1.5 bg-muted/30 rounded-[2rem] border border-muted/50 backdrop-blur-sm">
        <button
          onClick={() => setActiveTab('active')}
          className={cn(
            "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all",
            activeTab === 'active' ? "bg-white shadow-md text-secondary" : "text-muted-foreground/60 hover:text-secondary"
          )}
        >
          Em Aberto
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all",
            activeTab === 'history' ? "bg-white shadow-md text-secondary" : "text-muted-foreground/60 hover:text-secondary"
          )}
        >
          Histórico
        </button>
      </div>

      <div className="space-y-6">
        {filteredTrips.length > 0 ? (
          filteredTrips.map((trip) => (
            <Card 
              key={trip.id} 
              onClick={() => setSelectedTrip(trip)}
              className="rounded-[3rem] border-none shadow-xl hover:shadow-2xl bg-white overflow-hidden active:scale-[0.98] transition-all duration-300 group cursor-pointer"
            >
              <CardContent className="p-0">
                {/* Top Strip - Status & ID */}
                <div className="bg-muted/20 px-8 py-4 flex justify-between items-center border-b border-muted/10">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{trip.id}</span>
                    {trip.status === 'active' && (
                      <Badge className="bg-green-500 text-white border-none text-[8px] font-black px-2 py-0.5 animate-pulse shadow-lg shadow-green-200">
                        EM CURSO
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
                    <Calendar className="h-3 w-3" /> {trip.date} • {trip.time}
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  {/* Route Visualizer */}
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-3 w-3 rounded-full border-2 border-secondary bg-white" />
                      <div className="w-[1.5px] h-8 bg-gradient-to-b from-secondary to-muted-foreground/20 border-dashed border-l-2" />
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-lg font-black text-foreground tracking-tight group-hover:text-secondary transition-colors">
                        {trip.origin} → {trip.destination}
                      </p>
                    </div>
                  </div>

                  {/* Earnings & Packages Info */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-4 bg-secondary/5 p-4 rounded-[2rem] border border-secondary/10">
                      <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-secondary">
                        <Coins className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-secondary uppercase tracking-widest opacity-70">Ganhos Previstos</p>
                        <h4 className="text-xl font-black text-secondary tracking-tight">
                          R$ {trip.packages.reduce((acc, p) => acc + p.earnings, 0).toFixed(2)}
                        </h4>
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 px-6 py-4 rounded-[2rem] text-center border border-muted-foreground/5 min-w-[100px]">
                      <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Cargas</p>
                      <p className="text-sm font-black text-foreground">{trip.packages.length} Pacotes</p>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-8 pb-6 flex justify-end">
                  <div className="h-10 w-10 rounded-full bg-muted/20 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-24 text-center space-y-6 page-transition">
            <div className="h-24 w-24 bg-muted/20 rounded-[2.5rem] flex items-center justify-center mx-auto relative">
              <MapIcon className="h-10 w-10 text-muted-foreground/20" />
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-sm">
                <Plus className="h-5 w-5 text-muted-foreground/40" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-black text-muted-foreground tracking-tighter">Estrada vazia por enquanto...</p>
              <p className="text-sm text-muted-foreground/60 max-w-[240px] mx-auto font-medium">
                Sua próxima oportunidade de lucro começa com uma nova rota.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="rounded-2xl border-2 border-dashed h-12 px-8 font-bold text-muted-foreground hover:bg-secondary/5 hover:text-secondary transition-all" 
              onClick={() => setIsCreating(true)}
            >
              Planejar agora
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function TripDetail({ trip, onBack }: { trip: TravelerTrip, onBack: () => void }) {
  return (
    <div className="space-y-8 page-transition pb-32">
      <header className="flex items-center gap-4 pt-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-muted/50 h-10 w-10 active:scale-90 transition-transform">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-black tracking-tighter">Detalhes da Viagem</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{trip.id}</p>
        </div>
      </header>

      {/* Hero Card Premium */}
      <Card className="rounded-[3rem] border-none bg-gradient-to-br from-secondary via-secondary/90 to-secondary/80 text-white shadow-2xl shadow-secondary/30 overflow-hidden relative">
        <div className="absolute -top-10 -right-10 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700">
          <Navigation className="h-48 w-48 rotate-12" />
        </div>
        <CardContent className="p-10 relative z-10 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Badge className="bg-white/20 text-white border-none backdrop-blur-md px-3 py-1 font-bold text-[10px] tracking-wider uppercase">Lucro Total Estimado</Badge>
              <h3 className="text-4xl font-black tracking-tighter">
                R$ {trip.packages.reduce((acc, p) => acc + p.earnings, 0).toFixed(2)}
              </h3>
            </div>
            <div className="h-14 w-14 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Coins className="h-7 w-7 text-white" />
            </div>
          </div>
          
          <div className="flex gap-8 border-t border-white/10 pt-8">
            <div className="space-y-1">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Partida</p>
              <p className="text-sm font-bold">{trip.date} • {trip.time}</p>
            </div>
            <div className="space-y-1">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Cargas</p>
              <p className="text-sm font-bold">{trip.packages.length} Volumes</p>
            </div>
          </div>
          
          <div className="bg-black/10 backdrop-blur-md p-5 rounded-[2rem] flex items-center gap-4 border border-white/5">
            <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <p className="text-[11px] font-medium leading-relaxed opacity-90">
              Você tem <strong>{trip.packages.length} reservas</strong> ativas. Colete os códigos de segurança em cada ponto de encontro.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Route Timeline */}
      <section className="space-y-4">
        <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Seu Trajeto</h4>
        <div className="bg-white p-6 rounded-[2.5rem] border border-muted/50 space-y-6">
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
      <section className="space-y-6">
        <div className="flex justify-between items-end px-1">
          <div>
            <h4 className="text-xl font-black tracking-tighter">Manifesto de Carga 📦</h4>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Itens reservados para você</p>
          </div>
          <Badge className="bg-secondary/10 text-secondary border-none px-3 py-1 font-black text-[9px] mb-1">
            {trip.packages.length} VOLUMES
          </Badge>
        </div>
        
        <div className="space-y-4">
          {trip.packages.length > 0 ? (
            trip.packages.map((pkg) => (
              <Card key={pkg.id} className="rounded-[2.5rem] border-none shadow-lg hover:shadow-xl bg-white overflow-hidden active:scale-[0.99] transition-all group">
                <CardContent className="p-0">
                  <div className="p-6 flex justify-between items-center bg-muted/10 border-b border-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
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

                  <div className="p-6 flex items-center justify-between">
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
                      "border-none text-[8px] font-black uppercase px-4 py-1.5 rounded-full shadow-sm",
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
            <div className="p-16 rounded-[3rem] bg-muted/10 border-2 border-dashed border-muted flex flex-col items-center justify-center text-center gap-4">
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
      <div className="space-y-3 pt-6">
        <Button className="w-full h-16 rounded-[1.5rem] bg-secondary hover:bg-secondary/90 font-black text-base gap-3 shadow-2xl shadow-secondary/20 active:scale-95 transition-all">
          Iniciar Viagem <Truck className="h-6 w-6" />
        </Button>
        
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-14 rounded-2xl border-2 border-muted hover:bg-muted/30 font-bold text-muted-foreground gap-2 transition-all">
            <Calendar className="h-4 w-4" /> Reagendar
          </Button>
          <Button variant="outline" className="h-14 rounded-2xl border-2 border-destructive/10 text-destructive hover:bg-destructive/5 font-bold transition-all">
            Cancelar Rota
          </Button>
        </div>
      </div>
    </div>
  );
}
