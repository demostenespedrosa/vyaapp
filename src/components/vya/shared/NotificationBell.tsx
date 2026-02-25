"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  Bell,
  BellRing,
  CheckCheck,
  Info,
  Megaphone,
  AlertTriangle,
  Package,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "system" | "promo" | "alert" | "shipment";
  read: boolean;
  created_at: string;
}

function typeIcon(type: Notification["type"]) {
  switch (type) {
    case "promo":    return <Megaphone className="h-4 w-4" />;
    case "alert":   return <AlertTriangle className="h-4 w-4" />;
    case "shipment":return <Package className="h-4 w-4" />;
    default:        return <Info className="h-4 w-4" />;
  }
}

function typeBg(type: Notification["type"]) {
  switch (type) {
    case "promo":    return "bg-purple-100 text-purple-600";
    case "alert":   return "bg-red-100 text-red-600";
    case "shipment":return "bg-blue-100 text-blue-600";
    default:        return "bg-secondary/10 text-secondary";
  }
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Agora mesmo";
  if (mins < 60) return `Há ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Há ${hrs}h`;
  return `Há ${Math.floor(hrs / 24)}d`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      setUserId(session.user.id);
      fetchNotifications(session.user.id);
      subscribeRealtime(session.user.id);
    })();

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, []);

  const fetchNotifications = async (uid: string) => {
    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, message, type, read, created_at")
      .or(`user_id.eq.${uid},user_id.is.null`)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) console.error("NotificationBell fetch error:", error.message);
    if (data) setNotifications(data as Notification[]);
  };

  const subscribeRealtime = (uid: string) => {
    channelRef.current = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const n = payload.new as Notification & { user_id: string | null };
          // Só exibe se for broadcast (null) ou para este usuário
          if (n.user_id === null || n.user_id === uid) {
            setNotifications(prev => [{ ...n, read: false }, ...prev]);
            // Vibração nativa no celular
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
          }
        }
      )
      .subscribe();
  };

  const markAllRead = async () => {
    if (!userId) return;
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", unreadIds);

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markOneRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="rounded-full bg-muted/30 h-10 w-10 hover:bg-muted/50 active:scale-90 transition-all relative"
      >
        {unread > 0 ? (
          <BellRing className="h-5 w-5 text-primary animate-wiggle" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-white text-[9px] font-black border-2 border-background">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm p-0 flex flex-col">
          <SheetHeader className="px-5 py-4 border-b flex-row items-center justify-between space-y-0">
            <SheetTitle className="text-lg font-black tracking-tight">Notificações</SheetTitle>
            <SheetDescription className="sr-only">Suas notificações recentes</SheetDescription>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllRead}
                  className="h-8 text-xs font-bold text-secondary hover:text-secondary gap-1 rounded-full"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Marcar tudo
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-8">
                <div className="h-16 w-16 rounded-full bg-muted/40 flex items-center justify-center">
                  <Bell className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="font-bold text-muted-foreground">Nenhuma notificação</p>
                <p className="text-xs text-muted-foreground/70">Você será notificado sobre seus envios e novidades aqui.</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => markOneRead(n.id)}
                    className={cn(
                      "w-full text-left px-5 py-4 flex gap-3 items-start hover:bg-muted/30 active:bg-muted/50 transition-colors",
                      !n.read && "bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                      typeBg(n.type)
                    )}>
                      {typeIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm leading-tight",
                          !n.read ? "font-black text-foreground" : "font-semibold text-muted-foreground"
                        )}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest pt-0.5">
                        {relativeTime(n.created_at)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
