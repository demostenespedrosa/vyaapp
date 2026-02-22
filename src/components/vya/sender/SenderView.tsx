
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
  MapPinned,
  ArrowLeft,
  ShieldCheck,
  Hash,
  Phone,
  User,
  Info,
  ExternalLink,
  HelpCircle,
  Copy,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PackageForm } from "./PackageForm";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Estados detalhados do envio
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
  pickupCode: string; // Código de 6 dígitos (000-000)
  deliveryCode: string; // Código de 6 dígitos (000-000)
  recipient: {
    name: string;
    phone: string;
    cpf: string;
  };
  traveler?: {
    name: string;
    rating: number;
    photo: string;
  };
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
    price: 25.00,
    pickupCode: '442-981',
    deliveryCode: '110-334',
    recipient: { name: 'Mariana Costa', phone: '(11) 98877-6655', cpf: '***.443.221-**' },
    traveler: { name: 'Ricardo Silva', rating: 4.9, photo: 'https://picsum.photos/seed/traveler1/100/100' }
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
    price: 45.00,
    pickupCode: '882-114',
    deliveryCode: '993-002',
    recipient: { name: 'João Pedro', phone: '(41) 99988-7766', cpf: '***.112.334-**' }
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
    price: 15.00,
    pickupCode: '109-223',
    deliveryCode: '554-881',
    recipient: { name: 'Cláudia Souza', phone: '(21) 97766-5544', cpf: '***.887.665-**' },
    traveler: { name: 'Beatriz Lima', rating: 4.8, photo: 'https://picsum.photos/seed/traveler2/100/100' }
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
    price: 55.00,
    pickupCode: '332-119',
    deliveryCode: '882-441',
    recipient: { name: 'Felipe Mendes', phone: '(27) 96655-4433', cpf: '***.554.332-**' },
    traveler: { name: 'Carlos Santos', rating: 5.0, photo: 'https://picsum.photos/seed/traveler3/100/100' }
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
    price: 120.00,
    pickupCode: '112-993',
    deliveryCode: '445-102',
    recipient: { name: 'Ana Beatriz', phone: '(51) 95544-3322', cpf: '***.223.445-**' },
    traveler: { name: 'Marcos Oliver', rating: 4.7, photo: 'https://picsum.photos/seed/traveler4/100/100' }
  }
];

export function SenderView({ initialIsCreating = false }: { initialIsCreating?: boolean }) {
  const [isCreating, setIsCreating] = useState(initialIsCreating);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [searchQuery, setSearchQuery] = useState("");

  if (isCreating) {
    return (
      <div className="space-y-6 page-transition">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full bg-muted h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold">O que vamos mandar?</h2>
        </div>
        <PackageForm onComplete={() => setIsCreating(false)} />
      </div>
    );
  }

  if (selectedShipment) {
    return <ShipmentDetail shipment={selectedShipment} onBack={() => setSelectedShipment(null)} />;
  }

  const filteredShipments = MOCK_SHIPMENTS.filter(s => {
    const isTabMatch = activeTab === 'active' 
      ? (s.status !== 'delivered' && s.status !== 'canceled')
      : (s.status === 'delivered' || s.status === 'canceled');
    
    const isSearchMatch = s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return isTabMatch && isSearchMatch;
  });

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
            <ShipmentCard key={shipment.id} shipment={shipment} onClick={() => setSelectedShipment(shipment)} />
          ))
        ) : (
          <EmptyState onAction={() => setIsCreating(true)} />
        )}
      </div>
    </div>
  );
}

