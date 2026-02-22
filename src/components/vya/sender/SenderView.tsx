
"use client";

import { useState } from "react";
import { 
  Package, 
  Plus, 
  ArrowRight, 
  Search, 
  Clock, 
  CheckCircle2, 
  Truck, 
  MapPin,
  ChevronRight,
  MoreVertical,
  UserCheck,
  PackageOpen,
  MapPinned
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PackageForm } from "./PackageForm";
import { cn } from "@/lib/utils";

// Novos estados detalhados conforme solicitado
type ShipmentStatus = 'searching' | 'waiting_pickup' | 'transit' | 'waiting_delivery' | 'delivered' | 'canceled';

interface Shipment {
  id: string;
  status: ShipmentStatus;
  statusLabel: string;
  description: string;
  from: string;
  to: string;
  date: string;
  size: 'P' | 'M' | 'G';
  progress: number;
  price: number;
}

const MOCK_SHIPMENTS: Shipment[] = [
  { 
    id: 'VY-9821', 
    status: 'transit', 
    statusLabel: 'A caminho', 
    description: 'Tênis Nike e Camisetas',
    from: 'São Paulo, SP', 
    to: 'Campinas, SP', 
    date: 'Hoje, 14:20', 
    size: 'P', 
    progress: 65,
    price: 25.00
  },
  { 
    id: 'VY-4412', 
    status: 'searching', 
    statusLabel: 'Buscando viajante', 
    description: 'Livros de Design',
    from: 'Curitiba, PR', 
    to: 'Joinville, SC', 
    date: 'Hoje, 10:05', 
    size: 'M', 
    progress: 15,
    price: 45.00
  },
  { 
    id: 'VY-7723', 
    status: 'waiting_pickup', 
    statusLabel: 'Aguardando coleta', 
    description: 'Documentos urgentes',
    from: 'Rio de Janeiro, RJ', 
    to: 'Niterói, RJ', 
    date: 'Hoje, 16:00', 
    size: 'P', 
    progress: 40,
    price: 15.00
  },
  { 
    id: 'VY-3391', 
    status: 'waiting_delivery', 
    statusLabel: 'Aguardando retirada', 
    description: 'Café Especial',
    from: 'Belo Horizonte, MG', 
    to: 'Vitória, ES', 
    date: 'Ontem, 09:30', 
    size: 'M', 
    progress: 90,
    price: 55.00
  },
  { 
    id: 'VY-1029', 
    status: 'delivered', 
    statusLabel: 'Concluído', 
    description: 'Notebook Dell',
    from: 'Florianópolis, SC', 
    to: 'Porto Alegre, RS', 
    date: '2 dias atrás', 
    size: 'G', 
    progress: 100,
    price: 120.00
  }
];

export function SenderView({ initialIsCreating = false }: { initialIsCreating?: boolean }) {
  const [isCreating, setIsCreating] = useState(initialIsCreating);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [searchQuery, setSearchQuery] = useState("");

  if (isCreating) {
    return (
      <div className="space-y-6 page-transition">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full bg-muted h-10 w-10">
            <ArrowRight className="h-5 w-5 rotate-180" />
          </Button>
          <h2 className="text-xl font-bold">O que vamos mandar?</h2>
        </div>
        <PackageForm onComplete={() => setIsCreating(false)} />
      </div>
    );
  }

  const filteredShipments = MOCK_SHIPMENTS.filter(s => {
    // Filtro de abas: 'active' mostra tudo exceto entregue ou cancelado
    const isTabMatch = activeTab === 'active' 
      ? (s.status !== 'delivered' && s.status !== 'canceled')
      : (s.status === 'delivered' || s.status === 'canceled');
    
    const isSearchMatch = s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return isTabMatch && isSearchMatch;
  });

  const getStatusIcon = (status: ShipmentStatus) => {
    switch (status) {
      case 'searching': return <UserCheck className="h-5 w-5" />;
      case 'waiting_pickup': return <PackageOpen className="h-5 w-5" />;
      case 'transit': return <Truck className="h-5 w-5" />;
      case 'waiting_delivery': return <MapPinned className="h-5 w-5" />;
      case 'delivered': return <CheckCircle2 className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
      case 'searching': return "bg-orange-50 text-orange-600";
      case 'waiting_pickup': return "bg-blue-50 text-blue-600";
      case 'transit': return "bg-primary/10 text-primary";
      case 'waiting_delivery': return "bg-purple-50 text-purple-600";
      case 'delivered': return "bg-green-50 text-green-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 page-transition pb-10">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold">Meus Envios</h1>
        <Button 
          onClick={() => setIsCreating(true)}
          className="rounded-full h-12 px-6 bg-primary shadow-lg shadow-primary/20 gap-2 font-bold"
        >
          <Plus className="h-5 w-5" /> Novo Envio
        </Button>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Buscar pacote ou destino..." 
            className="pl-11 h-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex p-1 bg-muted/40 rounded-2xl border border-muted">
          <button
            onClick={() => setActiveTab('active')}
            className={cn(
              "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all",
              activeTab === 'active' ? "bg-white shadow-sm text-primary" : "text-muted-foreground"
            )}
          >
            Em andamento
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all",
              activeTab === 'history' ? "bg-white shadow-sm text-primary" : "text-muted-foreground"
            )}
          >
            Concluídos
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredShipments.length > 0 ? (
          filteredShipments.map((shipment) => (
            <div key={shipment.id} className="relative group active:scale-[0.98] transition-all">
              <div className="bg-white rounded-[2rem] border border-muted p-5 shadow-sm hover:shadow-md transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-2xl flex items-center justify-center transition-colors",
                      getStatusColor(shipment.status)
                    )}>
                      {getStatusIcon(shipment.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">{shipment.id}</span>
                        <Badge variant="outline" className="text-[9px] font-bold h-4 px-1 border-primary/20 text-primary">TAM {shipment.size}</Badge>
                      </div>
                      <p className="text-sm font-bold">{shipment.statusLabel}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mb-3 font-medium line-clamp-1">{shipment.description}</p>

                <div className="flex items-center gap-4 mb-4 relative">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary/30" />
                    <div className="w-[1px] h-4 border-l border-dashed border-primary/30" />
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground truncate">{shipment.from}</p>
                    <p className="text-xs font-bold truncate">{shipment.to}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary">R$ {shipment.price.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">{shipment.date}</p>
                  </div>
                </div>

                {activeTab === 'active' && (
                  <div className="space-y-2 mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Atualizado há pouco
                      </span>
                      <span className="text-primary">{shipment.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(var(--primary),0.4)]"
                        style={{ width: `${shipment.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <CheckCircle2 className="h-3 w-3" /> Concluído com sucesso
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs font-bold gap-1 text-primary p-0 h-auto">
                      Ver detalhes <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto">
              <Truck className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <div>
              <p className="font-bold text-muted-foreground">Nada por aqui ainda...</p>
              <p className="text-xs text-muted-foreground/60">Bora fazer o seu primeiro envio?</p>
            </div>
            <Button 
              variant="outline" 
              className="rounded-2xl border-dashed border-2 hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all"
              onClick={() => setIsCreating(true)}
            >
              Começar agora
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
