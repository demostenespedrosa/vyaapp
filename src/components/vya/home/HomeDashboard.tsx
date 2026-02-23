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
  Truck
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HomeDashboardProps {
  mode: 'sender' | 'traveler';
  onAction?: () => void;
}

export function HomeDashboard({ mode, onAction }: HomeDashboardProps) {
  const userName = "Lucas";

  const availablePackages = [
    { id: 'VY-982', size: 'P', earnings: 18.50, from: 'Caruaru, PE', to: 'Recife, PE', item: 'Smartphone Samsung', time: 'Há 12 min', urgency: 'high', distance: '135km' },
    { id: 'VY-441', size: 'M', earnings: 32.20, from: 'Bezerros, PE', to: 'Recife, PE', item: 'Caixa de Doces', time: 'Há 45 min', urgency: 'medium', distance: '102km' },
    { id: 'VY-772', size: 'G', earnings: 55.00, from: 'Gravatá, PE', to: 'Vitória, PE', item: 'Fardo de Roupas', time: 'Há 1h', urgency: 'low', distance: '52km' },
    { id: 'VY-102', size: 'P', earnings: 15.00, from: 'Caruaru, PE', to: 'Gravatá, PE', item: 'Documentos', time: 'Há 2h', urgency: 'high', distance: '55km' },
  ];

  return (
    <div className="space-y-6 page-transition pb-24">
      {/* Header Premium */}
      <header className="flex justify-between items-center pt-4 px-1">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-xl">
              <AvatarImage src="https://picsum.photos/seed/vya-user/200/200" />
              <AvatarFallback>LU</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-secondary rounded-full border-2 border-white flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white fill-current" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight leading-none">Boa jornada, {userName}!</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1 flex items-center gap-1">
              <LocateFixed className="h-3 w-3 text-secondary" /> {mode === 'sender' ? 'Remetente' : 'Viajante Ativo'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-2xl bg-muted/30 h-11 w-11 hover:bg-muted/50 transition-all border border-transparent hover:border-muted-foreground/10">
          <Bell className="h-5 w-5" />
        </Button>
      </header>

      {mode === 'sender' ? (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Hero de Envio de Alto Impacto */}
          <Card className="rounded-[3rem] border-none bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white shadow-2xl shadow-primary/30 overflow-hidden relative group active:scale-[0.98] transition-all">
            <div className="absolute -top-10 -right-10 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700">
              <Package className="h-48 w-48 rotate-12" />
            </div>
            <CardContent className="p-10 relative z-10 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white border-none backdrop-blur-md px-3 py-1 font-black text-[9px] tracking-widest uppercase">Envio Inteligente</Badge>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <Avatar key={i} className="h-6 w-6 border-2 border-primary">
                        <AvatarImage src={`https://picsum.photos/seed/traveler-${i}/100/100`} />
                      </Avatar>
                    ))}
                    <div className="h-6 w-6 rounded-full bg-secondary text-[8px] font-black flex items-center justify-center border-2 border-primary">+12</div>
                  </div>
                </div>
                <h2 className="text-4xl font-black leading-tight tracking-tighter">
                  Mande agora,<br />chega hoje. 🚀
                </h2>
                <p className="text-white/80 text-sm font-medium leading-relaxed max-w-[240px]">
                  Encontramos viajantes que já estão no seu trajeto. Mais rápido, barato e seguro.
                </p>
              </div>
              
              <Button 
                onClick={onAction}
                className="w-full h-18 rounded-[1.8rem] bg-white text-primary font-black hover:bg-white/95 text-lg gap-3 shadow-2xl shadow-black/10 active:scale-95 transition-all py-8"
              >
                Novo Envio <ArrowRight className="h-6 w-6" />
              </Button>
            </CardContent>
          </Card>

          {/* Atalhos Rápidos e Úteis */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="rounded-[2.5rem] border-none bg-muted/30 p-6 space-y-4 hover:bg-muted/50 transition-all cursor-pointer group">
              <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Rastrear</h4>
                <p className="text-sm font-black">Onde está meu pacote?</p>
              </div>
            </Card>
            <Card className="rounded-[2.5rem] border-none bg-muted/30 p-6 space-y-4 hover:bg-muted/50 transition-all cursor-pointer group">
              <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Route className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Rotas</h4>
                <p className="text-sm font-black">Cidades atendidas</p>
              </div>
            </Card>
          </div>

          {/* Benefícios com Design UAU */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-2">Por que usar VYA? 🌟</h3>
            <div className="space-y-3">
              {[
                { 
                  icon: TrendingUp, 
                  title: "Preços Fixos e Justos", 
                  desc: "Sem dinâmica. Você paga pelo tamanho e distância, sem surpresas.",
                  color: "text-blue-500",
                  bg: "bg-blue-50"
                },
                { 
                  icon: Sparkles, 
                  title: "Dimensionamento por IA", 
                  desc: "Tire uma foto ou descreva e nossa IA sugere o tamanho ideal (P, M ou G).",
                  color: "text-primary",
                  bg: "bg-primary/5"
                },
                { 
                  icon: ShieldCheck, 
                  title: "Segurança de Ponta", 
                  desc: "Pagamento retido e confirmação por código duplo (coleta e entrega).",
                  color: "text-green-600",
                  bg: "bg-green-50"
                }
              ].map((benefit, i) => (
                <div key={i} className="flex gap-4 p-5 rounded-[2.2rem] bg-white border border-muted shadow-sm hover:shadow-md transition-all group">
                  <div className={cn("h-14 w-14 rounded-2xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-110", benefit.bg, benefit.color)}>
                    <benefit.icon className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-foreground">{benefit.title}</h4>
                    <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action Final - Social Proof */}
          <div className="pt-4">
            <Card className="rounded-[2.5rem] border-none bg-secondary/5 p-8 flex flex-col items-center text-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Truck className="h-20 w-20" />
              </div>
              <div className="h-14 w-14 rounded-full bg-white shadow-md flex items-center justify-center">
                <Zap className="h-7 w-7 text-secondary fill-current" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black tracking-tight">Crescendo com você</h4>
                <p className="text-xs text-muted-foreground font-medium px-4">
                  Já movemos mais de 5.000 pacotes entre cidades do Nordeste e Sudeste este mês.
                </p>
              </div>
              <Button variant="ghost" className="text-secondary font-black text-[10px] uppercase tracking-widest gap-2 hover:bg-secondary/10 rounded-xl px-6">
                Ver depoimentos <ChevronRight className="h-4 w-4" />
              </Button>
            </Card>
          </div>
        </section>
      ) : (
        <section className="space-y-8">
          {/* Filtros de Categoria Estilizados */}
          <div className="space-y-4 px-1">
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              <Button size="sm" variant="secondary" className="rounded-2xl bg-secondary/10 text-secondary border-none h-10 px-6 font-black text-[10px] uppercase tracking-widest hover:bg-secondary/20 transition-all">
                Todas as Rotas
              </Button>
              <Button size="sm" variant="ghost" className="rounded-2xl text-muted-foreground/60 hover:text-primary h-10 px-6 font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 transition-all">
                Mais Rentáveis
              </Button>
              <Button size="sm" variant="ghost" className="rounded-2xl text-muted-foreground/60 hover:text-primary h-10 px-6 font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 transition-all">
                Urgentes
              </Button>
            </div>
          </div>

          {/* Listagem Exclusiva de Pedidos com Design "UAU" */}
          <div className="space-y-6">
            <div className="flex justify-between items-end px-2">
              <div>
                <h3 className="text-2xl font-black tracking-tighter">Oportunidades ⚡️</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Disponíveis na sua malha</p>
              </div>
              <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none px-3 py-1 animate-pulse font-black text-[9px] mb-1">
                {availablePackages.length} NOVOS MATCHES
              </Badge>
            </div>
            
            {availablePackages.length > 0 ? (
              <div className="space-y-6">
                {availablePackages.map((pkg) => (
                  <Card key={pkg.id} className="rounded-[3rem] border-none shadow-xl hover:shadow-2xl bg-white overflow-hidden active:scale-[0.98] transition-all duration-300 group relative">
                    {/* Background Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    
                    <CardContent className="p-0 relative z-10">
                      {/* Top Bar - Lucro e Urgência */}
                      <div className="bg-secondary/5 px-8 py-6 flex justify-between items-center border-b border-secondary/10">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-[1.2rem] bg-white shadow-md flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                            <Coins className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-70">Seu Ganho Líquido</p>
                            <h4 className="text-2xl font-black text-secondary tracking-tight">R$ {pkg.earnings.toFixed(2)}</h4>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={cn(
                            "border-none text-[8px] font-black px-3 py-1 rounded-full",
                            pkg.urgency === 'high' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-secondary/20 text-secondary'
                          )}>
                            {pkg.urgency === 'high' ? 'COLETA IMEDIATA' : 'NORMAL'}
                          </Badge>
                          <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-tighter flex items-center justify-end gap-1">
                            <Clock className="h-3 w-3" /> {pkg.time}
                          </p>
                        </div>
                      </div>

                      {/* Main Info - Rota Visual */}
                      <div className="p-8 space-y-6">
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col items-center gap-2">
                            <div className="h-4 w-4 rounded-full border-4 border-secondary bg-white ring-4 ring-secondary/5" />
                            <div className="w-[2px] h-10 bg-gradient-to-b from-secondary via-secondary/50 to-muted-foreground/20 border-dashed border-l-2" />
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Origem</p>
                              <p className="text-lg font-black text-foreground">{pkg.from}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Destino</p>
                              <p className="text-lg font-black text-foreground">{pkg.to}</p>
                            </div>
                          </div>
                          <div className="bg-muted/30 px-4 py-3 rounded-2xl text-center border border-muted-foreground/5 min-w-[80px]">
                            <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Via</p>
                            <p className="text-sm font-black text-foreground">{pkg.distance}</p>
                          </div>
                        </div>

                        {/* Content Strip */}
                        <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-[2rem] border border-muted-foreground/5">
                          <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Item Declarado</p>
                            <p className="text-sm font-bold truncate text-foreground">{pkg.item}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Tamanho</p>
                            <span className="text-sm font-black text-primary">TAM {pkg.size}</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button className="w-full h-16 rounded-[1.5rem] bg-secondary hover:bg-secondary/90 font-black text-base gap-3 shadow-xl shadow-secondary/20 active:scale-95 transition-all group/btn">
                          Aceitar Pedido agora <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center space-y-6 page-transition">
                <div className="h-24 w-24 bg-muted/20 rounded-[2.5rem] flex items-center justify-center mx-auto relative">
                  <Package className="h-10 w-10 text-muted-foreground/20" />
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-sm">
                    <AlertCircle className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-black text-muted-foreground tracking-tighter">Estrada vazia por enquanto...</p>
                  <p className="text-sm text-muted-foreground/60 max-w-[240px] mx-auto font-medium">
                    Assim que novos pedidos surgirem na sua malha, eles brilharão aqui.
                  </p>
                </div>
                <Button variant="outline" className="rounded-2xl border-2 border-dashed h-12 px-8 font-bold text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all">
                  Verificar outras rotas
                </Button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
