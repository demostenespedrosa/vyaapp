
"use client";

import { useState } from "react";
import { BottomNav } from "@/components/vya/layout/BottomNav";
import { HomeDashboard } from "@/components/vya/home/HomeDashboard";
import { SenderView } from "@/components/vya/sender/SenderView";
import { TravelerView } from "@/components/vya/traveler/TravelerView";
import { WalletCard } from "@/components/vya/shared/WalletCard";
import { Navbar } from "@/components/vya/layout/Navbar";

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
          <div className="space-y-6 page-transition text-center py-10">
            <div className="relative inline-block">
              <div className="h-24 w-24 rounded-full bg-primary/10 mx-auto flex items-center justify-center text-primary text-3xl font-bold border-4 border-white shadow-lg">
                L
              </div>
              <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-secondary border-4 border-white flex items-center justify-center text-white">
                ✓
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">Lucas Silveira</h2>
              <p className="text-sm text-muted-foreground">Nível 5 - Super Viajante</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 rounded-2xl bg-muted/50">
                <p className="text-lg font-bold text-primary">42</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Envios</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/50">
                <p className="text-lg font-bold text-secondary">15</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Viagens</p>
              </div>
            </div>
          </div>
        );
      default:
        return <HomeDashboard mode={mode} />;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Header Fixo com Toggle de Modo */}
      {activeTab === 'home' && (
        <div className="hidden"> {/* Placeholder se quisermos remover o Navbar original */}
          <Navbar mode={mode} onToggle={setMode} />
        </div>
      )}

      {/* Container Principal com Scroll Independente */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-24 no-scrollbar">
        <div className="max-w-md mx-auto h-full">
          {/* Toggle de Modo Flutuante (Linguagem Conversacional) */}
          {activeTab === 'home' && (
            <div className="flex p-1 bg-muted rounded-2xl mb-6 shadow-inner">
              <button 
                onClick={() => setMode('sender')}
                className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${mode === 'sender' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground opacity-60'}`}
              >
                Tô mandando
              </button>
              <button 
                onClick={() => setMode('traveler')}
                className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${mode === 'traveler' ? 'bg-white shadow-sm text-secondary' : 'text-muted-foreground opacity-60'}`}
              >
                Tô viajando
              </button>
            </div>
          )}
          
          {renderContent()}
        </div>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
