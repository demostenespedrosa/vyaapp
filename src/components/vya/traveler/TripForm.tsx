
"use client";

import { useState, useEffect, useCallback } from "react";
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
  Repeat,
  ArrowRightLeft,
  PackageCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const tripSchema = z.object({
  origin: z.string().min(3, "Onde você começa?"),
  originMeetingPoint: z.string().min(3, "Qual o ponto de encontro?"),
  destination: z.string().min(3, "Onde você termina?"),
  destinationMeetingPoint: z.string().min(3, "Onde você entrega?"),
  departureDate: z.date(),
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
}

interface RouteOption {
  distance: number;
  duration: number;
  geometry: any;
  summary: string;
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

  const [intermediateCities, setIntermediateCities] = useState<any[]>([]);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [stopMeetingPoints, setStopMeetingPoints] = useState<Record<string, string>>({});

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      origin: "",
      originMeetingPoint: "",
      destination: "",
      destinationMeetingPoint: "",
      departureDate: new Date(),
      departureTime: "08:00",
      maxPackages: 5,
      autoReserve: true,
      roundTrip: false,
    },
  });

  // Busca de Localidade (Cidade ou Ponto Público)
  const searchLocation = async (query: string) => {
    if (query.length < 3) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=5&addressdetails=1`, {
        headers: { 'Accept-Language': 'pt-BR' }
      });
      const data = await res.json();
      setSearchResults(data.map((item: any) => ({
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
        name: item.display_name.split(',')[0]
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  // Cálculo de Rotas OSRM
  const fetchRoutes = useCallback(async (origin: Location, dest: Location) => {
    setIsCalculatingRoutes(true);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${dest.lon},${dest.lat}?overview=full&alternatives=true&steps=true`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.code === 'Ok') {
        setRoutes(data.routes.map((r: any) => ({
          distance: r.distance / 1000,
          duration: r.duration / 60,
          geometry: r.geometry,
          summary: r.legs[0].summary || "Via Rodovia Principal"
        })));
        
        // Extrair cidades de passagem dos waypoints se houver
        const steps = data.routes[0].legs[0].steps;
        const cities = steps
          .filter((s: any) => s.name && s.name.length > 3)
          .map((s: any) => s.name)
          .filter((v: any, i: any, a: any) => a.indexOf(v) === i)
          .slice(1, -1);
        setIntermediateCities(cities);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCalculatingRoutes(false);
    }
  }, []);

  useEffect(() => {
    if (selectedOrigin && selectedDest && step === 3) {
      fetchRoutes(selectedOrigin, selectedDest);
    }
  }, [selectedOrigin, selectedDest, step, fetchRoutes]);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const progress = (step / 11) * 100;

  return (
    <div className="space-y-6 pb-32 page-transition">
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>Passo {step} de 11</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 w-full bg-muted rounded-full">
          <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          
          {/* PASSO 1: ORIGEM */}
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">De onde você vai sair? 📍</h2>
                <p className="text-sm text-muted-foreground">Busque sua cidade de partida.</p>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                  <Input 
                    placeholder="Cidade de Origem" 
                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-none text-base"
                    value={selectedOrigin ? selectedOrigin.name : form.watch("origin")}
                    onChange={(e) => {
                      form.setValue("origin", e.target.value);
                      setSelectedOrigin(null);
                      searchLocation(e.target.value);
                    }}
                  />
                  {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-secondary" />}
                </div>

                {!selectedOrigin && searchResults.length > 0 && (
                  <div className="bg-white rounded-2xl border shadow-lg overflow-hidden animate-in fade-in zoom-in-95">
                    {searchResults.map((loc, i) => (
                      <button key={i} type="button" className="w-full text-left p-4 text-sm hover:bg-secondary/5 border-b last:border-0" onClick={() => { setSelectedOrigin(loc); form.setValue("origin", loc.name); setSearchResults([]); }}>
                        {loc.display_name}
                      </button>
                    ))}
                  </div>
                )}

                {selectedOrigin && (
                  <div className="space-y-2 pt-2">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Ponto de Encontro para Coleta</FormLabel>
                    <Input 
                      placeholder="Ex: Rodoviária, Posto Shell entrada da cidade" 
                      className="h-14 rounded-2xl bg-muted/20 border-dashed border-2"
                      {...form.register("originMeetingPoint")}
                    />
                    <p className="text-[10px] text-muted-foreground px-1">Escolha locais públicos e seguros para o remetente te encontrar.</p>
                  </div>
                )}
              </div>

              <Button type="button" onClick={nextStep} disabled={!selectedOrigin || !form.watch("originMeetingPoint")} className="w-full h-14 rounded-2xl bg-secondary font-bold gap-2">
                Próximo <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* PASSO 2: DESTINO */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Para onde você vai? 🏁</h2>
                <p className="text-sm text-muted-foreground">Qual o destino final da sua viagem?</p>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                  <Input 
                    placeholder="Cidade de Destino" 
                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-none text-base"
                    value={selectedDest ? selectedDest.name : form.watch("destination")}
                    onChange={(e) => {
                      form.setValue("destination", e.target.value);
                      setSelectedDest(null);
                      searchLocation(e.target.value);
                    }}
                  />
                  {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-secondary" />}
                </div>

                {!selectedDest && searchResults.length > 0 && (
                  <div className="bg-white rounded-2xl border shadow-lg overflow-hidden animate-in fade-in zoom-in-95">
                    {searchResults.map((loc, i) => (
                      <button key={i} type="button" className="w-full text-left p-4 text-sm hover:bg-secondary/5 border-b last:border-0" onClick={() => { setSelectedDest(loc); form.setValue("destination", loc.name); setSearchResults([]); }}>
                        {loc.display_name}
                      </button>
                    ))}
                  </div>
                )}

                {selectedDest && (
                  <div className="space-y-2 pt-2">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Ponto de Entrega</FormLabel>
                    <Input 
                      placeholder="Ex: Shopping, Estacionamento tal" 
                      className="h-14 rounded-2xl bg-muted/20 border-dashed border-2"
                      {...form.register("destinationMeetingPoint")}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30"><ArrowLeft className="h-6 w-6" /></Button>
                <Button type="button" onClick={nextStep} disabled={!selectedDest || !form.watch("destinationMeetingPoint")} className="flex-1 h-14 rounded-2xl bg-secondary font-bold">Continuar</Button>
              </div>
            </div>
          )}

          {/* PASSO 3: ROTA */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Qual o seu trajeto? 🛣️</h2>
                <p className="text-sm text-muted-foreground">Escolha a rota que você vai seguir.</p>
              </div>

              {isCalculatingRoutes ? (
                <div className="py-20 flex flex-col items-center gap-4 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-secondary" />
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Calculando melhores rotas...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {routes.map((r, i) => (
                    <Card key={i} className={cn(
                      "rounded-[1.5rem] border-2 transition-all cursor-pointer active:scale-[0.98]",
                      selectedRouteIdx === i ? "border-secondary bg-secondary/5 shadow-inner" : "border-muted bg-white opacity-60"
                    )} onClick={() => setSelectedRouteIdx(i)}>
                      <CardContent className="p-5 flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-sm font-bold">{r.summary}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Route className="h-3 w-3" /> {Math.round(r.distance)}km</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {Math.floor(r.duration / 60)}h {Math.round(r.duration % 60)}m</span>
                          </div>
                        </div>
                        {selectedRouteIdx === i && <Check className="h-6 w-6 text-secondary" />}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30"><ArrowLeft className="h-6 w-6" /></Button>
                <Button type="button" onClick={nextStep} disabled={routes.length === 0} className="flex-1 h-14 rounded-2xl bg-secondary font-bold">Escolher Rota</Button>
              </div>
            </div>
          )}

          {/* PASSO 4 & 5: CIDADES DE PASSAGEM E PONTOS DE ENCONTRO */}
          {step === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Cidades de Passagem 🏙️</h2>
                <p className="text-sm text-muted-foreground">Marque onde você pode parar para pegar mais encomendas.</p>
              </div>

              <div className="space-y-3">
                {intermediateCities.length > 0 ? (
                  intermediateCities.map((city, i) => {
                    const isSelected = selectedStops.includes(city);
                    return (
                      <div key={i} className="space-y-2">
                        <button 
                          type="button" 
                          onClick={() => {
                            if (isSelected) {
                              setSelectedStops(selectedStops.filter(s => s !== city));
                            } else {
                              setSelectedStops([...selectedStops, city]);
                            }
                          }}
                          className={cn(
                            "w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all",
                            isSelected ? "border-secondary bg-secondary/5" : "border-muted bg-muted/10 opacity-60"
                          )}
                        >
                          <span className="text-sm font-bold">{city}</span>
                          <div className={cn("h-5 w-5 rounded-full border flex items-center justify-center", isSelected ? "bg-secondary border-secondary text-white" : "border-muted-foreground/30")}>
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                        </button>
                        
                        {isSelected && (
                          <div className="pl-4 border-l-2 border-secondary/20 space-y-2 animate-in slide-in-from-left-2">
                            <Input 
                              placeholder={`Ponto de encontro em ${city}`} 
                              className="h-12 rounded-xl bg-white border-dashed"
                              value={stopMeetingPoints[city] || ""}
                              onChange={(e) => setStopMeetingPoints({...stopMeetingPoints, [city]: e.target.value})}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-10 text-center space-y-2 bg-muted/10 rounded-[2rem] border border-dashed">
                    <Info className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                    <p className="text-xs font-bold text-muted-foreground uppercase">Nenhuma cidade detectada</p>
                    <p className="text-[10px] text-muted-foreground">Seu trajeto parece ser direto.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30"><ArrowLeft className="h-6 w-6" /></Button>
                <Button type="button" onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-secondary font-bold">Definir Paradas</Button>
              </div>
            </div>
          )}

          {/* PASSO 6 & 7: DATA E HORA */}
          {step === 5 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Quando você viaja? 🗓️</h2>
                <p className="text-sm text-muted-foreground">Defina o dia e o horário de partida.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Data da Viagem</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full h-14 rounded-2xl justify-start text-left font-bold gap-3 border-none bg-muted/30", !form.watch("departureDate") && "text-muted-foreground")}>
                        <CalendarIcon className="h-5 w-5 text-secondary" />
                        {form.watch("departureDate") ? format(form.watch("departureDate"), "PPP", { locale: ptBR }) : <span>Escolha a data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-[2rem]" align="start">
                      <Calendar mode="single" selected={form.watch("departureDate")} onSelect={(d) => d && form.setValue("departureDate", d)} initialFocus locale={ptBR} disabled={{ before: new Date() }} />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Hora de Partida</FormLabel>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                    <Input type="time" className="pl-12 h-14 rounded-2xl bg-muted/30 border-none text-base font-bold" {...form.register("departureTime")} />
                  </div>
                  <p className="text-[10px] text-muted-foreground px-1">Considere estar no ponto de encontro 15min antes.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30"><ArrowLeft className="h-6 w-6" /></Button>
                <Button type="button" onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-secondary font-bold">Confirmar Horário</Button>
              </div>
            </div>
          )}

          {/* PASSO 8: CAPACIDADE */}
          {step === 6 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Quantos pacotes? 📦</h2>
                <p className="text-sm text-muted-foreground">Defina o limite de envios que você pode levar.</p>
              </div>

              <Card className="rounded-[2.5rem] border-none bg-muted/20 overflow-hidden">
                <CardContent className="p-8 space-y-6 text-center">
                  <div className="flex justify-center items-center gap-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="h-12 w-12 rounded-full border-2 border-secondary/20"
                      onClick={() => form.setValue("maxPackages", Math.max(1, form.watch("maxPackages") - 1))}
                    >
                      <X className="h-6 w-6 text-secondary rotate-45" />
                    </Button>
                    <span className="text-6xl font-bold text-secondary tracking-tighter">{form.watch("maxPackages")}</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="h-12 w-12 rounded-full border-2 border-secondary/20"
                      onClick={() => form.setValue("maxPackages", form.watch("maxPackages") + 1)}
                    >
                      <Plus className="h-6 w-6 text-secondary" />
                    </Button>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Capacidade total de envios</p>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30"><ArrowLeft className="h-6 w-6" /></Button>
                <Button type="button" onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-secondary font-bold">Próximo</Button>
              </div>
            </div>
          )}

          {/* PASSO 9: RESERVA AUTOMÁTICA */}
          {step === 7 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Reserva Automática? ⚡</h2>
                <p className="text-sm text-muted-foreground">Mais praticidade para você e rapidez para o remetente.</p>
              </div>

              <div className="space-y-4">
                <Card className={cn(
                  "rounded-[2.5rem] border-2 transition-all p-8 space-y-4",
                  form.watch("autoReserve") ? "border-secondary bg-secondary/5" : "border-muted bg-white"
                )} onClick={() => form.setValue("autoReserve", !form.watch("autoReserve"))}>
                  <div className="flex justify-between items-start">
                    <div className="h-12 w-12 rounded-2xl bg-secondary text-white flex items-center justify-center shadow-lg shadow-secondary/20">
                      <Zap className="h-6 w-6 fill-current" />
                    </div>
                    <Switch checked={form.watch("autoReserve")} onCheckedChange={(v) => form.setValue("autoReserve", v)} className="data-[state=checked]:bg-secondary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">Ativar Auto-Reserva</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Os envios que baterem com sua rota são aceitos na hora. Você não perde tempo analisando e o remetente recebe a confirmação imediata.
                    </p>
                  </div>
                </Card>

                {!form.watch("autoReserve") && (
                  <div className="p-6 rounded-[2rem] bg-muted/20 border-dashed border-2 text-center space-y-2">
                    <PackageCheck className="h-6 w-6 text-muted-foreground mx-auto" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Análise Manual</p>
                    <p className="text-[10px] text-muted-foreground">Você terá 1h para aceitar cada pedido que surgir antes que ele expire.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30"><ArrowLeft className="h-6 w-6" /></Button>
                <Button type="button" onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-secondary font-bold">Continuar</Button>
              </div>
            </div>
          )}

          {/* PASSO 10: VIAGEM DE VOLTA */}
          {step === 8 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Viagem de Volta? 🔄</h2>
                <p className="text-sm text-muted-foreground">Vai voltar pelo mesmo caminho? Ganhe em dobro!</p>
              </div>

              <Card className={cn(
                "rounded-[2.5rem] border-2 transition-all p-8 space-y-4",
                form.watch("roundTrip") ? "border-secondary bg-secondary/5" : "border-muted bg-white"
              )} onClick={() => form.setValue("roundTrip", !form.watch("roundTrip"))}>
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                    <ArrowRightLeft className="h-6 w-6" />
                  </div>
                  <Switch checked={form.watch("roundTrip")} onCheckedChange={(v) => form.setValue("roundTrip", v)} className="data-[state=checked]:bg-secondary" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">Cadastrar Volta</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Criaremos automaticamente uma viagem invertendo origem e destino para o dia seguinte ou data de sua escolha.
                  </p>
                </div>
              </Card>

              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30"><ArrowLeft className="h-6 w-6" /></Button>
                <Button type="button" onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-secondary font-bold">Ir para Resumo</Button>
              </div>
            </div>
          )}

          {/* PASSO 11: RESUMO FINAL */}
          {step === 9 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 pb-10">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Tudo pronto! 🏁</h2>
                <p className="text-sm text-muted-foreground">Confira os detalhes da sua oferta de carona.</p>
              </div>

              <div className="space-y-4">
                <Card className="rounded-[2rem] border-none bg-muted/30 p-6 space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                      <div className="h-2 w-2 rounded-full bg-secondary/40" />
                      <div className="w-[1px] h-12 border-l border-dashed border-secondary/40" />
                      <div className="h-2 w-2 rounded-full bg-secondary" />
                    </div>
                    <div className="flex-1 space-y-6">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Origem</p>
                        <p className="text-sm font-bold">{form.watch("origin")}</p>
                        <p className="text-[10px] text-muted-foreground">{form.watch("originMeetingPoint")}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Destino</p>
                        <p className="text-sm font-bold">{form.watch("destination")}</p>
                        <p className="text-[10px] text-muted-foreground">{form.watch("destinationMeetingPoint")}</p>
                      </div>
                    </div>
                  </div>

                  {selectedStops.length > 0 && (
                    <div className="pt-4 border-t flex flex-wrap gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase w-full">Paradas:</span>
                      {selectedStops.map(s => <Badge key={s} variant="outline" className="text-[9px] border-secondary/20">{s}</Badge>)}
                    </div>
                  )}

                  <div className="pt-4 border-t grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Data/Hora</p>
                      <p className="text-xs font-bold">{format(form.watch("departureDate"), "dd/MM")} às {form.watch("departureTime")}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Capacidade</p>
                      <p className="text-xs font-bold">{form.watch("maxPackages")} Pacotes</p>
                    </div>
                  </div>
                </Card>

                <div className="p-6 rounded-[2rem] bg-secondary/10 border border-secondary/20 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-secondary text-white flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-medium text-secondary-foreground">
                    Sua viagem será visível para remetentes compatíveis na sua rota.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  type="button" 
                  onClick={() => {
                    toast({ title: "Viagem Criada!", description: "Bora fazer essa grana extra!" });
                    onComplete();
                  }}
                  className="w-full h-16 rounded-[1.5rem] bg-secondary text-lg font-bold gap-3 shadow-xl shadow-secondary/20 active:scale-95 transition-transform"
                >
                  Publicar Viagem <Check className="h-6 w-6" />
                </Button>
                <Button variant="ghost" type="button" onClick={() => setStep(1)} className="w-full font-bold text-muted-foreground">
                  Recomeçar do zero
                </Button>
              </div>
            </div>
          )}

        </form>
      </Form>
    </div>
  );
}
