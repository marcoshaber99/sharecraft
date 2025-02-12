"use client";

import { User } from "next-auth";
import Image from "next/image";
import { ModeToggle } from "@/components/mode-toggle";
import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface DashboardHeaderProps {
  user: User;
  signOutAction: () => Promise<void>;
}

export function DashboardHeader({ user, signOutAction }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
              <Image
                src={user?.image || "/placeholder.svg?height=40&width=40"}
                alt={user?.name || "User avatar"}
                fill
                className="object-cover"
              />
            </div>
            <span className="font-medium hidden sm:inline-block">
              {user?.name || "Athlete"}
            </span>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:flex items-center gap-2">
            <ModeToggle />
            <form action={signOutAction}>
              <Button
                type="submit"
                size="sm"
                className="text-muted-foreground hover:text-foreground transition-colors bg-transparent hover:bg-gray-200 dark:hover:bg-gray-900 border  dark:hover:border-gray-500"
              >
                Sign Out
              </Button>
            </form>
          </div>

          {/* Mobile menu */}
          <div className="sm:hidden">
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5 text-muted-foreground" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setIsMenuOpen(false)}>
                  <span className="font-medium">{user?.name || "Athlete"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Moon className="w-4 h-4 mr-2 0" />
                  ) : (
                    <Sun className="w-4 h-4 mr-2 " />
                  )}
                  {theme === "dark" ? "Light" : "Dark"}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={signOutAction}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
