"use client";

import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-destructive py-2 text-destructive-foreground text-sm font-medium",
        className
      )}
    >
      <WifiOff className="h-4 w-4" />
      <span>You&apos;re offline</span>
    </div>
  );
}
