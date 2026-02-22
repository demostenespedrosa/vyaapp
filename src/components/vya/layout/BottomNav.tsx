
"use client";

import { Home, Package, Wallet, User, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'activity', label: 'Envios', icon: Package },
    { id: 'action', label: 'Novo', icon: PlusCircle, isAction: true },
    { id: 'wallet', label: 'Carteira', icon: Wallet },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass z-50 px-6 pb-safe-area-bottom border-t shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative -top-6 flex items-center justify-center h-14 w-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 active:scale-90 transition-transform"
              >
                <Icon className="h-8 w-8" />
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-6 w-6", isActive && "fill-primary/10")} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
              {isActive && (
                <span className="h-1 w-1 rounded-full bg-primary absolute bottom-2" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
