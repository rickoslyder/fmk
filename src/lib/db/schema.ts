import Dexie, { type EntityTable } from "dexie";
import type {
  Preferences,
  Person,
  CustomPerson,
  CustomCategory,
  GameHistoryEntry,
} from "@/types";

/** Cached image record */
export interface CachedImage {
  id: string;
  personId: string;
  imageBase64: string;
  createdAt: number;
  lastAccessed: number;
}

/** Custom people list */
export interface CustomList {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

/** Daily challenge cache */
export interface DailyChallengeCache {
  date: string;
  challengeData: string; // JSON stringified
  fetchedAt: number;
}

/** FMK Database schema */
export class FMKDatabase extends Dexie {
  preferences!: EntityTable<Preferences, "id">;
  people!: EntityTable<Person, "id">;
  customPeople!: EntityTable<CustomPerson, "id">;
  customCategories!: EntityTable<CustomCategory, "id">;
  customLists!: EntityTable<CustomList, "id">;
  gameHistory!: EntityTable<GameHistoryEntry, "id">;
  cachedImages!: EntityTable<CachedImage, "id">;
  dailyChallenges!: EntityTable<DailyChallengeCache, "date">;

  constructor() {
    super("fmk-database");

    this.version(1).stores({
      // Preferences table - single row for user prefs
      preferences: "id",

      // Pre-built people from categories
      people: "id, categoryId, gender, name, birthYear",

      // User-created custom people
      customPeople: "id, listId, gender, name, createdAt",

      // AI-generated custom categories
      customCategories: "id, createdAt",

      // Custom people lists
      customLists: "id, createdAt",

      // Game history
      gameHistory: "id, categoryId, playedAt",

      // Image cache with LRU tracking
      cachedImages: "id, personId, lastAccessed",

      // Daily challenge cache
      dailyChallenges: "date, fetchedAt",
    });
  }
}

/** Database instance */
export const db = new FMKDatabase();
