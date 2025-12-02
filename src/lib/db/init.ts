import { db } from "./schema";
import { DEFAULT_PREFERENCES } from "@/types";

/**
 * Initialize the database with default data
 * Called on first app load
 */
export async function initializeDatabase(): Promise<void> {
  // Check if preferences exist
  const existingPrefs = await db.preferences.get("user-preferences");

  if (!existingPrefs) {
    // First time user - set default preferences
    await db.preferences.put({
      ...DEFAULT_PREFERENCES,
      updatedAt: Date.now(),
    });
  }
}

/**
 * Check if this is the first time the user is using the app
 */
export async function isFirstTimeUser(): Promise<boolean> {
  const prefs = await db.preferences.get("user-preferences");
  return !prefs || !prefs.onboardingComplete;
}

/**
 * Mark onboarding as complete
 */
export async function completeOnboarding(): Promise<void> {
  const prefs = await db.preferences.get("user-preferences");
  await db.preferences.put({
    ...(prefs ?? DEFAULT_PREFERENCES),
    id: "user-preferences",
    onboardingComplete: true,
    updatedAt: Date.now(),
  });
}

/**
 * Clear all user data (for debugging/reset)
 */
export async function clearAllData(): Promise<void> {
  await db.transaction(
    "rw",
    [
      db.preferences,
      db.people,
      db.customPeople,
      db.customCategories,
      db.customLists,
      db.gameHistory,
      db.cachedImages,
      db.dailyChallenges,
    ],
    async () => {
      await db.preferences.clear();
      await db.people.clear();
      await db.customPeople.clear();
      await db.customCategories.clear();
      await db.customLists.clear();
      await db.gameHistory.clear();
      await db.cachedImages.clear();
      await db.dailyChallenges.clear();
    }
  );
}

/**
 * Save a game to history
 */
export async function saveGameToHistory(
  game: Parameters<typeof db.gameHistory.add>[0]
): Promise<void> {
  await db.gameHistory.add(game);
}

/**
 * Delete a game from history
 */
export async function deleteGameFromHistory(id: string): Promise<void> {
  await db.gameHistory.delete(id);
}

/**
 * Clear all game history
 */
export async function clearGameHistory(): Promise<void> {
  await db.gameHistory.clear();
}
