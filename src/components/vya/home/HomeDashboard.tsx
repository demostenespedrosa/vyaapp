
"use client";

import { Bell, ArrowRight, Calculator, Package, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function HomeDashboard({ mode }: { mode: 'sender' | 'traveler' }) {
  const userName = "Lucas"; // Mock

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
              : "Pronto pra fazer uma grana extra?"}
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

      {/* Card de Ação Herói (Substitui a busca) */}
      <section>
        {mode === 'sender' ? (
          <Card className="rounded-[2.5rem] border-none bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white shadow-2xl shadow-primary/20 overflow-hidden relative group active:scale-[0.98] transition-all">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Package className="h-32 w-32 rotate-12" />
            </div>
            <CardContent className="p-8 relative z-10 space-y-6">
              <div className="space-y-2">
                <Badge className="bg-white/20 text-white border-none backdrop-blur-md mb-1">NOVO NO APP</Badge>
                <h2 className="text-2xl font-bold leading-tight tracking-tight">
                  Precisa mandar algo pra ontem? 📦
                </h2>
                <p className="text-white/80 text-sm font-medium">
                  Simule o frete em segundos e encontre um viajante agora mesmo.
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button className="w-full h-14 rounded-2xl bg-white text-primary font-bold hover:bg-white/90 text-base gap-2 shadow-xl shadow-black/5">
                  <Calculator className="h-5 w-5" /> Fazer uma cotação
                </Button>
                <Button variant="ghost" className="w-full h-12 rounded-2xl text-white font-bold hover:bg-white/10 text-sm gap-2">
                  Enviar pacote agora <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-[2.5rem] border-none bg-gradient-to-br from-secondary via-secondary/90 to-secondary/80 text-white shadow-2xl shadow-secondary/20 overflow-hidden relative group active:scale-[0.98] transition-all">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Zap className="h-32 w-32 -rotate-12" />
            </div>
            <CardContent className="p-8 relative z-10 space-y-6">
              <div className="space-y-2">
                <Badge className="bg-white/20 text-white border-none backdrop-blur-md mb-1">OPORTUNIDADE</Badge>
                <h2 className="text-2xl font-bold leading-tight tracking-tight">
                  Vai pegar a estrada hoje? 🚗
                </h2>
                <p className="text-white/80 text-sm font-medium">
                  Cadastre sua viagem e pague o combustível levando encomendas.
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button className="w-full h-14 rounded-2xl bg-white text-secondary font-bold hover:bg-white/90 text-base gap-2 shadow-xl shadow-black/5">
                  <Sparkles className="h-5 w-5" /> Cadastrar Viagem
                </Button>
                <Button variant="ghost" className="w-full h-12 rounded-2xl text-white font-bold hover:bg-white/10 text-sm gap-2">
                  Ver pacotes na rota <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Cards de Destaque com Vieses Cognitivos */}
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

      {/* Atividade Recente */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-bold">Últimas do VYA</h3>
          <Button variant="link" className="text-primary font-bold text-sm p-0 h-auto">Ver tudo</Button>
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-[2rem] bg-white border border-muted shadow-sm active:scale-[0.99] transition-transform cursor-pointer">
              <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-bold">
                VY
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">Pacote entregue!</p>
                <p className="text-[11px] text-muted-foreground truncate">De São Paulo para Santos</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full inline-block">Concluído</p>
                <p className="text-[10px] text-muted-foreground mt-1">Há 2h</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
