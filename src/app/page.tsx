
"use client";

import { useState, useEffect } from "react";
import { BottomNav } from "@/components/vya/layout/BottomNav";
import { HomeDashboard } from "@/components/vya/home/HomeDashboard";
import { SenderView } from "@/components/vya/sender/SenderView";
import { TravelerView } from "@/components/vya/traveler/TravelerView";
import { AdminDashboard } from "@/components/vya/admin/AdminDashboard";
import { WalletDashboard } from "@/components/vya/wallet/WalletDashboard";
import { ProfileView } from "@/components/vya/profile/ProfileView";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Shield, 
  CreditCard, 
  LogOut, 
  ChevronRight, 
  ShieldCheck, 
  Box, 
  ArrowRight,
  User as UserIcon,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [mode, setMode] = useState<'sender' | 'traveler' | 'admin'>('sender');
  const [startCreating, setStartCreating] = useState(false);

  useEffect(() => {
    if (mode === 'sender' && (activeTab === 'action' || activeTab === 'wallet')) {
      setActiveTab('home');
    }
    setStartCreating(false);
  }, [mode]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'activity' && tab !== 'action') {
      setStartCreating(false);
    }
  };

  const handleHomeAction = () => {
    setStartCreating(true);
    if (mode === 'sender') {
      setActiveTab('activity');
    } else {
      setActiveTab('action');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('home');
    setMode('sender');
  };

  const renderContent = () => {
    if (mode === 'admin') {
      return <AdminDashboard onLogout={handleLogout} />;
    }

    switch (activeTab) {
      case 'home':
        return <HomeDashboard mode={mode as 'sender' | 'traveler'} onAction={handleHomeAction} />;
      case 'activity':
        return mode === 'sender' ? (
          <SenderView initialIsCreating={startCreating} />
        ) : (
          <TravelerView initialIsCreating={false} />
        );
      case 'action':
        return mode === 'sender' 
          ? <SenderView initialIsCreating={true} /> 
          : <TravelerView initialIsCreating={true} />;
      case 'wallet':
        return <WalletDashboard />;
      case 'profile':
        return <ProfileView mode={mode as 'sender' | 'traveler'} onModeChange={setMode} onLogout={handleLogout} />;
      default:
        return <HomeDashboard mode={mode as 'sender' | 'traveler'} onAction={handleHomeAction} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white flex flex-col px-6 py-10 page-transition">
        <div className="flex-1 flex flex-col justify-center space-y-12">
          <div className="space-y-6 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary shadow-2xl shadow-primary/30 text-white mx-auto">
              <Box className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter text-foreground">VYA</h1>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Logística Colaborativa</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center px-4 leading-tight">
              A revolução da entrega na palma da sua mão. 📦
            </h2>
            <p className="text-sm text-muted-foreground text-center px-8">
              Mova o Brasil sem precisar de frota própria. Conectamos quem precisa mandar com quem já vai viajar.
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-auto">
          <Button 
            onClick={() => { setIsLoggedIn(true); setMode('sender'); }}
            className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-lg font-bold gap-3 shadow-xl shadow-primary/20 group active:scale-95 transition-all"
          >
            <UserIcon className="h-6 w-6" /> Acessar como Usuário
            <ArrowRight className="h-5 w-5 ml-auto opacity-40 group-hover:opacity-100 transition-opacity" />
          </Button>

          <Button 
            variant="outline"
            onClick={() => { setIsLoggedIn(true); setMode('admin'); }}
            className="w-full h-16 rounded-[1.5rem] border-2 border-primary/10 hover:bg-primary/5 text-lg font-bold gap-3 group active:scale-95 transition-all"
          >
            <ShieldAlert className="h-6 w-6 text-primary" /> Painel do Administrador
            <ArrowRight className="h-5 w-5 ml-auto opacity-20 group-hover:opacity-100 transition-opacity" />
          </Button>
          
          <div className="pt-6 text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
              <Sparkles className="h-3 w-3 text-primary" /> Sistema em modo Demo (Sem Backend)
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <main className={cn(
        "flex-1 scrollable-content",
        mode === 'admin' ? "bg-slate-50" : "px-4 pt-safe-area-top pb-10"
      )}>
        <div className={cn(
          "h-full",
          mode === 'admin' ? "w-full" : "max-w-md mx-auto"
        )}>
          {renderContent()}
        </div>
      </main>

      {mode !== 'admin' && (
        <BottomNav mode={mode as 'sender' | 'traveler'} activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
}