function ShipmentCard({ shipment, onClick }: { shipment: Shipment, onClick: () => void }) {
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
    <div onClick={onClick} className="relative group active:scale-[0.98] transition-all cursor-pointer">
      <div className="bg-white rounded-[2rem] border border-muted p-5 shadow-sm hover:shadow-md transition-all">
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

        <div className="flex items-center gap-4 mb-4">
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

        <div className="space-y-2 mt-4 pt-4 border-t">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Atualizado há pouco
            </span>
            <span className="text-primary">{shipment.progress}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${shipment.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ShipmentDetail({ shipment, onBack }: { shipment: Shipment, onBack: () => void }) {
  const { toast } = useToast();
  const steps = [
    { id: 'searching', label: 'Buscando Viajante', sub: 'Sistema procurando match' },
    { id: 'waiting_pickup', label: 'Aguardando Coleta', sub: 'Viajante indo ao ponto' },
    { id: 'transit', label: 'Em Trânsito', sub: 'Pacote na estrada' },
    { id: 'waiting_delivery', label: 'Pronto para Retirada', sub: 'Aguardando destinatário' },
    { id: 'delivered', label: 'Entregue', sub: 'Finalizado com sucesso' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === shipment.status);

  const copyCode = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado!",
      description: `Código de ${type} pronto para colar.`,
    });
  };

  return (
    <div className="space-y-8 page-transition pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-muted h-10 w-10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">Envio {shipment.id}</h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Criado em {shipment.date}</p>
        </div>
      </div>

      {/* Status Hero */}
      <Card className="rounded-[2.5rem] border-none bg-primary text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Truck className="h-32 w-32" />
        </div>
        <CardContent className="p-8 relative z-10 space-y-4">
          <div className="space-y-1">
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Status Atual</p>
            <h3 className="text-2xl font-bold">{shipment.statusLabel}</h3>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <p className="text-xs font-medium leading-relaxed">
              Pagamento seguro retido. Valor será liberado apenas após a confirmação dos códigos.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Linha do Tempo */}
      <section className="space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Rastreio em Tempo Real</h4>
        <div className="space-y-6 pl-2">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isLast = idx === steps.length - 1;

            return (
              <div key={step.id} className="flex gap-4 relative">
                {!isLast && (
                  <div className={cn(
                    "absolute left-[11px] top-6 w-[2px] h-full",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )} />
                )}
                <div className={cn(
                  "h-6 w-6 rounded-full border-4 z-10 flex items-center justify-center shrink-0",
                  isCompleted ? "bg-primary border-primary text-white" : 
                  isCurrent ? "bg-white border-primary animate-pulse" : "bg-white border-muted"
                )}>
                  {isCompleted && <CheckCircle2 className="h-3 w-3" />}
                </div>
                <div className={cn(
                  "flex-1 pb-2",
                  isCurrent ? "opacity-100" : isCompleted ? "opacity-80" : "opacity-40"
                )}>
                  <p className={cn("text-sm font-bold", isCurrent && "text-primary")}>{step.label}</p>
                  <p className="text-[10px] text-muted-foreground">{step.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Códigos de Segurança */}
      {shipment.status !== 'delivered' && (
        <section className="space-y-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Confirmação de Segurança 🔐</h4>
          
          <div className="grid gap-3">
            {/* Código de Coleta - Remetente fornece ao viajante */}
            <Card className="rounded-[2rem] border-none bg-muted/30 overflow-hidden group">
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Package className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Código de Coleta</p>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-bold uppercase border-primary/20 text-primary">Para o Viajante</Badge>
                </div>
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm">
                  <span className="text-2xl font-bold tracking-[0.3rem] text-primary">{shipment.pickupCode}</span>
                  <Button variant="ghost" size="icon" onClick={() => copyCode(shipment.pickupCode, "coleta")}>
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                <p className="text-[9px] text-muted-foreground leading-relaxed">
                  Forneça este código ao viajante assim que ele coletar o pacote com você.
                </p>
              </CardContent>
            </Card>

            {/* Código de Entrega - Destinatário fornece ao viajante */}
            <Card className="rounded-[2rem] border-none bg-muted/30 overflow-hidden group">
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Código de Entrega</p>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-bold uppercase border-secondary/20 text-secondary">Para o Destinatário</Badge>
                </div>
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm">
                  <span className="text-2xl font-bold tracking-[0.3rem] text-secondary">{shipment.deliveryCode}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => copyCode(shipment.deliveryCode, "entrega")}>
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground leading-relaxed">
                  Compartilhe este código com o <strong>destinatário</strong>. Ele deve informar ao viajante na hora da entrega.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Informações do Envio */}
      <section className="space-y-3">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Dados da Entrega</h4>
        <Card className="rounded-[2rem] border-muted bg-white overflow-hidden shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">O que é</p>
                <p className="text-sm font-bold">{shipment.description}</p>
                <p className="text-[10px] text-muted-foreground">Tamanho {shipment.size} • R$ {shipment.price.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                  <div className="h-2 w-2 rounded-full bg-primary/30" />
                  <div className="w-[1px] h-8 border-l border-dashed border-primary/30" />
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Origem</p>
                    <p className="text-xs font-medium">{shipment.from}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Destino Final</p>
                    <p className="text-xs font-medium">{shipment.to}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Destinatário</p>
                    <p className="text-xs font-bold">{shipment.recipient.name}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full bg-primary/5 text-primary">
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Ações de Suporte */}
      <section className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-14 rounded-2xl gap-2 font-bold border-muted text-muted-foreground">
          <HelpCircle className="h-5 w-5" /> Ajuda
        </Button>
        <Button variant="outline" className="h-14 rounded-2xl gap-2 font-bold border-destructive/20 text-destructive hover:bg-destructive/5">
          Cancelar
        </Button>
      </section>
    </div>
  );
}

function EmptyState({ onAction }: { onAction: () => void }) {
  return (
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
        onClick={onAction}
      >
        Começar agora
      </Button>
    </div>
  );
}
