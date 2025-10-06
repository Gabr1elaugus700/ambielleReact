'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Bell, Menu } from "lucide-react"

export function AppHeader() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xl text-gray-800 dark:text-white">
              Sistema de Controle - Ambielle
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400">
              <Bell className="h-5 w-5" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/64x64" alt="Gisele"/>
                <AvatarFallback>GI</AvatarFallback>
              </Avatar>
              <span className="text-gray-700 dark:text-gray-300 hidden sm:block">Gisele</span>
            </div>

            <Button variant="ghost" size="icon" className="md:hidden text-gray-500 dark:text-gray-400">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}