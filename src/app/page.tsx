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
import { AppProvider, useAppContext } from "@/contexts/AppContext";
import { Box } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// AppShell — componente interno que pode usar o AppContext
// ---------------------------------------------------------------------------

function AppShell() {
  const { profile } = useAppContext();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [mode, setMode] = useState<"sender" | "traveler" | "admin">("sender");
  const [startCreating, setStartCreating] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [activeTab]);

  useEffect(() => {
    // Timeout de segurança: se nada responder em 8s, libera a tela de login
    const safetyTimer = setTimeout(() => {
      setIsLoadingAuth(false);
    }, 8000);

    // Supabase v2: onAuthStateChange já dispara INITIAL_SESSION na montagem
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      clearTimeout(safetyTimer);
      if (session?.user) {
        await handleLoginSuccess(session.user);
      } else {
        setIsLoggedIn(false);
        setIsLoadingAuth(false);
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (mode === "sender" && (activeTab === "action" || activeTab === "wallet")) {
      setActiveTab("home");
    }
    setStartCreating(false);
  }, [mode]);

  // Só busca role — perfil completo já é cacheado e atualizado pelo AppContext
  const handleLoginSuccess = async (user: any) => {
    let role = "cliente";

    try {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (data?.role) {
        role = String(data.role).trim().toLowerCase();
      } else if (user.user_metadata?.role) {
        role = String(user.user_metadata.role).trim().toLowerCase();
      }
    } catch (err) {
      console.error("Erro ao buscar role:", err);
    } finally {
      setMode(role === "admin" ? "admin" : "sender");
      setIsLoggedIn(true);
      setIsLoadingAuth(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== "activity" && tab !== "action") {
      setStartCreating(false);
    }
  };

  const handleHomeAction = () => {
    setStartCreating(true);
    setActiveTab(mode === "sender" ? "activity" : "action");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setActiveTab("home");
    setMode("sender");
  };

  // Converte o UserProfile do contexto para o formato que ProfileView espera
  const profileForView = profile
    ? {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        cpf: profile.cpf,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
      }
    : null;

  const renderContent = () => {
    if (mode === "admin") {
      return <AdminDashboard onLogout={handleLogout} />;
    }

    switch (activeTab) {
      case "home":
        return <HomeDashboard mode={mode as "sender" | "traveler"} onAction={handleHomeAction} />;
      case "activity":
        return mode === "sender" ? (
          <SenderView initialIsCreating={startCreating} />
        ) : (
          <TravelerView initialIsCreating={false} />
        );
      case "action":
        return mode === "sender" ? (
          <SenderView initialIsCreating={true} />
        ) : (
          <TravelerView initialIsCreating={true} />
        );
      case "wallet":
        return <WalletDashboard />;
      case "profile":
        return (
          <ProfileView
            mode={mode as "sender" | "traveler"}
            onModeChange={setMode}
            onLogout={handleLogout}
            initialProfile={profileForView}
            onProfileUpdate={() => {
              /* AppContext atualiza via realtime */
            }}
          />
        );
      default:
        return <HomeDashboard mode={mode as "sender" | "traveler"} onAction={handleHomeAction} />;
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-primary to-brand-purple shadow-2xl shadow-primary/30 text-white animate-pulse">
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
      <main
        ref={mainRef}
        className={cn(
          "flex-1 scrollable-content",
          mode === "admin" ? "bg-slate-50" : "px-4 pt-safe-area-top pb-10"
        )}
      >
        <div
          className={cn(
            "h-full",
            mode === "admin" ? "w-full" : "max-w-md mx-auto"
          )}
        >
          {renderContent()}
        </div>
      </main>

      {mode !== "admin" && (
        <BottomNav
          mode={mode as "sender" | "traveler"}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Home — wrapper com o AppProvider (contexto global de sessão)
// ---------------------------------------------------------------------------

export default function Home() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
