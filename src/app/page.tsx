
"use client";

import { useState, useEffect, useRef } from "react";
import { BottomNav } from "@/components/vya/layout/BottomNav";
import { HomeDashboard } from "@/components/vya/home/HomeDashboard";
import { SenderView } from "@/components/vya/sender/SenderView";
import { TravelerView } from "@/components/vya/traveler/TravelerView";
import { AdminDashboard } from "@/components/vya/admin/AdminDashboard";
import { WalletDashboard } from "@/components/vya/wallet/WalletDashboard";
import { ProfileView } from "@/components/vya/profile/ProfileView";
import { AuthScreen } from "@/components/vya/auth/AuthScreen";
import { supabase } from "@/lib/supabase";
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
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [mode, setMode] = useState<'sender' | 'traveler' | 'admin'>('sender');
  const [startCreating, setStartCreating] = useState(false);
  const [userProfile, setUserProfile] = useState<{ id: string; full_name: string; email: string; cpf: string; phone: string; avatar_url?: string } | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [activeTab]);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await handleLoginSuccess(session.user);
      } else {
        setIsLoadingAuth(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await handleLoginSuccess(session.user);
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (mode === 'sender' && (activeTab === 'action' || activeTab === 'wallet')) {
      setActiveTab('home');
    }
    setStartCreating(false);
  }, [mode]);

  const handleLoginSuccess = async (user: any) => {
    let role = 'cliente'; // Fallback padrão

    try {
      // Busca a role diretamente do banco de dados
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, full_name, cpf, phone, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error("Erro ao buscar role no Supabase:", error.message);
      }
      
      if (data) {
        role = String(data.role || 'cliente').trim().toLowerCase();
        setUserProfile({
          id: data.id,
          full_name: data.full_name || '',
          email: user.email || '',
          cpf: data.cpf || '',
          phone: data.phone || '',
          avatar_url: data.avatar_url,
        });
      } else if (user.user_metadata?.role) {
        role = String(user.user_metadata.role).trim().toLowerCase();
      }
    } catch (err) {
      console.error("Erro inesperado ao buscar role:", err);
    }

    // Força a atualização do estado com base na role resolvida
    const finalMode = role === 'admin' ? 'admin' : 'sender';
    setMode(finalMode);
    setIsLoggedIn(true);
    setIsLoadingAuth(false);
  };

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
        return <ProfileView mode={mode as 'sender' | 'traveler'} onModeChange={setMode} onLogout={handleLogout} initialProfile={userProfile} onProfileUpdate={(p) => setUserProfile(p)} />;
      default:
        return <HomeDashboard mode={mode as 'sender' | 'traveler'} onAction={handleHomeAction} />;
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary shadow-2xl shadow-primary/30 text-white animate-pulse">
          <Box className="h-10 w-10" />
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <main ref={mainRef} className={cn(
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
