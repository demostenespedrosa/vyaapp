"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  cpf: string;
  phone: string;
  avatar_url?: string;
  role?: string;
  rating?: number;
  referral_code?: string;
}

export interface AppConfigs {
  pricingTable: any | null;
  platformFeePercent: number;
}

interface AppContextValue {
  // Auth
  isLoadingAuth: boolean;
  isLoggedIn: boolean;
  userId: string | null;
  mode: "sender" | "traveler" | "admin";
  setMode: (m: "sender" | "traveler" | "admin") => void;
  handleLogout: () => Promise<void>;
  // Dados do usuário
  profile: UserProfile | null;
  refreshProfile: () => Promise<void>;
  // Configs globais
  configs: AppConfigs;
  configsLoaded: boolean;
}

const DEFAULT_CONFIGS: AppConfigs = { pricingTable: null, platformFeePercent: 20 };

const AppContext = createContext<AppContextValue>({
  isLoadingAuth: true,
  isLoggedIn: false,
  userId: null,
  mode: "sender",
  setMode: () => {},
  handleLogout: async () => {},
  profile: null,
  refreshProfile: async () => {},
  configs: DEFAULT_CONFIGS,
  configsLoaded: false,
});

// ---------------------------------------------------------------------------
// Provider — única fonte de verdade de autenticação
// ---------------------------------------------------------------------------

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [mode, setMode] = useState<"sender" | "traveler" | "admin">("sender");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [configs, setConfigs] = useState<AppConfigs>(DEFAULT_CONFIGS);
  const [configsLoaded, setConfigsLoaded] = useState(false);

  const profileFetchedFor = useRef<string | null>(null);
  const configsFetched = useRef(false);

  // -------------------------------------------------------------------------
  // Fetches de dados do usuário
  // -------------------------------------------------------------------------

  const fetchProfile = useCallback(async (uid: string, email: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, cpf, phone, avatar_url, role, rating, referral_code")
        .eq("id", uid)
        .single();

      if (data) {
        setProfile({
          id: data.id,
          full_name: data.full_name || "",
          email,
          cpf: data.cpf || "",
          phone: data.phone || "",
          avatar_url: data.avatar_url,
          role: data.role,
          rating: data.rating,
          referral_code: data.referral_code,
        });
        return data.role as string | undefined;
      }
    } catch (err) {
      console.error("[AppContext] fetchProfile error:", err);
    }
    return undefined;
  }, []);

  const fetchConfigs = useCallback(async () => {
    if (configsFetched.current) return;
    configsFetched.current = true;
    try {
      const [{ data: p }, { data: f }] = await Promise.all([
        supabase.from("configs").select("value").eq("key", "pricing_table").single(),
        supabase.from("configs").select("value").eq("key", "platform_fee_percent").single(),
      ]);
      setConfigs({
        pricingTable: p?.value ?? null,
        platformFeePercent: f?.value != null ? Number(f.value) : 20,
      });
    } catch (err) {
      console.error("[AppContext] fetchConfigs error:", err);
    } finally {
      setConfigsLoaded(true);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    profileFetchedFor.current = null;
    const email = profile?.email ?? "";
    await fetchProfile(userId, email);
  }, [userId, profile?.email, fetchProfile]);

  // -------------------------------------------------------------------------
  // Listener único de auth — NENHUM outro componente deve ouvir onAuthStateChange
  // -------------------------------------------------------------------------

  useEffect(() => {
    // Safety timer: após 8s sem resposta, libera a UI
    const safetyTimer = setTimeout(() => setIsLoadingAuth(false), 8000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        clearTimeout(safetyTimer);

        if (!session?.user) {
          setIsLoggedIn(false);
          setUserId(null);
          setProfile(null);
          profileFetchedFor.current = null;
          setIsLoadingAuth(false);
          return;
        }

        const uid = session.user.id;
        const email = session.user.email ?? "";

        setUserId(uid);
        setIsLoggedIn(true);

        // Busca perfil+role uma única vez por uid
        if (profileFetchedFor.current !== uid) {
          profileFetchedFor.current = uid;
          const role = await fetchProfile(uid, email);
          const resolvedRole = role ?? session.user.user_metadata?.role ?? "cliente";
          setMode(String(resolvedRole).trim().toLowerCase() === "admin" ? "admin" : "sender");
          fetchConfigs(); // fire-and-forget, não bloqueia o loading
        }

        setIsLoadingAuth(false);
      }
    );

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [fetchProfile, fetchConfigs]);

  // -------------------------------------------------------------------------
  // Realtime: atualiza o perfil quando mudar no banco
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`profile:${userId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${userId}` },
        (payload) => {
          setProfile((prev) =>
            prev ? { ...prev, ...(payload.new as Partial<UserProfile>) } : prev
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // -------------------------------------------------------------------------

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserId(null);
    setProfile(null);
    setMode("sender");
    profileFetchedFor.current = null;
  }, []);

  return (
    <AppContext.Provider
      value={{
        isLoadingAuth,
        isLoggedIn,
        userId,
        mode,
        setMode,
        handleLogout,
        profile,
        refreshProfile,
        configs,
        configsLoaded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAppContext() {
  return useContext(AppContext);
}
