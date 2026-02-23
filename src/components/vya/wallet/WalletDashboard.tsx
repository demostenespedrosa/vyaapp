"use client";

import { useState } from "react";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Plus,
  ArrowRight,
  Banknote,
  Coins,
  History,
  Sparkles,
  Award
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'withdrawal';
  title: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

export function WalletDashboard() {
  const [activeTab, setActiveTab] = useState<'all' | 'earnings' | 'withdrawals'>('all');

  const transactions: Transaction[] = [
    { id: 'TX-9901', type: 'credit', title: 'Entrega #VY-9821', date: 'Hoje, 16:45', amount: 18.50, status: 'pending' },
    { id: 'TX-8812', type: 'credit', title: 'Entrega #VY-4412', date: 'Hoje, 12:30', amount: 32.20, status: 'completed' },
    { id: 'TX-7711', type: 'withdrawal', title: 'Saque para Banco', date: 'Ontem, 09:15', amount: -150.00, status: 'completed' },
    { id: 'TX-6623', type: 'credit', title: 'Entrega #VY-7723', date: '12 Jan, 2024', amount: 55.00, status: 'completed' },
    { id: 'TX-5510', type: 'credit', title: 'Bônus Primeira Viagem', date: '10 Jan, 2024', amount: 10.00, status: 'completed' },
  ];

  const totalBalance = 450.20;
  const pendingBalance = 18.50;
  const lifeTimeEarnings = 1240.00;

  return (
    <div className="space-y-8 page-transition pb-32">
      {/* Header com Saudação */}
      <header className="flex justify-between items-end pt-4 px-1">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Seus Ganhos</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Gestão financeira VYA</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
          <Banknote className="h-6 w-6" />
        </div>
      </header>

      {/* Hero Card - Saldo Principal (DOPAMINA) */}
      <Card className="rounded-[3rem] border-none bg-gradient-to-br from-secondary via-secondary/90 to-secondary/80 text-white shadow-2xl shadow-secondary/30 overflow-hidden relative group">
        <div className="absolute -top-10 -right-10 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700">
          <Coins className="h-48 w-48 rotate-12" />
        </div>
        <CardContent className="p-10 relative z-10 space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-none backdrop-blur-md px-3 py-1 font-bold text-[10px] tracking-wider uppercase">Saldo Disponível</Badge>
              {pendingBalance > 0 && (
                <Badge className="bg-orange-500/80 text-white border-none backdrop-blur-md px-3 py-1 font-bold text-[10px] tracking-wider uppercase animate-pulse">
                  + R$ {pendingBalance.toFixed(2)} Pendente
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold opacity-60">R$</span>
              <h2 className="text-6xl font-black tracking-tighter">
                {totalBalance.toFixed(2).split('.')[0]}
                <span className="text-2xl opacity-60">,{totalBalance.toFixed(2).split('.')[1]}</span>
              </h2>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1 h-16 rounded-[1.5rem] bg-white text-secondary font-black hover:bg-white/95 text-base gap-3 shadow-2xl shadow-black/10 active:scale-95 transition-all">
              <ArrowUpRight className="h-6 w-6" /> Sacar agora
            </Button>
            <Button variant="outline" className="h-16 w-16 rounded-[1.5rem] border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-0">
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid - Motivação */}
      <div className="grid grid-cols-2 gap-4 px-1">
        <Card className="rounded-[2.5rem] border-none bg-muted/30 p-6 space-y-3 hover:bg-muted/50 transition-colors">
          <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
            <TrendingUp className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Ganhos Totais</h4>
            <p className="text-lg font-black tracking-tight">R$ {lifeTimeEarnings.toFixed(2)}</p>
          </div>
        </Card>
        <Card className="rounded-[2.5rem] border-none bg-muted/30 p-6 space-y-3 hover:bg-muted/50 transition-colors">
          <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Nível de Lucro</h4>
            <p className="text-lg font-black tracking-tight">Ouro</p>
          </div>
        </Card>
      </div>

      {/* Histórico com Filtros */}
      <section className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <div>
            <h3 className="text-2xl font-black tracking-tighter">Histórico 📜</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Suas movimentações recentes</p>
          </div>
          <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-secondary h-8 hover:bg-secondary/5">
            Ver Tudo <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        <div className="flex p-1.5 bg-muted/30 rounded-[2rem] border border-muted/50 backdrop-blur-sm mx-1">
          {['all', 'earnings', 'withdrawals'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all",
                activeTab === tab ? "bg-white shadow-md text-secondary" : "text-muted-foreground/60 hover:text-secondary"
              )}
            >
              {tab === 'all' ? 'Tudo' : tab === 'earnings' ? 'Ganhos' : 'Saques'}
            </button>
          ))}
        </div>

        <div className="space-y-3 px-1">
          {transactions.map((tx) => (
            <Card key={tx.id} className="rounded-[2rem] border-none bg-white shadow-sm hover:shadow-md active:scale-[0.99] transition-all group overflow-hidden">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                  tx.type === 'credit' ? 'bg-secondary/10 text-secondary' : 'bg-red-50 text-red-500'
                )}>
                  {tx.type === 'credit' ? <Plus className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-foreground truncate">{tx.title}</p>
                    {tx.status === 'pending' && (
                      <Badge className="bg-orange-50 text-orange-600 border-none text-[8px] font-black px-2 py-0.5">
                        PENDENTE
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-tighter">
                    <Clock className="h-3 w-3" /> {tx.date}
                  </p>
                </div>

                <div className="text-right">
                  <p className={cn(
                    "text-base font-black tracking-tight",
                    tx.type === 'credit' ? 'text-secondary' : 'text-foreground'
                  )}>
                    {tx.amount > 0 ? '+' : ''} R$ {Math.abs(tx.amount).toFixed(2)}
                  </p>
                  <div className="flex items-center justify-end gap-1">
                    {tx.status === 'completed' ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-orange-500" />
                    )}
                    <span className="text-[8px] font-black text-muted-foreground uppercase">{tx.id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action Final */}
        <div className="px-1 pt-4">
          <Card className="rounded-[2.5rem] border-none bg-primary/5 p-8 text-center space-y-4">
            <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="h-6 w-6 text-primary fill-current" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black tracking-tight">Indique um Amigo</h4>
              <p className="text-[11px] text-muted-foreground font-medium px-4">
                Ganhe bônus de R$ 5,00 em cada viagem completa do seu indicado.
              </p>
            </div>
            <Button variant="ghost" className="text-primary font-black text-xs gap-2 hover:bg-primary/10 rounded-xl">
              Compartilhar Link <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
