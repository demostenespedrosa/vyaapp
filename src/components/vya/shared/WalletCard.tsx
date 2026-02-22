
"use client";

import { Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function WalletCard() {
  return (
    <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none rounded-[2rem] shadow-2xl shadow-primary/20 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-80">Saldo Disponível</CardTitle>
        <Wallet className="h-5 w-5 opacity-60" />
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-4xl font-bold font-headline mb-1 tracking-tight">
          <span className="text-lg opacity-60 mr-1">R$</span>
          450,20
        </div>
        <p className="text-[10px] font-medium opacity-70 mb-6">
          Prontinho para ir pro seu banco via PIX
        </p>
        
        <div className="flex gap-3">
          <Button size="lg" className="flex-1 h-12 rounded-2xl bg-white text-primary font-bold hover:bg-white/90 shadow-lg">
            <ArrowDownLeft className="mr-2 h-4 w-4" /> Receber
          </Button>
          <Button size="lg" variant="outline" className="flex-1 h-12 rounded-2xl border-white/30 text-white font-bold hover:bg-white/10">
            <ArrowUpRight className="mr-2 h-4 w-4" /> Sacar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
