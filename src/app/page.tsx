
"use client";

import { useState } from "react";
import { Navbar } from "@/components/vya/layout/Navbar";
import { SenderView } from "@/components/vya/sender/SenderView";
import { TravelerView } from "@/components/vya/traveler/TravelerView";

export default function Home() {
  const [mode, setMode] = useState<'sender' | 'traveler'>('sender');

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar mode={mode} onToggle={setMode} />
      
      <main className="flex-1 container mx-auto px-4 py-8 animate-in fade-in duration-500">
        {mode === 'sender' ? (
          <SenderView />
        ) : (
          <TravelerView />
        )}
      </main>

      <footer className="border-t bg-muted/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 opacity-50">
              <div className="bg-foreground h-4 w-4 rounded-sm" />
              <span className="font-bold text-sm tracking-tight">VYA LOGISTICS</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2024 VYA Logistics. Transformando espaço ocioso em logística colaborativa descentralizada.
            </p>
            <div className="flex gap-6 text-xs font-bold text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Termos</a>
              <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
              <a href="#" className="hover:text-primary transition-colors">Suporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
