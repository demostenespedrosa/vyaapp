"use client";

/**
 * AppContext — cache global de dados do usuário e configurações.
 *
 * Garante que perfil e configs sejam buscados UMA ÚNICA VEZ por sessão.
 * Mudanças chegam via Supabase Realtime (sem polling, sem refetch desnecessário).
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
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
  userId: string | null;
  profile: UserProfile | null;
  configs: AppConfigs;
  configsLoaded: boolean;
  /** Força re-fetch do perfil (ex: após o usuário editar dados) */
  refreshProfile: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_CONFIGS: AppConfigs = {
  pricingTable: null,
  platformFeePercent: 20,
};

const AppContext = createContext<AppContextValue>({
  userId: null,
  profile: null,
  configs: DEFAULT_CONFIGS,
  configsLoaded: false,
  refreshProfile: async () => {},
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AppProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [configs, setConfigs] = useState<AppConfigs>(DEFAULT_CONFIGS);
  const [configsLoaded, setConfigsLoaded] = useState(false);

  // Evita duplo fetch se o componente re-renderizar
  const profileFetchedFor = useRef<string | null>(null);
  const configsFetched = useRef(false);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  const fetchProfile = useCallback(async (uid: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, cpf, phone, avatar_url, role, rating, referral_code")
        .eq("id", uid)
        .single();

      if (data) {
        const { data: { user } } = await supabase.auth.getUser();
        setProfile({
          id: data.id,
          full_name: data.full_name || "",
          email: user?.email || "",
          cpf: data.cpf || "",
          phone: data.phone || "",
          avatar_url: data.avatar_url,
          role: data.role,
          rating: data.rating,
          referral_code: data.referral_code,
        });
      }
    } catch (err) {
      console.error("[AppContext] fetchProfile error:", err);
    }
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
    if (userId) {
      profileFetchedFor.current = null; // permite re-fetch
      await fetchProfile(userId);
    }
  }, [userId, fetchProfile]);

  // -------------------------------------------------------------------------
  // Auth listener — seta userId e dispara fetches iniciais
  // -------------------------------------------------------------------------

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      if (uid && profileFetchedFor.current !== uid) {
        profileFetchedFor.current = uid;
        fetchProfile(uid);
        fetchConfigs();
      }

      if (!uid) {
        setProfile(null);
        profileFetchedFor.current = null;
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchConfigs]);

  // -------------------------------------------------------------------------
  // Realtime: atualiza o perfil automaticamente quando mudar no banco
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`profile:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          setProfile((prev) =>
            prev ? { ...prev, ...(payload.new as Partial<UserProfile>) } : prev
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <AppContext.Provider value={{ userId, profile, configs, configsLoaded, refreshProfile }}>
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
