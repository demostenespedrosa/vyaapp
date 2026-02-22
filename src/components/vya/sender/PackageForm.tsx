
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { suggestPackageSize } from "@/ai/flows/intelligent-package-sizing-flow";
import { extractFiscalDocumentData } from "@/ai/flows/fiscal-document-data-extraction-flow";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SIZES, SizeKey, calculatePrice } from "@/lib/constants";
import { Loader2, Sparkles, CheckCircle2, FileText, Upload } from "lucide-react";

const formSchema = z.object({
  description: z.string().min(10, "Descreva melhor o seu pacote"),
  origin: z.string().min(3, "Origem obrigatória"),
  destination: z.string().min(3, "Destino obrigatório"),
  size: z.enum(["P", "M", "G"]),
  fiscalData: z.any().optional(),
});

export function PackageForm({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [fiscalInfo, setFiscalInfo] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      origin: "",
      destination: "",
      size: "P",
    },
  });

  async function handleAnalyzeDescription() {
    const desc = form.getValues("description");
    if (desc.length < 5) return;
    setIsAnalyzing(true);
    try {
      const result = await suggestPackageSize({ packageDescription: desc });
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
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const result = await extractFiscalDocumentData({ documentDataUri: base64 });
        setFiscalInfo(result);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExtracting(false);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Enviando pacote:", { ...values, fiscalInfo });
    onComplete();
  };

  return (
    <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
      <div className="h-2 bg-muted w-full">
        <div 
          className="h-full bg-primary transition-all duration-500" 
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {step === 1 && "1. O que vamos enviar?"}
          {step === 2 && "2. Check-in Fiscal Obrigatório"}
          {step === 3 && "3. Revisão e Pagamento"}
        </CardTitle>
        <CardDescription>Siga os passos para garantir a segurança da sua carga.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição do Conteúdo</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea 
                            placeholder="Ex: Um smartphone Samsung S21 com carregador e NF." 
                            className="min-h-[100px]"
                            {...field}
                            onBlur={handleAnalyzeDescription}
                          />
                          {isAnalyzing && (
                            <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs text-primary animate-pulse">
                              <Loader2 className="h-3 w-3 animate-spin" /> Analisando tamanho...
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {aiSuggestion && (
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-primary">IA Sugeriu: Tamanho {aiSuggestion.suggestedSize}</p>
                      <p className="text-[10px] text-muted-foreground">{aiSuggestion.restrictions}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="origin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade Origem</FormLabel>
                        <FormControl><Input placeholder="Ex: São Paulo" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade Destino</FormLabel>
                        <FormControl><Input placeholder="Ex: Campinas" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tamanho Definido</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tamanho" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(SIZES).map(([key, info]) => (
                            <SelectItem key={key} value={key}>
                              {info.label} - {info.weight}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="button" className="w-full" onClick={() => setStep(2)}>
                  Próximo Passo: Documentação
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                  <FileText className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-800">
                    A VYA exige NF-e ou Declaração de Conteúdo para proteger o viajante e garantir a legalidade do transporte intermunicipal.
                  </p>
                </div>

                <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4 bg-muted/30">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {isExtracting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                  </div>
                  <div>
                    <p className="font-bold">Arraste sua NF-e ou clique para upload</p>
                    <p className="text-xs text-muted-foreground">Formatos aceitos: PDF, JPG, PNG</p>
                  </div>
                  <Input type="file" className="hidden" id="fiscal-upload" onChange={handleFileUpload} />
                  <Button variant="outline" type="button" asChild>
                    <label htmlFor="fiscal-upload" className="cursor-pointer">Escolher Arquivo</label>
                  </Button>
                </div>

                {fiscalInfo && (
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-2 text-green-700">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-bold">Documento Extraído com Sucesso</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="font-bold block">Remetente</span>
                        {fiscalInfo.sender.name}
                      </div>
                      <div>
                        <span className="font-bold block">Destinatário</span>
                        {fiscalInfo.recipient.name}
                      </div>
                      <div className="col-span-2">
                        <span className="font-bold block">Itens</span>
                        {fiscalInfo.itemDescription}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button variant="ghost" type="button" className="flex-1" onClick={() => setStep(1)}>Voltar</Button>
                  <Button type="button" className="flex-1" onClick={() => setStep(3)} disabled={!fiscalInfo}>Continuar</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="rounded-xl border p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pacote Tamanho {form.getValues("size")}</span>
                    <span className="font-bold">R$ {calculatePrice(form.getValues("size"), 150).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Taxa de Plataforma</span>
                    <span className="font-bold">R$ 4,50</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between items-center">
                    <span className="font-bold">Total a Pagar</span>
                    <span className="text-2xl font-bold text-primary">R$ {(calculatePrice(form.getValues("size"), 150) + 4.5).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full h-12 text-lg font-bold gap-2">
                    Pagar com PIX <Sparkles className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full">Cartão de Crédito (+ taxas)</Button>
                </div>

                <Button variant="ghost" type="button" className="w-full" onClick={() => setStep(2)}>Voltar</Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
