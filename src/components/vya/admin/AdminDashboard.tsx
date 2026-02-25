"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, Route, Settings, ShieldCheck, Plus, Search, MoreVertical, 
  Edit2, Trash2, MapPin, CheckCircle2, AlertCircle, LayoutDashboard, 
  LogOut, TrendingUp, Package, Clock, Bell, ChevronDown, 
  ChevronRight, ArrowRight, Building2, CircleDollarSign, Filter, Download,
  Wallet, Percent, ShieldAlert, BellRing, DollarSign, Car, Send
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import { PREDEFINED_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { SafePoint } from "./SafePointsMap";

const SafePointsMap = dynamic(() => import("./SafePointsMap"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400 font-bold">Carregando mapa...</div>
});

interface AdminDashboardProps {
  onLogout?: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, packages: 0, trips: 0, revenue: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [userFilter, setUserFilter] = useState('all');
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [userToVerify, setUserToVerify] = useState<any | null>(null);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<any | null>(null);
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [isAddCityDialogOpen, setIsAddCityDialogOpen] = useState(false);
  const [newCity, setNewCity] = useState({ name: '', state: '', status: 'active' });
  const [pendingPoints, setPendingPoints] = useState<SafePoint[]>([]);
  const [isSavingPoints, setIsSavingPoints] = useState(false);

  const { toast } = useToast();

  const [routes, setRoutes] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [newNotification, setNewNotification] = useState({ title: '', message: '', target: 'all' });
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch users and their pending documents/vehicles
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          *,
          documents(id, status, document_type, document_url),
          vehicles(id, status, type, brand, model, plate)
        `)
        .order('created_at', { ascending: false });

      if (profiles) {
        const mappedUsers = profiles.map(p => {
          const hasPendingDocs = p.documents?.some((d: any) => d.status === 'pending');
          const hasPendingVehicles = p.vehicles?.some((v: any) => v.status === 'pending');
          const isPending = hasPendingDocs || hasPendingVehicles;
          
          return {
            id: p.id,
            name: p.full_name,
            email: p.email || 'Sem email',
            role: p.role === 'admin' ? 'Admin' : (p.vehicles?.length > 0 ? 'Viajante' : 'Remetente'),
            status: isPending ? 'Pending' : 'Verified',
            orders: 0, // We could fetch this from packages/trips
            date: new Date(p.created_at).toLocaleDateString('pt-BR'),
            vehicle: p.vehicles?.[0]?.type || null,
            documents: p.documents,
            vehicles: p.vehicles
          };
        });
        setUsers(mappedUsers);
      }

      // Fetch stats
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: packagesCount } = await supabase.from('packages').select('*', { count: 'exact', head: true });
      const { count: tripsCount } = await supabase.from('trips').select('*', { count: 'exact', head: true });
      
      // Fetch notifications
      const { data: notifs } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(10);
      if (notifs) setNotifications(notifs);

      // Fetch cities + safe_points
      const { data: citiesData } = await supabase.from('cities').select('*').order('name', { ascending: true });
      const { data: safePointsData } = await supabase.from('safe_points').select('*');
      if (citiesData) {
        const citiesWithPoints = citiesData.map(city => ({
          ...city,
          safePoints: (safePointsData ?? []).filter(sp => sp.city_id === city.id)
        }));
        setCities(citiesWithPoints);
      }

      // Fetch pricing config
      const { data: pricingData } = await supabase.from('configs').select('value').eq('key', 'pricing_table').maybeSingle();
      if (pricingData?.value) setPricingTable(pricingData.value);

      // Fetch platform fee
      const { data: feeData } = await supabase.from('configs').select('value').eq('key', 'platform_fee_percent').maybeSingle();
      if (feeData?.value != null) setPlatformFeePercent(Number(feeData.value));

      // Fetch routes
      const { data: routesData } = await supabase.from('routes').select('*').order('created_at', { ascending: false });
      if (routesData && routesData.length > 0) setRoutes(routesData);

      // Fetch transactions
      const { data: transactionsData } = await supabase.from('transactions').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(20);
      if (transactionsData && transactionsData.length > 0) {
        setTransactions(transactionsData.map(t => ({
          id: t.id.substring(0, 8).toUpperCase(),
          date: new Date(t.created_at).toLocaleString('pt-BR'),
          user: t.profiles?.full_name || 'Usuário',
          type: t.type,
          amount: t.amount,
          status: t.status
        })));
      }

      setStats({
        users: usersCount || 0,
        packages: packagesCount || 0,
        trips: tripsCount || 0,
        revenue: 0 // Calculate from packages later
      });
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePoints = async () => {
    if (!selectedCity) return;
    setIsSavingPoints(true);
    try {
      // Delete all existing points for this city
      await supabase.from('safe_points').delete().eq('city_id', selectedCity.id);

      // Insert all current points
      if (pendingPoints.length > 0) {
        const toInsert = pendingPoints.map(p => ({
          city_id: selectedCity.id,
          lat: p.lat,
          lng: p.lng,
          name: p.name,
        }));
        const { error } = await supabase.from('safe_points').insert(toInsert);
        if (error) throw error;
      }

      // Update local cities state
      const { data: freshPoints } = await supabase.from('safe_points').select('*').eq('city_id', selectedCity.id);
      setCities(prev => prev.map(c =>
        c.id === selectedCity.id ? { ...c, safePoints: freshPoints ?? [] } : c
      ));
      setIsMapDialogOpen(false);
    } catch (err) {
      console.error('Erro ao salvar pontos seguros:', err);
    } finally {
      setIsSavingPoints(false);
    }
  };

  const [isAddRouteDialogOpen, setIsAddRouteDialogOpen] = useState(false);
  const [isAddingRoute, setIsAddingRoute] = useState(false);
  const [newRoute, setNewRoute] = useState({
    origin: '',
    destination: '',
    distanceKm: '',
    averageDurationMin: '',
    waypoints: [] as string[]
  });

  const [pricingTable, setPricingTable] = useState({
    P: { ate150: 35.00, de151a300: 55.00, aPartir301: 85.00, insurance: 9.90 },
    M: { ate150: 55.00, de151a300: 85.00, aPartir301: 130.00, insurance: 14.90 },
    G: { ate150: 85.00, de151a300: 130.00, aPartir301: 190.00, insurance: 24.90 },
  });
  const [platformFeePercent, setPlatformFeePercent] = useState<number>(20);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const { error: e1 } = await supabase
        .from('configs')
        .upsert({ key: 'pricing_table', value: pricingTable }, { onConflict: 'key' });
      if (e1) throw e1;

      const { error: e2 } = await supabase
        .from('configs')
        .upsert({ key: 'platform_fee_percent', value: platformFeePercent }, { onConflict: 'key' });
      if (e2) throw e2;

      toast({ title: 'Configurações salvas!', description: 'Tabela de preços e taxas atualizadas com sucesso.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: err?.message ?? 'Tente novamente.' });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddCity = async () => {
    if (!newCity.name || !newCity.state) return;
    try {
      const { data, error } = await supabase
        .from('cities')
        .insert([{
          name: newCity.name,
          state: newCity.state,
          status: newCity.status,
          hubs: 0,
          lat: -14.2350,
          lng: -51.9253
        }])
        .select();

      if (error) throw error;
      if (data) {
        setCities([data[0], ...cities]);
      }
      setIsAddCityDialogOpen(false);
      setNewCity({ name: '', state: '', status: 'active' });
    } catch (error) {
      console.error("Erro ao adicionar cidade:", error);
    }
  };

  const handleAddRoute = async () => {
    if (!newRoute.origin || !newRoute.destination || !newRoute.distanceKm || !newRoute.averageDurationMin) {
      toast({ variant: "destructive", title: "Campos obrigatórios", description: "Preencha origem, destino, distância e duração." });
      return;
    }
    if (newRoute.origin === newRoute.destination) {
      toast({ variant: "destructive", title: "Rota inválida", description: "Origem e destino não podem ser iguais." });
      return;
    }
    setIsAddingRoute(true);
    try {
      const { data, error } = await supabase
        .from('routes')
        .insert([{
          origin: newRoute.origin,
          destination: newRoute.destination,
          distance_km: Number(newRoute.distanceKm),
          average_duration_min: Number(newRoute.averageDurationMin),
          waypoints: newRoute.waypoints,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      setRoutes(prev => [data, ...prev]);
      setIsAddRouteDialogOpen(false);
      setNewRoute({ origin: '', destination: '', distanceKm: '', averageDurationMin: '', waypoints: [] });
      toast({ title: "Rota criada!", description: `${newRoute.origin} → ${newRoute.destination} cadastrada com sucesso.` });
    } catch (error: any) {
      console.error("Erro ao adicionar rota:", error);
      toast({ variant: "destructive", title: "Erro ao criar rota", description: error?.message ?? "Verifique os dados e tente novamente." });
    } finally {
      setIsAddingRoute(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      // Aprovar todos os documentos pendentes do usuário
      await supabase
        .from('documents')
        .update({ status: 'approved' })
        .eq('user_id', userId)
        .eq('status', 'pending');

      // Aprovar todos os veículos pendentes do usuário
      await supabase
        .from('vehicles')
        .update({ status: 'approved' })
        .eq('user_id', userId)
        .eq('status', 'pending');

      // Atualizar a lista local
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'Verified' } : u));
      setIsVerifyDialogOpen(false);
    } catch (error) {
      console.error("Erro ao aprovar usuário:", error);
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      // Rejeitar todos os documentos pendentes do usuário
      await supabase
        .from('documents')
        .update({ status: 'rejected' })
        .eq('user_id', userId)
        .eq('status', 'pending');

      // Rejeitar todos os veículos pendentes do usuário
      await supabase
        .from('vehicles')
        .update({ status: 'rejected' })
        .eq('user_id', userId)
        .eq('status', 'pending');

      // Atualizar a lista local
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'Rejected' } : u));
      setIsVerifyDialogOpen(false);
    } catch (error) {
      console.error("Erro ao rejeitar usuário:", error);
    }
  };

  const handleSendNotification = async () => {
    if (!newNotification.title || !newNotification.message) return;
    setIsSendingNotification(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: null, // null means broadcast to all or specific role
            title: newNotification.title,
            message: newNotification.message,
            type: 'system',
            read: false,
            // We can use a metadata field to store the target audience if needed, 
            // but for now we just insert it. In a real app, you'd have a backend 
            // function to fan out notifications to specific users.
          }
        ])
        .select();

      if (error) throw error;

      if (data) {
        setNotifications([data[0], ...notifications]);
      }
      setNewNotification({ title: '', message: '', target: 'all' });
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
    } finally {
      setIsSendingNotification(false);
    }
  };

  const handleOpenVerifyDialog = (user: any) => {
    setUserToVerify(user);
    setIsVerifyDialogOpen(true);
  };

  const navItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'cities', label: 'Cidades', icon: Building2 },
    { id: 'routes', label: 'Rotas', icon: Route },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'financial', label: 'Financeiro', icon: CircleDollarSign },
    { id: 'notifications', label: 'Notificações', icon: BellRing },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  // --- RENDER FUNCTIONS ---

  const renderDashboard = () => {
    const dashboardStats = [
      { label: 'Envios Hoje', value: stats.packages.toString(), change: '+12%', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Usuários Ativos', value: stats.users.toString(), change: '+5%', icon: Users, color: 'text-primary', bg: 'bg-primary/5' },
      { label: 'Receita (Bruta)', value: `R$ ${stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, change: '+18%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'Viagens Ativas', value: stats.trips.toString(), change: '-2%', icon: Route, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tighter text-slate-800">Visão Geral da Operação</h2>
            <p className="text-slate-500 text-sm font-medium">Acompanhe o pulso da malha logística VYA em tempo real.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-12 rounded-[1.2rem] font-bold border-slate-200 hover:bg-slate-50 text-slate-600 gap-2">
              <Download className="h-4 w-4" /> Exportar Relatório
            </Button>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, i) => (
            <Card key={i} className="rounded-[2rem] border-none shadow-sm bg-white hover:shadow-md transition-all duration-300 group cursor-default">
              <CardContent className="p-6 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div className={cn("h-14 w-14 rounded-[1.2rem] flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3", stat.bg, stat.color)}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className={cn(
                    "border-none font-black text-[10px] px-2.5 py-1 rounded-full",
                    stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                  )}>
                    {stat.change}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</h4>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* RECENT ACTIVITY TABLES */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <Card className="xl:col-span-2 rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-slate-100 bg-slate-50/30">
              <div>
                <CardTitle className="text-xl font-black tracking-tight text-slate-800">Monitoramento de Rotas</CardTitle>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Viagens ativas no momento</p>
              </div>
              <Button variant="ghost" size="sm" className="text-[11px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 h-9 rounded-xl">
                Ver Mapa Completo <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="pl-8 font-bold text-xs uppercase tracking-widest text-slate-400 h-14">Rota ID</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-400">Trajeto</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.slice(0, 4).map((route) => (
                    <TableRow key={route.id} className="hover:bg-slate-50/80 transition-colors border-slate-100 group">
                      <TableCell className="pl-8 py-5">
                        <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{route.id.substring(0, 8).toUpperCase()}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">{route.origin}</span>
                          <ArrowRight className="h-3 w-3 text-slate-300" />
                          <span className="font-bold text-slate-700">{route.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          EM CURSO
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {routes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-slate-500 font-medium">
                        Nenhuma rota ativa no momento.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden flex flex-col">
            <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/30">
              <CardTitle className="text-xl font-black tracking-tight text-slate-800">Alertas do Sistema</CardTitle>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Atenção requerida</p>
            </CardHeader>
            <CardContent className="p-8 space-y-6 flex-1">
              {[
                { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50', title: 'Atraso Detectado', text: 'Viagem VY-9821 parada há 30 min', time: '12 min atrás' },
                { icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-50', title: 'Novos Cadastros', text: '5 motoristas aguardando verificação', time: '45 min atrás' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start group cursor-pointer">
                  <div className={cn("h-12 w-12 rounded-[1.2rem] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", item.bg, item.color)}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-black text-slate-800 leading-tight">{item.title}</p>
                    <p className="text-xs font-medium text-slate-500 leading-tight">{item.text}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* PENDING USERS */}
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-slate-100 bg-slate-50/30">
            <div>
              <CardTitle className="text-xl font-black tracking-tight text-slate-800">Aguardando Aprovação</CardTitle>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Usuários com documentação pendente</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setActiveTab('users');
                setUserFilter('pending');
              }}
              className="text-[11px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 h-9 rounded-xl"
            >
              Ver Todos <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableHead className="pl-8 font-bold text-xs uppercase tracking-widest text-slate-400 h-14">Usuário</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-400">Papel</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-400">Data de Cadastro</TableHead>
                  <TableHead className="text-right pr-8 font-bold text-xs uppercase tracking-widest text-slate-400">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.filter(u => u.status === 'Pending').slice(0, 5).map((user, i) => (
                  <TableRow key={i} className="hover:bg-slate-50/80 transition-colors border-slate-100 group">
                    <TableCell className="pl-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center font-black text-orange-600 shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{user.name}</p>
                          <p className="text-xs font-medium text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "border-none font-black text-[10px] uppercase px-3 py-1.5 rounded-md",
                        user.role === 'Viajante' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
                      )}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-bold text-slate-500">{user.date}</p>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setActiveTab('users');
                          setUserFilter('pending');
                        }}
                        className="h-8 rounded-lg font-bold bg-orange-100 text-orange-700 hover:bg-orange-200 hover:text-orange-800"
                      >
                        Analisar Docs
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.filter(u => u.status === 'Pending').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500 font-medium">
                      Nenhum usuário aguardando aprovação no momento.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCities = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter text-slate-800">Cidades Atendidas</h2>
          <p className="text-slate-500 text-sm font-medium">Gerencie as cidades onde a VYA opera e seus pontos de coleta (Hubs).</p>
        </div>
        <Button 
          onClick={() => setIsAddCityDialogOpen(true)}
          className="h-14 rounded-[1.5rem] font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 px-8 text-base"
        >
          <Plus className="h-5 w-5" /> Nova Cidade
        </Button>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-slate-100">
              <TableHead className="pl-8 font-bold text-xs uppercase tracking-widest text-slate-400 h-16">ID</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-400">Cidade / Estado</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-400">Hubs Ativos</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-400">Status</TableHead>
              <TableHead className="text-right pr-8 font-bold text-xs uppercase tracking-widest text-slate-400">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cities.map((city) => (
              <TableRow key={city.id} className="hover:bg-slate-50/80 transition-colors border-slate-100">
                <TableCell className="pl-8 py-6">
                  <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-md">{city.id.substring(0, 8).toUpperCase()}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm">{city.name}</p>
                      <p className="font-bold text-slate-400 text-xs">{city.state}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs font-bold border-none px-3 py-1 rounded-md">
                    {city.hubs} Hubs
                  </Badge>
                </TableCell>
                <TableCell>
                  {city.status === 'active' ? (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full w-fit">
                      <CheckCircle2 className="h-3.5 w-3.5" /> ATIVA
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full w-fit">
                      <AlertCircle className="h-3.5 w-3.5" /> INATIVA
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-all"
                      onClick={() => {
                        setSelectedCity(city);
                        setPendingPoints(city.safePoints ?? []);
                        setIsMapDialogOpen(true);
                      }}
                      title="Gerenciar Pontos Seguros"
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-primary/10 text-slate-500 hover:text-primary transition-all">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
        <DialogContent className="max-w-4xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8 border-b border-slate-100 bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-800">
                Pontos Seguros - {selectedCity?.name}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Clique no mapa para adicionar novos pontos de encontro seguros para os viajantes e remetentes.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 bg-slate-50">
            {selectedCity && (
              <SafePointsMap 
                cityCenter={[selectedCity.lat, selectedCity.lng]} 
                initialPoints={selectedCity.safePoints}
                onPointsChange={(points) => setPendingPoints(points)}
              />
            )}
          </div>
          <DialogFooter className="p-6 bg-white border-t border-slate-100">
            <Button 
              variant="outline" 
              onClick={() => setIsMapDialogOpen(false)}
              disabled={isSavingPoints}
              className="h-12 rounded-xl font-bold"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSavePoints}
              disabled={isSavingPoints}
              className="h-12 rounded-xl font-black bg-primary hover:bg-primary/90 px-8"
            >
              {isSavingPoints ? (
                <><span className="animate-spin mr-2">⏳</span> Salvando...</>
              ) : (
                'Salvar Pontos'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddCityDialogOpen} onOpenChange={setIsAddCityDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-800">Nova Cidade</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Cadastre uma nova cidade para operação da VYA.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 bg-slate-50 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Nome da Cidade</label>
              <Input 
                placeholder="Ex: São Paulo" 
                className="h-14 rounded-xl bg-white border-slate-200 font-medium"
                value={newCity.name}
                onChange={(e) => setNewCity({...newCity, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Estado (UF)</label>
              <Input 
                placeholder="Ex: SP" 
                maxLength={2}
                className="h-14 rounded-xl bg-white border-slate-200 font-medium uppercase"
                value={newCity.state}
                onChange={(e) => setNewCity({...newCity, state: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Status Inicial</label>
              <select 
                className="flex h-14 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={newCity.status}
                onChange={(e) => setNewCity({...newCity, status: e.target.value})}
              >
                <option value="active">Ativa</option>
                <option value="inactive">Inativa</option>
              </select>
            </div>
          </div>
          <DialogFooter className="p-6 bg-white border-t border-slate-100">
            <Button 
              variant="outline" 
              onClick={() => setIsAddCityDialogOpen(false)} 
              className="h-12 rounded-xl font-bold"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddCity} 
              className="h-12 rounded-xl font-black bg-primary hover:bg-primary/90 px-8"
            >
              Cadastrar Cidade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderRoutes = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter text-slate-800">Cálculo de Rotas</h2>
          <p className="text-slate-500 text-sm font-medium">Crie e gerencie as rotas oficiais, definindo distâncias e preços base.</p>
        </div>
        <Button 
          onClick={() => setIsAddRouteDialogOpen(true)}
          className="h-14 rounded-[1.5rem] font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 px-8 text-base"
        >
          <Plus className="h-5 w-5" /> Nova Rota
        </Button>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-slate-100">
              <TableHead className="pl-8 font-bold text-xs uppercase tracking-widest text-slate-400 h-16">ID</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-400">Trajeto Principal</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-400">Métricas</TableHead>
              <TableHead className="text-right pr-8 font-bold text-xs uppercase tracking-widest text-slate-400">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.map((route) => (
              <TableRow key={route.id} className="hover:bg-slate-50/80 transition-colors border-slate-100">
                <TableCell className="pl-8 py-6">
                  <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-md">{route.id.substring(0, 8).toUpperCase()}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                      <Route className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm">{route.origin}</p>
                      <p className="font-black text-slate-800 text-sm">{route.destination}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <MapPin className="h-4 w-4 text-slate-400" /> {route.distance_km || route.distanceKm} km
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-slate-400" /> {Math.floor((route.average_duration_min || route.averageDurationMin) / 60)}h {(route.average_duration_min || route.averageDurationMin) % 60}m
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-primary/10 text-slate-500 hover:text-primary transition-all">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-500 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isAddRouteDialogOpen} onOpenChange={setIsAddRouteDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-800">Nova Rota</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Cadastre uma nova rota oficial para cálculo de preços e distâncias.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 bg-slate-50 space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Cidade de Origem</label>
                <select 
                  className="flex h-14 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={newRoute.origin}
                  onChange={(e) => setNewRoute({...newRoute, origin: e.target.value})}
                >
                  <option value="" disabled>Selecione a origem</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.name}>{city.name} - {city.state}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Cidade de Destino</label>
                <select 
                  className="flex h-14 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={newRoute.destination}
                  onChange={(e) => setNewRoute({...newRoute, destination: e.target.value})}
                >
                  <option value="" disabled>Selecione o destino</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.name}>{city.name} - {city.state}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Distância (km)</label>
                <Input 
                  type="number"
                  placeholder="Ex: 135" 
                  className="h-14 rounded-xl bg-white border-slate-200 font-medium"
                  value={newRoute.distanceKm}
                  onChange={(e) => setNewRoute({...newRoute, distanceKm: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Duração Média (minutos)</label>
                <Input 
                  type="number"
                  placeholder="Ex: 120" 
                  className="h-14 rounded-xl bg-white border-slate-200 font-medium"
                  value={newRoute.averageDurationMin}
                  onChange={(e) => setNewRoute({...newRoute, averageDurationMin: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Cidades no Caminho (Opcional)</label>
              <div className="space-y-2">
                {cities.filter(c => c.name !== newRoute.origin && c.name !== newRoute.destination).map(city => (
                  <label key={city.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      checked={newRoute.waypoints.includes(city.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewRoute({...newRoute, waypoints: [...newRoute.waypoints, city.name]});
                        } else {
                          setNewRoute({...newRoute, waypoints: newRoute.waypoints.filter(w => w !== city.name)});
                        }
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{city.name} - {city.state}</p>
                      {city.safePoints.length > 0 && (
                        <p className="text-[10px] font-medium text-slate-500">{city.safePoints.length} pontos seguros cadastrados</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-2">Selecione as cidades intermediárias onde o viajante pode fazer paradas.</p>
            </div>
          </div>
          <DialogFooter className="p-6 bg-white border-t border-slate-100">
            <Button 
              variant="outline" 
              onClick={() => setIsAddRouteDialogOpen(false)} 
              className="h-12 rounded-xl font-bold"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddRoute} 
              disabled={isAddingRoute}
              className="h-12 rounded-xl font-black bg-primary hover:bg-primary/90 px-8"
            >
              {isAddingRoute ? (
                <><span className="animate-spin mr-2">⏳</span> Salvando...</>
              ) : (
                'Cadastrar Rota'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter text-slate-800">Gerenciar Usuários</h2>
          <p className="text-slate-500 text-sm font-medium">Controle de remetentes, viajantes e verificações de segurança.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input placeholder="Buscar por nome, email ou CPF..." className="pl-12 h-14 w-80 rounded-[1.2rem] bg-slate-50 border-slate-200 font-medium focus-visible:ring-primary/20" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-14 rounded-[1.2rem] font-bold border-slate-200 hover:bg-slate-50 text-slate-600 px-6 gap-2">
                <Filter className="h-4 w-4" /> 
                {userFilter === 'all' ? 'Todos' : userFilter === 'pending' ? 'Pendentes' : 'Verificados'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-[1.2rem] border-none shadow-xl p-2 min-w-[200px]">
              <DropdownMenuItem onClick={() => setUserFilter('all')} className="rounded-xl font-bold text-sm p-3 cursor-pointer hover:bg-slate-50">Todos os Usuários</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setUserFilter('pending')} className="rounded-xl font-bold text-sm p-3 cursor-pointer hover:bg-slate-50">Aguardando Aprovação</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setUserFilter('verified')} className="rounded-xl font-bold text-sm p-3 cursor-pointer hover:bg-slate-50">Verificados</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-slate-100">
              <TableHead className="pl-8 py-6 font-bold text-xs uppercase tracking-widest text-slate-400">Usuário</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-400">Papel Principal</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-400">Status de Verificação</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-400">Atividade</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-400">Cadastro</TableHead>
              <TableHead className="text-right pr-8 font-bold text-xs uppercase tracking-widest text-slate-400">Gerir</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users
              .filter(u => userFilter === 'all' ? true : userFilter === 'pending' ? u.status === 'Pending' : u.status === 'Verified')
              .map((user, i) => (
              <TableRow key={i} className="hover:bg-slate-50/80 transition-colors border-slate-100">
                <TableCell className="pl-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-[1.2rem] bg-slate-100 flex items-center justify-center font-black text-lg text-slate-400 shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{user.name}</p>
                      <p className="text-xs font-medium text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn(
                    "border-none font-black text-[10px] uppercase px-3 py-1.5 rounded-md",
                    user.role === 'Viajante' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
                  )}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.status === 'Verified' ? (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full w-fit">
                      <CheckCircle2 className="h-3.5 w-3.5" /> VERIFICADO
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full w-fit">
                      <AlertCircle className="h-3.5 w-3.5" /> PENDENTE
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-700">{user.orders}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Envios</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-xs font-bold text-slate-500">{user.date}</p>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex items-center justify-end gap-2">
                    {user.status === 'Pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleOpenVerifyDialog(user)}
                        className="h-10 rounded-xl font-bold bg-orange-100 text-orange-700 hover:bg-orange-200 hover:text-orange-800"
                      >
                        Analisar Docs
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500"><MoreVertical className="h-5 w-5" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-[1.2rem] border-none shadow-xl p-2 min-w-[200px]">
                        <DropdownMenuItem className="rounded-xl gap-3 font-bold text-sm p-3 cursor-pointer hover:bg-slate-50"><Edit2 className="h-4 w-4 text-slate-400" /> Editar Perfil</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenVerifyDialog(user)} className="rounded-xl gap-3 font-bold text-sm p-3 cursor-pointer hover:bg-slate-50"><ShieldCheck className="h-4 w-4 text-slate-400" /> Verificar Docs</DropdownMenuItem>
                        <div className="h-px bg-slate-100 my-1 mx-2" />
                        <DropdownMenuItem className="rounded-xl gap-3 font-bold text-sm p-3 cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"><Trash2 className="h-4 w-4" /> Suspender Conta</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {users.filter(u => userFilter === 'all' ? true : userFilter === 'pending' ? u.status === 'Pending' : u.status === 'Verified').length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500 font-medium">
                  Nenhum usuário encontrado com este filtro.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent className="max-w-3xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8 border-b border-slate-100 bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-800">
                Verificação de Documentos
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Analise os documentos enviados por {userToVerify?.name} para aprovar ou rejeitar o cadastro.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-8 bg-slate-50/50 space-y-8 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Foto do Usuário (Selfie)
                </label>
                <div className="aspect-[4/3] rounded-2xl bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                  <img src="https://picsum.photos/seed/selfie/800/600" alt="Foto do Usuário" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm" className="rounded-xl font-bold">Ampliar</Button>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> RG ou CNH (Frente)
                </label>
                <div className="aspect-[4/3] rounded-2xl bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                  <img src="https://picsum.photos/seed/doc-front/800/600" alt="Doc Frente" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm" className="rounded-xl font-bold">Ampliar</Button>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> RG ou CNH (Verso)
                </label>
                <div className="aspect-[4/3] rounded-2xl bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                  <img src="https://picsum.photos/seed/doc-back/800/600" alt="Doc Verso" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm" className="rounded-xl font-bold">Ampliar</Button>
                  </div>
                </div>
              </div>
              {userToVerify?.vehicle && (
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Car className="h-4 w-4 text-primary" /> Documento Veicular (CRLV)
                  </label>
                  <div className="aspect-[4/3] rounded-2xl bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                    <img src="https://picsum.photos/seed/vehicle/800/600" alt="Documento Veicular" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm" className="rounded-xl font-bold">Ampliar</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="font-bold text-slate-800">Dados Extraídos</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 font-medium">Nome Completo</p>
                  <p className="font-black text-slate-800">{userToVerify?.name}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">CPF</p>
                  <p className="font-black text-slate-800">***.456.789-**</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Data de Nascimento</p>
                  <p className="font-black text-slate-800">15/08/1990</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Papel</p>
                  <p className="font-black text-slate-800">{userToVerify?.role}</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-white border-t border-slate-100 flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={() => setIsVerifyDialogOpen(false)} 
              className="h-12 rounded-xl font-bold"
            >
              Cancelar
            </Button>
            <div className="flex gap-3">
              <Button 
                onClick={() => userToVerify && handleRejectUser(userToVerify.email)} 
                className="h-12 rounded-xl font-black bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-8"
              >
                Rejeitar Docs
              </Button>
              <Button 
                onClick={() => userToVerify && handleApproveUser(userToVerify.email)} 
                className="h-12 rounded-xl font-black bg-green-500 hover:bg-green-600 text-white px-8"
              >
                Aprovar Cadastro
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderFinancial = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter text-slate-800">Controle Financeiro</h2>
          <p className="text-slate-500 text-sm font-medium">Acompanhe receitas, taxas da plataforma e repasses aos viajantes.</p>
        </div>
        <Button className="h-14 rounded-[1.5rem] font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 px-8 text-base">
          <Download className="h-5 w-5" /> Relatório Mensal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[2rem] border-none shadow-sm bg-white">
          <CardContent className="p-8 flex flex-col gap-4">
            <div className="h-14 w-14 rounded-[1.2rem] bg-green-50 text-green-600 flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Receita Total (Mês)</p>
              <h4 className="text-4xl font-black text-slate-800 tracking-tighter mt-1">R$ 45.200</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-none shadow-sm bg-white">
          <CardContent className="p-8 flex flex-col gap-4">
            <div className="h-14 w-14 rounded-[1.2rem] bg-primary/10 text-primary flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Lucro VYA (Taxas)</p>
              <h4 className="text-4xl font-black text-slate-800 tracking-tighter mt-1">R$ 9.040</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-none shadow-sm bg-white">
          <CardContent className="p-8 flex flex-col gap-4">
            <div className="h-14 w-14 rounded-[1.2rem] bg-orange-50 text-orange-600 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Saques Pendentes</p>
              <h4 className="text-4xl font-black text-slate-800 tracking-tighter mt-1">R$ 3.450</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/30">
          <CardTitle className="text-xl font-black tracking-tight text-slate-800">Últimas Transações</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-slate-100">
              <TableHead className="pl-8 py-6 font-bold text-xs uppercase tracking-widest text-slate-400">ID / Data</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-400">Usuário</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-400">Tipo</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-400">Valor</TableHead>
              <TableHead className="text-right pr-8 font-bold text-xs uppercase tracking-widest text-slate-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? transactions.map((trx) => (
              <TableRow key={trx.id} className="hover:bg-slate-50/80 transition-colors border-slate-100">
                <TableCell className="pl-8 py-5">
                  <p className="font-mono text-[11px] font-bold text-slate-500">{trx.id}</p>
                  <p className="text-xs font-medium text-slate-400 mt-1">{trx.date}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-black text-slate-800">{trx.user}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn(
                    "border-none font-black text-[10px] uppercase px-3 py-1.5 rounded-md",
                    trx.type === 'payment' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                  )}>
                    {trx.type === 'payment' ? 'Pagamento Recebido' : 'Saque Viajante'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-black text-slate-800">R$ {trx.amount.toFixed(2)}</p>
                </TableCell>
                <TableCell className="text-right pr-8">
                  {trx.status === 'completed' ? (
                    <div className="flex items-center justify-end gap-1.5 text-[10px] font-black text-green-600">
                      <CheckCircle2 className="h-4 w-4" /> CONCLUÍDO
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-1.5 text-[10px] font-black text-orange-600">
                      <Clock className="h-4 w-4" /> PENDENTE
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500 font-medium">
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter text-slate-800">Central de Notificações</h2>
          <p className="text-slate-500 text-sm font-medium">Crie e envie notificações push para os usuários do aplicativo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-sm bg-white">
          <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-[1.2rem] bg-primary/10 text-primary flex items-center justify-center">
                <Send className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black tracking-tight text-slate-800">Novo Disparo</CardTitle>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure a mensagem e o público-alvo</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Público-Alvo</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input type="radio" name="target" value="all" checked={newNotification.target === 'all'} onChange={(e) => setNewNotification({...newNotification, target: e.target.value})} className="h-4 w-4 text-primary focus:ring-primary border-slate-300" />
                  <span className="font-bold text-slate-800 text-sm">Todos os Usuários</span>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input type="radio" name="target" value="travelers" checked={newNotification.target === 'travelers'} onChange={(e) => setNewNotification({...newNotification, target: e.target.value})} className="h-4 w-4 text-primary focus:ring-primary border-slate-300" />
                  <span className="font-bold text-slate-800 text-sm">Apenas Viajantes</span>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input type="radio" name="target" value="senders" checked={newNotification.target === 'senders'} onChange={(e) => setNewNotification({...newNotification, target: e.target.value})} className="h-4 w-4 text-primary focus:ring-primary border-slate-300" />
                  <span className="font-bold text-slate-800 text-sm">Apenas Remetentes</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Título da Notificação</label>
              <Input 
                placeholder="Ex: Nova promoção de frete!" 
                value={newNotification.title}
                onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                className="h-14 rounded-xl bg-slate-50 border-slate-200 font-medium" 
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Mensagem</label>
              <textarea 
                placeholder="Digite o conteúdo da notificação push..." 
                value={newNotification.message}
                onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                className="w-full min-h-[120px] p-4 rounded-xl bg-slate-50 border border-slate-200 font-medium text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              />
            </div>

            <Button 
              onClick={handleSendNotification}
              disabled={isSendingNotification || !newNotification.title || !newNotification.message}
              className="w-full h-14 rounded-xl font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 text-base gap-2"
            >
              {isSendingNotification ? 'Enviando...' : <><Send className="h-5 w-5" /> Enviar Notificação Agora</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden flex flex-col">
          <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/30">
            <CardTitle className="text-xl font-black tracking-tight text-slate-800">Histórico de Disparos</CardTitle>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Últimas notificações enviadas</p>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            <div className="divide-y divide-slate-100">
              {notifications.length > 0 ? notifications.map((notif, i) => (
                <div key={i} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-sm">{notif.title}</h4>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none text-[10px] font-black uppercase">
                      {notif.type || 'Sistema'}
                    </Badge>
                  </div>
                  <p className="text-xs font-bold text-slate-400">{new Date(notif.created_at).toLocaleString('pt-BR')}</p>
                </div>
              )) : (
                <div className="p-6 text-center text-slate-500 text-sm font-medium">
                  Nenhuma notificação enviada ainda.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter text-slate-800">Configurações do Sistema</h2>
          <p className="text-slate-500 text-sm font-medium">Ajuste regras de negócio, taxas e parâmetros globais da plataforma.</p>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={isSavingSettings}
          className="h-14 rounded-[1.5rem] font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 px-8 text-base"
        >
          {isSavingSettings ? <><span className="animate-spin mr-2">⏳</span> Salvando...</> : 'Salvar Alterações'}
        </Button>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-[1.2rem] bg-green-50 text-green-600 flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-black tracking-tight text-slate-800">Tabela de Preços de Frete</CardTitle>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Valores base por tamanho e distância</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100">
                <TableHead className="pl-8 py-6 font-bold text-xs uppercase tracking-widest text-slate-400">Tamanho do Pacote</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-400">Até 150 km</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-400">De 151 a 300 km</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-400">A partir de 301 km</TableHead>
                <TableHead className="pr-8 font-bold text-xs uppercase tracking-widest text-slate-400">Seguro (R$)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(['P', 'M', 'G'] as const).map((size) => (
                <TableRow key={size} className="hover:bg-slate-50/80 transition-colors border-slate-100">
                  <TableCell className="pl-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-700">
                        {size}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Pacote {size}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {size === 'P' ? 'Até 5kg' : size === 'M' ? 'Até 15kg' : 'Acima de 15kg'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                      <Input 
                        type="number" 
                        value={pricingTable[size].ate150}
                        onChange={(e) => setPricingTable(prev => ({
                          ...prev,
                          [size]: { ...prev[size], ate150: Number(e.target.value) }
                        }))}
                        className="h-12 pl-10 rounded-xl bg-white border-slate-200 font-black text-slate-800 w-32" 
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                      <Input 
                        type="number" 
                        value={pricingTable[size].de151a300}
                        onChange={(e) => setPricingTable(prev => ({
                          ...prev,
                          [size]: { ...prev[size], de151a300: Number(e.target.value) }
                        }))}
                        className="h-12 pl-10 rounded-xl bg-white border-slate-200 font-black text-slate-800 w-32" 
                      />
                    </div>
                  </TableCell>
                  <TableCell className="pr-8">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                      <Input 
                        type="number" 
                        value={pricingTable[size].aPartir301}
                        onChange={(e) => setPricingTable(prev => ({
                          ...prev,
                          [size]: { ...prev[size], aPartir301: Number(e.target.value) }
                        }))}
                        className="h-12 pl-10 rounded-xl bg-white border-slate-200 font-black text-slate-800 w-32" 
                      />
                    </div>
                  </TableCell>
                  <TableCell className="pr-8">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                      <Input 
                        type="number"
                        step="0.01"
                        value={pricingTable[size].insurance}
                        onChange={(e) => setPricingTable(prev => ({
                          ...prev,
                          [size]: { ...prev[size], insurance: Number(e.target.value) }
                        }))}
                        className="h-12 pl-10 rounded-xl bg-green-50 border-green-200 font-black text-green-800 w-32" 
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white">
          <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-[1.2rem] bg-primary/10 text-primary flex items-center justify-center">
                <Percent className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black tracking-tight text-slate-800">Taxas e Comissões</CardTitle>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Regras de precificação</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Taxa da Plataforma (%)</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={platformFeePercent}
                onChange={(e) => setPlatformFeePercent(Number(e.target.value))}
                className="h-14 rounded-[1.2rem] bg-slate-50 border-slate-200 font-black text-lg"
              />
              <p className="text-xs text-slate-500 font-medium">Porcentagem adicionada ao frete base cobrada do remetente.</p>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Valor Mínimo de Saque (R$)</label>
              <Input defaultValue="50.00" className="h-14 rounded-[1.2rem] bg-slate-50 border-slate-200 font-black text-lg" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white">
          <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-[1.2rem] bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black tracking-tight text-slate-800">Segurança e Verificação</CardTitle>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Controle de acesso</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 rounded-[1.2rem] border border-slate-100 bg-slate-50">
              <div>
                <p className="font-bold text-slate-800 text-sm">Aprovação Automática</p>
                <p className="text-xs text-slate-500 mt-1">Aprovar remetentes sem revisão manual</p>
              </div>
              <div className="h-6 w-11 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-[1.2rem] border border-slate-100 bg-slate-50">
              <div>
                <p className="font-bold text-slate-800 text-sm">Verificação de CNH Obrigatória</p>
                <p className="text-xs text-slate-500 mt-1">Para todos os novos viajantes</p>
              </div>
              <div className="h-6 w-11 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-body">
      {/* SIDEBAR DESKTOP */}
      <aside className="w-72 bg-white border-r flex flex-col shrink-0 shadow-sm z-10">
        <div className="p-8 flex items-center gap-4 border-b border-slate-100">
          <div className="h-12 w-12 bg-primary rounded-[1.2rem] flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-800 leading-none">VYA ADMIN</h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Painel de Gestão</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-[1.2rem] text-sm font-bold transition-all duration-300 group",
                activeTab === item.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[0.98]" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-primary"
              )}
            >
              <item.icon className={cn("h-5 w-5 transition-transform", activeTab !== item.id && "group-hover:scale-110")} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden shrink-0">
              <img src="https://picsum.photos/seed/admin-user/100/100" alt="Admin" className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-800 truncate">Admin Master</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Gestor de Operações</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-red-500 bg-red-50 hover:bg-red-100 active:scale-95 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
        {/* TOP HEADER */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-4 bg-slate-100/50 px-5 py-3 rounded-[1.5rem] border border-slate-200/50 w-[28rem] focus-within:bg-white focus-within:border-primary/30 focus-within:shadow-sm focus-within:ring-4 focus-within:ring-primary/5 transition-all">
            <Search className="h-5 w-5 text-slate-400" />
            <input 
              placeholder="Pesquisar rotas, usuários, IDs de envio..." 
              className="bg-transparent border-none focus:outline-none text-sm font-medium w-full placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" className="h-12 rounded-[1.2rem] font-bold text-slate-600 border-slate-200 hover:bg-slate-50 gap-2">
              <Clock className="h-4 w-4" /> Últimos 30 dias
            </Button>
            <Button variant="ghost" size="icon" className="relative h-12 w-12 rounded-[1.2rem] bg-slate-100 hover:bg-slate-200 transition-colors">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-3 right-3 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-slate-100" />
            </Button>
          </div>
        </header>

        {/* CONTENT SCROLLABLE */}
        <main className="flex-1 overflow-y-auto p-10 no-scrollbar">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'cities' && renderCities()}
          {activeTab === 'routes' && renderRoutes()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'financial' && renderFinancial()}
          {activeTab === 'notifications' && renderNotifications()}
          {activeTab === 'settings' && renderSettings()}
        </main>
      </div>
    </div>
  );
}
