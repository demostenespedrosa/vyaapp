/**
 * dataCache — cache em memória com TTL para dados operacionais.
 *
 * Impede refetches desnecessários ao navegar entre telas.
 * Os dados ficam válidos por `ttlMs` ms (padrão: 60s).
 * Chame `invalidate(key)` após mutações para forçar refresh na próxima visita.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL = 60_000; // 60 segundos

export const dataCache = {
  get<T>(key: string, ttlMs = DEFAULT_TTL): T | null {
    const entry = store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() - entry.timestamp > ttlMs) {
      store.delete(key);
      return null;
    }
    return entry.data;
  },

  set<T>(key: string, data: T): void {
    store.set(key, { data, timestamp: Date.now() });
  },

  invalidate(key: string): void {
    store.delete(key);
  },

  invalidatePrefix(prefix: string): void {
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) store.delete(key);
    }
  },
};
