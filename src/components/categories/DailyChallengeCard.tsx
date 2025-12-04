"use client";

import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function DailyChallengeCard() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="relative bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 opacity-60">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/20 p-2">
            <Calendar className="h-5 w-5 text-primary/50" />
          </div>
          <div>
            <h3 className="font-semibold text-muted-foreground">Daily Challenge</h3>
            <p className="text-sm text-muted-foreground/70">{today}</p>
          </div>
        </div>
        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
          Coming Soon
        </span>
      </CardContent>
    </Card>
  );
}
