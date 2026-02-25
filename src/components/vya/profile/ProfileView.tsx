"use client";

import { useState } from "react";
import { 
  User, 
  Shield, 
  Car, 
  ChevronRight, 
  LogOut, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ProfileViewProps {
  mode: 'sender' | 'traveler';
  onModeChange: (mode: 'sender' | 'traveler') => void;
  onLogout: () => void;
}

export function ProfileView({ mode, onModeChange, onLogout }: ProfileViewProps) {
  const [activeScreen, setActiveScreen] = useState<'menu' | 'personal' | 'security' | 'vehicles'>('menu');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'personal':
        return <PersonalDataScreen onBack={() => setActiveScreen('menu')} />;
      case 'security':
        return <SecurityScreen onBack={() => setActiveScreen('menu')} />;
      case 'vehicles':
        return <VehiclesScreen onBack={() => setActiveScreen('menu')} />;
      default:
        return (
          <div className="space-y-8 page-transition pb-32 pt-safe-area-top">
            <div className="text-center space-y-4 pt-6">
              <div className="relative inline-block">
                <div className="h-28 w-28 rounded-full bg-primary/10 mx-auto flex items-center justify-center text-primary text-4xl font-bold border-4 border-white shadow-xl">
                  L
                </div>
                <div className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-secondary border-4 border-white flex items-center justify-center text-white shadow-md">
                  ✓
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Lucas Silveira</h2>
                <p className="text-sm text-muted-foreground font-medium">
                  {mode === 'traveler' ? 'Nível 5 • Super Viajante' : 'Remetente Frequente'}
                </p>
              </div>
            </div>

            <section className="space-y-3 px-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Painel do Usuário</h3>
              <Card className="rounded-[2.5rem] border-none shadow-sm bg-muted/30">
                <CardContent className="p-2 space-y-2">
                  <div className="flex items-center justify-between p-5 bg-white rounded-[2rem] shadow-sm">
                    <div className="space-y-0.5">
                      <Label className="text-base font-bold">Modo de Uso</Label>
                      <p className="text-xs text-muted-foreground">
                        {mode === 'sender' ? "Você está como Remetente" : "Você está como Viajante"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("text-[10px] font-bold uppercase transition-colors", mode === 'sender' ? 'text-primary' : 'text-muted-foreground')}>Mandar</span>
                      <Switch 
                        checked={mode === 'traveler'} 
                        onCheckedChange={(checked) => onModeChange(checked ? 'traveler' : 'sender')}
                        className="data-[state=checked]:bg-secondary"
                      />
                      <span className={cn("text-[10px] font-bold uppercase transition-colors", mode === 'traveler' ? 'text-secondary' : 'text-muted-foreground')}>Viajar</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-2 px-4">
              <button 
                onClick={() => setActiveScreen('personal')}
                className="w-full flex items-center justify-between p-4 bg-muted/20 rounded-3xl active:scale-[0.98] transition-all hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-500">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm">Meus Dados</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
              </button>

              <button 
                onClick={() => setActiveScreen('security')}
                className="w-full flex items-center justify-between p-4 bg-muted/20 rounded-3xl active:scale-[0.98] transition-all hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-green-50 text-green-500">
                    <Shield className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm">Segurança</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
              </button>

              {mode === 'traveler' && (
                <button 
                  onClick={() => setActiveScreen('vehicles')}
                  className="w-full flex items-center justify-between p-4 bg-muted/20 rounded-3xl active:scale-[0.98] transition-all hover:bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-500">
                      <Car className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm">Meus Veículos</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
                </button>
              )}

              <button className="w-full flex items-center justify-between p-4 bg-muted/20 rounded-3xl active:scale-[0.98] transition-all hover:bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-orange-50 text-orange-500">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm">Pagamentos</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
              </button>
              
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-between p-4 bg-red-50 rounded-3xl active:scale-[0.98] transition-all hover:bg-red-100 mt-4"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-white text-destructive">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm text-destructive">Sair da Conta</span>
                </div>
              </button>
            </section>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderScreen()}
    </div>
  );
}

