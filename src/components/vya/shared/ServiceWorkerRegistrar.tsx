"use client";

import { useEffect } from "react";

/**
 * Registra o Service Worker assim que o componente monta no cliente.
 * Sem UI — apenas side effects.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.log("[VYA] Service Worker registrado:", reg.scope);

          // Verifica por atualizações a cada 60 s (quando o app está em foco)
          setInterval(() => {
            if (document.visibilityState === "visible") {
              reg.update().catch(() => {/* ignora falhas de rede */});
            }
          }, 60_000);
        })
        .catch((err) => {
          console.warn("[VYA] Falha ao registrar Service Worker:", err);
        });
    });
  }, []);

  return null;
}
