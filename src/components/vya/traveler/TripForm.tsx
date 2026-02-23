
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  MapPin, 
  ChevronRight, 
  ArrowLeft, 
  Navigation, 
  Clock, 
  Calendar as CalendarIcon, 
  Route, 
  Plus, 
  Check,
  Zap,
  ShieldCheck,
  Search,
  Loader2,
  X,
  Info,
  TrendingUp,
  ArrowRightLeft,
  PackageCheck,
  Building2,
  MapPinned,
  Trash2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const tripSchema = z.object({
  origin: z.string().min(3, "Onde você começa?"),
  originMeetingPoint: z.string().min(3, "Qual o ponto de encontro?"),
  destination: z.string().min(3, "Onde você termina?"),
  destinationMeetingPoint: z.string().min(3, "Onde você entrega?"),
  departureDate: z.string().min(10, "Escolha o dia da viagem"),
  departureTime: z.string().min(5, "Que horas você sai?"),
  maxPackages: z.number().min(1).max(50),
  autoReserve: z.boolean().default(true),
  roundTrip: z.boolean().default(false),
});

type TripFormValues = z.infer<typeof tripSchema>;

interface Location {
  display_name: string;
  lat: string;
  lon: string;
  name: string;
  type?: string;
}

interface RouteOption {
  distance: number;
  duration: number;
  geometry: any;
  summary: string;
  roadNames: string[];
}