function PersonalDataScreen({ onBack }: { onBack: () => void }) {
  const [docStatus, setDocStatus] = useState<'pending' | 'uploaded' | 'approved'>('pending');

  return (
    <div className="fixed inset-0 z-50 bg-background animate-in slide-in-from-right-full duration-300 overflow-y-auto pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-black tracking-tight">Meus Dados</h1>
      </header>

      <div className="p-4 space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
              LS
            </div>
            <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md border-2 border-background">
              <Camera className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nome Completo</Label>
            <Input defaultValue="Lucas Silveira" className="h-14 rounded-2xl bg-muted/30 border-none font-medium" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">E-mail</Label>
            <Input defaultValue="lucas.silveira@email.com" type="email" className="h-14 rounded-2xl bg-muted/30 border-none font-medium" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Telefone</Label>
            <Input defaultValue="(11) 98877-6655" type="tel" className="h-14 rounded-2xl bg-muted/30 border-none font-medium" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">CPF</Label>
            <Input defaultValue="123.456.789-00" disabled className="h-14 rounded-2xl bg-muted/30 border-none font-medium opacity-70" />
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold">Documentação</h3>
          <Card className="rounded-3xl border-2 border-dashed bg-muted/10">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              {docStatus === 'pending' ? (
                <>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Envie sua CNH ou RG</p>
                    <p className="text-xs text-muted-foreground mt-1">Necessário para verificação de identidade</p>
                  </div>
                  <Button onClick={() => setDocStatus('uploaded')} className="w-full rounded-2xl h-12 font-bold">
                    Escolher Arquivo
                  </Button>
                </>
              ) : docStatus === 'uploaded' ? (
                <>
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Em Análise</p>
                    <p className="text-xs text-muted-foreground mt-1">Seu documento está sendo verificado pela nossa equipe.</p>
                  </div>
                  <Button variant="outline" onClick={() => setDocStatus('pending')} className="w-full rounded-2xl h-12 font-bold">
                    Enviar Novamente
                  </Button>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Documento Aprovado</p>
                    <p className="text-xs text-muted-foreground mt-1">Sua identidade foi verificada com sucesso.</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Button className="w-full h-14 rounded-2xl font-bold text-lg mt-8">
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}

function SecurityScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-background animate-in slide-in-from-right-full duration-300 overflow-y-auto pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-black tracking-tight">Segurança</h1>
      </header>

      <div className="p-4 space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Autenticação</h3>
          
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Senha Atual</Label>
            <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl bg-muted/30 border-none font-medium" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nova Senha</Label>
            <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl bg-muted/30 border-none font-medium" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Confirmar Nova Senha</Label>
            <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl bg-muted/30 border-none font-medium" />
          </div>
          
          <Button className="w-full h-14 rounded-2xl font-bold mt-2">
            Atualizar Senha
          </Button>
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Configurações Adicionais</h3>
          
          <Card className="rounded-3xl border-none bg-muted/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Autenticação em 2 Fatores</Label>
                  <p className="text-xs text-muted-foreground">Maior segurança para sua conta</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Biometria / Face ID</Label>
                  <p className="text-xs text-muted-foreground">Acesso rápido pelo celular</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-8">
          <Button variant="destructive" className="w-full h-14 rounded-2xl font-bold bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none">
            Excluir Minha Conta
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Esta ação é irreversível e apagará todos os seus dados.
          </p>
        </div>
      </div>
    </div>
  );
}

function VehiclesScreen({ onBack }: { onBack: () => void }) {
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [vehicles, setVehicles] = useState([
    { id: 1, type: 'Carro', model: 'Honda Civic', plate: 'ABC-1234', color: 'Prata', status: 'approved' },
    { id: 2, type: 'Moto', model: 'Honda CG 160', plate: 'XYZ-9876', color: 'Vermelha', status: 'pending' }
  ]);

  if (isAddingVehicle) {
    return (
      <VehicleForm 
        onBack={() => setIsAddingVehicle(false)} 
        onComplete={(newVehicle) => {
          setVehicles([...vehicles, { id: Date.now(), type: 'Carro', status: 'pending', ...newVehicle }]);
          setIsAddingVehicle(false);
        }} 
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background animate-in slide-in-from-right-full duration-300 overflow-y-auto pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-black tracking-tight">Meus Veículos</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="rounded-3xl border-none bg-muted/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{vehicle.model}</h3>
                      <p className="text-xs text-muted-foreground font-medium">{vehicle.plate} • {vehicle.color}</p>
                    </div>
                  </div>
                  {vehicle.status === 'approved' ? (
                    <div className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Aprovado
                    </div>
                  ) : (
                    <div className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Em Análise
                    </div>
                  )}
                </div>
                <div className="bg-white/50 px-4 py-3 border-t flex justify-end gap-2">
                  <Button variant="ghost" size="sm" className="text-xs font-bold h-8 rounded-xl">Editar</Button>
                  <Button variant="ghost" size="sm" className="text-xs font-bold h-8 rounded-xl text-destructive hover:text-destructive">Remover</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button 
          onClick={() => setIsAddingVehicle(true)}
          className="w-full h-14 rounded-2xl font-bold text-lg border-2 border-dashed border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 shadow-none"
        >
          + Adicionar Novo Veículo
        </Button>
      </div>
    </div>
  );
}

function VehicleForm({ onBack, onComplete }: { onBack: () => void, onComplete: (vehicle: any) => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    color: '',
    plate: ''
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else onComplete(formData);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onBack();
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.brand.trim().length > 0;
      case 2: return formData.model.trim().length > 0;
      case 3: return formData.color.trim().length > 0;
      case 4: return formData.plate.trim().length > 0;
      default: return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background animate-in slide-in-from-bottom-full duration-300 flex flex-col overflow-y-auto">
      <header className="px-4 py-4 flex items-center justify-between border-b">
        <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={cn("h-1.5 w-8 rounded-full transition-colors", step >= i ? "bg-primary" : "bg-muted")} />
          ))}
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="flex-1 p-6 flex flex-col">
        <div className="flex-1">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">Qual a marca do veículo?</h2>
                <p className="text-muted-foreground text-sm">Ex: Honda, Toyota, Volkswagen...</p>
              </div>
              <Input 
                autoFocus
                placeholder="Digite a marca" 
                className="h-14 rounded-2xl bg-muted/30 border-none font-medium text-lg"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">Qual o modelo?</h2>
                <p className="text-muted-foreground text-sm">Ex: Civic, Corolla, Gol...</p>
              </div>
              <Input 
                autoFocus
                placeholder="Digite o modelo" 
                className="h-14 rounded-2xl bg-muted/30 border-none font-medium text-lg"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">Qual a cor?</h2>
                <p className="text-muted-foreground text-sm">Ex: Prata, Preto, Branco...</p>
              </div>
              <Input 
                autoFocus
                placeholder="Digite a cor" 
                className="h-14 rounded-2xl bg-muted/30 border-none font-medium text-lg"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">Qual a placa?</h2>
                <p className="text-muted-foreground text-sm">Digite a placa do veículo</p>
              </div>
              <Input 
                autoFocus
                placeholder="ABC-1234" 
                className="h-14 rounded-2xl bg-muted/30 border-none font-medium text-lg uppercase"
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
              />
            </div>
          )}
        </div>

        <div className="pt-6 pb-safe-area-bottom pb-24">
          <Button 
            className="w-full h-14 rounded-2xl font-bold text-lg"
            onClick={handleNext}
            disabled={!isStepValid()}
          >
            {step === 4 ? 'Concluir Cadastro' : 'Próximo'}
          </Button>
        </div>
      </div>
    </div>
  );
}
