
"use client";

import { Bell, Search, TrendingUp, ShieldCheck, Zap } from "lucide-react";
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
          <p className="text-muted-foreground text-sm">
            {mode === 'sender' 
              ? "Bora mandar alguma coisa hoje?" 
              : "Pronto pra fazer uma grana extra?"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-muted/50">
            <Bell className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src="https://picsum.photos/seed/vya-user/200/200" />
            <AvatarFallback>LU</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Busca Rápida */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input 
          placeholder={mode === 'sender' ? "Rastrear pacote..." : "Procurar viagens..."}
          className="w-full h-14 pl-12 pr-4 bg-muted/40 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
        />
      </div>

      {/* Cards de Destaque com Vieses Cognitivos (Social Proof & Urgency) */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold px-1">Bombando no VYA 🚀</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
          <Card className="min-w-[280px] bg-primary text-white border-none shadow-xl shadow-primary/20">
            <CardContent className="p-6 space-y-4">
              <Badge className="bg-white/20 text-white border-none">DICA DA IA</Badge>
              <h4 className="text-xl font-bold leading-tight">
                Viagens para o Litoral cresceram 40% este fim de semana!
              </h4>
              <p className="text-sm opacity-80">Aproveite para enviar seus pacotes agora.</p>
            </CardContent>
          </Card>

          <Card className="min-w-[280px] bg-secondary text-white border-none shadow-xl shadow-secondary/20">
            <CardContent className="p-6 space-y-4">
              <Badge className="bg-white/20 text-white border-none">SEGURANÇA</Badge>
              <h4 className="text-xl font-bold leading-tight">
                Seu pacote está 100% segurado pela VYA.
              </h4>
              <p className="text-sm opacity-80">Pode relaxar, a gente cuida de tudo.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Grid de Benefícios */}
      <section className="grid grid-cols-2 gap-4">
        <Card className="border-none bg-muted/30">
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Zap className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold">Mais Rápido</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Entregas no mesmo dia são a nossa meta.</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-muted/30">
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold">100% Legal</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Documentação fiscal em cada envio.</p>
          </CardContent>
        </Card>
      </section>

      {/* Atividade Recente (Peak-End Rule - Mostrar sucesso) */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-bold">Últimas do VYA</h3>
          <Button variant="link" className="text-primary font-bold text-sm">Ver tudo</Button>
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border shadow-sm">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-primary font-bold">
                VY
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Pacote entregue!</p>
                <p className="text-xs text-muted-foreground">De São Paulo para Santos</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-secondary">Concluído</p>
                <p className="text-[10px] text-muted-foreground">Há 2h</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
