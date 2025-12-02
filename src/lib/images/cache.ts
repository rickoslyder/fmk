/**
 * Image caching utilities using IndexedDB
 * Implements LRU eviction when cache gets too large
 */

import { db } from "@/lib/db";
import type { CachedImage } from "@/lib/db/schema";
import { MAX_CACHED_IMAGES, IMAGE_CACHE_EXPIRY } from "@/lib/constants";

/**
 * Get a cached image by person ID
 */
export async function getCachedImage(personId: string): Promise<string | null> {
  try {
    const cached = await db.cachedImages
      .where("personId")
      .equals(personId)
      .first();

    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.createdAt > IMAGE_CACHE_EXPIRY) {
      await db.cachedImages.delete(cached.id);
      return null;
    }

    // Update last accessed time for LRU
    await db.cachedImages.update(cached.id, {
      lastAccessed: Date.now(),
    });

    return cached.imageBase64;
  } catch (error) {
    console.error("Error getting cached image:", error);
    return null;
  }
}

/**
 * Cache an image for a person
 */
export async function cacheImage(
  personId: string,
  imageBase64: string
): Promise<void> {
  try {
    // Check cache size and evict if needed
    await evictIfNeeded();

    const id = `img-${personId}-${Date.now()}`;
    const now = Date.now();

    // Remove any existing cache for this person
    await db.cachedImages.where("personId").equals(personId).delete();

    // Add new cache entry
    await db.cachedImages.add({
      id,
      personId,
      imageBase64,
      createdAt: now,
      lastAccessed: now,
    });
  } catch (error) {
    console.error("Error caching image:", error);
  }
}

/**
 * Evict oldest images if cache is too large (LRU)
 */
async function evictIfNeeded(): Promise<void> {
  try {
    const count = await db.cachedImages.count();

    if (count >= MAX_CACHED_IMAGES) {
      // Get oldest accessed images
      const toEvict = await db.cachedImages
        .orderBy("lastAccessed")
        .limit(Math.ceil(MAX_CACHED_IMAGES * 0.1)) // Evict 10%
        .toArray();

      const idsToDelete = toEvict.map((img) => img.id);
      await db.cachedImages.bulkDelete(idsToDelete);

      console.log(`Evicted ${idsToDelete.length} cached images`);
    }
  } catch (error) {
    console.error("Error evicting images:", error);
  }
}

/**
 * Clear all cached images
 */
export async function clearImageCache(): Promise<void> {
  await db.cachedImages.clear();
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  count: number;
  oldestAccess: number | null;
  newestAccess: number | null;
}> {
  const count = await db.cachedImages.count();

  if (count === 0) {
    return { count, oldestAccess: null, newestAccess: null };
  }

  const oldest = await db.cachedImages.orderBy("lastAccessed").first();
  const newest = await db.cachedImages.orderBy("lastAccessed").last();

  return {
    count,
    oldestAccess: oldest?.lastAccessed ?? null,
    newestAccess: newest?.lastAccessed ?? null,
  };
}
