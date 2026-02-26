"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Package,
  Plane,
  ShieldCheck,
  Leaf,
  Rocket,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  X,
  Star,
  UserCircle2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface OnboardingFlowProps {
  firstName: string;
  /** Sempre conclui no modo sender — viajante é opt-in via perfil */
  onComplete: () => void;
}

type Step = {
  id: string;
  gradient: string;        // fundo da página
  iconGradient: string;    // fundo do ícone
  Icon: React.ElementType;
  eyebrow?: string;        // label pequena acima do título
  title: (name: string) => React.ReactNode;
  body: (name: string) => React.ReactNode;
  /** Se true, renderiza um "card destaque" abaixo do body */
  highlight?: {
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    text: string;
  };
};

// ---------------------------------------------------------------------------
// Passos
// ---------------------------------------------------------------------------

const STEPS: Step[] = [
  // 1 — Boas-vindas
  {
    id: "welcome",
    gradient: "from-orange-50 via-white to-white",
    iconGradient: "from-primary to-brand-purple",
    Icon: Sparkles,
    title: (name) => (
      <>
        Oi, <span className="text-primary">{name}</span>! 👋
      </>
    ),
    body: () => (
      <>
        Seja muito bem-vindo à{" "}
        <span className="font-bold text-foreground">VYA</span>! Sou seu guia
        por aqui e vou te explicar tudo em menos de um minuto ⚡<br /><br />
        Juro que vai ser tranquilo — e vai mudar a forma como você envia
        pacotes 😄
      </>
    ),
  },

  // 2 — O problema (caminhões) e a solução verde
  {
    id: "eco",
    gradient: "from-emerald-50 via-white to-white",
    iconGradient: "from-emerald-500 to-teal-400",
    Icon: Leaf,
    eyebrow: "Menos caminhões, mais pessoas",
    title: () => "Bom pra você e pro planeta 🌱",
    body: () => (
      <>
        Sabe aquele carro que já ia passando pela cidade do seu pacote de
        qualquer jeito? Ou esse viajante que ia de ônibus pro mesmo destino?
        <br /><br />
        A VYA aproveita essas viagens que <span className="font-semibold text-foreground">já estão acontecendo</span>{" "}
        para entregar seus pacotes — sem jogar mais um caminhão na rodovia.{" "}
        <span className="font-semibold text-emerald-600">
          Entrega rápida, custo menor e ainda cuida do meio ambiente.
        </span>
      </>
    ),
    highlight: {
      icon: Leaf,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      text: "Cada envio pela VYA evita uma viagem de caminhão desnecessária. 🌍",
    },
  },

  // 3 — Como enviar um pacote
  {
    id: "sender",
    gradient: "from-orange-50 via-white to-white",
    iconGradient: "from-primary to-orange-400",
    Icon: Package,
    eyebrow: "Você como Remetente",
    title: () => "Enviar ficou simples demais 📦",
    body: () => (
      <>
        Você cria o pedido em menos de 2 minutos: informa origem, destino,
        dimensões e valor declarado. A VYA mostra o preço na hora.
        <br /><br />
        Viajantes próximos entram em contato, combinam a retirada e levam
        seu pacote pessoalmente. Sem fila, sem agência.
      </>
    ),
    highlight: {
      icon: Package,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      text: "Acompanhe o status do seu pacote em tempo real pelo aplicativo.",
    },
  },

  // 4 — Segurança
  {
    id: "security",
    gradient: "from-blue-50 via-white to-white",
    iconGradient: "from-blue-500 to-indigo-500",
    Icon: ShieldCheck,
    eyebrow: "Sua tranquilidade em primeiro lugar",
    title: () => "Seguro de verdade 🛡️",
    body: () => (
      <>
        Todo viajante tem perfil verificado, avaliações reais de outros
        usuários e aceita os termos de responsabilidade antes de pegar
        qualquer pacote.
        <br /><br />
        Você só confirma a entrega depois de receber — o pagamento ao
        viajante fica retido até lá. Sem risco pra você.
      </>
    ),
    highlight: {
      icon: Star,
      iconColor: "text-yellow-500",
      iconBg: "bg-yellow-50",
      text: "Sistema de avaliação mútua: remetentes e viajantes se avaliam após cada entrega.",
    },
  },

  // 5 — Modo viajante (teaser)
  {
    id: "traveler",
    gradient: "from-purple-50 via-white to-white",
    iconGradient: "from-brand-purple to-brand-pink",
    Icon: Plane,
    eyebrow: "Psst — tem um bônus!",
    title: () => "Vai viajar? Leve pacotes e ganhe! ✈️",
    body: () => (
      <>
        Quando você for viajar — seja de carro, ônibus ou avião — pode
        ativar o{" "}
        <span className="font-bold text-brand-purple">modo Viajante</span>{" "}
        no seu perfil e ver pacotes disponíveis no seu caminho.
        <br /><br />
        É uma renda extra sem esforço: você já vai fazer a viagem de
        qualquer jeito 😏
      </>
    ),
    highlight: {
      icon: UserCircle2,
      iconColor: "text-brand-purple",
      iconBg: "bg-brand-purple/10",
      text: 'Alterne entre Remetente e Viajante a qualquer momento em "Perfil → Meu modo".',
    },
  },

  // 6 — Pronto!
  {
    id: "ready",
    gradient: "from-orange-50 via-white to-white",
    iconGradient: "from-primary to-brand-purple",
    Icon: Rocket,
    title: (name) => (
      <>
        Tudo certo, <span className="text-primary">{name}</span>! 🚀
      </>
    ),
    body: () => (
      <>
        Agora você já sabe tudo. Seu primeiro envio está a um toque de
        distância.
        <br /><br />
        Qualquer dúvida, o suporte está sempre disponível no app. E
        lembre-se: cada pacote que você envia pela VYA é um caminhão a
        menos na estrada 🌿
      </>
    ),
  },
];

