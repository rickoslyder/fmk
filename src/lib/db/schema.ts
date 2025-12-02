import Dexie, { type EntityTable } from "dexie";
import type {
  Preferences,
  Person,
  CustomPerson,
  CustomCategory,
  GameHistoryEntry,
  SavedPlayer,
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
  savedPlayers!: EntityTable<SavedPlayer, "id">;

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

    // Version 2: Add saved players table
    this.version(2).stores({
      preferences: "id",
      people: "id, categoryId, gender, name, birthYear",
      customPeople: "id, listId, gender, name, createdAt",
      customCategories: "id, createdAt",
      customLists: "id, createdAt",
      gameHistory: "id, categoryId, playedAt",
      cachedImages: "id, personId, lastAccessed",
      dailyChallenges: "date, fetchedAt",
      savedPlayers: "id, name, createdAt, lastPlayedAt",
    });
  }
}

/** Database instance */
export const db = new FMKDatabase();
