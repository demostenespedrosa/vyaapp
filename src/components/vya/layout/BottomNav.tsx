
"use client";

import { Home, Package, Wallet, User, Map, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  mode: 'sender' | 'traveler';
}

export function BottomNav({ activeTab, onTabChange, mode }: BottomNavProps) {
  // Definimos as abas baseadas no modo (Remetente vs Viajante)
  // Removido o botão FAB (action) do modo viajante a pedido do usuário
  const tabs = mode === 'sender' 
    ? [
        { id: 'home', label: 'Início', icon: Home },
        { id: 'activity', label: 'Envios', icon: Package },
        { id: 'profile', label: 'Perfil', icon: User },
      ]
    : [
        { id: 'home', label: 'Pedidos', icon: Search },
        { id: 'activity', label: 'Viagens', icon: Map },
        { id: 'wallet', label: 'Grana', icon: Wallet },
        { id: 'profile', label: 'Perfil', icon: User },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass z-50 px-6 pb-safe-area-bottom border-t shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      <div className={cn(
        "flex items-center h-16 max-w-md mx-auto",
        "justify-around" // Simplificado para justify-around em ambos os modos para melhor espaçamento com menos itens
      )}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all active:scale-95 relative px-2",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-6 w-6", isActive && "fill-primary/10")} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
              {isActive && (
                <span className="h-1 w-1 rounded-full bg-primary absolute -bottom-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
