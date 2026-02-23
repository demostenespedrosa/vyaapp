"use client";

import { useState } from "react";
import { 
  Users, 
  Route, 
  Settings, 
  ShieldCheck, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  MapPin,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  CreditCard,
  LogOut,
  TrendingUp,
  Package,
  Clock,
  Bell,
  ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { PREDEFINED_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AdminDashboardProps {
  onLogout?: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'routes', label: 'Rotas Oficiais', icon: Route },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'finance', label: 'Financeiro', icon: CreditCard },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const stats = [
    { label: 'Envios Hoje', value: '142', change: '+12%', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Usuários Ativos', value: '1,245', change: '+5%', icon: Users, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Receita (Bruta)', value: 'R$ 12.450', change: '+18%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Viagens Ativas', value: '28', change: '-2%', icon: Route, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-body">
      {/* SIDEBAR DESKTOP */}
      <aside className="w-64 bg-white border-r flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter text-slate-800">VYA ADMIN</h1>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Painel de Gestão</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === item.id 
                  ? "bg-primary text-white shadow-md shadow-primary/10" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-primary"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="h-5 w-5" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-20 bg-white border-b flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border w-96">
            <Search className="h-4 w-4 text-slate-400" />
            <input 
              placeholder="Pesquisar rotas, usuários ou envios..." 
              className="bg-transparent border-none focus:outline-none text-sm w-full"
            />
          </div>

          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl bg-slate-50">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>
            
            <div className="flex items-center gap-3 pl-6 border-l">
              <div className="text-right hidden xl:block">
                <p className="text-sm font-bold text-slate-800">Admin Master</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Gestor de Operações</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                <img src="https://picsum.photos/seed/admin-user/100/100" alt="Admin" />
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </header>

        {/* CONTENT SCROLLABLE */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Bem-vindo, Admin 👋</h2>
                  <p className="text-slate-500 text-sm">Aqui está o que está acontecendo na VYA agora.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="rounded-xl font-bold bg-white">Baixar Relatório</Button>
                  <Button className="rounded-xl font-bold">Nova Campanha</Button>
                </div>
              </div>

              {/* STATS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <Card key={i} className="rounded-[1.5rem] border-none shadow-sm overflow-hidden group hover:shadow-lg transition-all">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                        <stat.icon className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <h4 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h4>
                        <p className={cn("text-[10px] font-bold", stat.change.startsWith('+') ? 'text-green-600' : 'text-red-500')}>
                          {stat.change} <span className="text-slate-400 font-medium">vs último mês</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* RECENT ACTIVITY TABLES */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <Card className="xl:col-span-2 rounded-[2rem] border-none shadow-sm bg-white">
                  <CardHeader className="flex flex-row items-center justify-between p-8 border-b">
                    <CardTitle className="text-lg font-bold">Monitoramento de Rotas</CardTitle>
                    <Button variant="ghost" size="sm" className="text-primary font-bold">Ver todas</Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow>
                          <TableHead className="pl-8 font-bold">Rota ID</TableHead>
                          <TableHead className="font-bold">Origem/Destino</TableHead>
                          <TableHead className="font-bold">Paradas</TableHead>
                          <TableHead className="font-bold">Status</TableHead>
                          <TableHead className="text-right pr-8 font-bold">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {PREDEFINED_ROUTES.slice(0, 3).map((route) => (
                          <TableRow key={route.id} className="hover:bg-slate-50/50 transition-colors">
                            <TableCell className="pl-8 font-mono text-xs text-slate-400">{route.id}</TableCell>
                            <TableCell className="font-bold text-slate-700">{route.origin} → {route.destination}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {route.stops.slice(0, 2).map((s, i) => (
                                  <Badge key={i} variant="secondary" className="bg-slate-100 text-[9px] font-medium border-none">{s.split(',')[0]}</Badge>
                                ))}
                                {route.stops.length > 2 && <Badge variant="secondary" className="bg-slate-100 text-[9px] border-none">+{route.stops.length - 2}</Badge>}
                              </div>
                            </TableCell>
                            <TableCell><Badge className="bg-green-50 text-green-600 border-none">Ativa</Badge></TableCell>
                            <TableCell className="text-right pr-8">
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-sm bg-white">
                  <CardHeader className="p-8 border-b">
                    <CardTitle className="text-lg font-bold">Alertas Operacionais</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    {[
                      { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50', text: 'Viagem atrasada na Rota 1', time: '12 min atrás' },
                      { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', text: '5 Novos pedidos pendentes', time: '45 min atrás' },
                      { icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-50', text: 'Backup de dados concluído', time: '2h atrás' },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", item.bg, item.color)}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-700">{item.text}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{item.time}</p>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full rounded-xl mt-4">Ver todos os logs</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'routes' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Gestão de Rotas Oficiais</h2>
                  <p className="text-slate-500 text-sm">Configure os trajetos que a VYA atende com prioridade.</p>
                </div>
                <Button className="rounded-xl font-bold gap-2 h-12 px-6">
                  <Plus className="h-5 w-5" /> Nova Rota Oficial
                </Button>
              </div>

              <Card className="rounded-[2rem] border-none shadow-sm bg-white">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="pl-8 font-bold py-5">Identificador</TableHead>
                        <TableHead className="font-bold">Ponto de Partida</TableHead>
                        <TableHead className="font-bold">Destino Final</TableHead>
                        <TableHead className="font-bold">Cidades de Passagem</TableHead>
                        <TableHead className="font-bold">Métrica</TableHead>
                        <TableHead className="text-right pr-8 font-bold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {PREDEFINED_ROUTES.map((route) => (
                        <TableRow key={route.id} className="hover:bg-slate-50/50 transition-colors border-b">
                          <TableCell className="pl-8">
                            <span className="font-mono text-[10px] text-slate-400">{route.id}</span>
                          </TableCell>
                          <TableCell className="font-bold">{route.origin}</TableCell>
                          <TableCell className="font-bold">{route.destination}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {route.stops.map((s, i) => (
                                <Badge key={i} variant="secondary" className="bg-slate-100 text-[9px] font-medium border-none">{s}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-slate-700">{route.distanceKm} km</p>
                              <p className="text-[10px] text-slate-400">{Math.floor(route.averageDurationMin / 60)}h {route.averageDurationMin % 60}m</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-8">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-primary transition-all">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Diretório de Usuários</h2>
                  <p className="text-slate-500 text-sm">Gerencie remetentes, viajantes e suas verificações.</p>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Buscar por nome ou CPF..." className="pl-11 h-12 w-64 rounded-xl bg-slate-50 border-none" />
                  </div>
                  <Button variant="outline" className="rounded-xl font-bold h-12">Filtrar</Button>
                </div>
              </div>

              <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="pl-8 py-5 font-bold">Usuário</TableHead>
                      <TableHead className="font-bold">Papel Principal</TableHead>
                      <TableHead className="font-bold">Verificação</TableHead>
                      <TableHead className="font-bold">Atividade</TableHead>
                      <TableHead className="font-bold">Cadastro</TableHead>
                      <TableHead className="text-right pr-8 font-bold">Gerir</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: "Lucas Silveira", email: "lucas@email.com", role: "Viajante", status: "Verified", orders: 42, date: "15 Mai, 2024" },
                      { name: "Mariana Costa", email: "mariana@email.com", role: "Remetente", status: "Verified", orders: 15, date: "22 Mai, 2024" },
                      { name: "Ricardo Silva", email: "ricardo@email.com", role: "Viajante", status: "Pending", orders: 2, date: "01 Jun, 2024" },
                      { name: "Ana Paula", email: "ana@email.com", role: "Remetente", status: "Verified", orders: 8, date: "10 Jun, 2024" },
                      { name: "Felipe Mendes", email: "felipe@email.com", role: "Viajante", status: "Verified", orders: 124, date: "12 Jan, 2024" },
                    ].map((user, i) => (
                      <TableRow key={i} className="hover:bg-slate-50/50 transition-colors border-b">
                        <TableCell className="pl-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{user.name}</p>
                              <p className="text-xs text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "border-none font-bold text-[10px] uppercase px-3 py-1",
                            user.role === 'Viajante' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
                          )}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.status === 'Verified' ? (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit">
                              <CheckCircle2 className="h-3.5 w-3.5" /> VERIFICADO
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full w-fit">
                              <AlertCircle className="h-3.5 w-3.5" /> PENDENTE
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="text-xs font-bold text-slate-700">{user.orders} Envios</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs text-slate-400 font-medium">{user.date}</p>
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl border-none shadow-xl p-2 min-w-[160px]">
                              <DropdownMenuItem className="rounded-lg gap-2 font-medium cursor-pointer"><Edit2 className="h-4 w-4" /> Editar Perfil</DropdownMenuItem>
                              <DropdownMenuItem className="rounded-lg gap-2 font-medium cursor-pointer"><ShieldCheck className="h-4 w-4" /> Verificar Docs</DropdownMenuItem>
                              <DropdownMenuItem className="rounded-lg gap-2 font-medium cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Suspender Conta</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}