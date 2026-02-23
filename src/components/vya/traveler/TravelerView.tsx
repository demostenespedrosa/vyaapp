
"use client";

import { useState } from "react";
import { Navigation, Bike, Car, Bus, MapPin, Search, Calendar, ChevronRight, Plus, Map as MapIcon, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { WalletCard } from "../shared/WalletCard";
import { Badge } from "@/components/ui/badge";
import { TripForm } from "./TripForm";
import { cn } from "@/lib/utils";

export function TravelerView({ initialIsCreating = false }: { initialIsCreating?: boolean }) {
  const [isCreating, setIsCreating] = useState(initialIsCreating);
  const [activeTab, setActiveTab] = useState<'trips' | 'wallet'>('trips');

  if (isCreating) {
    return (
      <div className="space-y-6 page-transition">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full bg-muted h-10 w-10">
            <Plus className="h-5 w-5 rotate-45" />
          </Button>
          <h2 className="text-xl font-bold">Planejar Viagem</h2>
        </div>
        <TripForm onComplete={() => setIsCreating(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-8 page-transition pb-24">
      {/* Header do Viajante */}
      <header className="flex justify-between items-center pt-2">
        <h1 className="text-2xl font-bold">Central do Viajante</h1>
        <Button 
          onClick={() => setIsCreating(true)}
          className="rounded-full h-12 px-6 bg-secondary shadow-lg shadow-secondary/20 gap-2 font-bold"
        >
          <Plus className="h-5 w-5" /> Nova Viagem
        </Button>
      </header>

      {/* Tabs Estilo App */}
      <div className="flex p-1 bg-muted/40 rounded-2xl border border-muted">
        <button
          onClick={() => setActiveTab('trips')}
          className={cn(
            "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2",
            activeTab === 'trips' ? "bg-white shadow-sm text-secondary" : "text-muted-foreground"
          )}
        >
          <MapIcon className="h-4 w-4" /> Minhas Viagens
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={cn(
            "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2",
            activeTab === 'wallet' ? "bg-white shadow-sm text-secondary" : "text-muted-foreground"
          )}
        >
          <Wallet className="h-4 w-4" /> Minha Grana
        </button>
      </div>

      {activeTab === 'wallet' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <WalletCard />
          <div className="p-10 rounded-[2.5rem] bg-muted/30 border border-dashed flex flex-col items-center justify-center text-center gap-3">
            <p className="text-sm font-bold text-muted-foreground">Seu extrato aparecerá aqui.</p>
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">Faça sua primeira entrega hoje!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-lg font-bold">Envios na sua Rota 📦</h3>
              <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none animate-pulse">Novos!</Badge>
            </div>
            
            <div className="space-y-4">
              {[
                { id: 'VY-982', size: 'P', earnings: 18.50, route: 'São Paulo → Campinas', hubs: 'Posto Shell Anhanguera', urgency: 'Alta' },
                { id: 'VY-441', size: 'M', earnings: 32.20, route: 'Curitiba → Joinville', hubs: 'Rodoviária de Curitiba', urgency: 'Normal' },
              ].map((pkg) => (
                <Card key={pkg.id} className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden active:scale-[0.98] transition-all border-l-4 border-l-secondary">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{pkg.id}</span>
                        <p className="font-bold text-base leading-tight">{pkg.route}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-secondary">R$ {pkg.earnings.toFixed(2)}</p>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Seu ganho</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl">
                      <MapPin className="h-4 w-4 text-secondary shrink-0" />
                      <span className="truncate">Coleta: <strong className="text-foreground">{pkg.hubs}</strong></span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-[9px] font-bold uppercase border-secondary/20 text-secondary">Tamanho {pkg.size}</Badge>
                      <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                        <Navigation className="h-3 w-3" /> Urgência {pkg.urgency}
                      </span>
                    </div>

                    <Button className="w-full h-12 rounded-xl bg-secondary hover:bg-secondary/90 font-bold gap-2 shadow-lg shadow-secondary/10">
                      Aceitar Envio <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold px-1">Viagens Agendadas</h3>
            <div className="p-10 rounded-[2.5rem] bg-muted/20 border border-dashed text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground mx-auto">
                <Navigation className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground">Nenhuma viagem ativa.</p>
                <p className="text-[10px] text-muted-foreground/60">Planeje sua rota e encontre encomendas.</p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