const TOTAL = STEPS.length;

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function OnboardingFlow({ firstName, onComplete }: OnboardingFlowProps) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<"enter" | "exit-left" | "exit-right">("enter");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const step = STEPS[idx];
  const isLast = idx === TOTAL - 1;

  const go = (direction: "next" | "back") => {
    const next = direction === "next" ? idx + 1 : idx - 1;
    if (next < 0 || next >= TOTAL) return;

    setDir(direction === "next" ? "exit-left" : "exit-right");
    setTimeout(() => {
      setIdx(next);
      setDir("enter");
    }, 180);
  };

  const finish = () => {
    setVisible(false);
    setTimeout(onComplete, 280);
  };

  const HighlightIcon = step.highlight?.icon;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col bg-gradient-to-b transition-opacity duration-300",
        `bg-gradient-to-b ${step.gradient}`,
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-3">
        <div className="w-9">
          {idx > 0 && (
            <button
              onClick={() => go("back")}
              className="h-9 w-9 rounded-full bg-black/6 flex items-center justify-center active:scale-90 transition-transform"
            >
              <ArrowLeft className="h-4 w-4 text-foreground/60" />
            </button>
          )}
        </div>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full transition-all duration-300",
                i === idx
                  ? "w-5 h-2 bg-foreground"
                  : i < idx
                  ? "w-2 h-2 bg-foreground/30"
                  : "w-2 h-2 bg-foreground/12"
              )}
            />
          ))}
        </div>

        <button
          onClick={finish}
          className="h-9 w-9 rounded-full bg-black/6 flex items-center justify-center active:scale-90 transition-transform"
        >
          <X className="h-4 w-4 text-foreground/50" />
        </button>
      </div>

      {/* ── Conteúdo animado ── */}
      <div
        key={idx}
        className={cn(
          "flex-1 flex flex-col overflow-y-auto transition-all duration-[180ms] ease-out",
          dir === "enter" && "opacity-100 translate-x-0",
          dir === "exit-left" && "opacity-0 -translate-x-5",
          dir === "exit-right" && "opacity-0 translate-x-5"
        )}
      >
        <div className="flex flex-col items-center px-6 pt-8 pb-4 gap-7">
          {/* Ícone */}
          <div
            className={cn(
              "h-28 w-28 rounded-[2.25rem] flex items-center justify-center shadow-2xl flex-shrink-0",
              `bg-gradient-to-br ${step.iconGradient}`
            )}
          >
            <step.Icon className="h-14 w-14 text-white" />
          </div>

          {/* Texto */}
          <div className="w-full space-y-3 max-w-sm">
            {step.eyebrow && (
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center">
                {step.eyebrow}
              </p>
            )}

            <h2 className="text-2xl font-black text-foreground leading-tight text-center">
              {step.title(firstName)}
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              {step.body(firstName)}
            </p>
          </div>

          {/* Card destaque */}
          {step.highlight && HighlightIcon && (
            <div className="w-full max-w-sm rounded-2xl border border-border bg-white/80 backdrop-blur p-4 flex items-start gap-3 shadow-sm">
              <div
                className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0",
                  step.highlight.iconBg
                )}
              >
                <HighlightIcon className={cn("h-4.5 w-4.5", step.highlight.iconColor)} />
              </div>
              <p className="text-xs text-foreground/70 leading-relaxed pt-0.5">
                {step.highlight.text}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Botão ── */}
      <div className="px-6 pt-3 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <Button
          onClick={isLast ? finish : () => go("next")}
          size="lg"
          className={cn(
            "w-full h-14 rounded-2xl text-base font-bold gap-2 shadow-lg active:scale-[0.98] transition-all",
            isLast
              ? "bg-gradient-to-r from-primary to-brand-purple text-white shadow-primary/25"
              : idx === 1
              ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-emerald-400/25"
              : idx === 3
              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-400/25"
              : idx === 4
              ? "bg-gradient-to-r from-brand-purple to-brand-pink text-white shadow-brand-purple/25"
              : "bg-foreground text-background"
          )}
        >
          {isLast ? "Vamos lá! 🚀" : "Próximo"}
          {!isLast && <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
