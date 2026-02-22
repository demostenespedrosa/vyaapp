
"use client";

import { useState } from "react";
import { Package, MapPin, Search, Plus, Navigation, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PackageForm } from "./PackageForm";
import { Badge } from "@/components/ui/badge";

export function SenderView({ initialIsCreating = false }: { initialIsCreating?: boolean }) {
  const [isCreating, setIsCreating] = useState(initialIsCreating);

  if (isCreating) {
    return (
      <div className="space-y-6 page-transition">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full bg-muted">
            <ArrowRight className="h-5 w-5 rotate-180" />
          </Button>
          <h2 className="text-xl font-bold">Novo Envio</h2>
        </div>
        <PackageForm onComplete={() => setIsCreating(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-8 page-transition">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Seus Envios</h1>
          <Button 
            size="sm" 
            className="rounded-full gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none" 
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-4 w-4" /> Novo
          </Button>
        </div>
      </section>

      <div className="space-y-4">
        {[
          { id: 'VY-9821', status: 'Em trânsito', from: 'São Paulo', to: 'Campinas', eta: '45 min', size: 'P', color: 'bg-blue-500' },
          { id: 'VY-4412', status: 'Procurando Viajante', from: 'Curitiba', to: 'Joinville', eta: '-', size: 'M', color: 'bg-amber-500' }
        ].map((shipment) => (
          <div key={shipment.id} className="relative overflow-hidden group">
            <div className="p-5 rounded-3xl border bg-white shadow-sm active:scale-[0.98] transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-2xl ${shipment.color}/10 flex items-center justify-center text-primary`}>
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{shipment.id}</p>
                    <p className="text-sm font-bold">{shipment.status}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-muted text-[10px] border-none px-2 py-0">TAM {shipment.size}</Badge>
              </div>
              
              <div className="flex items-center gap-3 text-sm font-medium">
                <span className="truncate">{shipment.from}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{shipment.to}</span>
              </div>

              {shipment.eta !== '-' && (
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-secondary font-bold">
                    <Navigation className="h-3 w-3" />
                    Chega em {shipment.eta}
                  </div>
                  <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-2/3 rounded-full" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
