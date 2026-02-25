
"use client";

import { useState, useMemo } from "react";
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
  Search,
  Loader2,
  X,
  Info,
  ArrowRightLeft,
  Building2,
  Sparkles,
  Award,
  MapPinOff,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { PREDEFINED_ROUTES, PredefinedRoute } from "@/lib/constants";

const tripSchema = z.object({
  routeId: z.string().min(1, "Escolha uma rota oficial"),
  originMeetingPoint: z.string().min(3, "Onde os remetentes te encontram?"),
  destinationMeetingPoint: z.string().min(3, "Onde você entrega no destino final?"),
  departureDate: z.string().min(10, "Escolha o dia da viagem"),
  departureTime: z.string().min(5, "Que horas você sai?"),
  maxPackages: z.number().min(1).max(50),
  autoReserve: z.boolean().default(true),
  roundTrip: z.boolean().default(false),
});

type TripFormValues = z.infer<typeof tripSchema>;

export function TripForm({ onComplete }: { onComplete: () => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  
  // States para Busca de Cidades Oficiais
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null);
  const [selectedDest, setSelectedDest] = useState<string | null>(null);
  
  // States para os Sheets de Busca
  const [isOriginSheetOpen, setIsOriginSheetOpen] = useState(false);
  const [isDestSheetOpen, setIsDestSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRoute, setSelectedRoute] = useState<PredefinedRoute | null>(null);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [stopMeetingPoints, setStopMeetingPoints] = useState<Record<string, string>>({});

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      routeId: "",
      originMeetingPoint: "",
      destinationMeetingPoint: "",
      departureDate: new Date().toISOString().split('T')[0],
      departureTime: "08:00",
      maxPackages: 5,
      autoReserve: true,
      roundTrip: false,
    },
  });

  // Extrair cidades únicas de origem e destino das rotas cadastradas
  const allOrigins = useMemo(() => Array.from(new Set(PREDEFINED_ROUTES.map(r => r.origin))), []);
  
  // Filtrar destinos possíveis baseados na origem selecionada
  const availableDestinations = useMemo(() => {
    if (!selectedOrigin) return [];
    return Array.from(new Set(
      PREDEFINED_ROUTES
        .filter(r => r.origin === selectedOrigin)
        .map(r => r.destination)
    ));
  }, [selectedOrigin]);

  const filteredOrigins = useMemo(() => {
    if (!searchQuery) return allOrigins;
    return allOrigins.filter(city => city.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, allOrigins]);

  const filteredDestinations = useMemo(() => {
    if (!searchQuery) return availableDestinations;
    return availableDestinations.filter(city => city.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, availableDestinations]);

  const handleSelectOrigin = (city: string) => {
    setSelectedOrigin(city);
    setSelectedDest(null);
    setIsOriginSheetOpen(false);
    setSearchQuery("");
  };

  const handleSelectDest = (city: string) => {
    setSelectedDest(city);
    setIsDestSheetOpen(false);
    setSearchQuery("");
    
    // Encontrar a rota correspondente
    const route = PREDEFINED_ROUTES.find(r => r.origin === selectedOrigin && r.destination === city);
    if (route) {
      setSelectedRoute(route);
      form.setValue("routeId", route.id);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const toggleStop = (stop: string) => {
    const exists = selectedStops.includes(stop);
    if (exists) {
      setSelectedStops(selectedStops.filter(s => s !== stop));
      const newPoints = { ...stopMeetingPoints };
      delete newPoints[stop];
      setStopMeetingPoints(newPoints);
    } else {
      setSelectedStops([...selectedStops, stop]);
    }
  };

  const progress = (step / 7) * 100;

  return (
    <div className="space-y-6 pb-32 page-transition">
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>Etapa {step} de 7</span>
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
                <h2 className="text-xl font-bold">Sua Rota Oficial 🚗</h2>
                <p className="text-sm text-muted-foreground">Selecione as cidades atendidas pela VYA.</p>
              </div>

              <div className="space-y-4 relative">
                {/* Linha conectora visual */}
                <div className="absolute left-[1.35rem] top-10 bottom-10 w-[2px] bg-muted-foreground/20 border-dashed border-l-2 z-0" />

                {/* Botão de Origem */}
                <div className="relative z-10">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 mb-2 block">Cidade de Saída</FormLabel>
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); setIsOriginSheetOpen(true); }}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-[1.5rem] border-2 transition-all text-left active:scale-[0.98]",
                      selectedOrigin ? "bg-secondary/5 border-secondary/30" : "bg-white border-muted hover:border-secondary/50"
                    )}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                      selectedOrigin ? "bg-secondary text-white" : "bg-muted text-muted-foreground"
                    )}>
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {selectedOrigin ? (
                        <p className="text-base font-black text-foreground truncate">{selectedOrigin}</p>
                      ) : (
                        <p className="text-base font-bold text-muted-foreground/60">De onde você sai?</p>
                      )}
                    </div>
                  </button>
                </div>

                {/* Botão de Destino */}
                <div className={cn("relative z-10 transition-opacity duration-300", !selectedOrigin && "opacity-50 pointer-events-none")}>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 mb-2 block">Cidade de Destino</FormLabel>
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); setIsDestSheetOpen(true); }}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-[1.5rem] border-2 transition-all text-left active:scale-[0.98]",
                      selectedDest ? "bg-secondary/5 border-secondary/30" : "bg-white border-muted hover:border-secondary/50"
                    )}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                      selectedDest ? "bg-secondary text-white" : "bg-muted text-muted-foreground"
                    )}>
                      <Navigation className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {selectedDest ? (
                        <p className="text-base font-black text-foreground truncate">{selectedDest}</p>
                      ) : (
                        <p className="text-base font-bold text-muted-foreground/60">Para onde você vai?</p>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {selectedRoute && (
                <div className="p-5 bg-secondary/5 border-2 border-secondary/10 rounded-[2rem] animate-in slide-in-from-top-2 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="h-6 w-6 text-secondary fill-current" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Rota Oficial Identificada</span>
                    <p className="text-sm font-black text-foreground mt-0.5">{selectedRoute.origin} → {selectedRoute.destination}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                      {selectedRoute.distanceKm}km • Aprox. {Math.floor(selectedRoute.averageDurationMin / 60)}h {selectedRoute.averageDurationMin % 60}m
                    </p>
                  </div>
                </div>
              )}

              <Button type="button" onClick={nextStep} disabled={!selectedRoute} className="w-full h-14 rounded-[1.5rem] bg-secondary font-black gap-2 shadow-lg shadow-secondary/20 active:scale-95 transition-all text-base mt-4">
                Continuar <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Pontos de Encontro 📍</h2>
                <p className="text-sm text-muted-foreground">Onde você vai coletar e entregar nas pontas?</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Saída em {selectedRoute?.origin}</FormLabel>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Ex: Rodoviária, Posto Ipiranga BR-232" 
                      className="pl-11 h-14 rounded-2xl bg-muted/20 border-dashed border-2 focus-visible:ring-secondary/20"
                      {...form.register("originMeetingPoint")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Entrega em {selectedRoute?.destination}</FormLabel>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Ex: Shopping Recife, Terminal de Integração" 
                      className="pl-11 h-14 rounded-2xl bg-muted/20 border-dashed border-2 focus-visible:ring-secondary/20"
                      {...form.register("destinationMeetingPoint")}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30 active:scale-90 transition-transform"><ArrowLeft className="h-6 w-6" /></Button>
                <Button type="button" onClick={nextStep} disabled={!form.watch("originMeetingPoint") || !form.watch("destinationMeetingPoint")} className="flex-1 h-14 rounded-2xl bg-secondary font-bold shadow-lg shadow-secondary/10">Confirmar Locais</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Cidades de Passagem 🏙️</h2>
                <p className="text-sm text-muted-foreground">Marque onde você aceita parar para coletar ou entregar.</p>
              </div>
              
              <div className="grid gap-3">
                {selectedRoute?.stops.map((stop, i) => {
                  const isSelected = selectedStops.includes(stop);
                  return (
                    <Card 
                      key={i} 
                      className={cn(
                        "rounded-2xl border-none transition-all overflow-hidden cursor-pointer active:scale-[0.99]",
                        isSelected ? "bg-secondary/10 shadow-sm" : "bg-muted/30"
                      )}
                      onClick={() => toggleStop(stop)}
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
                            <p className="text-sm font-bold">{stop}</p>
                          </div>
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={() => toggleStop(stop)}
                            className="h-6 w-6 rounded-lg data-[state=checked]:bg-secondary border-secondary/30"
                          />
                        </div>
                        
                        {isSelected && (
                          <div className="animate-in slide-in-from-top-2 pt-2 border-t border-secondary/10">
                            <FormLabel className="text-[9px] font-bold uppercase text-secondary mb-1 block">Ponto de Encontro em {stop}</FormLabel>
                            <Input 
                              placeholder="Qual o local de parada?" 
                              className="h-11 rounded-xl bg-white border-dashed border-2 focus-visible:ring-secondary/20 text-xs"
                              value={stopMeetingPoints[stop] || ""}
                              onChange={(e) => {
                                e.stopPropagation();
                                setStopMeetingPoints({...stopMeetingPoints, [stop]: e.target.value});
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

              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30 active:scale-90 transition-transform"><ArrowLeft className="h-6 w-6" /></Button>
                <Button type="button" onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-secondary font-bold shadow-lg shadow-secondary/10">Continuar</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Agenda 🗓️</h2>
                <p className="text-sm text-muted-foreground">Data e horário da sua partida.</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Qual o dia?</FormLabel>
                  <div className="relative">
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                    <Input type="date" className="pl-12 h-16 rounded-[1.5rem] bg-muted/30 border-none text-base font-bold" {...form.register("departureDate")} />
                  </div>
                </div>
                <div className="space-y-3">
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Horário de Saída</FormLabel>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                    <Input type="time" className="pl-12 h-16 rounded-[1.5rem] bg-muted/30 border-none text-2xl font-bold" {...form.register("departureTime")} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30 active:scale-90 transition-transform"><ArrowLeft className="h-6 w-6" /></Button>
                <Button type="button" onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-secondary font-bold shadow-lg shadow-secondary/10">Continuar</Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Capacidade 📦</h2>
                <p className="text-sm text-muted-foreground">Quantos pacotes cabem hoje?</p>
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
                    <span className="text-7xl font-black text-secondary tracking-tighter">{form.watch("maxPackages")}</span>
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
                </CardContent>
              </Card>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30 active:scale-90 transition-transform"><ArrowLeft className="h-6 w-6" /></Button>
                <Button type="button" onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-secondary font-bold shadow-lg shadow-secondary/10">Continuar</Button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Configurações ⚙️</h2>
                <p className="text-sm text-muted-foreground">Personalize sua experiência de viajante.</p>
              </div>
              <div className="space-y-4">
                <Card className={cn(
                  "rounded-[2.5rem] border-2 transition-all p-8 space-y-4 cursor-pointer",
                  form.watch("autoReserve") ? "border-secondary bg-secondary/5 shadow-md" : "border-muted bg-white"
                )} onClick={() => form.setValue("autoReserve", !form.watch("autoReserve"))}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Zap className="h-6 w-6 text-secondary fill-current" />
                      <h3 className="font-bold">Reserva Automática</h3>
                    </div>
                    <Switch checked={form.watch("autoReserve")} onCheckedChange={(v) => form.setValue("autoReserve", v)} className="data-[state=checked]:bg-secondary" />
                  </div>
                  <p className="text-xs text-muted-foreground">Mais praticidade! Os envios são atribuídos a você na hora, respeitando sua capacidade.</p>
                </Card>

                <Card className={cn(
                  "rounded-[2.5rem] border-2 transition-all p-8 space-y-4 cursor-pointer",
                  form.watch("roundTrip") ? "border-primary bg-primary/5 shadow-md" : "border-muted bg-white"
                )} onClick={() => form.setValue("roundTrip", !form.watch("roundTrip"))}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <ArrowRightLeft className="h-6 w-6 text-primary" />
                      <h3 className="font-bold">Cadastrar Volta</h3>
                    </div>
                    <Switch checked={form.watch("roundTrip")} onCheckedChange={(v) => form.setValue("roundTrip", v)} className="data-[state=checked]:bg-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">Quer fazer o dobro de grana? Criaremos a rota inversa para você.</p>
                </Card>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30 active:scale-90 transition-transform"><ArrowLeft className="h-6 w-6" /></Button>
                <Button type="button" onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-secondary font-bold shadow-lg shadow-secondary/10">Resumo Final</Button>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 pb-10">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Tudo Pronto! 🏆</h2>
                <p className="text-sm text-muted-foreground">Confira sua logística oficial VYA.</p>
              </div>
              <Card className="rounded-[2.5rem] border-none bg-muted/30 p-8 space-y-6">
                <div className="flex gap-5">
                  <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                    <div className="h-3 w-3 rounded-full bg-secondary" />
                    <div className="w-[1.5px] h-24 border-l-2 border-dashed border-secondary/40" />
                    <div className="h-3 w-3 rounded-full bg-secondary" />
                  </div>
                  <div className="flex-1 space-y-8">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Rota Principal</p>
                      <p className="text-base font-bold">{selectedRoute?.origin} → {selectedRoute?.destination}</p>
                      <p className="text-[10px] text-muted-foreground italic">Ponto: {form.watch("originMeetingPoint")}</p>
                    </div>
                    {selectedStops.length > 0 && (
                      <div>
                        <p className="text-[9px] font-bold text-secondary uppercase tracking-widest mb-1">Paradas Selecionadas</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedStops.map((s, i) => (
                            <Badge key={i} variant="outline" className="bg-white/50 border-secondary/20 text-secondary text-[8px]">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-6 border-t border-muted-foreground/10 flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                  <div className="space-y-1">
                    <span className="text-muted-foreground block">Saída</span>
                    <span className="text-secondary">{form.watch("departureDate")} • {form.watch("departureTime")}</span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-muted-foreground block">Vagas</span>
                    <span className="text-secondary">{form.watch("maxPackages")} Pacotes</span>
                  </div>
                </div>
              </Card>
              <div className="space-y-3">
                <Button 
                  type="button" 
                  onClick={() => {
                    toast({ title: "Viagem Publicada! 🚀", description: "Sua carona logística oficial está no ar." });
                    onComplete();
                  }}
                  className="w-full h-16 rounded-[1.5rem] bg-secondary text-lg font-bold gap-3 shadow-xl shadow-secondary/20 transition-transform active:scale-95"
                >
                  Oferecer Carona <Check className="h-6 w-6" />
                </Button>
                <Button variant="ghost" type="button" onClick={prevStep} className="w-full font-bold text-muted-foreground">Ajustar Detalhes</Button>
              </div>
            </div>
          )}

        </form>
      </Form>

      {/* Sheet de Origem */}
      <Sheet open={isOriginSheetOpen} onOpenChange={setIsOriginSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] p-0 rounded-t-[2rem] flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="text-xl font-black tracking-tighter text-left">De onde você sai?</SheetTitle>
            <div className="relative mt-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Buscar cidade de origem..." 
                className="pl-12 h-14 rounded-[1.5rem] bg-muted/30 border-none text-base font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredOrigins.length > 0 ? (
              <div className="space-y-1">
                {filteredOrigins.map(city => (
                  <button 
                    key={city} 
                    type="button" 
                    className="w-full text-left p-4 rounded-2xl hover:bg-muted/50 active:bg-muted transition-colors flex items-center gap-4 group" 
                    onClick={() => handleSelectOrigin(city)}
                  >
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-secondary/10 group-hover:text-secondary transition-colors">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <span className="text-base font-bold flex-1">{city}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-secondary transition-colors" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center space-y-4">
                <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mx-auto">
                  <MapPinOff className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-black text-slate-800">Origem não atendida</p>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Queremos chegar aí em breve!</p>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Sheet de Destino */}
      <Sheet open={isDestSheetOpen} onOpenChange={setIsDestSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] p-0 rounded-t-[2rem] flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="text-xl font-black tracking-tighter text-left">Para onde você vai?</SheetTitle>
            <div className="relative mt-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Buscar cidade de destino..." 
                className="pl-12 h-14 rounded-[1.5rem] bg-muted/30 border-none text-base font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredDestinations.length > 0 ? (
              <div className="space-y-1">
                {filteredDestinations.map(city => (
                  <button 
                    key={city} 
                    type="button" 
                    className="w-full text-left p-4 rounded-2xl hover:bg-muted/50 active:bg-muted transition-colors flex items-center gap-4 group" 
                    onClick={() => handleSelectDest(city)}
                  >
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-secondary/10 group-hover:text-secondary transition-colors">
                      <Navigation className="h-5 w-5" />
                    </div>
                    <span className="text-base font-bold flex-1">{city}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-secondary transition-colors" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center space-y-4">
                <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mx-auto">
                  <MapPinOff className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-black text-slate-800">Destino não atendido</p>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Sugerimos novas rotas semanalmente!</p>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
