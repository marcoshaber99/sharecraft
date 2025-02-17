"use client";

import { User } from "next-auth";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  user: User;
  signOutAction: () => Promise<void>;
}

export function DashboardHeader({ user, signOutAction }: DashboardHeaderProps) {
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
            <span className="font-medium">{user?.name || "Athlete"}</span>
          </div>

          <form action={signOutAction}>
            <Button
              type="submit"
              size="sm"
              className="text-muted-foreground hover:text-foreground transition-colors bg-transparent hover:bg-gray-200 dark:hover:bg-gray-900 border dark:hover:border-gray-500"
            >
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
