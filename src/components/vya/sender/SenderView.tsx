
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { dataCache } from "@/lib/dataCache";
import { useAppContext } from "@/contexts/AppContext";
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
  QrCode,
  Filter,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PackageForm } from "./PackageForm";
import { CheckoutScreen } from "./CheckoutScreen";
import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Estados detalhados do envio
type ShipmentStatus = 'searching' | 'waiting_payment' | 'waiting_pickup' | 'transit' | 'waiting_delivery' | 'delivered' | 'canceled';

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
  pickupCode: string;
  deliveryCode: string;
  pixQrCode: string;
  pixCopyPaste: string;
  expiresAt: string | null;
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

interface CheckoutData {
  packageId: string;
  packageDisplayId: string;
  pixQrCode: string;
  pixCopyPaste: string;
  expiresAt: string;
  amount: number;
}

export function SenderView({ initialIsCreating = false }: { initialIsCreating?: boolean }) {
  const { userId } = useAppContext();
  const [isCreating, setIsCreating] = useState(initialIsCreating);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [searchQuery, setSearchQuery] = useState("");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const CACHE_KEY = userId ? `shipments:${userId}` : null;

  const mapShipments = (data: any[]): Shipment[] => {
    const statusMap: Record<string, { label: string; progress: number }> = {
      'searching': { label: 'Buscando viajante', progress: 15 },
      'waiting_payment': { label: 'Aguardando pagamento', progress: 28 },
      'waiting_pickup': { label: 'Aguardando coleta', progress: 40 },
      'transit': { label: 'A caminho', progress: 65 },
      'waiting_delivery': { label: 'Aguardando retirada', progress: 90 },
      'delivered': { label: 'Concluído', progress: 100 },
      'canceled': { label: 'Cancelado', progress: 0 }
    };
    return data.map(pkg => {
      const travelerProfile = pkg.trips?.profiles;
      return {
        id: pkg.id.substring(0, 8).toUpperCase(),
        status: pkg.status as ShipmentStatus,
        statusLabel: statusMap[pkg.status]?.label || pkg.status,
        description: pkg.description,
        from: `${pkg.origin_city}, ${pkg.origin_state}`,
        to: `${pkg.destination_city}, ${pkg.destination_state}`,
        date: new Date(pkg.created_at).toLocaleString('pt-BR'),
        size: pkg.size as 'P' | 'M' | 'G',
        progress: statusMap[pkg.status]?.progress || 0,
        price: pkg.price,
        pickupCode: pkg.pickup_code,
        deliveryCode: pkg.delivery_code,
        pixQrCode: pkg.pix_qr_code ?? '',
        pixCopyPaste: pkg.pix_copy_paste ?? '',
        expiresAt: pkg.expires_at ?? null,
        recipient: { name: pkg.recipient_name, phone: pkg.recipient_phone, cpf: pkg.recipient_cpf },
        traveler: travelerProfile ? {
          name: travelerProfile.full_name,
          rating: travelerProfile.rating || 5.0,
          photo: travelerProfile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(travelerProfile.full_name)}`
        } : undefined
      };
    });
  };

  const fetchShipments = useCallback(async (silent = false) => {
    if (!userId) return;
    if (!silent) setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('packages')
        .select(`*, pix_qr_code, pix_copy_paste, expires_at, trips (traveler_id, profiles (full_name, avatar_url, rating))`)
        .eq('sender_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        const mapped = mapShipments(data);
        setShipments(mapped);
        if (CACHE_KEY) dataCache.set(CACHE_KEY, mapped);
      }
    } catch (error) {
      console.error("Erro ao buscar envios:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, CACHE_KEY]);

  useEffect(() => {
    if (!userId) return;

    // 1. Mostra cache imediatamente se disponível (zero loading)
    if (CACHE_KEY) {
      const cached = dataCache.get<Shipment[]>(CACHE_KEY);
      if (cached) {
        setShipments(cached);
        setIsLoading(false);
      } else {
        fetchShipments();
      }
    }

    // 2. Realtime: qualquer mudança no pacote do usuário → refetch silencioso
    const channel = supabase
      .channel(`packages-sender:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'packages', filter: `sender_id=eq.${userId}` },
        async (payload) => {
          await fetchShipments(true); // atualiza a lista silenciosamente
          // Se o pacote mudou para waiting_payment, abre a CheckoutScreen
          const newRow = payload.new as Record<string, unknown>;
          if (newRow?.status === 'waiting_payment' && newRow?.pix_copy_paste) {
            setCheckoutData({
              packageId: String(newRow.id),
              packageDisplayId: 'VY-' + String(newRow.id).substring(0, 8).toUpperCase(),
              pixQrCode: String(newRow.pix_qr_code ?? ''),
              pixCopyPaste: String(newRow.pix_copy_paste),
              expiresAt: String(newRow.expires_at),
              amount: Number(newRow.price),
            });
          }
          // Se o pacote saiu de waiting_payment (pagamento confirmado), fecha o checkout
          if (newRow?.status === 'waiting_pickup') {
            setCheckoutData(prev =>
              prev?.packageId === String(newRow.id) ? null : prev
            );
          }
        }
      )
      .subscribe();

    const scrollable = document.querySelector('.scrollable-content') as HTMLElement;
    if (scrollable) scrollable.scrollTop = 0;

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // Se houver checkout pendente, exibe a tela de pagamento PIX
  if (checkoutData) {
    return (
      <CheckoutScreen
        packageDisplayId={checkoutData.packageDisplayId}
        pixQrCode={checkoutData.pixQrCode}
        pixCopyPaste={checkoutData.pixCopyPaste}
        expiresAt={checkoutData.expiresAt}
        amount={checkoutData.amount}
        onPaid={() => {
          setCheckoutData(null);
          fetchShipments(true);
        }}
        onExpired={() => {
          setCheckoutData(null);
          fetchShipments(true);
        }}
      />
    );
  }

  // Se houver um envio selecionado, renderiza a tela de detalhes (simulando navegação nativa)
  if (selectedShipment) {
    return (
      <div className="fixed inset-0 z-50 bg-background animate-in slide-in-from-right-full duration-300 overflow-y-auto">
        <ShipmentDetail shipment={selectedShipment} onBack={() => setSelectedShipment(null)} />
      </div>
    );
  }

  const filteredShipments = shipments.filter(s => {
    const isTabMatch = activeTab === 'active' 
      ? (s.status !== 'delivered' && s.status !== 'canceled')
      : (s.status === 'delivered' || s.status === 'canceled');
    
    const isSearchMatch = s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return isTabMatch && isSearchMatch;
  });

  const activeCount = shipments.filter(s => s.status !== 'delivered' && s.status !== 'canceled').length;
  const historyCount = shipments.filter(s => s.status === 'delivered' || s.status === 'canceled').length;

  return (
    <div className="space-y-6 page-transition pb-24">
      {/* Sheet para Novo Envio */}
      <Sheet open={isCreating} onOpenChange={setIsCreating}>
        <SheetContent side="bottom" className="h-[90vh] p-0 rounded-t-[2rem] overflow-hidden flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-2 border-b">
            <SheetTitle className="text-xl font-black tracking-tighter text-left">Novo Envio</SheetTitle>
            <SheetDescription className="sr-only">Preencha os dados para solicitar um novo envio</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <PackageForm onComplete={() => { if (CACHE_KEY) dataCache.invalidate(CACHE_KEY); dataCache.invalidatePrefix('home:'); setIsCreating(false); fetchShipments(); }} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Header Nativo de Dashboard */}
      <header className="pt-4 px-2 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Meus Envios</h1>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Gestão Logística</p>
          </div>
          <Button 
            onClick={() => setIsCreating(true)}
            size="icon"
            className="h-12 w-12 rounded-full bg-primary text-white shadow-lg shadow-primary/20 active:scale-90 transition-all"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* Cards de Resumo (Propósito Maior) */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="rounded-[2rem] border-none bg-blue-50 shadow-sm">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-3xl font-black text-blue-950 tracking-tighter">{activeCount}</p>
                <p className="text-[10px] font-bold text-blue-600/80 uppercase tracking-widest">Em Andamento</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border-none bg-green-50 shadow-sm">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-3xl font-black text-green-950 tracking-tighter">{historyCount}</p>
                <p className="text-[10px] font-bold text-green-600/80 uppercase tracking-widest">Concluídos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      {/* Busca e Filtro */}
      <div className="px-2 flex gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Buscar código ou destino..." 
            className="pl-12 h-14 rounded-[1.5rem] bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-14 w-14 rounded-[1.5rem] border-none bg-muted/30 text-muted-foreground active:scale-90 transition-all shrink-0">
          <Filter className="h-5 w-5" />
        </Button>
      </div>

      {/* Segmented Control Nativo */}
      <div className="px-2">
        <div className="flex p-1.5 bg-muted/30 rounded-[2rem] backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('active')}
            className={cn(
              "flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-300",
              activeTab === 'active' ? "bg-white shadow-sm text-primary scale-[0.98]" : "text-muted-foreground/60 hover:text-primary"
            )}
          >
            Ativos
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-300",
              activeTab === 'history' ? "bg-white shadow-sm text-primary scale-[0.98]" : "text-muted-foreground/60 hover:text-primary"
            )}
          >
            Histórico
          </button>
        </div>
      </div>

      {/* Lista de Envios */}
      <div className="space-y-4 px-2">
        {filteredShipments.length > 0 ? (
          filteredShipments.map((shipment) => (
            <ShipmentCard key={shipment.id} shipment={shipment} onClick={() => setSelectedShipment(shipment)} />
          ))
        ) : (
          <EmptyState onAction={() => setIsCreating(true)} tab={activeTab} />
        )}
      </div>
    </div>
  );
}

