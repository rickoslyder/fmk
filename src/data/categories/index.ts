import type { Person, CategoryMeta } from "@/types";

// Import all category data
import movieStarsData from "./movie-stars.json";
import musiciansData from "./musicians.json";
import athletesData from "./athletes.json";
import realityTvData from "./reality-tv.json";
import politiciansData from "./politicians.json";
import comediansData from "./comedians.json";
import influencersData from "./influencers.json";
import techCeosData from "./tech-ceos.json";
import modelsData from "./models.json";
import chefsData from "./chefs.json";

/** Category data structure from JSON files */
interface CategoryData {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  people: Person[];
}

/** All category data */
export const CATEGORIES_DATA: CategoryData[] = [
  movieStarsData as CategoryData,
  musiciansData as CategoryData,
  athletesData as CategoryData,
  realityTvData as CategoryData,
  politiciansData as CategoryData,
  comediansData as CategoryData,
  influencersData as CategoryData,
  techCeosData as CategoryData,
  modelsData as CategoryData,
  chefsData as CategoryData,
];

/** Get category metadata with people counts */
export function getCategoryMeta(): CategoryMeta[] {
  return CATEGORIES_DATA.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon as CategoryMeta["icon"],
    description: cat.description,
    peopleCount: cat.people.length,
  }));
}

/** Get all people from a category */
export function getPeopleByCategory(categoryId: string): Person[] {
  const category = CATEGORIES_DATA.find((c) => c.id === categoryId);
  return category?.people ?? [];
}

/** Get all people from all categories */
export function getAllPeople(): Person[] {
  return CATEGORIES_DATA.flatMap((c) => c.people);
}

/** Get a random selection of people across all categories */
export function getRandomPeople(count: number): Person[] {
  const allPeople = getAllPeople();
  const shuffled = [...allPeople].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** Get category by ID */
export function getCategoryById(categoryId: string): CategoryData | undefined {
  return CATEGORIES_DATA.find((c) => c.id === categoryId);
}
