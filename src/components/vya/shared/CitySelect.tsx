"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { MapPin, X, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CityOption {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
}

interface CitySelectProps {
  /** Label exibido no placeholder e acessibilidade */
  label: string;
  /** Cor de destaque: "primary" | "secondary" */
  color?: "primary" | "secondary";
  /** Cidade atualmente selecionada */
  value: CityOption | null;
  /** Chamado ao selecionar ou limpar (null = limpar) */
  onChange: (city: CityOption | null) => void;
}

// Cache global para não refazer a query a cada instância
let cachedCities: CityOption[] | null = null;

export function CitySelect({ label, color = "primary", value, onChange }: CitySelectProps) {
  const [query, setQuery] = useState("");
  const [cities, setCities] = useState<CityOption[]>(cachedCities ?? []);
  const [isLoading, setIsLoading] = useState(!cachedCities);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Carrega cidades ativas uma única vez (cache global)
  useEffect(() => {
    if (cachedCities) return;
    (async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("cities")
        .select("id, name, state, lat, lng")
        .eq("status", "active")
        .order("name");
      if (error) console.error("CitySelect: erro ao buscar cidades", error.message);
      if (data) {
        const list = data as CityOption[];
        cachedCities = list;
        setCities(list);
      }
      setIsLoading(false);
    })();
  }, []);

  const filtered = query.trim().length < 1
    ? cities
    : cities.filter(c =>
        `${c.name} ${c.state}`.toLowerCase().includes(query.toLowerCase())
      );

  const colorClass = color === "primary"
    ? "bg-primary/10 text-primary"
    : "bg-secondary/10 text-secondary";

  const hoverClass = color === "primary"
    ? "hover:bg-primary/5"
    : "hover:bg-secondary/5";

  const handleSelect = (city: CityOption) => {
    onChange(city);
    setQuery("");
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "flex items-center gap-3 bg-white p-2 rounded-[2rem] border shadow-sm transition-shadow",
          open && "ring-2 ring-primary/20 border-primary/30"
        )}
        onClick={() => !value && setOpen(true)}
      >
        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", colorClass)}>
          <MapPin className="h-5 w-5" />
        </div>

        {value ? (
          /* Cidade selecionada */
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold truncate">{value.name}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{value.state}</p>
          </div>
        ) : (
          /* Input de busca */
          <input
            type="text"
            placeholder={isLoading ? "Carregando cidades..." : `${label} (digite para filtrar)`}
            disabled={isLoading}
            value={query}
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60 min-w-0"
            onFocus={() => setOpen(true)}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
          />
        )}

        {isLoading && !value && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2 shrink-0" />
        )}

        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full shrink-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dropdown */}
      {open && !value && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] bg-white rounded-2xl border shadow-xl max-h-52 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-150">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center px-4">
              <Search className="h-6 w-6 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                {query ? `Nenhuma cidade encontrada para "${query}"` : "Nenhuma cidade disponível"}
              </p>
            </div>
          ) : (
            filtered.map(city => (
              <button
                key={city.id}
                type="button"
                onClick={() => handleSelect(city)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b last:border-0 transition-colors flex items-center gap-3",
                  hoverClass
                )}
              >
                <MapPin className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                <span className="text-sm font-semibold">{city.name}</span>
                <span className="text-xs text-muted-foreground ml-auto shrink-0">{city.state}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
