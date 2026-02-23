
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
  Share2,
  Zap,
  Box,
  QrCode
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
          <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full bg-muted h-10 w-10 active:scale-90 transition-transform">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-black tracking-tighter">Novo Envio</h2>
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
    <div className="space-y-8 page-transition pb-20">
      <div className="flex items-end justify-between pt-2 px-1">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Seus Envios</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Gestão de encomendas ativa</p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="rounded-[1.5rem] h-14 px-6 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 gap-2 font-black text-sm active:scale-95 transition-all"
        >
          <Plus className="h-5 w-5" /> Novo Envio
        </Button>
      </div>

      <div className="space-y-4">
        <div className="relative group mx-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Rastrear por código ou destino..." 
            className="pl-12 h-14 rounded-[1.5rem] bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex p-1.5 bg-muted/30 rounded-[2rem] border border-muted/50 backdrop-blur-sm mx-1">
          <button
            onClick={() => setActiveTab('active')}
            className={cn(
              "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all",
              activeTab === 'active' ? "bg-white shadow-md text-primary" : "text-muted-foreground/60 hover:text-primary"
            )}
          >
            Em Andamento
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all",
              activeTab === 'history' ? "bg-white shadow-md text-primary" : "text-muted-foreground/60 hover:text-primary"
            )}
          >
            Histórico
          </button>
        </div>
      </div>

      <div className="space-y-6 px-1">
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
      case 'searching': return <UserCheck className="h-6 w-6" />;
      case 'waiting_pickup': return <PackageOpen className="h-6 w-6" />;
      case 'transit': return <Truck className="h-6 w-6" />;
      case 'waiting_delivery': return <MapPinned className="h-6 w-6" />;
      case 'delivered': return <CheckCircle2 className="h-6 w-6" />;
      default: return <Package className="h-6 w-6" />;
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
    <Card 
      onClick={onClick} 
      className="rounded-[3rem] border-none shadow-xl hover:shadow-2xl bg-white overflow-hidden active:scale-[0.98] transition-all duration-300 group cursor-pointer"
    >
      <CardContent className="p-0">
        {/* Top Header do Card */}
        <div className="bg-muted/10 px-8 py-4 flex justify-between items-center border-b border-muted/5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{shipment.id}</span>
            <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[8px] font-black px-2 py-0.5">
              TAM {shipment.size}
            </Badge>
          </div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter flex items-center gap-1">
            <Clock className="h-3 w-3" /> {shipment.date}
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-14 w-14 rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
                getStatusColor(shipment.status)
              )}>
                {getStatusIcon(shipment.status)}
              </div>
              <div>
                <h4 className="text-lg font-black text-foreground tracking-tight leading-none group-hover:text-primary transition-colors">
                  {shipment.statusLabel}
                </h4>
                <p className="text-xs text-muted-foreground font-medium mt-1 line-clamp-1">{shipment.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-primary tracking-tighter">R$ {shipment.price.toFixed(2)}</p>
              <p className="text-[9px] font-black text-muted-foreground uppercase">Frete Pago</p>
            </div>
          </div>

          {/* Rota Visual */}
          <div className="flex items-center gap-4 bg-muted/10 p-4 rounded-[2rem] border border-muted/5 overflow-hidden">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Origem</p>
              <p className="text-xs font-bold truncate text-foreground">{shipment.from.split(',')[0]}</p>
            </div>
            <div className="flex flex-col items-center px-2">
              <ArrowRight className="h-4 w-4 text-primary opacity-30" />
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Destino</p>
              <p className="text-xs font-bold truncate text-foreground">{shipment.to.split(',')[0]}</p>
            </div>
          </div>

          {/* Progresso com Estilo */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span className="text-muted-foreground">Progresso do Rastreio</span>
              <span className="text-primary">{shipment.progress}%</span>
            </div>
            <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all duration-1000 ease-out"
                style={{ width: `${shipment.progress}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ShipmentDetail({ shipment, onBack }: { shipment: Shipment, onBack: () => void }) {
  const { toast } = useToast();
  const steps = [
    { id: 'searching', label: 'Buscando Viajante', sub: 'Match em processamento' },
    { id: 'waiting_pickup', label: 'Aguardando Coleta', sub: 'Viajante indo ao ponto' },
    { id: 'transit', label: 'Em Trânsito', sub: 'Pacote na estrada' },
    { id: 'waiting_delivery', label: 'Pronto para Retirada', sub: 'Destinatário acionado' },
    { id: 'delivered', label: 'Entregue', sub: 'Jornada concluída' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === shipment.status);

  const copyCode = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copiado! 📋",
      description: `Código de ${type} pronto para ser enviado.`,
    });
  };

  return (
    <div className="space-y-8 page-transition pb-20">
      <header className="flex items-center gap-4 pt-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-muted/50 h-10 w-10 active:scale-90 transition-transform">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-black tracking-tighter">Detalhes do Envio</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{shipment.id}</p>
        </div>
      </header>

      {/* Hero Status Card (DOPAMINA) */}
      <Card className="rounded-[3rem] border-none bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white shadow-2xl shadow-primary/30 overflow-hidden relative">
        <div className="absolute -top-10 -right-10 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700">
          <Zap className="h-48 w-48 rotate-12 fill-current" />
        </div>
        <CardContent className="p-10 relative z-10 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Badge className="bg-white/20 text-white border-none backdrop-blur-md px-3 py-1 font-bold text-[10px] tracking-wider uppercase">Status Logístico</Badge>
              <h3 className="text-4xl font-black tracking-tighter">{shipment.statusLabel}</h3>
            </div>
            <div className="h-14 w-14 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <QrCode className="h-7 w-7 text-white" />
            </div>
          </div>
          
          <div className="bg-black/10 backdrop-blur-md p-5 rounded-[2rem] flex items-center gap-4 border border-white/5">
            <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <p className="text-[11px] font-medium leading-relaxed opacity-90">
              Sua encomenda está protegida pelo **VYA Safe**. O pagamento só é liberado após a confirmação total.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Linha do Tempo Estilizada */}
      <section className="space-y-6">
        <div className="flex justify-between items-end px-1">
          <div>
            <h4 className="text-xl font-black tracking-tighter">Rastreamento 🗺️</h4>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Histórico de movimentação</p>
          </div>
          <Badge className="bg-primary/10 text-primary border-none px-3 py-1 font-black text-[9px] mb-1">
            AO VIVO
          </Badge>
        </div>
        
        <div className="bg-white p-8 rounded-[3rem] border border-muted/50 shadow-sm space-y-8 relative">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isLast = idx === steps.length - 1;

            return (
              <div key={step.id} className="flex gap-6 relative">
                {!isLast && (
                  <div className={cn(
                    "absolute left-[13px] top-8 w-[2px] h-[calc(100%+32px)] transition-colors duration-500",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )} />
                )}
                <div className={cn(
                  "h-7 w-7 rounded-full border-4 z-10 flex items-center justify-center shrink-0 transition-all duration-500 shadow-sm",
                  isCompleted ? "bg-primary border-primary text-white" : 
                  isCurrent ? "bg-white border-primary animate-pulse" : "bg-white border-muted"
                )}>
                  {isCompleted && <CheckCircle2 className="h-3 w-3" />}
                </div>
                <div className={cn(
                  "flex-1 transition-opacity duration-500",
                  isCurrent ? "opacity-100" : isCompleted ? "opacity-60" : "opacity-30"
                )}>
                  <p className={cn("text-base font-black tracking-tight", isCurrent && "text-primary")}>{step.label}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{step.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Códigos de Segurança (O "Cofre") */}
      {shipment.status !== 'delivered' && (
        <section className="space-y-6">
          <div className="px-1">
            <h4 className="text-xl font-black tracking-tighter">Chaves de Segurança 🔐</h4>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Confirmação via protocolo VYA</p>
          </div>
          
          <div className="grid gap-4">
            {/* Código de Coleta */}
            <Card className="rounded-[2.5rem] border-none bg-muted/30 overflow-hidden group">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Protocolo de Coleta</p>
                      <h5 className="text-sm font-black text-foreground">Para o Viajante</h5>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-xl border border-primary/5">
                  <span className="text-3xl font-black tracking-[0.4rem] text-primary font-code">{shipment.pickupCode}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-12 w-12 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors"
                    onClick={() => copyCode(shipment.pickupCode, "coleta")}
                  >
                    <Copy className="h-5 w-5 text-primary" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed px-2">
                  Mostre ou informe este código ao viajante apenas **no momento em que ele pegar o pacote**.
                </p>
              </CardContent>
            </Card>

            {/* Código de Entrega */}
            <Card className="rounded-[2.5rem] border-none bg-muted/30 overflow-hidden group">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:rotate-12 transition-transform">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Protocolo de Entrega</p>
                      <h5 className="text-sm font-black text-foreground">Para o Destinatário</h5>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-xl border border-secondary/5">
                  <span className="text-3xl font-black tracking-[0.4rem] text-secondary font-code">{shipment.deliveryCode}</span>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-12 w-12 rounded-full bg-secondary/5 hover:bg-secondary/10"
                      onClick={() => copyCode(shipment.deliveryCode, "entrega")}
                    >
                      <Copy className="h-5 w-5 text-secondary" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-secondary/5 hover:bg-secondary/10">
                      <Share2 className="h-5 w-5 text-secondary" />
                    </Button>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed px-2">
                  Envie este código para o **destinatário**. Ele deve informar ao viajante para liberar o pacote.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Detalhes Técnicos */}
      <section className="space-y-4">
        <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-2">Sumário do Item</h4>
        <Card className="rounded-[3rem] border-muted bg-white overflow-hidden shadow-sm">
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-[1.5rem] bg-muted/50 flex items-center justify-center text-muted-foreground">
                <Box className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Conteúdo Declarado</p>
                <p className="text-lg font-black text-foreground tracking-tight">{shipment.description}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary" className="bg-primary/5 text-primary text-[9px] font-black border-none px-2 py-0">TAM {shipment.size}</Badge>
                  <Badge variant="secondary" className="bg-muted text-muted-foreground text-[9px] font-black border-none px-2 py-0">R$ {shipment.price.toFixed(2)}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-muted/50">
              <div className="flex gap-4">
                <div className="flex flex-col items-center pt-1 shrink-0">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="w-[1px] h-10 border-l border-dashed border-primary/30" />
                  <div className="h-2 w-2 rounded-full bg-primary/30" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase">Local de Coleta</p>
                    <p className="text-xs font-bold text-foreground">{shipment.from}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase">Local de Entrega</p>
                    <p className="text-xs font-bold text-foreground">{shipment.to}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-muted/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-[1.2rem] bg-muted/50 flex items-center justify-center text-muted-foreground">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase">Destinatário</p>
                  <p className="text-sm font-black text-foreground">{shipment.recipient.name}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-primary/5 text-primary active:scale-90 transition-transform">
                <Phone className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Ações de Apoio */}
      <section className="grid grid-cols-2 gap-4 pt-4">
        <Button variant="outline" className="h-16 rounded-[1.5rem] gap-2 font-black text-sm border-2 border-muted text-muted-foreground active:scale-95 transition-all">
          <HelpCircle className="h-5 w-5" /> Central de Ajuda
        </Button>
        <Button variant="outline" className="h-16 rounded-[1.5rem] gap-2 font-black text-sm border-2 border-destructive/10 text-destructive hover:bg-destructive/5 active:scale-95 transition-all">
          Cancelar Envio
        </Button>
      </section>
    </div>
  );
}

function EmptyState({ onAction }: { onAction: () => void }) {
  return (
    <div className="py-24 text-center space-y-8 animate-in fade-in duration-700">
      <div className="h-28 w-28 bg-muted/20 rounded-[3rem] flex items-center justify-center mx-auto relative group">
        <Truck className="h-12 w-12 text-muted-foreground/30 group-hover:scale-110 transition-transform" />
        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-3 shadow-lg group-hover:rotate-12 transition-transform">
          <Package className="h-6 w-6 text-primary/40" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-black tracking-tighter text-muted-foreground">Sua garagem está vazia...</h3>
        <p className="text-sm text-muted-foreground/60 max-w-[240px] mx-auto font-medium">
          Que tal enviar algo hoje e ver a mágica da logística colaborativa acontecer?
        </p>
      </div>
      <Button 
        onClick={onAction}
        className="rounded-[1.5rem] h-14 px-10 bg-primary font-black shadow-xl shadow-primary/20 active:scale-95 transition-all"
      >
        Começar Meu Primeiro Envio
      </Button>
    </div>
  );
}
