"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./schema";
import type {
  Preferences,
  Person,
  CustomCategory,
  GameHistoryEntry,
  Gender,
  SavedPlayer,
} from "@/types";
import type { CustomList, CachedImage } from "./schema";
import { DEFAULT_PREFERENCES } from "@/types";

/**
 * Hook to get user preferences
 * Returns default preferences if none exist
 */
export function usePreferences(): Preferences | undefined {
  return useLiveQuery(async () => {
    const prefs = await db.preferences.get("user-preferences");
    return prefs ?? DEFAULT_PREFERENCES;
  }, []);
}

/**
 * Hook to update user preferences
 */
export function useUpdatePreferences() {
  return async (updates: Partial<Preferences>) => {
    await db.preferences.put({
      ...(await db.preferences.get("user-preferences")) ?? DEFAULT_PREFERENCES,
      ...updates,
      id: "user-preferences",
      updatedAt: Date.now(),
    });
  };
}

/**
 * Hook to get people by category
 */
export function usePeopleByCategory(categoryId: string): Person[] | undefined {
  return useLiveQuery(
    () => db.people.where("categoryId").equals(categoryId).toArray(),
    [categoryId]
  );
}

/**
 * Hook to get filtered people by category
 */
export function useFilteredPeople(
  categoryId: string,
  genderFilter: Gender[],
  ageRange: [number, number]
): Person[] | undefined {
  return useLiveQuery(async () => {
    const currentYear = new Date().getFullYear();
    const [minAge, maxAge] = ageRange;

    const people = await db.people
      .where("categoryId")
      .equals(categoryId)
      .toArray();

    return people.filter((person) => {
      // Gender filter
      if (!genderFilter.includes(person.gender)) {
        return false;
      }

      // Age filter (if birthYear is available)
      if (person.birthYear) {
        const age = currentYear - person.birthYear;
        if (age < minAge || age > maxAge) {
          return false;
        }
      }

      return true;
    });
  }, [categoryId, genderFilter, ageRange]);
}

/**
 * Hook to get all custom categories
 */
export function useCustomCategories(): CustomCategory[] | undefined {
  return useLiveQuery(() =>
    db.customCategories.orderBy("createdAt").reverse().toArray()
  );
}

/**
 * Hook to get all custom lists
 */
export function useCustomLists(): CustomList[] | undefined {
  return useLiveQuery(() =>
    db.customLists.orderBy("createdAt").reverse().toArray()
  );
}

/**
 * Hook to get custom people by list
 */
export function useCustomPeopleByList(listId: string) {
  return useLiveQuery(
    () => db.customPeople.where("listId").equals(listId).toArray(),
    [listId]
  );
}

/**
 * Hook to get game history
 */
export function useGameHistory(limit = 50): GameHistoryEntry[] | undefined {
  return useLiveQuery(() =>
    db.gameHistory.orderBy("playedAt").reverse().limit(limit).toArray()
  );
}

/**
 * Hook to get a single game from history
 */
export function useGameHistoryEntry(
  id: string
): GameHistoryEntry | undefined {
  return useLiveQuery(() => db.gameHistory.get(id), [id]);
}

/**
 * Hook to get cached image for a person
 */
export function useCachedImage(personId: string): CachedImage | undefined {
  return useLiveQuery(
    () => db.cachedImages.where("personId").equals(personId).first(),
    [personId]
  );
}

/**
 * Hook to check if onboarding is complete
 */
export function useOnboardingComplete(): boolean | undefined {
  return useLiveQuery(async () => {
    const prefs = await db.preferences.get("user-preferences");
    return prefs?.onboardingComplete ?? false;
  }, []);
}

/**
 * Hook to get all saved players
 */
export function useSavedPlayers(): SavedPlayer[] | undefined {
  return useLiveQuery(async () => {
    try {
      const players = await db.savedPlayers.toArray();
      console.log("[useSavedPlayers] Loaded players:", players.length);
      // Sort by createdAt descending (newest first) - simpler and more reliable
      return players.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (error) {
      console.error("[useSavedPlayers] Error loading players:", error);
      return [];
    }
  });
}

/**
 * Hook to get a single saved player
 */
export function useSavedPlayer(id: string): SavedPlayer | undefined {
  return useLiveQuery(() => db.savedPlayers.get(id), [id]);
}
