"use client";

import { useState } from "react";
import { 
  Bell, 
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

export function HomeDashboard({ mode, onAction }: HomeDashboardProps) {
  const userName = "Lucas";

  // Mock de um envio ativo para mostrar no topo da Home do Remetente
  const activeShipment = {
    id: 'VY-9821',
    status: 'transit',
    destination: 'Campinas, SP',
    eta: 'Hoje, 16:30',
    progress: 65
  };

  const availablePackages = [
    { id: 'VY-982', size: 'P', earnings: 18.50, from: 'Caruaru, PE', to: 'Recife, PE', item: 'Smartphone Samsung', time: 'Há 12 min', urgency: 'high', distance: '135km' },
    { id: 'VY-441', size: 'M', earnings: 32.20, from: 'Bezerros, PE', to: 'Recife, PE', item: 'Caixa de Doces', time: 'Há 45 min', urgency: 'medium', distance: '102km' },
    { id: 'VY-772', size: 'G', earnings: 55.00, from: 'Gravatá, PE', to: 'Vitória, PE', item: 'Fardo de Roupas', time: 'Há 1h', urgency: 'low', distance: '52km' },
  ];

  return (
    <div className="space-y-6 page-transition pb-24">
      {/* Header Nativo */}
      <header className="flex justify-between items-center pt-4 px-1">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/10 shadow-sm">
            <AvatarImage src="https://picsum.photos/seed/vya-user/200/200" />
            <AvatarFallback>LU</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Bem-vindo de volta</p>
            <h1 className="text-xl font-black text-foreground tracking-tight leading-none">{userName}</h1>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full bg-muted/30 h-10 w-10 hover:bg-muted/50 active:scale-90 transition-all relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-background" />
        </Button>
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
                      <span className="text-primary">Chega {activeShipment.eta}</span>
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
              { icon: History, label: "Histórico", color: "text-purple-500", bg: "bg-purple-50" },
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
            <Card className="rounded-[2rem] border-none bg-gradient-to-r from-secondary/10 to-primary/5 p-6 flex items-center gap-4 relative overflow-hidden">
              <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                <Sparkles className="h-6 w-6 text-secondary fill-current" />
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
          <Card className="rounded-[2.5rem] border-none bg-secondary text-white shadow-xl shadow-secondary/20 overflow-hidden relative mx-1">
            <div className="absolute -right-6 -top-6 p-8 opacity-10">
              <Route className="h-32 w-32 rotate-12 fill-current" />
            </div>
            <CardContent className="p-6 relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Badge className="bg-white/20 text-white border-none backdrop-blur-md px-2.5 py-0.5 font-bold text-[9px] tracking-widest uppercase">Próxima Viagem</Badge>
                  <h2 className="text-2xl font-black tracking-tight mt-1">Hoje, 14:00</h2>
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
                  <p className="text-sm font-bold text-white/90 leading-none">Caruaru, PE</p>
                  <p className="text-sm font-bold text-white/90 leading-none">Recife, PE</p>
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
                  <p className="text-2xl font-black text-green-950 tracking-tighter">R$ 145,50</p>
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
                  <p className="text-2xl font-black text-blue-950 tracking-tighter">4 Concluídas</p>
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
              { icon: HelpCircle, label: "Suporte", color: "text-purple-500", bg: "bg-purple-50" },
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
              <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none px-3 py-1 font-black text-[9px] mb-1">
                {availablePackages.length} MATCHES
              </Badge>
            </div>
            
            {availablePackages.length > 0 ? (
              <div className="space-y-4">
                {availablePackages.map((pkg) => (
                  <Card key={pkg.id} className="rounded-[2.5rem] border-2 border-secondary/10 shadow-lg hover:shadow-xl bg-white overflow-hidden active:scale-[0.98] active:bg-muted/30 transition-all duration-300 cursor-pointer">
                    <CardContent className="p-0">
                      {/* Header do Card de Oportunidade */}
                      <div className="bg-secondary/5 px-6 py-4 flex justify-between items-center border-b border-secondary/10">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-secondary">
                            <Coins className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-secondary uppercase tracking-widest opacity-80">Ganho Líquido</p>
                            <h4 className="text-xl font-black text-secondary tracking-tight">R$ {pkg.earnings.toFixed(2)}</h4>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={cn(
                            "border-none text-[8px] font-black px-2.5 py-1 rounded-full",
                            pkg.urgency === 'high' ? 'bg-red-500 text-white shadow-md shadow-red-200' : 'bg-secondary/20 text-secondary'
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
                            <div className="h-3 w-3 rounded-full border-2 border-secondary bg-white" />
                            <div className="w-[2px] h-8 bg-gradient-to-b from-secondary to-muted-foreground/20 border-dashed border-l-2" />
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
                        <Button className="w-full h-14 rounded-[1.2rem] bg-secondary hover:bg-secondary/90 font-black text-sm gap-2 shadow-lg shadow-secondary/20 active:scale-95 transition-all">
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
