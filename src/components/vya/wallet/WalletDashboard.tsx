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
    { id: 'VY-9821', type: 'credit', title: 'Viagem Caruaru → Recife', date: 'Hoje, 16:45', amount: 145.50, status: 'pending' },
    { id: 'VY-4412', type: 'credit', title: 'Viagem Gravatá → Vitória', date: 'Hoje, 12:30', amount: 85.20, status: 'completed' },
    { id: 'TX-7711', type: 'withdrawal', title: 'Saque para Conta Corrente', date: 'Ontem, 09:15', amount: -150.00, status: 'completed' },
    { id: 'VY-7723', type: 'credit', title: 'Viagem Recife → Caruaru', date: '12 Jan, 2024', amount: 120.00, status: 'completed' },
    { id: 'TX-5510', type: 'credit', title: 'Bônus de Indicação', date: '10 Jan, 2024', amount: 50.00, status: 'completed' },
  ];

  const totalBalance = 450.20;
  const pendingBalance = 145.50;
  const lifeTimeEarnings = 1240.00;

  return (
    <div className="space-y-6 page-transition pb-24">
      {/* Header Nativo */}
      <header className="pt-4 px-2 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Carteira</h1>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Seus ganhos na estrada</p>
          </div>
          <Button 
            size="icon"
            className="h-12 w-12 rounded-full bg-secondary/10 text-secondary hover:bg-secondary/20 active:scale-90 transition-all"
          >
            <History className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* Hero Card - Saldo Principal (DOPAMINA) */}
      <div className="px-2">
        <Card className="rounded-[2.5rem] border-none bg-gradient-to-br from-secondary via-secondary/90 to-secondary/80 text-white shadow-xl shadow-secondary/20 overflow-hidden relative group">
          <div className="absolute -top-10 -right-10 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Coins className="h-48 w-48 rotate-12" />
          </div>
          <CardContent className="p-8 relative z-10 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-none backdrop-blur-md px-2.5 py-0.5 font-bold text-[9px] tracking-widest uppercase">Saldo Disponível</Badge>
                {pendingBalance > 0 && (
                  <Badge className="bg-orange-500/80 text-white border-none backdrop-blur-md px-2.5 py-0.5 font-bold text-[9px] tracking-widest uppercase animate-pulse">
                    + R$ {pendingBalance.toFixed(2)} a liberar
                  </Badge>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold opacity-70">R$</span>
                <h2 className="text-5xl font-black tracking-tighter">
                  {totalBalance.toFixed(2).split('.')[0]}
                  <span className="text-2xl opacity-70">,{totalBalance.toFixed(2).split('.')[1]}</span>
                </h2>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 h-14 rounded-[1.5rem] bg-white text-secondary font-black hover:bg-white/90 text-sm gap-2 shadow-lg shadow-black/10 active:scale-95 transition-all">
                <ArrowUpRight className="h-5 w-5" /> Transferir
              </Button>
              <Button variant="outline" className="h-14 w-14 rounded-[1.5rem] border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-0 active:scale-95 transition-all">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid - Motivação */}
      <div className="grid grid-cols-2 gap-3 px-2">
        <Card className="rounded-[2rem] border-none bg-green-50 shadow-sm">
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-green-950 tracking-tighter">R$ {lifeTimeEarnings.toFixed(0)}</p>
              <p className="text-[10px] font-bold text-green-600/80 uppercase tracking-widest">Ganhos Totais</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-none bg-blue-50 shadow-sm">
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-blue-950 tracking-tighter">Ouro</p>
              <p className="text-[10px] font-bold text-blue-600/80 uppercase tracking-widest">Nível de Viajante</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico com Filtros */}
      <section className="space-y-4">
        <div className="px-2">
          <div className="flex p-1.5 bg-muted/30 rounded-[2rem] backdrop-blur-sm">
            {['all', 'earnings', 'withdrawals'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-300",
                  activeTab === tab ? "bg-white shadow-sm text-secondary scale-[0.98]" : "text-muted-foreground/60 hover:text-secondary"
                )}
              >
                {tab === 'all' ? 'Tudo' : tab === 'earnings' ? 'Ganhos' : 'Saques'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 px-2">
          {transactions.map((tx) => (
            <Card key={tx.id} className="rounded-[2rem] border-2 border-muted/50 shadow-sm hover:shadow-md bg-white overflow-hidden active:scale-[0.98] active:bg-muted/30 transition-all duration-300 cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={cn(
                  "h-12 w-12 rounded-[1.2rem] flex items-center justify-center shrink-0",
                  tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-secondary/10 text-secondary'
                )}>
                  {tx.type === 'credit' ? <ArrowDownLeft className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                </div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">{tx.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {tx.date}
                    </p>
                    {tx.status === 'pending' && (
                      <Badge className="bg-orange-100 text-orange-700 border-none text-[8px] font-black px-2 py-0.5">
                        EM ROTA
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <p className={cn(
                    "text-base font-black tracking-tight",
                    tx.type === 'credit' ? 'text-green-600' : 'text-foreground'
                  )}>
                    {tx.amount > 0 ? '+' : ''} R$ {Math.abs(tx.amount).toFixed(2)}
                  </p>
                  <div className="flex items-center justify-end gap-1">
                    {tx.status === 'completed' ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <Clock className="h-3 w-3 text-orange-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action Final */}
        <div className="px-2 pt-2">
          <Card className="rounded-[2.5rem] border-none bg-gradient-to-r from-secondary/10 to-primary/5 p-6 flex items-center gap-4 relative overflow-hidden">
            <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6 text-secondary fill-current" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-black tracking-tight">Indique um Motorista</h4>
              <p className="text-[11px] text-muted-foreground font-medium leading-tight">
                Ganhe R$ 50 na primeira viagem do seu indicado.
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
          </Card>
        </div>
      </section>
    </div>
  );
}
