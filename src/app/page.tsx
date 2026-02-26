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
import { AppProvider, useAppContext } from "@/contexts/AppContext";
import { Box } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// AppShell — apenas consome o contexto, sem nenhum listener próprio de auth
// ---------------------------------------------------------------------------

function AppShell() {
  const {
    isLoadingAuth,
    isLoggedIn,
    mode,
    setMode,
    handleLogout,
    profile,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState("home");
  const [startCreating, setStartCreating] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Rola para o topo ao mudar aba
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [activeTab]);

  // Ajusta aba ativa ao trocar de modo
  useEffect(() => {
    if (mode === "sender" && (activeTab === "action" || activeTab === "wallet")) {
      setActiveTab("home");
    }
    setStartCreating(false);
  }, [mode]);

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

  const handleLogoutAndReset = async () => {
    await handleLogout();
    setActiveTab("home");
  };

  // Converte UserProfile do contexto para o formato de ProfileView
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
      return <AdminDashboard onLogout={handleLogoutAndReset} />;
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
            onLogout={handleLogoutAndReset}
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

  // Tela de loading
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-primary to-brand-purple shadow-2xl shadow-primary/30 text-white animate-pulse">
          <Box className="h-10 w-10" />
        </div>
      </div>
    );
  }

  // onLoginSuccess é no-op: AppContext escuta onAuthStateChange automaticamente
  if (!isLoggedIn) {
    return <AuthScreen onLoginSuccess={() => {}} />;
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
// Home — wrapper raiz com AppProvider (contexto global de auth + dados)
// ---------------------------------------------------------------------------

export default function Home() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
