
"use client";

import { useState } from "react";
import { Navigation, Bike, Car, Bus, MapPin, Search, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { WalletCard } from "../shared/WalletCard";
import { Badge } from "@/components/ui/badge";

export function TravelerView() {
  const [modal, setModal] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold text-secondary">Para onde você vai viajar hoje?</h1>
            <p className="text-muted-foreground">Rentabilize o seu espaço ocioso e ajude a mover o país.</p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Como você vai?</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'moto', icon: Bike },
                      { id: 'car', icon: Car },
                      { id: 'bus', icon: Bus }
                    ].map((m) => (
                      <Button 
                        key={m.id}
                        type="button" 
                        variant={modal === m.id ? 'secondary' : 'outline'} 
                        size="icon"
                        className="h-12 w-12 rounded-xl"
                        onClick={() => setModal(m.id)}
                      >
                        <m.icon className="h-6 w-6" />
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Sua Rota</label>
                  <div className="flex gap-2">
                    <Input placeholder="Origem" className="flex-1" />
                    <Input placeholder="Destino" className="flex-1" />
                    <Button variant="secondary" size="icon" className="shrink-0"><Search className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <WalletCard />
      </section>

      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          Pacotes Disponíveis na sua Rota <Badge variant="secondary" className="animate-pulse">Novos!</Badge>
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: 'VY-982', size: 'P', earnings: 18.50, route: 'São Paulo → Campinas', hubs: 'Posto Shell Anhanguera', urgency: 'Alta' },
            { id: 'VY-441', size: 'M', earnings: 32.20, route: 'Curitiba → Joinville', hubs: 'Rodoviária de Curitiba', urgency: 'Normal' },
            { id: 'VY-129', size: 'G', earnings: 64.00, route: 'Rio → Niterói', hubs: 'Posto Graal Petrópolis', urgency: 'Baixa' },
          ].map((pkg) => (
            <Card key={pkg.id} className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-secondary">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground">{pkg.id}</span>
                    <p className="font-bold text-lg">{pkg.route}</p>
                  </div>
                  <Badge className="bg-secondary/10 text-secondary border-none">R$ {pkg.earnings.toFixed(2)}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Navigation className="h-3 w-3" />
                    Ponto de Encontro: <span className="text-foreground font-medium">{pkg.hubs}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="px-2 py-0.5 rounded bg-muted text-[10px] font-bold">TAMANHO {pkg.size}</div>
                    <div className="text-[10px] text-muted-foreground">URGÊNCIA: {pkg.urgency}</div>
                  </div>
                </div>

                <Button className="w-full bg-secondary hover:bg-secondary/90 gap-2">
                  Aceitar Entrega <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
