
'use client'

import React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Bell, Menu } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { name: "Início", href: "/features/home" },
  { name: "Clientes", href: "/features/clientes" },
  { name: "Serviços", href: "/features/servicos" },
  { name: "Tarefas", href: "/features/tarefas" },
  { name: "Relatórios", href: "/features/relatorios" },
];

export function AppHeader() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-20 w-full">
      <div className="flex items-center h-16 px-6 w-full">
        {/* Logo/Nome do sistema à extrema esquerda */}
        <div className="flex-shrink-0 flex items-center h-full" style={{ minWidth: 220 }}>
          <span className="font-bold text-2xl text-gray-800 dark:text-white tracking-wide">
            Sistema de Controle - Ambielle
          </span>
        </div>

        {/* Navegação desktop centralizada */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-lg font-bold text-gray-700 dark:text-gray-300 hover:underline">
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Ações à direita */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400">
            <Bell className="h-5 w-5" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://placehold.co/64x64" alt="Gisele" />
              <AvatarFallback>GI</AvatarFallback>
            </Avatar>
            <span className="text-gray-700 dark:text-gray-300 hidden sm:block font-bold">Gisele</span>
          </div>
        </div>

        {/* Navegação mobile */}
        <div className="md:hidden ml-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.name} href={link.href} className="text-lg font-bold hover:underline">
                    {link.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}