import React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Sobre", href: "/sobre" },
    { name: "Serviços", href: "/servicos" },
    { name: "Contato", href: "/contato" },
];

export default function NavBar() {
    return (
        <nav className="w-full flex items-center justify-between px-4 py-2 border-b bg-white">
            <div className="text-xl font-bold">Ambielle</div>
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <div className="flex flex-col gap-4 mt-8">
                            {navLinks.map((link) => (
                                <Link key={link.name} href={link.href} className="text-lg font-medium hover:underline">
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <div className="hidden md:flex gap-6">
                {navLinks.map((link) => (
                    <Link key={link.name} href={link.href} className="text-lg font-medium hover:underline">
                        {link.name}
                    </Link>
                ))}
            </div>
        </nav>
    );
}