"use client";

import { useState, useEffect, useRef } from "react";
import { Box, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, Gift, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface AuthScreenProps {
  onLoginSuccess: (user: any) => void;
}

export function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Referral code state
  const [referralCode, setReferralCode] = useState("");
  const [referralStatus, setReferralStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Validate referral code with debounce
  useEffect(() => {
    const code = referralCode.trim().toUpperCase();
    if (!code) { setReferralStatus('idle'); return; }

    setReferralStatus('checking');
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', code)
        .maybeSingle();

      if (error || !data) {
        setReferralStatus('invalid');
      } else {
        setReferralStatus('valid');
      }
    }, 600);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [referralCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Login
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        if (data.user) onLoginSuccess(data.user);
      } else {
        // Bloqueia envio se o código digitado ainda é inválido
        if (referralCode.trim() && referralStatus === 'invalid') {
          setError('Código de indicação inválido. Verifique o código e tente novamente.');
          setIsLoading(false);
          return;
        }

        // Cadastro
        const metadata: Record<string, string> = {
          full_name: name,
          role: 'cliente',
        };
        if (referralCode.trim() && referralStatus === 'valid') {
          metadata.referral_code = referralCode.trim().toUpperCase();
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: metadata },
        });

        if (signUpError) throw signUpError;

        // Se o Supabase exigir confirmação de e-mail, o usuário não loga direto
        if (data.user && data.session) {
          onLoginSuccess(data.user);
        } else {
          setError('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Ocorreu um erro ao tentar autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-y-auto">
      <div className="flex flex-col px-6 pt-16 pb-16 space-y-10 max-w-sm mx-auto w-full">
        {/* Header / Logo */}
        <div className="space-y-6 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-primary to-brand-purple shadow-2xl shadow-primary/30 text-white mx-auto">
            <Box className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-foreground">VYA</h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Logística Colaborativa</p>
          </div>
        </div>

        {/* Toggle Login / Register */}
        <div className="flex p-1.5 bg-muted/30 rounded-[2rem] backdrop-blur-sm max-w-xs mx-auto w-full">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); setReferralCode(''); setReferralStatus('idle'); }}
            className={cn(
              "flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-300",
              isLogin ? "bg-white shadow-sm text-primary scale-[0.98]" : "text-muted-foreground/60 hover:text-primary"
            )}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            className={cn(
              "flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-300",
              !isLogin ? "bg-white shadow-sm text-primary scale-[0.98]" : "text-muted-foreground/60 hover:text-primary"
            )}
          >
            Criar Conta
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 w-full">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {!isLogin && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  required
                  type="text"
                  placeholder="Seu nome" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-12 h-14 rounded-2xl bg-muted/30 border-none font-medium text-base focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>
          )}

          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                required
                type="email"
                placeholder="seu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-14 rounded-2xl bg-muted/30 border-none font-medium text-base focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                required
                type="password"
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 h-14 rounded-2xl bg-muted/30 border-none font-medium text-base focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Código de Indicação
                </Label>
                <span className="text-[10px] font-medium text-muted-foreground/60">Opcional</span>
              </div>
              <div className="relative">
                <Gift className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Ex: AB3CD4EF"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  className={cn(
                    "pl-12 pr-12 h-14 rounded-2xl bg-muted/30 border-2 font-mono font-bold text-base tracking-widest uppercase focus-visible:ring-2 focus-visible:ring-primary/20 transition-colors",
                    referralStatus === 'valid' && 'border-green-400 bg-green-50',
                    referralStatus === 'invalid' && 'border-red-300 bg-red-50',
                    referralStatus === 'idle' || referralStatus === 'checking' ? 'border-transparent' : ''
                  )}
                />
                {/* Status icon */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {referralStatus === 'checking' && (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  )}
                  {referralStatus === 'valid' && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {referralStatus === 'invalid' && (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>
              </div>
              {referralStatus === 'valid' && (
                <p className="text-xs font-bold text-green-600 ml-1">
                  ✓ Código válido! Você e seu indicador ganham bônus no primeiro envio.
                </p>
              )}
              {referralStatus === 'invalid' && (
                <p className="text-xs font-medium text-red-500 ml-1">
                  Código não encontrado. Verifique com quem te indicou.
                </p>
              )}
            </div>
          )}

          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-lg font-bold gap-3 shadow-xl shadow-primary/20 group active:scale-95 transition-all mt-4"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                {isLogin ? 'Acessar Conta' : 'Cadastrar'}
                <ArrowRight className="h-5 w-5 ml-auto opacity-40 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
