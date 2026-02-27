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
  ShieldCheck,
  CreditCard,
  X,
  Route,
  ShieldAlert,
  Info,
  User,
  Phone,
  Clock,
  AlertTriangle,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { CitySelect, type CityOption } from "@/components/vya/shared/CitySelect";
import { useAppContext } from "@/contexts/AppContext";

const formSchema = z.object({
  description: z.string().min(5, "Conta pra gente o que tem dentro!"),
  origin: z.string().min(1, "Selecione a cidade de origem"),
  destination: z.string().min(1, "Selecione a cidade de destino"),
  size: z.enum(["P", "M", "G"]),
  recipientName: z.string().min(3, "Nome do destinatário é obrigatório"),
  recipientPhone: z.string().min(10, "Telefone/WhatsApp inválido"),
  recipientCpf: z.string().min(11, "CPF deve ter pelo menos 11 dígitos"),
});

type FormValues = z.infer<typeof formSchema>;

// ---------------------------------------------------------------------------
// Dados + ilustrações SVG para cada tamanho de pacote
// ---------------------------------------------------------------------------

const SIZE_OPTS: Array<{
  key: SizeKey;
  headline: string;
  hint: string;
  weight: string;
  examples: string;
  border: string;
  bg: string;
  textColor: string;
  illustration: React.ReactNode;
}> = [
  {
    key: 'P',
    headline: 'Pequeno',
    hint: 'Cabe numa mochila',
    weight: 'Até 3 kg',
    examples: 'Celulares, documentos, roupas dobradas',
    border: 'border-primary',
    bg: 'bg-primary/10',
    textColor: 'text-primary',
    illustration: (
      <svg viewBox="0 0 80 66" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Alca */}
        <path d="M28 21 C28 12 52 12 52 21" stroke="#FE6344" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        {/* Corpo mochila */}
        <rect x="13" y="21" width="54" height="36" rx="13" fill="#FFF0EC" stroke="#FE6344" strokeWidth="2"/>
        {/* Bolso frontal */}
        <rect x="22" y="34" width="36" height="18" rx="8" fill="white" stroke="#FE6344" strokeWidth="1.5"/>
        {/* Caixinha dentro */}
        <rect x="30" y="38" width="20" height="11" rx="3" fill="#FE6344" fillOpacity="0.35"/>
        <line x1="30" y1="43.5" x2="50" y2="43.5" stroke="#FE6344" strokeWidth="1" strokeOpacity="0.6"/>
        {/* Zipper */}
        <circle cx="40" cy="34" r="2.5" fill="#FE6344"/>
      </svg>
    ),
  },
  {
    key: 'M',
    headline: 'Médio',
    hint: 'Cabe em uma mala de viagem',
    weight: 'Até 10 kg',
    examples: 'Caixas de sapato, sacolas de roupas',
    border: 'border-brand-purple',
    bg: 'bg-brand-purple/10',
    textColor: 'text-brand-purple',
    illustration: (
      <svg viewBox="0 0 80 66" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Alça superior */}
        <path d="M30 18 L30 12 Q40 8 50 12 L50 18" stroke="#875be3" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        {/* Corpo mala */}
        <rect x="9" y="18" width="62" height="40" rx="8" fill="#F0EBFC" stroke="#875be3" strokeWidth="2"/>
        {/* Linha divisora central */}
        <line x1="9" y1="36" x2="71" y2="36" stroke="#875be3" strokeWidth="1.5" strokeDasharray="5 3"/>
        {/* Caixa representando conteudo */}
        <rect x="19" y="22" width="42" height="12" rx="3" fill="#875be3" fillOpacity="0.2"/>
        <rect x="19" y="39" width="42" height="14" rx="3" fill="#875be3" fillOpacity="0.15"/>
        {/* Fechadura */}
        <rect x="35" y="32" width="10" height="7" rx="2.5" fill="#875be3" fillOpacity="0.55"/>
        {/* Rodinhas */}
        <rect x="17" y="57" width="11" height="5" rx="2.5" fill="#875be3"/>
        <rect x="52" y="57" width="11" height="5" rx="2.5" fill="#875be3"/>
      </svg>
    ),
  },
  {
    key: 'G',
    headline: 'Grande',
    hint: 'Cabe no porta-malas de um carro',
    weight: 'Até 30 kg',
    examples: 'Fardos, caixas volumosas',
    border: 'border-slate-500',
    bg: 'bg-slate-100',
    textColor: 'text-slate-700',
    illustration: (
      <svg viewBox="0 0 80 66" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Carro — lataria */}
        <path d="M4 37 L4 51 Q4 57 10 57 L70 57 Q76 57 76 51 L76 37 L58 37 L50 25 L26 25 L18 37 Z" fill="#F1F5F9" stroke="#475569" strokeWidth="2"/>
        {/* Cabine/teto */}
        <path d="M26 25 L32 16 L54 16 L60 25 Z" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5"/>
        {/* Para-brisa */}
        <path d="M33 17 L37 25 L55 25 L58 17 Z" fill="white" fillOpacity="0.75"/>
        {/* Tampa porta-malas aberta */}
        <path d="M58 37 Q69 27 71 18" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
        {/* Caixa grande no porta-malas */}
        <rect x="49" y="30" width="25" height="18" rx="3" fill="#475569" fillOpacity="0.28"/>
        <line x1="49" y1="39" x2="74" y2="39" stroke="#475569" strokeWidth="1" strokeOpacity="0.5"/>
        <line x1="61.5" y1="30" x2="61.5" y2="48" stroke="#475569" strokeWidth="1" strokeOpacity="0.4"/>
        {/* Rodas */}
        <circle cx="20" cy="57" r="7.5" fill="#475569"/>
        <circle cx="20" cy="57" r="3.5" fill="#F1F5F9"/>
        <circle cx="62" cy="57" r="7.5" fill="#475569"/>
        <circle cx="62" cy="57" r="3.5" fill="#F1F5F9"/>
      </svg>
    ),
  },
];

