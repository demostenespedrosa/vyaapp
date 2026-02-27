"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAppContext } from "@/contexts/AppContext";
import { dataCache } from "@/lib/dataCache";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  Coins,
  Sparkles,
  Award,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WalletData {
  pendingBalance: number;
  availableBalance: number;
  totalEarned: number;
}

interface WalletTx {
  id: string;
  type: "CREDIT" | "WITHDRAWAL";
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  description: string | null;
  createdAt: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 0) return `Hoje, ${time}`;
  if (diffDays === 1) return `Ontem, ${time}`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function travelerLevel(total: number) {
  if (total >= 3000) return { label: "Diamante 💎", color: "text-cyan-500", bg: "bg-cyan-50" };
  if (total >= 1500) return { label: "Ouro 🥇", color: "text-yellow-500", bg: "bg-yellow-50" };
  if (total >= 500) return { label: "Prata 🥈", color: "text-slate-500", bg: "bg-slate-50" };
  return { label: "Bronze 🥉", color: "text-orange-500", bg: "bg-orange-50" };
}

const CACHE_KEY_PREFIX = "wallet:";

export function WalletDashboard() {
  const { userId } = useAppContext();
  const { toast } = useToast();

  const [wallet, setWallet] = useState<WalletData>({
    pendingBalance: 0,
    availableBalance: 0,
    totalEarned: 0,
  });
  const [transactions, setTransactions] = useState<WalletTx[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "earnings" | "withdrawals">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const cacheKey = userId ? `${CACHE_KEY_PREFIX}${userId}` : null;

  const fetchData = useCallback(
    async (silent = false) => {
      if (!userId) return;
      if (!silent) setIsLoading(true);
      try {
        // Busca carteira
        const { data: walletRow } = await supabase
          .from("wallets")
          .select("pending_balance, available_balance, total_earned")
          .eq("user_id", userId)
          .maybeSingle();

        const walletData: WalletData = {
          pendingBalance: Number(walletRow?.pending_balance ?? 0),
          availableBalance: Number(walletRow?.available_balance ?? 0),
          totalEarned: Number(walletRow?.total_earned ?? 0),
        };

        // Busca transações via wallet.id
        let txList: WalletTx[] = [];
        if (walletRow) {
          const { data: walletFull } = await supabase
            .from("wallets")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

          if (walletFull?.id) {
            const { data: txData } = await supabase
              .from("wallet_transactions")
              .select("id, type, amount, status, description, created_at")
              .eq("wallet_id", walletFull.id)
              .order("created_at", { ascending: false })
              .limit(50);

            txList = (txData ?? []).map((t) => ({
              id: t.id,
              type: t.type as "CREDIT" | "WITHDRAWAL",
              amount: Number(t.amount),
              status: t.status as "PENDING" | "COMPLETED" | "FAILED",
              description: t.description,
              createdAt: t.created_at,
            }));
          }
        }

        setWallet(walletData);
        setTransactions(txList);
        if (cacheKey) dataCache.set(cacheKey, { wallet: walletData, transactions: txList });
      } catch (err) {
        console.error("[WalletDashboard] fetchData error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, cacheKey]
  );

  useEffect(() => {
    if (!userId) return;

    // Cache imediato
    if (cacheKey) {
      const cached = dataCache.get<{ wallet: WalletData; transactions: WalletTx[] }>(cacheKey, 60_000);
      if (cached) {
        setWallet(cached.wallet);
        setTransactions(cached.transactions);
        setIsLoading(false);
        return;
      }
    }
    fetchData();
  }, [userId, cacheKey, fetchData]);

  // ── Solicitar Saque ──────────────────────────────────────────────────────
  async function handleWithdraw() {
    if (wallet.availableBalance <= 0) return;
    setIsWithdrawing(true);
    try {
      const res = await fetch("/api/wallet/withdraw", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao solicitar saque.");

      toast({
        title: "Saque solicitado! 💸",
        description: `R$ ${wallet.availableBalance.toFixed(2)} → seu PIX em instantes.`,
      });
      if (cacheKey) dataCache.invalidate(cacheKey);
      fetchData(true);
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Erro no saque",
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setIsWithdrawing(false);
    }
  }

  const level = travelerLevel(wallet.totalEarned);

  const filteredTx = transactions.filter((t) => {
    if (activeTab === "earnings") return t.type === "CREDIT";
    if (activeTab === "withdrawals") return t.type === "WITHDRAWAL";
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-transition pb-24">
      {/* ── Hero Card ──────────────────────────────────────────────────── */}
      <Card className="rounded-[2.5rem] border-none bg-gradient-to-br from-brand-purple via-brand-purple/90 to-purple-400 text-white shadow-2xl shadow-brand-purple/30 overflow-hidden relative mx-1">
        <div className="absolute -top-10 -right-10 opacity-10">
          <Wallet className="h-56 w-56 rotate-12 fill-current" />
        </div>
        <CardContent className="p-7 relative z-10 space-y-6">
          {/* Saldo disponível */}
          <div>
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Saldo Disponível</p>
            <h1 className="text-5xl font-black tracking-tighter mt-1">
              R$ {wallet.availableBalance.toFixed(2).replace(".", ",")}
            </h1>
          </div>

          {/* Saldo pendente */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-[1.5rem] border border-white/10">
            <Clock className="h-5 w-5 text-white/70 shrink-0" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/60">Em Custódia</p>
              <p className="text-sm font-black">
                R$ {wallet.pendingBalance.toFixed(2).replace(".", ",")}
              </p>
            </div>
          </div>

          {/* Botão sacar */}
          <Button
            onClick={handleWithdraw}
            disabled={wallet.availableBalance <= 0 || isWithdrawing}
            className="w-full h-14 rounded-[1.2rem] bg-white text-brand-purple font-black text-sm shadow-lg hover:bg-white/90 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            {isWithdrawing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Processando...</>
            ) : wallet.availableBalance <= 0 ? (
              "Sem saldo para sacar"
            ) : (
              <>Sacar R$ {wallet.availableBalance.toFixed(2).replace(".", ",")} via PIX<ArrowUpRight className="h-4 w-4 ml-2" /></>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* ── Stats Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 px-1">
        <Card className="rounded-[2rem] border-none bg-green-50 shadow-sm">
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-green-600/80 uppercase tracking-widest">Total Ganho</p>
              <p className="text-2xl font-black text-green-950 tracking-tighter">
                R$ {wallet.totalEarned.toFixed(0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className={cn("rounded-[2rem] border-none shadow-sm", level.bg)}>
          <CardContent className="p-4 flex flex-col gap-3">
            <div className={cn("h-10 w-10 rounded-full bg-white/60 flex items-center justify-center", level.color)}>
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nível</p>
              <p className={cn("text-xl font-black tracking-tighter", level.color)}>{level.label}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Extrato ─────────────────────────────────────────────────────── */}
      <section className="space-y-4 px-1">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-xl font-black tracking-tighter">Extrato</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
              {filteredTx.length} movimentações
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchData(true)}
            className="h-9 w-9 rounded-full bg-muted/30 text-muted-foreground active:scale-90"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Segmented control */}
        <div className="flex p-1.5 bg-muted/30 rounded-[2rem]">
          {(["all", "earnings", "withdrawals"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-300",
                activeTab === tab
                  ? "bg-white shadow-sm text-brand-purple scale-[0.98]"
                  : "text-muted-foreground/60 hover:text-brand-purple"
              )}
            >
              {tab === "all" ? "Todos" : tab === "earnings" ? "Ganhos" : "Saques"}
            </button>
          ))}
        </div>

        {/* Lista de transações */}
        {filteredTx.length > 0 ? (
          <div className="space-y-3">
            {filteredTx.map((tx) => (
              <TxCard key={tx.id} tx={tx} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <div className="h-16 w-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto">
              <Coins className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-bold text-muted-foreground">Nenhuma movimentação ainda</p>
            <p className="text-[11px] text-muted-foreground/60 font-medium">
              Aceite pacotes para começar a ganhar
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function TxCard({ tx }: { tx: WalletTx }) {
  const isCredit = tx.type === "CREDIT";
  const isPending = tx.status === "PENDING";
  const isFailed = tx.status === "FAILED";

  return (
    <Card className={cn(
      "rounded-[2rem] border-none shadow-sm transition-all",
      isFailed ? "bg-red-50" : isPending ? "bg-amber-50" : "bg-white"
    )}>
      <CardContent className="p-4 flex items-center gap-4">
        {/* Ícone */}
        <div className={cn(
          "h-11 w-11 rounded-[1rem] flex items-center justify-center shrink-0",
          isFailed
            ? "bg-red-100 text-red-500"
            : isPending
            ? "bg-amber-100 text-amber-600"
            : isCredit
            ? "bg-green-100 text-green-600"
            : "bg-brand-purple/10 text-brand-purple"
        )}>
          {isFailed ? (
            <AlertTriangle className="h-5 w-5" />
          ) : isPending ? (
            <Clock className="h-5 w-5" />
          ) : isCredit ? (
            <ArrowDownLeft className="h-5 w-5" />
          ) : (
            <ArrowUpRight className="h-5 w-5" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-foreground truncate">
            {tx.description ?? (isCredit ? "Repasse recebido" : "Saque PIX")}
          </p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
            {formatDate(tx.createdAt)}
          </p>
        </div>

        {/* Valor + Status */}
        <div className="text-right shrink-0">
          <p className={cn(
            "text-base font-black",
            isFailed ? "text-red-500" :
            isCredit ? "text-green-600" : "text-brand-purple"
          )}>
            {isCredit ? "+" : "-"}R$ {tx.amount.toFixed(2).replace(".", ",")}
          </p>
          <Badge className={cn(
            "text-[8px] font-black border-none mt-0.5",
            isFailed ? "bg-red-100 text-red-600" :
            isPending ? "bg-amber-100 text-amber-600" :
            "bg-green-100 text-green-700"
          )}>
            {isFailed ? "Falhou" : isPending ? "Pendente" : "Concluído"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
