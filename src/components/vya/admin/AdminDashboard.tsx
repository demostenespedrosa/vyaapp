
"use client";

import { useState } from "react";
import { 
  Users, 
  Route, 
  Settings, 
  ShieldCheck, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  MapPin,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PREDEFINED_ROUTES, PredefinedRoute } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('routes');

  return (
    <div className="space-y-8 page-transition pb-24">
      <header className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-2xl font-bold">Painel Admin</h1>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Controle Total VYA</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl h-12 bg-muted/40 p-1">
          <TabsTrigger value="routes" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-primary">
            <Route className="h-4 w-4 mr-2" /> Rotas
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-primary">
            <Users className="h-4 w-4 mr-2" /> Usuários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="routes" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-bold">Rotas Atendidas</h3>
            <Button size="sm" className="rounded-full bg-primary font-bold gap-2">
              <Plus className="h-4 w-4" /> Nova Rota
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por cidade ou rodovia..." className="pl-11 h-12 rounded-2xl bg-muted/30 border-none" />
          </div>

          <div className="space-y-4">
            {PREDEFINED_ROUTES.map((route) => (
              <Card key={route.id} className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden active:scale-[0.99] transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-primary/20 text-primary">Ativa</Badge>
                        <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">{route.id}</span>
                      </div>
                      <h4 className="text-base font-bold">{route.origin} → {route.destination}</h4>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="h-4 w-4" /></Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cidades de Passagem ({route.stops.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {route.stops.map((stop, i) => (
                        <Badge key={i} variant="secondary" className="bg-muted/50 text-muted-foreground border-none text-[9px] font-medium">
                          {stop}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Distância</p>
                        <p className="text-sm font-bold text-primary">{route.distanceKm} km</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Tempo Médio</p>
                        <p className="text-sm font-bold text-primary">{Math.floor(route.averageDurationMin / 60)}h {route.averageDurationMin % 60}m</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-muted/20 text-muted-foreground"><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-red-50 text-red-500"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-bold">Gestão de Usuários</h3>
            <Badge className="bg-primary/10 text-primary border-none">12.450 Total</Badge>
          </div>

          <div className="space-y-4">
            {[
              { name: "Lucas Silveira", role: "Traveler", status: "Verified", orders: 42 },
              { name: "Mariana Costa", role: "Sender", status: "Verified", orders: 15 },
              { name: "Ricardo Silva", role: "Traveler", status: "Pending", orders: 2 },
            ].map((user, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-[2rem] border border-muted shadow-sm">
                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center font-bold text-muted-foreground text-lg">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">{user.role} • {user.orders} Atividades</p>
                </div>
                <div className="text-right">
                  {user.status === 'Verified' ? (
                    <div className="flex items-center gap-1 text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3" /> VERIFICADO
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      <AlertCircle className="h-3 w-3" /> PENDENTE
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
