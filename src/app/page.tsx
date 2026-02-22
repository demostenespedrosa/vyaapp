
"use client";

import { useState } from "react";
import { BottomNav } from "@/components/vya/layout/BottomNav";
import { HomeDashboard } from "@/components/vya/home/HomeDashboard";
import { SenderView } from "@/components/vya/sender/SenderView";
import { TravelerView } from "@/components/vya/traveler/TravelerView";
import { WalletCard } from "@/components/vya/shared/WalletCard";
import { Navbar } from "@/components/vya/layout/Navbar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Shield, CreditCard, LogOut } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [mode, setMode] = useState<'sender' | 'traveler'>('sender');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeDashboard mode={mode} />;
      case 'activity':
        return mode === 'sender' ? <SenderView /> : <TravelerView />;
      case 'action':
        return <SenderView initialIsCreating={true} />;
      case 'wallet':
        return (
          <div className="space-y-6 page-transition">
            <h1 className="text-2xl font-bold">Sua Grana</h1>
            <WalletCard />
            <div className="p-6 rounded-3xl bg-muted/30 border border-dashed flex flex-col items-center justify-center text-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">Histórico de transações vazio por enquanto...</p>
              <p className="text-xs text-muted-foreground/60">Bora movimentar essa conta!</p>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-8 page-transition pb-10">
            {/* Header do Perfil */}
            <div className="text-center space-y-4 pt-6">
              <div className="relative inline-block">
                <div className="h-28 w-28 rounded-full bg-primary/10 mx-auto flex items-center justify-center text-primary text-4xl font-bold border-4 border-white shadow-xl">
                  L
                </div>
                <div className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-secondary border-4 border-white flex items-center justify-center text-white shadow-md">
                  ✓
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Lucas Silveira</h2>
                <p className="text-sm text-muted-foreground">Nível 5 • Super Viajante</p>
              </div>
            </div>

            {/* Status Rápido */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-3xl bg-muted/50 text-center">
                <p className="text-xl font-bold text-primary">42</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Envios</p>
              </div>
              <div className="p-4 rounded-3xl bg-muted/50 text-center">
                <p className="text-xl font-bold text-secondary">15</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Viagens</p>
              </div>
            </div>

            {/* Configurações de Modo (O que foi movido) */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-muted-foreground uppercase px-2 tracking-widest">Configurações</h3>
              <Card className="rounded-[2rem] border-none shadow-sm bg-muted/30">
                <CardContent className="p-2">
                  <div className="flex items-center justify-between p-4 bg-white rounded-[1.5rem] shadow-sm">
                    <div className="space-y-0.5">
                      <Label className="text-base font-bold">Modo de Uso</Label>
                      <p className="text-xs text-muted-foreground">
                        {mode === 'sender' ? "Você está como Remetente" : "Você está como Viajante"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold uppercase ${mode === 'sender' ? 'text-primary' : 'text-muted-foreground'}`}>Mandar</span>
                      <Switch 
                        checked={mode === 'traveler'} 
                        onCheckedChange={(checked) => setMode(checked ? 'traveler' : 'sender')}
                        className="data-[state=checked]:bg-secondary"
                      />
                      <span className={`text-[10px] font-bold uppercase ${mode === 'traveler' ? 'text-secondary' : 'text-muted-foreground'}`}>Viajar</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Lista de Opções Estilo iOS */}
            <section className="space-y-2">
              {[
                { icon: Settings, label: "Dados Pessoais", color: "text-blue-500" },
                { icon: Shield, label: "Segurança e Senha", color: "text-green-500" },
                { icon: CreditCard, label: "Métodos de Pagamento", color: "text-orange-500" },
                { icon: LogOut, label: "Sair da Conta", color: "text-destructive" },
              ].map((item, idx) => (
                <button key={idx} className="w-full flex items-center justify-between p-4 bg-muted/30 rounded-2xl active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl bg-white shadow-sm ${item.color}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm">{item.label}</span>
                  </div>
                  <Settings className="h-4 w-4 text-muted-foreground opacity-20" />
                </button>
              ))}
            </section>
          </div>
        );
      default:
        return <HomeDashboard mode={mode} />;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Container Principal com Scroll Independente */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-24 no-scrollbar">
        <div className="max-w-md mx-auto h-full">
          {renderContent()}
        </div>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
