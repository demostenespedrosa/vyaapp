"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Copy,
  CheckCircle2,
  Clock,
  QrCode,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CheckoutScreenProps {
  /** ID curto exibível do pacote (ex.: "VY-A1B2C3") */
  packageDisplayId: string;
  /** Imagem base64 do QR Code PIX (pode ser vazia em modo sandbox sem API key) */
  pixQrCode: string;
  /** String copia-e-cola do PIX */
  pixCopyPaste: string;
  /** ISO string do momento de expiração */
  expiresAt: string;
  /** Valor total a ser pago (R$) */
  amount: number;
  /** Chamado quando a tela detecta que o pagamento foi confirmado (via realtime) */
  onPaid: () => void;
  /** Chamado quando o temporizador chegar a zero */
  onExpired: () => void;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function CheckoutScreen({
  packageDisplayId,
  pixQrCode,
  pixCopyPaste,
  expiresAt,
  amount,
  onPaid,
  onExpired,
}: CheckoutScreenProps) {
  const { toast } = useToast();
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [copied, setCopied] = useState(false);

  // ── Calcula tempo restante ──────────────────────────────────────────────
  const computeSecondsLeft = useCallback(() => {
    const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    return diff;
  }, [expiresAt]);

  useEffect(() => {
    setSecondsLeft(computeSecondsLeft());

    const interval = setInterval(() => {
      const remaining = computeSecondsLeft();
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [computeSecondsLeft, onExpired]);

  const totalSeconds = 60 * 60; // 1 hora = 3600s
  const progress = Math.max(0, (secondsLeft / totalSeconds) * 100);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const hours = Math.floor(minutes / 60);
  const displayMinutes = minutes % 60;

  const isUrgent = secondsLeft < 300; // menos de 5 min → vermelho

  // ── Copia o código PIX ──────────────────────────────────────────────────
  const handleCopy = async () => {
    try {
      await copyToClipboard(pixCopyPaste);
      setCopied(true);
      toast({ title: "Chave PIX copiada! 📋", description: "Cole no seu app de banco." });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast({ variant: "destructive", title: "Erro ao copiar", description: "Selecione o código manualmente." });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background overflow-y-auto animate-in fade-in slide-in-from-bottom-8 duration-400">
      <div className="min-h-screen flex flex-col">

        {/* ── Hero Header ─────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-orange-400 text-white px-6 pt-14 pb-8 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 opacity-10">
            <Zap className="h-48 w-48 rotate-12 fill-white" />
          </div>
          <div className="relative z-10 space-y-3">
            <Badge className="bg-white/20 text-white border-none text-[9px] font-black tracking-widest uppercase px-3 py-1">
              Pagamento Pendente
            </Badge>
            <h1 className="text-3xl font-black tracking-tighter">
              Finalize o Envio
            </h1>
            <p className="text-white/80 text-sm font-medium">
              Um viajante aceitou seu pacote! Pague agora para confirmar.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-white/15 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <p className="text-[11px] text-white/70 font-medium">VYA Safe — liberado só após entrega</p>
            </div>
          </div>
        </div>

        {/* ── Conteúdo ────────────────────────────────────────────────── */}
        <div className="flex-1 px-5 py-6 space-y-6">

          {/* Valor */}
          <Card className="rounded-[2rem] border-none bg-primary/5 shadow-sm">
            <CardContent className="p-5 flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Valor a pagar</p>
                <p className="text-3xl font-black text-primary tracking-tighter">
                  R$ {amount.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{packageDisplayId}</p>
              </div>
              <div className="h-14 w-14 rounded-[1.2rem] bg-primary/10 flex items-center justify-center text-primary">
                <QrCode className="h-7 w-7" />
              </div>
            </CardContent>
          </Card>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Escaneie com seu banco
            </p>
            <div className="p-4 bg-white rounded-[2rem] shadow-lg border-2 border-muted/30">
              {pixQrCode ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`data:image/png;base64,${pixQrCode}`}
                  alt="QR Code PIX"
                  className="w-52 h-52 rounded-xl"
                />
              ) : (
                <div className="w-52 h-52 rounded-xl bg-muted/30 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <QrCode className="h-12 w-12 opacity-30" />
                  <p className="text-[10px] font-bold text-center px-4 leading-tight">
                    QR Code indisponível<br/>Use copia-e-cola abaixo
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Copia e Cola */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
              Ou copie o código PIX
            </p>
            <Card className={cn(
              "rounded-[2rem] border-2 transition-all duration-300",
              copied ? "border-green-400 bg-green-50" : "border-muted/40 bg-muted/20"
            )}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-mono text-muted-foreground truncate leading-relaxed select-all">
                    {pixCopyPaste}
                  </p>
                </div>
                <Button
                  onClick={handleCopy}
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full shrink-0 transition-all",
                    copied
                      ? "bg-green-500 text-white shadow-sm shadow-green-200"
                      : "bg-primary text-white shadow-sm shadow-primary/30"
                  )}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Temporizador ────────────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Tempo Restante
              </p>
              <span
                className={cn(
                  "text-lg font-black tracking-tight tabular-nums transition-colors",
                  isUrgent ? "text-destructive animate-pulse" : "text-foreground"
                )}
              >
                {hours > 0
                  ? `${pad(hours)}:${pad(displayMinutes)}:${pad(seconds)}`
                  : `${pad(displayMinutes)}:${pad(seconds)}`}
              </span>
            </div>

            {/* Barra de progresso */}
            <div className="h-3 w-full bg-muted/40 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-linear",
                  isUrgent ? "bg-destructive" : "bg-primary"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>

            {isUrgent && (
              <div className="flex items-center gap-2 px-1">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-[11px] font-bold text-destructive">
                  Menos de 5 minutos! Efetue o pagamento agora.
                </p>
              </div>
            )}
          </div>

          {/* Instrução passo a passo */}
          <Card className="rounded-[2rem] border-none bg-muted/20">
            <CardContent className="p-5 space-y-4">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Como pagar
              </p>
              {[
                'Abra o app do seu banco',
                'Acesse a área de PIX',
                'Escolha "Copia e Cola" ou escaneie o QR Code',
                'Confirme o valor e pague',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-black shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm font-medium text-foreground/80">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* CTA — aguardando confirmação */}
          <div className="flex items-center justify-center gap-3 py-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <p className="text-[11px] font-bold text-muted-foreground">
              Aguardando confirmação do pagamento...
            </p>
          </div>

          {/* Botão cancelar (link visual) */}
          <button
            className="w-full text-center text-[11px] font-bold text-muted-foreground/50 hover:text-muted-foreground transition-colors py-2 active:scale-95"
            onClick={onExpired}
          >
            Cancelar e voltar
          </button>

        </div>
      </div>
    </div>
  );
}
