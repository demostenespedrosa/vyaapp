
"use client";

import { useState } from "react";
import { Package, MapPin, Search, Plus, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PackageForm } from "./PackageForm";
import { Badge } from "@/components/ui/badge";

export function SenderView() {
  const [isCreating, setIsCreating] = useState(false);

  if (isCreating) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setIsCreating(false)} className="mb-4">
          ← Voltar para envios
        </Button>
        <PackageForm onComplete={() => setIsCreating(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">O que você quer enviar hoje?</h1>
            <p className="text-muted-foreground">Logística descentralizada e ultrarrápida na palma da sua mão.</p>
          </div>
          <Button size="lg" className="rounded-full gap-2 shadow-lg" onClick={() => setIsCreating(true)}>
            <Plus className="h-5 w-5" /> Novo Envio
          </Button>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Meus Envios Ativos</h3>
              <div className="relative w-48">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar tracking..." className="pl-8" />
              </div>
            </div>

            <div className="space-y-4">
              {[
                { id: 'VY-9821', status: 'Em trânsito', from: 'São Paulo', to: 'Campinas', eta: '45 min', size: 'P' },
                { id: 'VY-4412', status: 'Aguardando Viajante', from: 'Curitiba', to: 'Joinville', eta: '-', size: 'M' }
              ].map((shipment) => (
                <div key={shipment.id} className="flex items-center p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{shipment.id}</span>
                      <Badge variant={shipment.status.includes('trânsito') ? 'default' : 'secondary'}>
                        {shipment.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {shipment.from} → {shipment.to}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-secondary flex items-center justify-end gap-1">
                      <Navigation className="h-3 w-3" /> {shipment.eta}
                    </div>
                    <div className="text-xs text-muted-foreground">Tamanho {shipment.size}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/5 border-secondary/20">
          <CardContent className="p-6 space-y-4">
            <h4 className="font-bold">Por que VYA?</h4>
            <div className="space-y-3">
              {[
                { title: 'Preço Fixo', desc: 'Sem surpresas no valor do frete.' },
                { title: 'Velocidade', desc: 'Alguém já está indo para o seu destino.' },
                { title: 'Seguro', desc: 'Fiscal check-in obrigatório.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="h-2 w-2 rounded-full bg-secondary mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
