"use client";

import { Sparkles, PlusCircle, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function CustomPage() {
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        Custom Categories
      </h1>

      <div className="space-y-4">
        {/* AI Generate */}
        <Card className="cursor-pointer hover:border-primary transition-all">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Wand2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">AI Generate</h3>
              <p className="text-sm text-muted-foreground">
                Describe a category and AI will create it
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Custom Lists */}
        <Card className="cursor-pointer hover:border-primary transition-all">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-primary/10 p-3">
              <PlusCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Custom Lists</h3>
              <p className="text-sm text-muted-foreground">
                Create your own list of people
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Coming soon: AI-powered category generation and custom people lists!
      </p>
    </div>
  );
}
