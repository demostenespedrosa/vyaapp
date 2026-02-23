
"use client";

import { Bell, ArrowRight, Package, ShieldCheck, Zap, Search, MapPin, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HomeDashboardProps {
  mode: 'sender' | 'traveler';
  onAction?: () => void;
}

export function HomeDashboard({ mode, onAction }: HomeDashboardProps) {
  const userName = "Lucas";

  return (
    <div className="space-y-8 page-transition pb-24">
      {/* Header Conversacional */}
      <header className="flex justify-between items-start pt-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            E aí, {userName}! 👋
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            {mode === 'sender' 
              ? "Bora mandar alguma coisa hoje?" 
              : "Veja os pedidos na sua rota."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-muted/50 h-10 w-10">
            <Bell className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-sm">
            <AvatarImage src="https://picsum.photos/seed/vya-user/200/200" />
            <AvatarFallback>LU</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {mode === 'sender' ? (
        <section>
          <Card className="rounded-[2.5rem] border-none bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white shadow-2xl shadow-primary/20 overflow-hidden relative group active:scale-[0.98] transition-all">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Package className="h-32 w-32 rotate-12" />
            </div>
            <CardContent className="p-8 relative z-10 space-y-6">
              <div className="space-y-2">
                <Badge className="bg-white/20 text-white border-none backdrop-blur-md mb-1">DÊ O PRIMEIRO PASSO</Badge>
                <h2 className="text-2xl font-bold leading-tight tracking-tight">
                  Precisa mandar algo pra ontem? 📦
                </h2>
                <p className="text-white/80 text-sm font-medium">
                  Simule o frete em segundos e encontre um viajante agora mesmo.
                </p>
              </div>
              
              <Button 
                onClick={onAction}
                className="w-full h-14 rounded-2xl bg-white text-primary font-bold hover:bg-white/90 text-base gap-2 shadow-xl shadow-black/5"
              >
                Enviar pacote agora <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </section>
      ) : (
        <section className="space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
            <Input 
              placeholder="Para onde você vai hoje?" 
              className="pl-11 h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-secondary/20 transition-all text-base"
            />
          </div>

          <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-bold">Disponíveis na Rota 📦</h3>
            <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none animate-pulse">Novos Matchs!</Badge>
          </div>
          
          <div className="space-y-4">
            {[
              { id: 'VY-982', size: 'P', earnings: 18.50, from: 'Caruaru, PE', to: 'Recife, PE', item: 'Smartphone Samsung', time: 'Há 12 min' },
              { id: 'VY-441', size: 'M', earnings: 32.20, from: 'Bezerros, PE', to: 'Recife, PE', item: 'Caixa de Doces', time: 'Há 45 min' },
              { id: 'VY-772', size: 'G', earnings: 55.00, from: 'Gravatá, PE', to: 'Vitória, PE', item: 'Fardo de Roupas', time: 'Há 1h' },
            ].map((pkg) => (
              <Card key={pkg.id} className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden active:scale-[0.98] transition-all border-l-4 border-l-secondary group">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{pkg.id}</span>
                        <Badge variant="outline" className="text-[9px] font-bold uppercase border-secondary/20 text-secondary">Tamanho {pkg.size}</Badge>
                      </div>
                      <p className="font-bold text-sm leading-tight group-hover:text-secondary transition-colors">{pkg.from} → {pkg.to}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-secondary">R$ {pkg.earnings.toFixed(2)}</p>
                      <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">Ganho Líquido</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/30 p-3 rounded-xl">
                    <Package className="h-3.5 w-3.5 text-secondary shrink-0" />
                    <span className="truncate">Conteúdo: <strong className="text-foreground">{pkg.item}</strong></span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                      <Zap className="h-3 w-3 text-secondary" /> {pkg.time}
                    </span>
                    <Button size="sm" className="h-9 rounded-xl bg-secondary hover:bg-secondary/90 font-bold gap-2 px-4">
                      Aceitar <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Cards de Destaque */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold px-1">Dicas pra você 💡</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
          <Card className="min-w-[260px] bg-muted/40 border-none rounded-[2rem]">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="font-bold leading-tight">Envio Seguro</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Cada pacote tem seguro total contra qualquer imprevisto.</p>
            </CardContent>
          </Card>

          <Card className="min-w-[260px] bg-muted/40 border-none rounded-[2rem]">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
                <Zap className="h-6 w-6" />
              </div>
              <h4 className="font-bold leading-tight">Entrega Express</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Mais de 80% das entregas chegam no mesmo dia!</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
