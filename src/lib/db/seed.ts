import { db } from "./schema";
import { CATEGORIES_DATA } from "@/data/categories";
import type { Person } from "@/types";

/**
 * Seed the database with pre-built category data
 * This should be called on first app launch after onboarding
 */
export async function seedCategories(): Promise<void> {
  // Check if data already exists
  const existingCount = await db.people.count();
  if (existingCount > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding database with category data...");

  // Collect all people from all categories
  const allPeople: Person[] = CATEGORIES_DATA.flatMap((category) =>
    category.people.map((person) => ({
      ...person,
      categoryId: category.id,
    }))
  );

  // Bulk insert all people
  await db.people.bulkAdd(allPeople);

  console.log(`Seeded ${allPeople.length} people across ${CATEGORIES_DATA.length} categories`);
}

/**
 * Check if database has been seeded
 */
export async function isDatabaseSeeded(): Promise<boolean> {
  const count = await db.people.count();
  return count > 0;
}

/**
 * Get statistics about seeded data
 */
export async function getSeededStats(): Promise<{
  totalPeople: number;
  categoryCounts: Record<string, number>;
}> {
  const people = await db.people.toArray();
  const categoryCounts: Record<string, number> = {};

  for (const person of people) {
    categoryCounts[person.categoryId] = (categoryCounts[person.categoryId] || 0) + 1;
  }

  return {
    totalPeople: people.length,
    categoryCounts,
  };
}

/**
 * Reseed the database (clear and re-add)
 * Useful for updates to category data
 */
export async function reseedCategories(): Promise<void> {
  await db.people.clear();
  await seedCategories();
}
