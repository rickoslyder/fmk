"use client";

import { CategoryCard } from "./CategoryCard";
import type { CategoryMeta } from "@/types";

interface CategoryGridProps {
  categories: CategoryMeta[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
