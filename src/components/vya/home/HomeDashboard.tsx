
"use client";

import { useState } from "react";
import { 
  Bell, 
  Package, 
  Zap, 
  Search, 
  ChevronRight, 
  Filter,
  MapPin,
  ArrowRight,
  Sparkles,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface HomeDashboardProps {
  mode: 'sender' | 'traveler';
  onAction?: () => void;
}

export function HomeDashboard({ mode, onAction }: HomeDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const userName = "Lucas";

  const availablePackages = [
    { id: 'VY-982', size: 'P', earnings: 18.50, from: 'Caruaru, PE', to: 'Recife, PE', item: 'Smartphone Samsung', time: 'Há 12 min', urgency: 'high' },
    { id: 'VY-441', size: 'M', earnings: 32.20, from: 'Bezerros, PE', to: 'Recife, PE', item: 'Caixa de Doces', time: 'Há 45 min', urgency: 'medium' },
    { id: 'VY-772', size: 'G', earnings: 55.00, from: 'Gravatá, PE', to: 'Vitória, PE', item: 'Fardo de Roupas', time: 'Há 1h', urgency: 'low' },
    { id: 'VY-102', size: 'P', earnings: 15.00, from: 'Caruaru, PE', to: 'Gravatá, PE', item: 'Documentos', time: 'Há 2h', urgency: 'high' },
  ];

  const filteredPackages = availablePackages.filter(p => 
    p.from.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 page-transition pb-24">
      {/* Header Compacto */}
      <header className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-sm">
            <AvatarImage src="https://picsum.photos/seed/vya-user/200/200" />
            <AvatarFallback>LU</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">Olá, {userName}!</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Modo {mode === 'sender' ? 'Remetente' : 'Viajante'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-muted/50 h-10 w-10">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {mode === 'sender' ? (
        <section className="space-y-6">
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
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="rounded-3xl border-none bg-muted/30 p-5 space-y-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h4 className="text-sm font-bold">Preços Fixos</h4>
              <p className="text-[10px] text-muted-foreground">Sem surpresas no final da corrida.</p>
            </Card>
            <Card className="rounded-3xl border-none bg-muted/30 p-5 space-y-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h4 className="text-sm font-bold">IA de Tamanho</h4>
              <p className="text-[10px] text-muted-foreground">Medimos seu pacote pela descrição.</p>
            </Card>
          </div>
        </section>
      ) : (
        <section className="space-y-6">
          {/* Busca e Filtro */}
          <div className="space-y-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
              <Input 
                placeholder="Para onde você vai hoje?" 
                className="pl-11 h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-secondary/20 transition-all text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <Button size="sm" variant="secondary" className="rounded-full bg-secondary/10 text-secondary border-none h-8 px-4 font-bold text-[10px] uppercase tracking-wider">
                Todas as Rotas
              </Button>
              <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground h-8 px-4 font-bold text-[10px] uppercase tracking-wider">
                Mais Rentáveis
              </Button>
              <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground h-8 px-4 font-bold text-[10px] uppercase tracking-wider">
                Urgentes
              </Button>
            </div>
          </div>

          {/* Listagem Exclusiva de Pedidos */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-lg font-bold">Disponíveis na Rota 📦</h3>
              <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none animate-pulse">
                {filteredPackages.length} novos pedidos
              </Badge>
            </div>
            
            {filteredPackages.length > 0 ? (
              <div className="space-y-4">
                {filteredPackages.map((pkg) => (
                  <Card key={pkg.id} className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden active:scale-[0.98] transition-all border-l-4 border-l-secondary group">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{pkg.id}</span>
                            {pkg.urgency === 'high' && (
                              <Badge className="bg-red-50 text-red-600 border-none text-[8px] h-4">URGENTE</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm leading-tight group-hover:text-secondary transition-colors">
                              {pkg.from}
                            </p>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <p className="font-bold text-sm leading-tight group-hover:text-secondary transition-colors">
                              {pkg.to}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-secondary">R$ {pkg.earnings.toFixed(2)}</p>
                          <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">Ganho Líquido</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground bg-muted/30 p-3 rounded-2xl">
                        <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shrink-0">
                          <Package className="h-4 w-4 text-secondary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-tighter opacity-60">Conteúdo do Pacote</p>
                          <p className="truncate font-bold text-foreground">{pkg.item}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1 border-l pl-3">
                          <span className="text-[10px] font-black text-foreground">TAM {pkg.size}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                          <Zap className="h-3 w-3 text-secondary" /> {pkg.time}
                        </span>
                        <Button size="sm" className="h-10 rounded-xl bg-secondary hover:bg-secondary/90 font-bold gap-2 px-6 shadow-md shadow-secondary/10">
                          Aceitar <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto opacity-30">
                  <AlertCircle className="h-10 w-10" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-muted-foreground">Nenhum pedido encontrado</p>
                  <p className="text-xs text-muted-foreground/60">Tente buscar por outra cidade ou rodovia.</p>
                </div>
                <Button variant="ghost" onClick={() => setSearchQuery("")} className="text-secondary font-bold">
                  Limpar Busca
                </Button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