function ShipmentCard({ shipment, onClick }: { shipment: Shipment, onClick: () => void }) {
  const getStatusConfig = (status: ShipmentStatus) => {
    switch (status) {
      case 'searching': return { icon: UserCheck, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" };
      case 'waiting_payment': return { icon: QrCode, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" };
      case 'waiting_pickup': return { icon: PackageOpen, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" };
      case 'transit': return { icon: Truck, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" };
      case 'waiting_delivery': return { icon: MapPinned, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" };
      case 'delivered': return { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" };
      default: return { icon: Package, color: "text-muted-foreground", bg: "bg-muted", border: "border-muted" };
    }
  };

  const config = getStatusConfig(shipment.status);
  const Icon = config.icon;

  return (
    <Card 
      onClick={onClick} 
      className={cn(
        "rounded-[2.5rem] border-2 shadow-sm hover:shadow-md bg-white overflow-hidden active:scale-[0.98] active:bg-muted/30 transition-all duration-300 cursor-pointer",
        config.border
      )}
    >
      <CardContent className="p-5 space-y-4">
        {/* Header do Card */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={cn("h-12 w-12 rounded-[1.2rem] flex items-center justify-center shrink-0", config.bg, config.color)}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{shipment.id}</p>
              <h4 className="text-base font-black text-foreground tracking-tight leading-none mt-1">
                {shipment.statusLabel}
              </h4>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground/40" />
        </div>

        {/* Info Principal */}
        <div className="pl-[3.75rem]">
          <p className="text-sm font-bold text-foreground/80 truncate">{shipment.description}</p>
          
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 bg-muted/30 rounded-xl p-2.5 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-[11px] font-bold truncate">{shipment.to.split(',')[0]}</span>
            </div>
            <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] font-black px-3 py-1.5 rounded-xl">
              R$ {shipment.price.toFixed(2)}
            </Badge>
          </div>

          {/* Barra de Progresso */}
          {shipment.status !== 'delivered' && shipment.status !== 'canceled' && (
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                <span className="text-muted-foreground">Progresso</span>
                <span className={config.color}>{shipment.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000 ease-out", config.bg.replace('/10', '').replace('50', '500'))}
                  style={{ width: `${shipment.progress}%`, backgroundColor: shipment.status === 'transit' ? 'hsl(var(--primary))' : undefined }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ShipmentDetail({ shipment, onBack }: { shipment: Shipment, onBack: () => void }) {
  const { toast } = useToast();
  const steps = [
    { id: 'searching', label: 'Buscando Viajante', sub: 'Match em processamento' },
    { id: 'waiting_payment', label: 'Aguardando Pagamento', sub: 'PIX gerado — confirme o pagamento' },
    { id: 'waiting_pickup', label: 'Aguardando Coleta', sub: 'Viajante indo ao ponto' },
    { id: 'transit', label: 'Em Trânsito', sub: 'Pacote na estrada' },
    { id: 'waiting_delivery', label: 'Pronto para Retirada', sub: 'Destinatário acionado' },
    { id: 'delivered', label: 'Entregue', sub: 'Jornada concluída' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === shipment.status);

  const copyCode = (code: string, type: string) => {
    copyToClipboard(code).then(() => {
      toast({
        title: "Copiado! 📋",
        description: `Código de ${type} copiado para a área de transferência.`,
      });
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Fixo */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-muted/30 px-4 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-muted/50 h-10 w-10 active:scale-90 transition-transform shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-black tracking-tight truncate">Detalhes do Envio</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{shipment.id}</p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </header>

      <div className="p-4 space-y-6">
        {/* Hero Status Card */}
        <Card className="rounded-[2.5rem] border-none bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white shadow-xl shadow-primary/20 overflow-hidden relative">
          <div className="absolute -top-10 -right-10 p-12 opacity-10">
            <Zap className="h-48 w-48 rotate-12 fill-current" />
          </div>
          <CardContent className="p-8 relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <Badge className="bg-white/20 text-white border-none backdrop-blur-md px-2.5 py-0.5 font-bold text-[9px] tracking-widest uppercase">Status Atual</Badge>
                <h3 className="text-3xl font-black tracking-tighter leading-none mt-2">{shipment.statusLabel}</h3>
              </div>
              <div className="h-12 w-12 rounded-[1.2rem] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <QrCode className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div className="bg-black/10 backdrop-blur-md p-4 rounded-[1.5rem] flex items-center gap-3 border border-white/5">
              <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <p className="text-[10px] font-medium leading-tight opacity-90">
                Protegido pelo **VYA Safe**. Pagamento liberado apenas após confirmação.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Códigos de Segurança */}
        {shipment.status !== 'delivered' && shipment.status !== 'canceled' && (
          <section className="space-y-4">
            <div className="px-1">
              <h4 className="text-lg font-black tracking-tight">Chaves de Segurança 🔐</h4>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protocolos de liberação</p>
            </div>
            
            <div className="grid gap-3">
              {/* Código de Coleta */}
              <Card className="rounded-[2rem] border-none bg-muted/30">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Coleta</p>
                      <p className="text-xl font-black tracking-widest text-foreground font-code">{shipment.pickupCode}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-full bg-white shadow-sm active:scale-90"
                    onClick={() => copyCode(shipment.pickupCode, "coleta")}
                  >
                    <Copy className="h-4 w-4 text-primary" />
                  </Button>
                </CardContent>
              </Card>

              {/* Código de Entrega */}
              <Card className="rounded-[2rem] border-none bg-muted/30">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Entrega</p>
                      <p className="text-xl font-black tracking-widest text-foreground font-code">{shipment.deliveryCode}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-full bg-white shadow-sm active:scale-90"
                    onClick={() => copyCode(shipment.deliveryCode, "entrega")}
                  >
                    <Copy className="h-4 w-4 text-secondary" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Linha do Tempo */}
        <section className="space-y-4">
          <div className="px-1">
            <h4 className="text-lg font-black tracking-tight">Rastreamento 🗺️</h4>
          </div>
          
          <div className="bg-white p-6 rounded-[2.5rem] border border-muted/50 shadow-sm space-y-6 relative">
            {steps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isLast = idx === steps.length - 1;

              return (
                <div key={step.id} className="flex gap-4 relative">
                  {!isLast && (
                    <div className={cn(
                      "absolute left-[11px] top-6 w-[2px] h-[calc(100%+16px)] transition-colors duration-500",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )} />
                  )}
                  <div className={cn(
                    "h-6 w-6 rounded-full border-[3px] z-10 flex items-center justify-center shrink-0 transition-all duration-500",
                    isCompleted ? "bg-primary border-primary text-white" : 
                    isCurrent ? "bg-white border-primary animate-pulse" : "bg-white border-muted"
                  )}>
                    {isCompleted && <CheckCircle2 className="h-2.5 w-2.5" />}
                  </div>
                  <div className={cn(
                    "flex-1 pb-2 transition-opacity duration-500",
                    isCurrent ? "opacity-100" : isCompleted ? "opacity-60" : "opacity-30"
                  )}>
                    <p className={cn("text-sm font-black tracking-tight", isCurrent && "text-primary")}>{step.label}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{step.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Detalhes do Item */}
        <section className="space-y-4">
          <h4 className="text-lg font-black tracking-tight px-1">Resumo do Envio 📦</h4>
          <Card className="rounded-[2.5rem] border-muted bg-white shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                  <Box className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Conteúdo</p>
                  <p className="text-base font-black text-foreground tracking-tight">{shipment.description}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="bg-primary/5 text-primary text-[8px] font-black border-none px-2 py-0">TAM {shipment.size}</Badge>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground text-[8px] font-black border-none px-2 py-0">R$ {shipment.price.toFixed(2)}</Badge>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Destinatário</p>
                    <p className="text-sm font-black text-foreground">{shipment.recipient.name}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-primary/5 text-primary active:scale-90">
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Ações */}
        <section className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="outline" className="h-14 rounded-[1.5rem] gap-2 font-black text-xs border-2 border-muted text-muted-foreground active:scale-95">
            <HelpCircle className="h-4 w-4" /> Ajuda
          </Button>
          <Button variant="outline" className="h-14 rounded-[1.5rem] gap-2 font-black text-xs border-2 border-destructive/10 text-destructive hover:bg-destructive/5 active:scale-95">
            Cancelar
          </Button>
        </section>
      </div>
    </div>
  );
}

function EmptyState({ onAction, tab }: { onAction: () => void, tab: 'active' | 'history' }) {
  return (
    <div className="py-16 text-center space-y-6 animate-in fade-in duration-500">
      <div className="h-24 w-24 bg-muted/20 rounded-[2.5rem] flex items-center justify-center mx-auto relative">
        {tab === 'active' ? (
          <Truck className="h-10 w-10 text-muted-foreground/40" />
        ) : (
          <CheckCircle2 className="h-10 w-10 text-muted-foreground/40" />
        )}
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-black tracking-tight text-muted-foreground">
          {tab === 'active' ? 'Nenhum envio ativo' : 'Histórico vazio'}
        </h3>
        <p className="text-xs text-muted-foreground/60 max-w-[200px] mx-auto font-medium">
          {tab === 'active' 
            ? 'Você não tem encomendas em trânsito no momento.' 
            : 'Você ainda não concluiu nenhum envio.'}
        </p>
      </div>
      {tab === 'active' && (
        <Button 
          onClick={onAction}
          className="rounded-[1.5rem] h-12 px-8 bg-primary font-black shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          Criar Primeiro Envio
        </Button>
      )}
    </div>
  );
}
