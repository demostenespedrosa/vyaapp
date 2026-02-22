"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { suggestPackageSize } from "@/ai/flows/intelligent-package-sizing-flow";
import { extractFiscalDocumentData } from "@/ai/flows/fiscal-document-data-extraction-flow";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SIZES, SizeKey, calculatePrice } from "@/lib/constants";
import { 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  Upload, 
  MapPin, 
  ChevronRight, 
  ArrowLeft,
  Package as PackageIcon,
  ShieldCheck,
  CreditCard,
  Search,
  X,
  Route,
  ShieldAlert,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  description: z.string().min(5, "Conta pra gente o que tem dentro!"),
  origin: z.string().min(3, "Onde o viajante retira?"),
  destination: z.string().min(3, "Onde entregamos?"),
  size: z.enum(["P", "M", "G"]),
});

type FormValues = z.infer<typeof formSchema>;

interface OsmLocation {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    suburb?: string;
    hamlet?: string;
    state?: string;
    road?: string;
    house_number?: string;
  };
  simplifiedName?: string;
}

export function PackageForm({ onComplete }: { onComplete: () => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [fiscalInfo, setFiscalInfo] = useState<any>(null);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);
  const [withInsurance, setWithInsurance] = useState(true);

  // States para busca de endereço
  const [originResults, setOriginResults] = useState<OsmLocation[]>([]);
  const [destResults, setDestResults] = useState<OsmLocation[]>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState<OsmLocation | null>(null);
  const [selectedDest, setSelectedDest] = useState<OsmLocation | null>(null);
  
  // Distância rodoviária
  const [calculatedDistance, setCalculatedDistance] = useState<number>(0);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      origin: "",
      destination: "",
      size: "P",
    },
  });

  // IA para sugerir tamanho
  const description = form.watch("description");
  useEffect(() => {
    const timer = setTimeout(() => {
      if (description.length > 10 && step === 1) {
        handleAnalyzeDescription();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [description]);

  async function handleAnalyzeDescription() {
    setIsAnalyzing(true);
    try {
      const result = await suggestPackageSize({ packageDescription: description });
      setAiSuggestion(result);
      form.setValue("size", result.suggestedSize as SizeKey);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Função para simplificar o endereço (Cidade, Estado)
  const formatLocationName = (loc: OsmLocation): string => {
    if (!loc.address) return loc.display_name.split(',')[0];
    
    const city = loc.address.city || loc.address.town || loc.address.village || loc.address.municipality || loc.address.suburb || loc.address.hamlet;
    const state = loc.address.state;
    const road = loc.address.road;
    
    if (road && city) {
      return `${road}, ${city} - ${state}`;
    }
    
    if (city && state) {
      return `${city}, ${state}`;
    }
    
    return loc.display_name.split(',').slice(0, 2).join(', ');
  };

  // Busca de endereço no OpenStreetMap (Nominatim)
  const searchOsm = async (query: string, setResults: (res: OsmLocation[]) => void, setSearching: (val: boolean) => void) => {
    if (query.length < 3) return;
    setSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=5&addressdetails=1`, {
        headers: {
          'Accept-Language': 'pt-BR',
          'User-Agent': 'VYA-Logistics-App-Prototype'
        }
      });
      const data = await response.json();
      
      const simplifiedData = data.map((item: OsmLocation) => ({
        ...item,
        simplifiedName: formatLocationName(item)
      }));
      
      setResults(simplifiedData);
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Erro na busca", description: "Não conseguimos buscar o endereço agora." });
    } finally {
      setSearching(false);
    }
  };

  // Cálculo de distância RODOVIÁRIA via OSRM API
  const fetchRoadDistance = useCallback(async (origin: OsmLocation, dest: OsmLocation) => {
    setIsCalculatingRoute(true);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${dest.lon},${dest.lat}?overview=false`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const distanceInMeters = data.routes[0].distance;
        const distanceInKm = distanceInMeters / 1000;
        setCalculatedDistance(distanceInKm);
      } else {
        throw new Error('Rota não encontrada');
      }
    } catch (e) {
      console.error("Erro ao calcular rota rodoviária:", e);
      setCalculatedDistance(100); // Fallback mock
    } finally {
      setIsCalculatingRoute(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedOrigin && selectedDest) {
      fetchRoadDistance(selectedOrigin, selectedDest);
    }
  }, [selectedOrigin, selectedDest, fetchRoadDistance]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setHasUploadedFile(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const result = await extractFiscalDocumentData({ documentDataUri: base64 });
        setFiscalInfo(result);
        toast({ title: "Documento lido!", description: "Dados extraídos com sucesso." });
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setIsExtracting(false);
      setHasUploadedFile(false);
      toast({ variant: "destructive", title: "Erro no upload", description: "Tente novamente." });
    } finally {
      setIsExtracting(false);
    }
  };

  const nextStep = async () => {
    if (step === 2 && (!selectedOrigin || !selectedDest)) {
      toast({ variant: "destructive", title: "Ops!", description: "Selecione a origem e o destino da lista." });
      return;
    }
    const fields = step === 1 ? ["description", "size"] : step === 2 ? ["origin", "destination"] : [];
    const isValid = await form.trigger(fields as any);
    if (isValid) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const onSubmit = (values: FormValues) => {
    toast({ title: "Quase lá!", description: "Processando seu pagamento..." });
    setTimeout(() => onComplete(), 2000);
  };

  const progress = (step / 4) * 100;

  // Cálculos de preço
  const baseFreight = calculatePrice(form.getValues("size"), calculatedDistance);
  const platformFee = 4.50;
  const totalFreight = baseFreight + platformFee;
  const insurancePrice = 9.90; // Mock de seguro fixo para o protótipo
  const finalTotal = totalFreight + (withInsurance ? insurancePrice : 0);

  return (
    <div className="space-y-6 pb-20 page-transition">
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>Passo {step} de 4</span>
          <span>{Math.round(progress)}% Concluído</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">O que vamos mandar? 📦</h2>
                <p className="text-sm text-muted-foreground">Dê uma descrição rápida do conteúdo.</p>
              </div>

              <FormField
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Textarea 
                          placeholder="Ex: Um tênis Nike e duas camisetas." 
                          className="min-h-[120px] rounded-[1.5rem] bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-base p-5"
                          {...field}
                        />
                        {isAnalyzing && (
                          <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[10px] font-bold text-primary bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm animate-pulse">
                            <Sparkles className="h-3 w-3" /> IA analisando...
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Tamanho do Pacote</FormLabel>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(SIZES) as SizeKey[]).map((key) => {
                    const size = SIZES[key];
                    const isSelected = form.watch("size") === key;
                    const isAiSuggested = aiSuggestion?.suggestedSize === key;

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => form.setValue("size", key)}
                        className={cn(
                          "relative flex flex-col items-center justify-center p-4 rounded-[2rem] border-2 transition-all active:scale-95",
                          isSelected ? "border-primary bg-primary/5 shadow-inner" : "border-muted bg-muted/20 grayscale opacity-60"
                        )}
                      >
                        {isAiSuggested && (
                          <div className="absolute -top-2 bg-primary text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-bounce">
                            SUGERIDO
                          </div>
                        )}
                        <PackageIcon className={cn("mb-2", isSelected ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-xs font-bold">{size.label}</span>
                        <span className="text-[9px] text-muted-foreground mt-0.5">{size.weight}</span>
                      </button>
                    );
                  })}
                </div>
                {aiSuggestion?.restrictions && (
                  <p className="text-[10px] text-destructive font-medium px-1 flex items-center gap-1">
                    ⚠️ {aiSuggestion.restrictions}
                  </p>
                )}
              </div>

              <Button type="button" onClick={nextStep} className="w-full h-14 rounded-2xl text-base font-bold gap-2">
                Continuar <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Pra onde vai? 📍</h2>
                <p className="text-sm text-muted-foreground">O cálculo é feito pela distância real rodoviária.</p>
              </div>

              <div className="space-y-6">
                {/* ORIGEM */}
                <div className="space-y-2">
                  <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] border shadow-sm relative z-20">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <Input 
                      placeholder="Origem (Cidade ou CEP)" 
                      className="border-none bg-transparent focus-visible:ring-0 text-base"
                      value={selectedOrigin ? selectedOrigin.simplifiedName : form.watch("origin")}
                      onChange={(e) => {
                        form.setValue("origin", e.target.value);
                        setSelectedOrigin(null);
                        if (e.target.value.length > 3) searchOsm(e.target.value, setOriginResults, setIsSearchingOrigin);
                      }}
                      readOnly={!!selectedOrigin}
                    />
                    {selectedOrigin ? (
                      <Button variant="ghost" size="icon" className="rounded-full" onClick={() => { setSelectedOrigin(null); form.setValue("origin", ""); setOriginResults([]); setCalculatedDistance(0); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      isSearchingOrigin && <Loader2 className="h-4 w-4 animate-spin text-primary mr-3" />
                    )}
                  </div>
                  {!selectedOrigin && originResults.length > 0 && (
                    <div className="bg-white rounded-2xl border shadow-lg max-h-48 overflow-y-auto z-30 relative animate-in fade-in zoom-in-95">
                      {originResults.map((loc, i) => (
                        <button key={i} type="button" className="w-full text-left p-4 text-sm hover:bg-primary/5 border-b last:border-0 transition-colors" onClick={() => { setSelectedOrigin(loc); setOriginResults([]); }}>
                          {loc.simplifiedName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* DESTINO */}
                <div className="space-y-2">
                  <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] border shadow-sm relative z-10">
                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <Input 
                      placeholder="Destino (Cidade ou CEP)" 
                      className="border-none bg-transparent focus-visible:ring-0 text-base"
                      value={selectedDest ? selectedDest.simplifiedName : form.watch("destination")}
                      onChange={(e) => {
                        form.setValue("destination", e.target.value);
                        setSelectedDest(null);
                        if (e.target.value.length > 3) searchOsm(e.target.value, setDestResults, setIsSearchingDest);
                      }}
                      readOnly={!!selectedDest}
                    />
                    {selectedDest ? (
                      <Button variant="ghost" size="icon" className="rounded-full" onClick={() => { setSelectedDest(null); form.setValue("destination", ""); setDestResults([]); setCalculatedDistance(0); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      isSearchingDest && <Loader2 className="h-4 w-4 animate-spin text-secondary mr-3" />
                    )}
                  </div>
                  {!selectedDest && destResults.length > 0 && (
                    <div className="bg-white rounded-2xl border shadow-lg max-h-48 overflow-y-auto z-30 relative animate-in fade-in zoom-in-95">
                      {destResults.map((loc, i) => (
                        <button key={i} type="button" className="w-full text-left p-4 text-sm hover:bg-secondary/5 border-b last:border-0 transition-colors" onClick={() => { setSelectedDest(loc); setDestResults([]); }}>
                          {loc.simplifiedName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isCalculatingRoute ? (
                  <div className="p-4 bg-muted/20 rounded-[1.5rem] border border-dashed flex justify-center items-center gap-3 animate-pulse">
                    <Route className="h-4 w-4 text-primary animate-bounce" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Traçando rota rodoviária...</span>
                  </div>
                ) : calculatedDistance > 0 && (
                  <div className="p-4 bg-primary/5 rounded-[1.5rem] border border-primary/20 flex justify-between items-center animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Distância via Estrada</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{Math.round(calculatedDistance)} km</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep} 
                  disabled={!selectedOrigin || !selectedDest || isCalculatingRoute} 
                  className="flex-1 h-14 rounded-2xl text-base font-bold"
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Check-in Fiscal 📑</h2>
                <p className="text-sm text-muted-foreground">Toda carga precisa ser legalizada para sua segurança.</p>
              </div>

              {!hasUploadedFile ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-primary/20 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center gap-5 bg-muted/10 relative overflow-hidden group">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Upload className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold">Escanear NF-e</p>
                      <p className="text-[10px] text-muted-foreground px-4 uppercase tracking-widest">Extraímos os dados via IA</p>
                    </div>
                    <Input type="file" className="hidden" id="fiscal-upload" onChange={handleFileUpload} />
                    <Button variant="outline" type="button" className="rounded-full px-8" asChild>
                      <label htmlFor="fiscal-upload" className="cursor-pointer">Escolher Arquivo</label>
                    </Button>
                  </div>
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-background px-4 text-muted-foreground">Ou</span></div>
                  </div>
                  <Button variant="ghost" type="button" className="w-full h-14 rounded-[1.5rem] border border-dashed text-sm font-bold" onClick={() => { setFiscalInfo({ manual: true }); nextStep(); }}>
                    Declaração de Conteúdo Manual
                  </Button>
                </div>
              ) : (
                <Card className="rounded-[2rem] border-primary/20 bg-primary/5 overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    {isExtracting ? (
                      <div className="flex flex-col items-center justify-center py-6 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-bold animate-pulse text-primary uppercase tracking-widest">Lendo documento...</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-green-500 text-white flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Documento Processado!</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{fiscalInfo?.documentType || 'OK'}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold text-primary mt-2" onClick={() => setHasUploadedFile(false)}>Trocar arquivo</Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <Button type="button" onClick={nextStep} disabled={!fiscalInfo || isExtracting} className="flex-1 h-14 rounded-2xl text-base font-bold">
                  Ver Resumo
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Resumo e Pagamento 🏁</h2>
                <p className="text-sm text-muted-foreground">Confira os valores finais antes do PIX.</p>
              </div>

              {/* OFERTA DE SEGURO */}
              <Card className={cn(
                "rounded-[2rem] border-2 transition-all overflow-hidden",
                withInsurance ? "border-primary bg-primary/5" : "border-muted bg-white"
              )}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-2xl flex items-center justify-center",
                        withInsurance ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      )}>
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">VYA Safe (Opcional)</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Seguro de Carga Integral</p>
                      </div>
                    </div>
                    <Switch 
                      checked={withInsurance} 
                      onCheckedChange={setWithInsurance} 
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  
                  <div className="space-y-2 p-3 bg-white/50 rounded-xl">
                    <p className="text-[11px] leading-relaxed">
                      Proteção contra <strong>roubo</strong> ou <strong>avaria significativa</strong>. 
                      Garante o valor total do produto + frete de volta no seu bolso.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary">
                      <Info className="h-3 w-3" /> APENAS + R$ {insurancePrice.toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* RESUMO FINANCEIRO */}
              <div className="bg-muted/20 rounded-[2.5rem] p-8 space-y-6 border border-muted relative overflow-hidden">
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Valor do frete</span>
                    <span className="font-bold">R$ {totalFreight.toFixed(2)}</span>
                  </div>
                  
                  {withInsurance && (
                    <div className="flex justify-between items-center text-sm animate-in fade-in slide-in-from-top-1">
                      <span className="text-muted-foreground font-medium">Seguro VYA Safe</span>
                      <span className="font-bold">R$ {insurancePrice.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total do pedido</p>
                      <p className="text-3xl font-bold text-primary tracking-tight">R$ {finalTotal.toFixed(2)}</p>
                    </div>
                    {withInsurance && (
                      <div className="text-right pb-1">
                        <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold px-2 py-0.5 bg-green-50 rounded-full">
                          <ShieldCheck className="h-3 w-3" /> PROTEGIDO
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <p className="text-[11px] text-primary/80 leading-tight">
                  Seu pagamento via PIX fica retido com segurança até você confirmar a entrega.
                </p>
              </div>

              <div className="space-y-3">
                <Button type="submit" className="w-full h-16 rounded-[1.5rem] text-lg font-bold gap-3 shadow-xl shadow-primary/20 active:scale-95 transition-transform">
                  Pagar com PIX <Sparkles className="h-5 w-5 fill-current" />
                </Button>
                <Button variant="ghost" type="button" className="w-full font-bold text-muted-foreground" onClick={prevStep}>
                  Voltar e ajustar
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
