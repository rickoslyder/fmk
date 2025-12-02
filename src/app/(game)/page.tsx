"use client";

import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryGrid, DailyChallengeCard } from "@/components/categories";
import { getCategoryMeta } from "@/data/categories";
import Link from "next/link";

export default function HomePage() {
  const categories = getCategoryMeta();

  return (
    <div className="p-4 space-y-6">
      {/* Daily Challenge */}
      <section>
        <DailyChallengeCard />
      </section>

      {/* Random Mix */}
      <section>
        <Link href="/setup?category=random">
          <Button
            variant="outline"
            size="touch"
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Shuffle className="h-5 w-5" />
              Random Mix
            </span>
            <span className="text-muted-foreground text-sm">
              All categories
            </span>
          </Button>
        </Link>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Categories</h2>
        <CategoryGrid categories={categories} />
      </section>
    </div>
  );
}
