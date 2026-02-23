
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
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TripForm } from "./TripForm";
import { WalletCard } from "../shared/WalletCard";
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
    <div className="space-y-8 page-transition pb-24">
      <header className="flex justify-between items-center pt-2">
        <h1 className="text-2xl font-bold">Minhas Viagens</h1>
        <Button 
          onClick={() => setIsCreating(true)}
          className="rounded-full h-12 px-6 bg-secondary shadow-lg shadow-secondary/20 gap-2 font-bold"
        >
          <Plus className="h-5 w-5" /> Nova Viagem
        </Button>
      </header>

      <div className="flex p-1 bg-muted/40 rounded-2xl border border-muted">
        <button
          onClick={() => setActiveTab('active')}
          className={cn(
            "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all",
            activeTab === 'active' ? "bg-white shadow-sm text-secondary" : "text-muted-foreground"
          )}
        >
          Ativas
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all",
            activeTab === 'history' ? "bg-white shadow-sm text-secondary" : "text-muted-foreground"
          )}
        >
          Histórico
        </button>
      </div>

      <div className="space-y-4">
        {filteredTrips.length > 0 ? (
          filteredTrips.map((trip) => (
            <Card 
              key={trip.id} 
              onClick={() => setSelectedTrip(trip)}
              className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden active:scale-[0.98] transition-all cursor-pointer group"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{trip.id}</span>
                      {trip.status === 'active' && (
                        <Badge className="bg-green-50 text-green-600 border-none text-[8px] animate-pulse">EM CURSO</Badge>
                      )}
                    </div>
                    <p className="font-bold text-base leading-tight group-hover:text-secondary transition-colors">{trip.origin} → {trip.destination}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{trip.date}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">{trip.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-full">
                    <Package className="h-3.5 w-3.5 text-secondary" />
                    <span className="text-[11px] font-bold text-slate-700">{trip.packages.length} Pacotes</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-secondary/10 px-3 py-1.5 rounded-full">
                    <Wallet className="h-3.5 w-3.5 text-secondary" />
                    <span className="text-[11px] font-bold text-secondary">R$ {trip.packages.reduce((acc, p) => acc + p.earnings, 0).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto">
              <MapIcon className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <div>
              <p className="font-bold text-muted-foreground">Nenhuma viagem ativa.</p>
              <p className="text-xs text-muted-foreground/60">Bora planejar sua próxima rota?</p>
            </div>
            <Button variant="outline" className="rounded-2xl border-dashed border-2" onClick={() => setIsCreating(true)}>
              Começar agora
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-muted h-10 w-10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">Viagem {trip.id}</h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{trip.origin} → {trip.destination}</p>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-none bg-secondary text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Navigation className="h-32 w-32" />
        </div>
        <CardContent className="p-8 relative z-10 space-y-6">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Ganhos Previstos</p>
              <h3 className="text-3xl font-bold">R$ {trip.packages.reduce((acc, p) => acc + p.earnings, 0).toFixed(2)}</h3>
            </div>
            <div className="text-right space-y-1">
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Data Partida</p>
              <p className="text-sm font-bold">{trip.date} • {trip.time}</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <p className="text-[11px] leading-relaxed">
              Você tem <strong>{trip.packages.length} pacotes</strong> confirmados. Certifique-se de coletar todos nos pontos de encontro.
            </p>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pacotes Atribuídos</h4>
          <Badge variant="outline" className="text-[9px] border-secondary/20 text-secondary">{trip.packages.length} UNIDADES</Badge>
        </div>
        
        <div className="space-y-3">
          {trip.packages.length > 0 ? (
            trip.packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-[2rem] border border-muted p-5 shadow-sm active:scale-[0.99] transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">{pkg.id}</span>
                      <p className="text-sm font-bold">{pkg.item}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-secondary">R$ {pkg.earnings.toFixed(2)}</p>
                    <p className="text-[9px] text-muted-foreground font-medium">Seu lucro</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border">
                      <AvatarImage src={`https://picsum.photos/seed/${pkg.sender}/100/100`} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] font-bold text-muted-foreground">{pkg.sender}</span>
                  </div>
                  <Badge className={cn(
                    "border-none text-[8px] font-bold uppercase px-3 py-1",
                    pkg.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                  )}>
                    {pkg.status === 'transit' ? 'A Caminho' : pkg.status === 'waiting_pickup' ? 'A Coletar' : 'Entregue'}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 rounded-[2rem] bg-muted/20 border border-dashed text-center space-y-2">
              <Zap className="h-8 w-8 text-muted-foreground/30 mx-auto" />
              <p className="text-xs font-bold text-muted-foreground">Nenhum pacote ainda.</p>
              <p className="text-[10px] text-muted-foreground/60">As reservas aparecerão aqui automaticamente.</p>
            </div>
          )}
        </div>
      </section>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1 h-14 rounded-2xl border-muted font-bold text-muted-foreground gap-2">
          <Calendar className="h-5 w-5" /> Reagendar
        </Button>
        <Button className="flex-1 h-14 rounded-2xl bg-secondary font-bold gap-2">
          Iniciar Viagem <Truck className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
