
"use client";

import { useState, useEffect } from "react";
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
import { SIZES, SizeKey, calculatePrice } from "@/lib/constants";
import { 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Upload, 
  MapPin, 
  ChevronRight, 
  ArrowLeft,
  Package as PackageIcon,
  ShieldCheck,
  CreditCard
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

export function PackageForm({ onComplete }: { onComplete: () => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [fiscalInfo, setFiscalInfo] = useState<any>(null);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      origin: "",
      destination: "",
      size: "P",
    },
  });

  // Gatilho de IA para sugerir tamanho baseado na descrição
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
        toast({
          title: "Documento lido!",
          description: "Extraímos os dados da nota automaticamente.",
        });
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setIsExtracting(false);
      setHasUploadedFile(false);
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: "Não conseguimos ler esse arquivo. Tente outro.",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const nextStep = async () => {
    const fields = step === 1 ? ["description", "size"] : step === 2 ? ["origin", "destination"] : [];
    const isValid = await form.trigger(fields as any);
    if (isValid) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const onSubmit = (values: FormValues) => {
    toast({
      title: "Quase lá!",
      description: "Estamos processando seu pagamento...",
    });
    setTimeout(() => onComplete(), 2000);
  };

  const progress = (step / 4) * 100;

  return (
    <div className="space-y-6 pb-20 page-transition">
      {/* Barra de Progresso Inteligente */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>Passo {step} de 4</span>
          <span>{Math.round(progress)}% Concluído</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* PASSO 1: CONTEÚDO E TAMANHO */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">O que vamos mandar? 📦</h2>
                <p className="text-sm text-muted-foreground">Dê uma descrição rápida do conteúdo.</p>
              </div>

              <FormField
                control={form.control}
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
                          isSelected 
                            ? "border-primary bg-primary/5 shadow-inner" 
                            : "border-muted bg-muted/20 grayscale opacity-60"
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

          {/* PASSO 2: ROTA */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Pra onde vai? 📍</h2>
                <p className="text-sm text-muted-foreground">Pode digitar a cidade ou o CEP.</p>
              </div>

              <div className="space-y-4 relative">
                {/* Linha visual de conexão */}
                <div className="absolute left-6 top-10 bottom-10 w-[2px] border-l-2 border-dashed border-muted" />
                
                <FormField
                  control={form.control}
                  name="origin"
                  render={({ field }) => (
                    <FormItem className="relative z-10">
                      <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] border shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <FormControl>
                          <Input 
                            placeholder="Origem (Cidade ou CEP)" 
                            className="border-none bg-transparent focus-visible:ring-0 text-base"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="px-6" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem className="relative z-10">
                      <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] border shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <FormControl>
                          <Input 
                            placeholder="Destino (Cidade ou CEP)" 
                            className="border-none bg-transparent focus-visible:ring-0 text-base"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="px-6" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={prevStep} className="h-14 w-14 rounded-2xl bg-muted/30">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <Button type="button" onClick={nextStep} className="flex-1 h-14 rounded-2xl text-base font-bold">
                  Quase pronto!
                </Button>
              </div>
            </div>
          )}

          {/* PASSO 3: DOCUMENTAÇÃO */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Check-in Fiscal 📑</h2>
                <p className="text-sm text-muted-foreground">Toda carga precisa ser legalizada para sua segurança e do viajante.</p>
              </div>

              {!hasUploadedFile ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-primary/20 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center gap-5 bg-muted/10 relative overflow-hidden group">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Upload className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold">Escanear NF-e</p>
                      <p className="text-[10px] text-muted-foreground px-4 uppercase tracking-widest">Extraímos os dados pra você via IA</p>
                    </div>
                    <Input type="file" className="hidden" id="fiscal-upload" onChange={handleFileUpload} />
                    <Button variant="outline" type="button" className="rounded-full px-8" asChild>
                      <label htmlFor="fiscal-upload" className="cursor-pointer">Escolher Arquivo</label>
                    </Button>
                  </div>
                  
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-background px-4 text-muted-foreground">Ou se preferir</span></div>
                  </div>

                  <Button variant="ghost" type="button" className="w-full h-14 rounded-[1.5rem] border border-dashed text-sm font-bold" onClick={() => {
                    setFiscalInfo({ manual: true });
                    nextStep();
                  }}>
                    Fazer Declaração de Conteúdo Manual
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
                            <p className="text-[10px] text-muted-foreground uppercase">{fiscalInfo?.documentType || 'Processado'}</p>
                          </div>
                        </div>
                        <div className="space-y-2 pt-2 border-t border-primary/10">
                          <div className="flex justify-between text-[11px]"><span className="text-muted-foreground font-bold">REMETENTE:</span> <span className="font-bold truncate max-w-[150px]">{fiscalInfo?.sender?.name || '---'}</span></div>
                          <div className="flex justify-between text-[11px]"><span className="text-muted-foreground font-bold">DESTINATÁRIO:</span> <span className="font-bold truncate max-w-[150px]">{fiscalInfo?.recipient?.name || '---'}</span></div>
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

          {/* PASSO 4: RESUMO E PAGAMENTO */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Tudo certo? 🏁</h2>
                <p className="text-sm text-muted-foreground">Confira os valores e finalize seu pedido.</p>
              </div>

              <div className="bg-muted/20 rounded-[2.5rem] p-8 space-y-6 border border-muted">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Transporte (TAM {form.getValues("size")})</span>
                    <span className="font-bold">R$ {calculatePrice(form.getValues("size"), 150).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Taxa VYA (Seguro + App)</span>
                    <span className="font-bold">R$ 4,50</span>
                  </div>
                  <div className="pt-4 border-t flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total a pagar</p>
                      <p className="text-3xl font-bold text-primary tracking-tight">R$ {(calculatePrice(form.getValues("size"), 150) + 4.5).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold mb-1">
                        <ShieldCheck className="h-3 w-3" /> SEGURO ATIVO
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <p className="text-[11px] text-primary/80 leading-tight">
                  Seu pagamento fica retido conosco até que você confirme o recebimento do pacote. **Segurança total!**
                </p>
              </div>

              <div className="space-y-3">
                <Button type="submit" className="w-full h-16 rounded-[1.5rem] text-lg font-bold gap-3 shadow-xl shadow-primary/20">
                  Pagar com PIX <Sparkles className="h-5 w-5 fill-current" />
                </Button>
                <Button variant="ghost" type="button" className="w-full font-bold text-muted-foreground" onClick={prevStep}>
                  Voltar
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}

