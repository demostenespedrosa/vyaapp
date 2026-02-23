"use client";

import { useState, useEffect } from "react";
import { BottomNav } from "@/components/vya/layout/BottomNav";
import { HomeDashboard } from "@/components/vya/home/HomeDashboard";
import { SenderView } from "@/components/vya/sender/SenderView";
import { TravelerView } from "@/components/vya/traveler/TravelerView";
import { AdminDashboard } from "@/components/vya/admin/AdminDashboard";
import { WalletCard } from "@/components/vya/shared/WalletCard";
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
        return (
          <div className="space-y-6 page-transition">
            <h1 className="text-2xl font-bold">Sua Grana</h1>
            <WalletCard />
            <div className="p-10 rounded-[2.5rem] bg-muted/30 border border-dashed flex flex-col items-center justify-center text-center gap-3">
              <p className="text-sm font-bold text-muted-foreground">Histórico vazio por enquanto...</p>
              <p className="text-xs text-muted-foreground/60">Bora movimentar essa conta e fazer uns trocados!</p>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-8 page-transition pb-32">
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
                <p className="text-sm text-muted-foreground font-medium">Nível 5 • Super Viajante</p>
              </div>
            </div>

            <section className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase px-4 tracking-widest">Painel do Usuário</h3>
              <Card className="rounded-[2.5rem] border-none shadow-sm bg-muted/30">
                <CardContent className="p-2 space-y-2">
                  <div className="flex items-center justify-between p-5 bg-white rounded-[2rem] shadow-sm">
                    <div className="space-y-0.5">
                      <Label className="text-base font-bold">Modo de Uso</Label>
                      <p className="text-xs text-muted-foreground">
                        {mode === 'sender' ? "Você está como Remetente" : "Você está como Viajante"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold uppercase transition-colors ${mode === 'sender' ? 'text-primary' : 'text-muted-foreground'}`}>Mandar</span>
                      <Switch 
                        checked={mode === 'traveler'} 
                        onCheckedChange={(checked) => setMode(checked ? 'traveler' : 'sender')}
                        className="data-[state=checked]:bg-secondary"
                      />
                      <span className={`text-[10px] font-bold uppercase transition-colors ${mode === 'traveler' ? 'text-secondary' : 'text-muted-foreground'}`}>Viajar</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-5 bg-primary/5 rounded-[2rem] border border-primary/10">
                    <div className="flex items-center gap-3 text-primary">
                      <ShieldCheck className="h-5 w-5" />
                      <Label className="text-base font-bold">Modo Admin</Label>
                    </div>
                    <Switch 
                      checked={mode === 'admin'} 
                      onCheckedChange={(checked) => setMode(checked ? 'admin' : 'sender')}
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-2">
              {[
                { icon: Settings, label: "Meus Dados", color: "text-blue-500", bg: "bg-blue-50" },
                { icon: Shield, label: "Segurança", color: "text-green-500", bg: "bg-green-50" },
                { icon: CreditCard, label: "Pagamentos", color: "text-orange-500", bg: "bg-orange-50" },
              ].map((item, idx) => (
                <button key={idx} className="w-full flex items-center justify-between p-4 bg-muted/20 rounded-3xl active:scale-[0.98] transition-all hover:bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-2xl ${item.bg} ${item.color}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm">{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
                </button>
              ))}
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 bg-red-50 rounded-3xl active:scale-[0.98] transition-all hover:bg-red-100"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-white text-destructive">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm text-destructive">Sair da Conta</span>
                </div>
              </button>
            </section>
          </div>
        );
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
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">Logística Colaborativa</p>
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
        "flex-1 overflow-y-auto no-scrollbar",
        mode === 'admin' ? "bg-slate-50" : "px-4 pt-4 pb-10"
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