export function PackageForm({ onComplete }: { onComplete: () => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [fiscalInfo, setFiscalInfo] = useState<any>(null);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);
  const [withInsurance, setWithInsurance] = useState(true);

  // Cidades selecionadas
  const [selectedOrigin, setSelectedOrigin] = useState<CityOption | null>(null);
  const [selectedDest, setSelectedDest] = useState<CityOption | null>(null);

  // Rota cadastrada
  const [matchedRoute, setMatchedRoute] = useState<any | null>(null);
  const [routeNotFound, setRouteNotFound] = useState(false);
  const [calculatedDistance, setCalculatedDistance] = useState<number>(0);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data de envio e contagem de viajantes
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [travelerCount, setTravelerCount] = useState<number | null>(null);
  const [isCountingTravelers, setIsCountingTravelers] = useState(false);

  // Configs de preço vêm do AppContext (buscadas uma única vez por sessão)
  const { configs, configsLoaded } = useAppContext();
  const pricingConfig = configs.pricingTable;
  const platformFeePercent = configs.platformFeePercent;
  const pricingLoading = !configsLoaded;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      origin: "",
      destination: "",
      size: "P",
      recipientName: "",
      recipientPhone: "",
      recipientCpf: "",
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

  // Busca rota cadastrada pelo admin
  const lookupRoute = useCallback(async (origin: CityOption, dest: CityOption) => {
    setIsCalculatingRoute(true);
    setMatchedRoute(null);
    setRouteNotFound(false);
    setCalculatedDistance(0);
    try {
      // Tenta origem → destino
      let { data } = await supabase
        .from('routes')
        .select('*')
        .eq('origin', origin.name)
        .eq('destination', dest.name)
        .eq('status', 'active')
        .maybeSingle();

      // Tenta sentido inverso (rota bidirecional)
      if (!data) {
        const { data: rev } = await supabase
          .from('routes')
          .select('*')
          .eq('origin', dest.name)
          .eq('destination', origin.name)
          .eq('status', 'active')
          .maybeSingle();
        if (rev) data = { ...rev, origin: origin.name, destination: dest.name };
      }

      if (data) {
        setMatchedRoute(data);
        setCalculatedDistance(data.distance_km);
      } else {
        setRouteNotFound(true);
      }
    } catch (e) {
      console.error('Erro ao buscar rota:', e);
      setRouteNotFound(true);
    } finally {
      setIsCalculatingRoute(false);
    }
  }, []);

  const fetchTravelerCount = useCallback(async (origin: string, dest: string, date: string) => {
    setIsCountingTravelers(true);
    setTravelerCount(null);
    try {
      const { count } = await supabase
        .from('trips')
        .select('id', { count: 'exact', head: true })
        .eq('origin_city', origin)
        .eq('destination_city', dest)
        .eq('departure_date', date)
        .eq('status', 'scheduled');
      setTravelerCount(count ?? 0);
    } catch (e) {
      console.error('Erro ao buscar viajantes:', e);
      setTravelerCount(0);
    } finally {
      setIsCountingTravelers(false);
    }
  }, []);

  useEffect(() => {
    if (selectedOrigin && selectedDest && selectedOrigin.id !== selectedDest.id) {
      lookupRoute(selectedOrigin, selectedDest);
    } else {
      setMatchedRoute(null);
      setRouteNotFound(false);
      setCalculatedDistance(0);
    }
    // Reseta a data ao trocar cidades
    setSelectedDate("");
    setTravelerCount(null);
  }, [selectedOrigin, selectedDest, lookupRoute]);

  useEffect(() => {
    if (selectedOrigin && selectedDest && matchedRoute && selectedDate) {
      fetchTravelerCount(selectedOrigin.name, selectedDest.name, selectedDate);
    } else if (!selectedDate) {
      setTravelerCount(null);
    }
  }, [selectedDate, selectedOrigin, selectedDest, matchedRoute, fetchTravelerCount]);

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
        if (result.recipient) {
          form.setValue("recipientName", result.recipient.name);
        }
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
      toast({ variant: "destructive", title: "Ops!", description: "Selecione a origem e o destino." });
      return;
    }
    if (step === 2 && selectedOrigin && selectedDest && selectedOrigin.id === selectedDest.id) {
      toast({ variant: "destructive", title: "Ops!", description: "Origem e destino não podem ser a mesma cidade." });
      return;
    }
    if (step === 2 && routeNotFound) {
      toast({ variant: "destructive", title: "Rota não disponível", description: "O admin ainda não cadastrou essa rota. Tente outra combinação." });
      return;
    }
    if (step === 2 && matchedRoute && !selectedDate) {
      toast({ variant: "destructive", title: "Escolha a data", description: "Selecione a data em que deseja enviar o pacote." });
      return;
    }
    
    let fieldsToValidate: any[] = [];
    switch (step) {
      case 1: fieldsToValidate = ["description", "size"]; break;
      case 2: fieldsToValidate = ["origin", "destination"]; break;
      case 3: fieldsToValidate = []; break; // Fiscal info validado pelo estado fiscalInfo
      case 4: fieldsToValidate = ["recipientName", "recipientPhone", "recipientCpf"]; break;
      default: fieldsToValidate = [];
    }
    
    const isValid = fieldsToValidate.length > 0 ? await form.trigger(fieldsToValidate) : true;
    if (isValid) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const onSubmit = async (values: FormValues) => {
    if (!selectedOrigin || !selectedDest) {
      toast({ variant: "destructive", title: "Ops!", description: "Selecione origem e destino." });
      return;
    }
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      const band = calculatedDistance <= 150 ? 'ate150'
        : calculatedDistance <= 300 ? 'de151a300'
        : 'aPartir301';
      const base = pricingConfig && pricingConfig[values.size]
        ? Number(pricingConfig[values.size][band])
        : calculatePrice(values.size as SizeKey, calculatedDistance);
      const insurance = Number(pricingConfig?.[values.size as SizeKey]?.insurance ?? 9.90);
      // Remetente paga o preço base; a taxa da plataforma é descontada no repasse ao viajante
      const finalTotal = base + (withInsurance ? insurance : 0);

      const { error } = await supabase.from('packages').insert({
        sender_id: user.id,
        description: values.description,
        size: values.size,
        origin_address: selectedOrigin.name,
        origin_city: selectedOrigin.name,
        origin_state: selectedOrigin.state,
        destination_address: selectedDest.name,
        destination_city: selectedDest.name,
        destination_state: selectedDest.state,
        recipient_name: values.recipientName,
        recipient_phone: values.recipientPhone,
        recipient_cpf: values.recipientCpf,
        price: base, // Salva o frete base; a taxa da plataforma é descontada no repasse ao viajante
        scheduled_date: selectedDate || null,
        pickup_code: generateCode(),
        delivery_code: generateCode(),
        status: 'searching',
      });

      if (error) throw error;

      toast({ title: "Envio criado! 🚀", description: "Estamos buscando o viajante ideal para você." });
      onComplete();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro ao criar envio", description: err.message || 'Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (step / 5) * 100;
  const selectedSize = form.watch("size") as SizeKey;

  // Faixa de distância
  const distanceBand = calculatedDistance <= 150 ? 'ate150'
    : calculatedDistance <= 300 ? 'de151a300'
    : 'aPartir301';
  const distanceBandLabel = calculatedDistance <= 150 ? 'até 150 km'
    : calculatedDistance <= 300 ? '151–300 km'
    : 'acima de 300 km';

  // Cálculos de preço reativos ao tamanho e distância
  // Remetente paga o frete base (sem taxa); a taxa é descontada no repasse ao viajante
  const baseFreight = pricingConfig && pricingConfig[selectedSize]
    ? Number(pricingConfig[selectedSize][distanceBand])
    : calculatePrice(selectedSize, calculatedDistance);
  const insurancePrice = Number(pricingConfig?.[selectedSize]?.insurance ?? 9.90);
  const finalTotal = baseFreight + (withInsurance ? insurancePrice : 0);

  return (
    <div className="space-y-6 pb-20 page-transition">
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>Passo {step} de 5</span>
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
                <div className="px-1">
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Tamanho do Pacote
                  </FormLabel>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Escolha com calma — isso ajuda o viajante a confirmar que cabe 😊
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {SIZE_OPTS.map(({ key, headline, hint, weight, examples, border, bg, textColor, illustration }) => {
                    const isSelected = form.watch("size") === key;
                    const isAiSuggested = aiSuggestion?.suggestedSize === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => form.setValue("size", key)}
                        className={cn(
                          "relative flex items-center rounded-[1.75rem] border-2 overflow-hidden transition-all duration-200 active:scale-[0.98] text-left w-full",
                          isSelected
                            ? `${border} shadow-md bg-white`
                            : "border-muted/40 bg-muted/10 opacity-60 hover:opacity-80"
                        )}
                      >
                        {/* Painel ilustração */}
                        <div
                          className={cn(
                            "w-24 h-24 flex-shrink-0 flex items-center justify-center p-2.5 transition-colors",
                            isSelected ? bg : "bg-muted/20"
                          )}
                        >
                          {illustration}
                        </div>

                        {/* Texto */}
                        <div className="flex-1 px-4 py-3 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[15px] font-black text-foreground leading-tight">{headline}</span>
                            {isAiSuggested && (
                              <span className="text-[8px] font-black bg-primary text-white px-2 py-0.5 rounded-full animate-bounce">
                                IA SUGERIU
                              </span>
                            )}
                          </div>
                          <p className={cn("text-xs font-bold", isSelected ? textColor : "text-muted-foreground")}>
                            {hint}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {weight} &middot; {examples}
                          </p>
                        </div>

                        {/* Indicador selecionado */}
                        <div className="pr-4 flex-shrink-0">
                          {isSelected ? (
                            <CheckCircle2 className={cn("h-5 w-5", textColor)} />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-muted" />
                          )}
                        </div>
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

              <Button type="button" onClick={nextStep} className="w-full h-14 rounded-2xl text-base font-bold gap-2 active:scale-[0.98] transition-transform">
                Continuar <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Pra onde vai? 📍</h2>
                <p className="text-sm text-muted-foreground">Selecione as cidades atendidas pela VYA.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Cidade de Origem</p>
                  <CitySelect
                    label="Origem"
                    color="primary"
                    value={selectedOrigin}
                    onChange={(city) => {
                      setSelectedOrigin(city);
                      form.setValue("origin", city?.name ?? "");
                      if (!city) setCalculatedDistance(0);
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Cidade de Destino</p>
                  <CitySelect
                    label="Destino"
                    color="secondary"
                    value={selectedDest}
                    onChange={(city) => {
                      setSelectedDest(city);
                      form.setValue("destination", city?.name ?? "");
                      if (!city) setCalculatedDistance(0);
                    }}
                  />
                </div>

                {isCalculatingRoute && (
                  <div className="p-4 bg-muted/20 rounded-[1.5rem] border border-dashed flex justify-center items-center gap-3 animate-pulse">
                    <Route className="h-4 w-4 text-primary animate-bounce" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Buscando rota cadastrada...</span>
                  </div>
                )}

                {!isCalculatingRoute && routeNotFound && selectedOrigin && selectedDest && (
                  <div className="p-4 bg-destructive/5 rounded-[1.5rem] border border-destructive/20 flex items-start gap-3 animate-in slide-in-from-top-2">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-destructive">Rota não disponível</p>
                      <p className="text-[11px] text-muted-foreground">Ainda não temos essa rota cadastrada. Tente outra combinação de cidades.</p>
                    </div>
                  </div>
                )}

                {!isCalculatingRoute && matchedRoute && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <div className="p-4 bg-primary/5 rounded-[1.5rem] border border-primary/20">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Route className="h-4 w-4 text-primary" />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Distância</span>
                        </div>
                        <span className="text-sm font-bold text-primary">{Math.round(matchedRoute.distance_km)} km</span>
                      </div>
                      {matchedRoute.average_duration_min > 0 && (
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-primary/10">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tempo estimado</span>
                          </div>
                          <span className="text-sm font-bold text-primary">
                            {Math.floor(matchedRoute.average_duration_min / 60)}h {matchedRoute.average_duration_min % 60}m
                          </span>
                        </div>
                      )}
                      {matchedRoute.waypoints && matchedRoute.waypoints.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-primary/10">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Paradas no caminho</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(Array.isArray(matchedRoute.waypoints) ? matchedRoute.waypoints : []).map((city: string, i: number) => (
                              <span key={i} className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">
                                {city}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Data de Envio — aparece quando a rota é confirmada */}
              {!isCalculatingRoute && matchedRoute && (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Data de Envio</p>

                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={cn(
                      "w-full h-14 rounded-[1.5rem] border-2 px-4 text-sm font-bold bg-white transition-all outline-none focus:ring-2 focus:ring-primary/20",
                      selectedDate ? "border-primary/40 bg-primary/5 text-foreground" : "border-muted text-muted-foreground"
                    )}
                  />

                  {isCountingTravelers && (
                    <div className="p-3 bg-muted/20 rounded-2xl border border-dashed flex items-center gap-2 animate-pulse">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Verificando viajantes disponíveis...
                      </span>
                    </div>
                  )}

                  {!isCountingTravelers && travelerCount !== null && selectedDate && (
                    <div className={cn(
                      "p-4 rounded-2xl border flex items-center gap-3 animate-in slide-in-from-top-2",
                      travelerCount > 0 ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"
                    )}>
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                        travelerCount > 0 ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                      )}>
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        {travelerCount > 0 ? (
                          <>
                            <p className="text-sm font-bold text-green-700">
                              {travelerCount === 1 ? "1 viajante" : `${travelerCount} viajantes`} nessa rota nessa data!
                            </p>
                            <p className="text-[10px] text-green-600">
                              Ótima chance de encontrar quem leve seu pacote. 🎉
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-bold text-amber-700">Nenhum viajante confirmado ainda</p>
                            <p className="text-[10px] text-amber-600">
                              Tente outro dia ou publique mesmo assim — avisamos quando alguém planejar essa rota.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30 active:scale-90 transition-transform">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!selectedOrigin || !selectedDest || isCalculatingRoute || routeNotFound || (!!matchedRoute && (!selectedDate || isCountingTravelers))}
                  className="flex-1 h-14 rounded-2xl text-base font-bold active:scale-[0.98] transition-transform"
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
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30 active:scale-90 transition-transform">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <Button type="button" onClick={nextStep} disabled={!fiscalInfo || isExtracting} className="flex-1 h-14 rounded-2xl text-base font-bold active:scale-[0.98] transition-transform">
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Quem recebe? 🤝</h2>
                <p className="text-sm text-muted-foreground">Precisamos dos dados de quem vai retirar a encomenda.</p>
              </div>

              <div className="space-y-4">
                <FormField
                  name="recipientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Nome Completo</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Nome de quem recebe" className="pl-11 h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="recipientPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">WhatsApp / Telefone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="(00) 00000-0000" className="pl-11 h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="recipientCpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">CPF do Destinatário</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="000.000.000-00" className="pl-11 h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30 active:scale-90 transition-transform">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <Button type="button" onClick={nextStep} className="flex-1 h-14 rounded-2xl text-base font-bold active:scale-[0.98] transition-transform">
                  Ver Resumo
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
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
              <div className="bg-muted/20 rounded-[2.5rem] p-6 space-y-3 border border-muted relative overflow-hidden">
                {pricingLoading ? (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Carregando tabela de preços...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Frete */}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Valor do frete</p>
                        <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                          Pacote {selectedSize} · {Math.round(calculatedDistance)} km ({distanceBandLabel})
                        </p>
                      </div>
                      <span className="text-sm font-bold">R$ {baseFreight.toFixed(2)}</span>
                    </div>

                    {/* Linha seguro */}
                    {withInsurance && (
                      <div className="flex justify-between items-center animate-in fade-in slide-in-from-top-1">
                        <p className="text-sm font-medium text-muted-foreground">Seguro VYA Safe</p>
                        <span className="text-sm font-bold">R$ {insurancePrice.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Total */}
                    <div className="pt-3 border-t flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total do pedido</p>
                        <p className="text-3xl font-bold text-primary tracking-tight">R$ {finalTotal.toFixed(2)}</p>
                      </div>
                      {withInsurance && (
                        <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold px-2 py-0.5 bg-green-50 rounded-full">
                          <ShieldCheck className="h-3 w-3" /> PROTEGIDO
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <p className="text-[11px] text-primary/80 leading-tight">
                  Seu pagamento via PIX fica retido com segurança até você confirmar a entrega.
                </p>
              </div>

              <div className="space-y-3">
                <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-[1.5rem] text-lg font-bold gap-3 shadow-xl shadow-primary/20 active:scale-[0.98] transition-transform">
                  {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Criando envio...</> : <>Pagar com PIX <Sparkles className="h-5 w-5 fill-current" /></>}
                </Button>
                <Button variant="ghost" type="button" className="w-full font-bold text-muted-foreground active:scale-95 transition-transform" onClick={prevStep}>
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
