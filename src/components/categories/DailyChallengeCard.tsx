"use client";

import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function DailyChallengeCard() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <Link href="/setup?category=daily">
      <Card className="group cursor-pointer bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 hover:border-primary transition-all">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/20 p-2">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Daily Challenge</h3>
              <p className="text-sm text-muted-foreground">{today}</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </CardContent>
      </Card>
    </Link>
  );
}
