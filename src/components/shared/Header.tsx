"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  showSettings?: boolean;
  className?: string;
}

export function Header({
  title = "FMK",
  showSettings = true,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <h1 className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--fmk-fuck))] via-[hsl(var(--fmk-marry))] to-[hsl(var(--fmk-kill))] bg-clip-text text-transparent">
            {title}
          </h1>
        </Link>

        {showSettings && (
          <Link
            href="/settings"
            className="touch-target flex items-center justify-center rounded-md hover:bg-accent transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Link>
        )}
      </div>
    </header>
  );
}
