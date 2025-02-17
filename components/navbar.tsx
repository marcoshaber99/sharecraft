import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { Share2 } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto px-6 w-full max-w-5xl flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Share2 className="h-6 w-6 text-[#FC4C02]" />
          <h1 className="text-lg font-geist font-semibold tracking-tight">
            Sharecraft
          </h1>
        </Link>
        <ModeToggle />
      </div>
    </nav>
  );
}
