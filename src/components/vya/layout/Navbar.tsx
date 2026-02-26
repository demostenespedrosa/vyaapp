
"use client";

import { Box, User, LogOut, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface NavbarProps {
  mode: 'sender' | 'traveler';
  onToggle: (mode: 'sender' | 'traveler') => void;
}

export function Navbar({ mode, onToggle }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center text-primary-foreground">
              <Box className="h-5 w-5" />
            </div>
            <span className="text-2xl font-headline font-bold text-primary">VYA</span>
          </div>

          <div className="hidden md:flex items-center gap-3 bg-muted px-3 py-1.5 rounded-full border">
            <Label htmlFor="mode-toggle" className={`text-xs font-bold transition-colors ${mode === 'sender' ? 'text-primary' : 'text-muted-foreground'}`}>
              Remetente
            </Label>
            <Switch 
              id="mode-toggle" 
              checked={mode === 'traveler'} 
              onCheckedChange={(checked) => onToggle(checked ? 'traveler' : 'sender')}
            />
            <Label htmlFor="mode-toggle" className={`text-xs font-bold transition-colors ${mode === 'traveler' ? 'text-brand-purple' : 'text-muted-foreground'}`}>
              Viajante
            </Label>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-destructive rounded-full border-2 border-background" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src="https://picsum.photos/seed/vya-user/200/200" alt="User" />
                  <AvatarFallback>VYA</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><User className="mr-2 h-4 w-4" /> Perfil</DropdownMenuItem>
              <DropdownMenuItem><Box className="mr-2 h-4 w-4" /> Histórico</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive"><LogOut className="mr-2 h-4 w-4" /> Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