export function TripForm({ onComplete }: { onComplete: () => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState<Location | null>(null);
  const [selectedDest, setSelectedDest] = useState<Location | null>(null);
  
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [isCalculatingRoutes, setIsCalculatingRoutes] = useState(false);

  // Estados para Cidades de Passagem (Paradas)
  const [suggestedStops, setSuggestedStops] = useState<Location[]>([]);
  const [isLoadingStops, setIsLoadingStops] = useState(false);
  const [selectedStops, setSelectedStops] = useState<Location[]>([]);
  const [stopMeetingPoints, setStopMeetingPoints] = useState<Record<string, string>>({});

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      origin: "",
      originMeetingPoint: "",
      destination: "",
      destinationMeetingPoint: "",
      departureDate: new Date().toISOString().split('T')[0],
      departureTime: "08:00",
      maxPackages: 5,
      autoReserve: true,
      roundTrip: false,
    },
  });

  const searchLocation = async (query: string, setter: (res: Location[]) => void, loadingSetter: (val: boolean) => void) => {
    if (query.length < 3) return;
    loadingSetter(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=5&addressdetails=1`, {
        headers: { 
          'Accept-Language': 'pt-BR',
          'User-Agent': 'VYA-Traveler-App-Prototype'
        }
      });
      const data = await res.json();
      setter(data.map((item: any) => ({
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
        name: item.display_name.split(',')[0],
        type: item.type
      })));
    } catch (e) {
      console.error(e);
    } finally {
      loadingSetter(false);
    }
  };

  const fetchRoutes = useCallback(async (origin: Location, dest: Location) => {
    setIsCalculatingRoutes(true);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${dest.lon},${dest.lat}?overview=full&alternatives=true&steps=true`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.code === 'Ok') {
        const fetchedRoutes = data.routes.map((r: any) => {
          const roadNames = r.legs[0].steps
            .map((s: any) => s.name)
            .filter((name: string) => name && name !== "" && name.length > 3)
            .filter((v: any, i: any, a: any) => a.indexOf(v) === i);

          return {
            distance: r.distance / 1000,
            duration: r.duration / 60,
            geometry: r.geometry,
            summary: r.legs[0].summary || "Rota sugerida",
            roadNames: roadNames.slice(0, 3)
          };
        });
        
        setRoutes(fetchedRoutes);
      }
    } catch (e) {
      console.error("Erro ao calcular rotas rodoviárias:", e);
      toast({ variant: "destructive", title: "Erro de mapa", description: "Não conseguimos traçar a rota rodoviária agora." });
    } finally {
      setIsCalculatingRoutes(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedOrigin && selectedDest && step === 3) {
      fetchRoutes(selectedOrigin, selectedDest);
    }
  }, [selectedOrigin, selectedDest, step, fetchRoutes]);

  // Efeito para "encontrar" cidades na rota
  useEffect(() => {
    if (step === 4 && selectedOrigin && selectedDest && routes[selectedRouteIdx]) {
      setIsLoadingStops(true);
      // Simulando a varredura da malha rodoviária para encontrar pontos de interesse
      setTimeout(() => {
        // Mock inteligente baseado na rota selecionada
        const routeName = routes[selectedRouteIdx].summary;
        const mocks: Location[] = [
          { name: "Ponto de Apoio Graal", display_name: `${routeName}, Km 82`, lat: "", lon: "" },
          { name: "Trevo de Acesso Leste", display_name: `${routeName}, Km 145`, lat: "", lon: "" },
          { name: "Cidade Satélite Intermediária", display_name: `Marginal da ${routeName}`, lat: "", lon: "" },
          { name: "Parada OBRIGATÓRIA", display_name: `${routeName}, Km 210`, lat: "", lon: "" },
        ];
        setSuggestedStops(mocks);
        setIsLoadingStops(false);
      }, 1500);
    }
  }, [step, selectedOrigin, selectedDest, selectedRouteIdx, routes]);

  const toggleStop = (loc: Location) => {
    const exists = selectedStops.some(s => s.display_name === loc.display_name);
    if (exists) {
      setSelectedStops(selectedStops.filter(s => s.display_name !== loc.display_name));
      const newPoints = { ...stopMeetingPoints };
      delete newPoints[loc.name];
      setStopMeetingPoints(newPoints);
    } else {
      setSelectedStops([...selectedStops, loc]);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const progress = (step / 9) * 100;

  return (
    <div className="space-y-6 pb-32 page-transition">
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>Etapa {step} de 9</span>
          <span>{Math.round(progress)}% Concluído</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-secondary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Início da Jornada 📍</h2>
                <p className="text-sm text-muted-foreground">Onde você inicia sua viagem?</p>
              </div>
              <div className="space-y-4">
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                  <Input 
                    placeholder="Cidade de Saída" 
                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-none text-base font-bold placeholder:font-normal"
                    value={selectedOrigin ? selectedOrigin.name : form.watch("origin")}
                    onChange={(e) => {
                      form.setValue("origin", e.target.value);
                      setSelectedOrigin(null);
                      searchLocation(e.target.value, setSearchResults, setIsSearching);
                    }}
                  />
                  {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-secondary" />}
                </div>
                {!selectedOrigin && searchResults.length > 0 && (
                  <div className="bg-white rounded-2xl border shadow-lg overflow-hidden animate-in fade-in zoom-in-95 z-30 relative">
                    {searchResults.map((loc, i) => (
                      <button key={i} type="button" className="w-full text-left p-4 text-sm hover:bg-secondary/5 border-b last:border-0 transition-colors" onClick={() => { setSelectedOrigin(loc); form.setValue("origin", loc.name); setSearchResults([]); }}>
                        {loc.display_name}
                      </button>
                    ))}
                  </div>
                )}
                {selectedOrigin && (
                  <div className="space-y-2 pt-2 animate-in slide-in-from-top-2">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Ponto de Encontro Principal</FormLabel>
                    <Input 
                      placeholder="Ex: Posto de Gasolina, Rodoviária, Praça Central" 
                      className="h-14 rounded-2xl bg-muted/20 border-dashed border-2 focus-visible:ring-secondary/20"
                      {...form.register("originMeetingPoint")}
                    />
                  </div>
                )}
              </div>
              <Button type="button" onClick={nextStep} disabled={!selectedOrigin || !form.watch("originMeetingPoint")} className="w-full h-14 rounded-2xl bg-secondary font-bold gap-2 shadow-lg shadow-secondary/10">
                Próximo Passo <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Destino Final 🏁</h2>
                <p className="text-sm text-muted-foreground">Até onde você vai levar as encomendas?</p>
              </div>
              <div className="space-y-4">
                <div className="relative group">
                  <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                  <Input 
                    placeholder="Cidade de Destino" 
                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-none text-base font-bold placeholder:font-normal"
                    value={selectedDest ? selectedDest.name : form.watch("destination")}
                    onChange={(e) => {
                      form.setValue("destination", e.target.value);
                      setSelectedDest(null);
                      searchLocation(e.target.value, setSearchResults, setIsSearching);
                    }}
                  />
                  {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-secondary" />}
                </div>
                {!selectedDest && searchResults.length > 0 && (
                  <div className="bg-white rounded-2xl border shadow-lg overflow-hidden animate-in fade-in zoom-in-95 z-30 relative">
                    {searchResults.map((loc, i) => (
                      <button key={i} type="button" className="w-full text-left p-4 text-sm hover:bg-secondary/5 border-b last:border-0 transition-colors" onClick={() => { setSelectedDest(loc); form.setValue("destination", loc.name); setSearchResults([]); }}>
                        {loc.display_name}
                      </button>
                    ))}
                  </div>
                )}
                {selectedDest && (
                  <div className="space-y-2 pt-2 animate-in slide-in-from-top-2">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Onde você entrega no destino?</FormLabel>
                    <Input 
                      placeholder="Ex: Shopping, Terminal, Ponto de Referência" 
                      className="h-14 rounded-2xl bg-muted/20 border-dashed border-2 focus-visible:ring-secondary/20"
                      {...form.register("destinationMeetingPoint")}
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30 active:scale-90 transition-transform"><ArrowLeft className="h-6 w-6" /></Button>
                <Button type="button" onClick={nextStep} disabled={!selectedDest || !form.watch("destinationMeetingPoint")} className="flex-1 h-14 rounded-2xl bg-secondary font-bold shadow-lg shadow-secondary/10">Continuar</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Qual o seu trajeto? 🛣️</h2>
                <p className="text-sm text-muted-foreground">Escolha a rota rodoviária real que você vai seguir.</p>
              </div>
              {isCalculatingRoutes ? (
                <div className="py-20 flex flex-col items-center gap-4 text-center">
                  <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center animate-pulse">
                    <Route className="h-8 w-8 text-secondary animate-bounce" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Mapeando rodovias brasileiras...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Rotas detectadas pela malha rodoviária</p>
                  <div className="space-y-3">
                    {routes.map((r, i) => (
                      <Card key={i} className={cn(
                        "rounded-[2rem] border-2 transition-all cursor-pointer active:scale-[0.98] overflow-hidden",
                        selectedRouteIdx === i ? "border-secondary bg-secondary/5 shadow-inner" : "border-muted bg-white opacity-60"
                      )} onClick={() => setSelectedRouteIdx(i)}>
                        <CardContent className="p-6 flex justify-between items-center">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-secondary/20 text-secondary border-none text-[8px] font-bold uppercase tracking-wider">
                                {i === 0 ? "Recomendada" : "Alternativa"}
                              </Badge>
                              <span className="text-sm font-bold">{r.summary}</span>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              <span className="flex items-center gap-1"><Route className="h-3.5 w-3.5 text-secondary" /> {Math.round(r.distance)}km</span>
                              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-secondary" /> {Math.floor(r.duration / 60)}h {Math.round(r.duration % 60)}m</span>
                            </div>
                          </div>
                          {selectedRouteIdx === i && (
                            <div className="h-8 w-8 rounded-full bg-secondary text-white flex items-center justify-center animate-in zoom-in">
                              <Check className="h-5 w-5" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30 active:scale-90 transition-transform"><ArrowLeft className="h-6 w-6" /></Button>
                <Button type="button" onClick={nextStep} disabled={routes.length === 0} className="flex-1 h-14 rounded-2xl bg-secondary font-bold shadow-lg shadow-secondary/10">Definir Trajeto</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Cidades de Passagem 🏙️</h2>
                <p className="text-sm text-muted-foreground">Marque onde você aceita parar para coletar ou entregar.</p>
              </div>
              
              <div className="space-y-6">
                {isLoadingStops ? (
                  <div className="py-12 flex flex-col items-center gap-3 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Escaneando rota para encontrar cidades...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <Sparkles className="h-4 w-4 text-secondary" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sugestões baseadas na sua rota</p>
                    </div>

                    <div className="grid gap-3">
                      {suggestedStops.map((loc, i) => {
                        const isSelected = selectedStops.some(s => s.display_name === loc.display_name);
                        return (
                          <Card 
                            key={i} 
                            className={cn(
                              "rounded-2xl border-none transition-all overflow-hidden cursor-pointer active:scale-[0.99]",
                              isSelected ? "bg-secondary/10" : "bg-muted/30"
                            )}
                            onClick={() => toggleStop(loc)}
                          >
                            <CardContent className="p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                                    isSelected ? "bg-secondary text-white" : "bg-white text-muted-foreground"
                                  )}>
                                    <Building2 className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold">{loc.name}</p>
                                    <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{loc.display_name}</p>
                                  </div>
                                </div>
                                <Checkbox 
                                  checked={isSelected}
                                  onCheckedChange={() => toggleStop(loc)}
                                  className="h-6 w-6 rounded-lg data-[state=checked]:bg-secondary border-secondary/30"
                                />
                              </div>
                              
                              {isSelected && (
                                <div className="animate-in slide-in-from-top-2 pt-2 border-t border-secondary/10">
                                  <FormLabel className="text-[9px] font-bold uppercase text-secondary mb-1 block">Ponto de Encontro em {loc.name}</FormLabel>
                                  <Input 
                                    placeholder="Ex: Rodoviária, Saída do Trevo..." 
                                    className="h-10 rounded-xl bg-white border-dashed border-2 focus-visible:ring-secondary/20 text-xs"
                                    value={stopMeetingPoints[loc.name] || ""}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      setStopMeetingPoints({...stopMeetingPoints, [loc.name]: e.target.value});
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedStops.length === 0 && !isLoadingStops && (
                  <div className="p-6 text-center space-y-2 bg-muted/10 rounded-2xl border border-dashed">
                    <Info className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Nenhuma parada selecionada</p>
                    <p className="text-[9px] text-muted-foreground/60">Marque as cidades acima para aumentar as chances de envios.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30 active:scale-90 transition-transform"><ArrowLeft className="h-6 w-6" /></Button>
                <Button type="button" onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-secondary font-bold shadow-lg shadow-secondary/10">Definir Paradas</Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Agenda da Viagem 🗓️</h2>
                <p className="text-sm text-muted-foreground">Quando você pretende dar o pé na estrada?</p>
              </div>
              <div className="space-y-6">
                <FormField
                  name="departureDate"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Qual o dia?</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-secondary pointer-events-none" />
                          <Input 
                            type="date" 
                            className="pl-14 h-16 rounded-[1.5rem] bg-muted/30 border-none text-base font-bold shadow-inner block"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-3">
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Horário de Saída</FormLabel>
                  <div className="relative">
                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-secondary pointer-events-none" />
                    <Input type="time" className="pl-14 h-16 rounded-[1.5rem] bg-muted/30 border-none text-xl font-bold shadow-inner" {...form.register("departureTime")} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30 active:scale-90 transition-transform"><ArrowLeft className="h-6 w-6" /></Button>
                <Button type="button" onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-secondary font-bold shadow-lg shadow-secondary/10">Confirmar Horário</Button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Capacidade de Carga 📦</h2>
                <p className="text-sm text-muted-foreground">Quantos pacotes cabem no seu veículo hoje?</p>
              </div>
              <Card className="rounded-[3rem] border-none bg-muted/20 overflow-hidden shadow-inner">
                <CardContent className="p-10 space-y-6 text-center">
                  <div className="flex justify-center items-center gap-8">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="h-14 w-14 rounded-full border-4 border-secondary/10 hover:bg-secondary/5 transition-all active:scale-90"
                      onClick={() => form.setValue("maxPackages", Math.max(1, form.watch("maxPackages") - 1))}
                    >
                      <X className="h-6 w-6 text-secondary rotate-45" />
                    </Button>
                    <div className="relative">
                      <span className="text-7xl font-black text-secondary tracking-tighter">{form.watch("maxPackages")}</span>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="h-14 w-14 rounded-full border-4 border-secondary/10 hover:bg-secondary/5 transition-all active:scale-90"
                      onClick={() => form.setValue("maxPackages", form.watch("maxPackages") + 1)}
                    >
                      <Plus className="h-6 w-6 text-secondary" />
                    </Button>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pacotes aceitos nesta viagem</p>
                </CardContent>
              </Card>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30 active:scale-90 transition-transform"><ArrowLeft className="h-6 w-6" /></Button>
                <Button type="button" onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-secondary font-bold shadow-lg shadow-secondary/10">Próximo</Button>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">VYA Fast-Match ⚡</h2>
                <p className="text-sm text-muted-foreground">Como você quer gerenciar seus pedidos?</p>
              </div>
              <div className="space-y-4">
                <Card className={cn(
                  "rounded-[2.5rem] border-2 transition-all p-8 space-y-6 cursor-pointer active:scale-[0.98]",
                  form.watch("autoReserve") ? "border-secondary bg-secondary/5 shadow-md" : "border-muted bg-white"
                )} onClick={() => form.setValue("autoReserve", !form.watch("autoReserve"))}>
                  <div className="flex justify-between items-start">
                    <div className="h-14 w-14 rounded-[1.5rem] bg-secondary text-white flex items-center justify-center shadow-lg shadow-secondary/20">
                      <Zap className="h-8 w-8 fill-current" />
                    </div>
                    <Switch checked={form.watch("autoReserve")} onCheckedChange={(v) => form.setValue("autoReserve", v)} className="data-[state=checked]:bg-secondary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold">Auto-Reserva Ativada</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">Matches perfeitos são confirmados instantaneamente.</p>
                  </div>
                </Card>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30 active:scale-90 transition-transform"><ArrowLeft className="h-6 w-6" /></Button>
                <Button type="button" onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-secondary font-bold shadow-lg shadow-secondary/10">Continuar</Button>
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Aproveitar o Retorno? 🔄</h2>
                <p className="text-sm text-muted-foreground">Vai voltar pelo mesmo trajeto? Dobre seus ganhos!</p>
              </div>
              <Card className={cn(
                "rounded-[2.5rem] border-2 transition-all p-8 space-y-6 cursor-pointer active:scale-[0.98]",
                form.watch("roundTrip") ? "border-primary bg-primary/5 shadow-md" : "border-muted bg-white"
              )} onClick={() => form.setValue("roundTrip", !form.watch("roundTrip"))}>
                <div className="flex justify-between items-start">
                  <div className="h-14 w-14 rounded-[1.5rem] bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                    <ArrowRightLeft className="h-8 w-8" />
                  </div>
                  <Switch checked={form.watch("roundTrip")} onCheckedChange={(v) => form.setValue("roundTrip", v)} className="data-[state=checked]:bg-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">Cadastrar Viagem de Volta</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">Criaremos uma rota inversa automaticamente.</p>
                </div>
              </Card>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30 active:scale-90 transition-transform"><ArrowLeft className="h-6 w-6" /></Button>
                <Button type="button" onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-secondary font-bold shadow-lg shadow-secondary/10">Resumo Final</Button>
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 pb-10">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Resumo da Oferta 🏆</h2>
                <p className="text-sm text-muted-foreground">Confira sua logística antes de publicar.</p>
              </div>
              <Card className="rounded-[2.5rem] border-none bg-muted/30 p-8 space-y-6 relative overflow-hidden">
                <div className="flex gap-5 relative z-10">
                  <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                    <div className="h-3 w-3 rounded-full bg-secondary" />
                    <div className="w-[1.5px] h-24 border-l-2 border-dashed border-secondary/40" />
                    <div className="h-3 w-3 rounded-full bg-secondary" />
                  </div>
                  <div className="flex-1 space-y-8">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Saída de</p>
                      <p className="text-base font-bold">{form.watch("origin")}</p>
                      <p className="text-[10px] text-muted-foreground italic">Encontro: {form.watch("originMeetingPoint")}</p>
                    </div>
                    {selectedStops.length > 0 && (
                      <div className="py-2">
                        <p className="text-[9px] font-bold text-secondary uppercase tracking-widest mb-2">Paradas em:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedStops.map((s, i) => (
                            <Badge key={i} variant="outline" className="bg-white/50 border-secondary/20 text-secondary text-[8px]">{s.name}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Destino Final</p>
                      <p className="text-base font-bold">{form.watch("destination")}</p>
                      <p className="text-[10px] text-muted-foreground italic">Entrega: {form.watch("destinationMeetingPoint")}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-muted-foreground/10 flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                  <div className="space-y-1">
                    <span className="text-muted-foreground block">Data e Hora</span>
                    <span className="text-secondary">{form.watch("departureDate")} às {form.watch("departureTime")}</span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-muted-foreground block">Capacidade</span>
                    <span className="text-secondary">{form.watch("maxPackages")} Pacotes</span>
                  </div>
                </div>
              </Card>
              <div className="space-y-3">
                <Button 
                  type="button" 
                  onClick={() => {
                    toast({ title: "Viagem Publicada! 🚀", description: "Bora ganhar uma grana extra na estrada!" });
                    onComplete();
                  }}
                  className="w-full h-16 rounded-[1.5rem] bg-secondary text-lg font-bold gap-3 shadow-xl shadow-secondary/20 active:scale-95 transition-transform"
                >
                  Publicar Viagem <Check className="h-6 w-6" />
                </Button>
                <Button variant="ghost" type="button" onClick={prevStep} className="w-full text-muted-foreground font-bold">Ajustar Detalhes</Button>
              </div>
            </div>
          )}

        </form>
      </Form>
    </div>
  );
}
