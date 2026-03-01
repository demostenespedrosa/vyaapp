"use client";

/**
 * PwaInstallPrompt
 * 
 * – Android / Desktop Chrome: captura o evento `beforeinstallprompt` e exibe
 *   um bottom-sheet com botão "Instalar".
 * – iOS Safari: exibe instrução "Toque em Compartilhar → Adicionar à Tela de
 *   Início" pois o iOS não suporta a API de instalação automática.
 * 
 * O banner só aparece se:
 *  1. O usuário está logado (`userId` presente)
 *  2. O app NÃO está em modo standalone (já instalado)
 *  3. O usuário não dispensou permanentemente (localStorage)
 */

import { useEffect, useState, useRef } from "react";
import { Download, X, Share, Smartphone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "vya_pwa_dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

interface PwaInstallPromptProps {
  userId: string | null;
}

type Platform = "android" | "ios" | "desktop" | "unknown";

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  // Desktop Chrome também suporta instalação
  if (/chrome/i.test(ua) && !/mobile/i.test(ua)) return "desktop";
  return "unknown";
}

function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error propriedade específica do Safari iOS
    window.navigator.standalone === true
  );
}

function isDismissed(): boolean {
  try {
    const val = localStorage.getItem(DISMISS_KEY);
    if (!val) return false;
    const ts = parseInt(val, 10);
    return Date.now() - ts < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  } catch { /* noop */ }
}

export function PwaInstallPrompt({ userId }: PwaInstallPromptProps) {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [visible, setVisible] = useState(false); // controla a animação
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deferredPrompt = useRef<any>(null);

  useEffect(() => {
    if (!userId) return;
    if (isInStandaloneMode()) return;
    if (isDismissed()) return;

    const plat = detectPlatform();
    setPlatform(plat);

    if (plat === "ios") {
      // iOS Safari: não tem API — exibimos instrução após 3 s
      const timer = setTimeout(() => {
        setShow(true);
        // Anima entrada
        requestAnimationFrame(() => setVisible(true));
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Android / Desktop Chrome: espera o evento beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setShow(true);
      requestAnimationFrame(() => setVisible(true));
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [userId]);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    if (outcome === "accepted") {
      handleDismiss(true);
    }
  };

  const handleDismiss = (permanent = false) => {
    setVisible(false);
    if (permanent) markDismissed();
    setTimeout(() => setShow(false), 400);
  };

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-[9999] px-4 pb-safe-bottom transition-all duration-400 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      )}
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)" }}
    >
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-black/20 border border-muted/30 overflow-hidden w-full max-w-lg mx-auto">
        {/* Cabeçalho colorido */}
        <div className="bg-gradient-to-r from-[#F15A2B] to-[#c8441c] px-6 pt-5 pb-4 flex items-start justify-between relative overflow-hidden">
          {/* Decoração de fundo */}
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5" />
          <div className="absolute -right-2 top-8 h-12 w-12 rounded-full bg-white/5" />

          <div className="flex items-center gap-4 relative z-10">
            {/* Ícone do app */}
            <div className="h-14 w-14 rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/apple-touch-icon.png" alt="VYA" className="h-14 w-14 object-cover" />
            </div>
            <div>
              <p className="text-white font-black text-lg leading-tight">VYA</p>
              <p className="text-white/70 text-[11px] font-medium leading-snug">
                Logística Colaborativa
              </p>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-white/60 text-[10px] ml-1">5.0</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => handleDismiss(false)}
            className="relative z-10 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0 mt-1"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Corpo */}
        <div className="px-6 py-4 space-y-4">
          {platform === "ios" ? (
            // ─── Instruções iOS ────────────────────────────────────────────
            <div className="space-y-3">
              <p className="text-sm font-bold text-foreground">
                Instale o VYA no seu iPhone
              </p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-primary font-black text-xs">1</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <p className="text-sm text-foreground font-medium">
                      Toque em{" "}
                      <strong className="inline-flex items-center gap-1">
                        Compartilhar
                        <span className="inline-block">
                          {/* Share icon como emoji inline */}
                          <Share className="h-4 w-4 text-blue-500 inline -mt-0.5" />
                        </span>
                      </strong>{" "}
                      na barra do Safari
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-primary font-black text-xs">2</span>
                  </div>
                  <p className="text-sm text-foreground font-medium flex-1">
                    Role para baixo e toque em{" "}
                    <strong>&quot;Adicionar à Tela de Início&quot;</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-primary font-black text-xs">3</span>
                  </div>
                  <p className="text-sm text-foreground font-medium flex-1">
                    Toque em <strong>&quot;Adicionar&quot;</strong> no canto
                    superior direito
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(true)}
                className="w-full text-muted-foreground text-xs h-9 rounded-xl"
              >
                Não mostrar novamente
              </Button>
            </div>
          ) : (
            // ─── Botão Android / Desktop ───────────────────────────────────
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">
                    Instale como aplicativo
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Acesso rápido, funciona offline e ocupa menos espaço que um
                    app convencional.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="ghost"
                  onClick={() => handleDismiss(true)}
                  className="h-12 rounded-2xl text-xs font-bold text-muted-foreground border border-muted"
                >
                  Agora não
                </Button>
                <Button
                  onClick={handleInstall}
                  className="h-12 rounded-2xl text-xs font-bold gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  <Download className="h-4 w-4" />
                  Instalar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
