
"use client";

import { Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function WalletCard() {
  return (
    <Card className="bg-primary text-primary-foreground overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">Carteira VYA</CardTitle>
        <Wallet className="h-4 w-4 opacity-70" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-headline">R$ 450,20</div>
        <p className="text-xs opacity-70 mt-1">Disponível para saque imediato via PIX</p>
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="secondary" className="flex-1 text-xs">
            <ArrowDownLeft className="mr-1 h-3 w-3" /> Receber
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary-foreground">
            <ArrowUpRight className="mr-1 h-3 w-3" /> Sacar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
