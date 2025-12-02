"use client";

import Link from "next/link";
import {
  Film,
  Music,
  Trophy,
  Tv,
  Landmark,
  Mic,
  Camera,
  Smartphone,
  Scroll,
  Wand2,
  Crown,
  Building2,
  ChefHat,
  Sparkles,
  Shuffle,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CategoryMeta, CategoryIcon } from "@/types";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<CategoryIcon, React.ComponentType<{ className?: string }>> = {
  film: Film,
  music: Music,
  trophy: Trophy,
  tv: Tv,
  landmark: Landmark,
  mic: Mic,
  camera: Camera,
  smartphone: Smartphone,
  scroll: Scroll,
  wand: Wand2,
  crown: Crown,
  building: Building2,
  "chef-hat": ChefHat,
  sparkles: Sparkles,
  shuffle: Shuffle,
  calendar: Calendar,
};

interface CategoryCardProps {
  category: CategoryMeta;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const Icon = ICON_MAP[category.icon] ?? Sparkles;

  return (
    <Link href={`/setup?category=${category.id}`}>
      <Card
        className={cn(
          "group cursor-pointer transition-all hover:border-primary hover:shadow-lg touch-target",
          className
        )}
      >
        <CardContent className="flex flex-col items-center justify-center p-4 text-center">
          <div className="mb-3 rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-sm">{category.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {category.peopleCount} people
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
