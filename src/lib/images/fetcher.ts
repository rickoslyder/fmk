/**
 * Waterfall image fetcher
 * Tries sources in order: TMDB → Wikipedia → gives up
 * Caches results in IndexedDB
 */

import { getPersonImageByTMDBId, getPersonImageByName } from "./tmdb";
import { getWikipediaImage } from "./wikipedia";
import { getCachedImage, cacheImage } from "./cache";
import type { Person } from "@/types";

export type ImageFetchStatus = "idle" | "loading" | "success" | "error";

export interface ImageFetchResult {
  status: ImageFetchStatus;
  imageUrl: string | null;
  source: "cache" | "tmdb" | "wikipedia" | null;
  error?: string;
}

/**
 * Fetch image through proxy and convert to base64 data URL
 */
async function fetchViaProxy(url: string): Promise<string | null> {
  try {
    const proxyUrl = `/api/images/proxy?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      console.error("Proxy fetch failed:", response.status);
      return null;
    }

    const data = await response.json();
    return data.success ? data.dataUrl : null;
  } catch (error) {
    console.error("Proxy fetch error:", error);
    return null;
  }
}

/**
 * Fetch image for a person using waterfall strategy
 * 1. Check cache
 * 2. Try TMDB (by ID if available, else by name)
 * 3. Try Wikipedia
 * 4. Return null if all fail
 */
export async function fetchPersonImage(person: Person): Promise<ImageFetchResult> {
  // 1. Check cache first
  const cached = await getCachedImage(person.id);
  if (cached) {
    return {
      status: "success",
      imageUrl: cached,
      source: "cache",
    };
  }

  // 2. Try TMDB
  let imageUrl: string | null = null;

  if (person.tmdbId) {
    // Use TMDB ID if available (more reliable)
    imageUrl = await getPersonImageByTMDBId(person.tmdbId);
  }

  if (!imageUrl) {
    // Try by name
    imageUrl = await getPersonImageByName(person.name);
  }

  if (imageUrl) {
    // Fetch through proxy and cache
    const dataUrl = await fetchViaProxy(imageUrl);
    if (dataUrl) {
      await cacheImage(person.id, dataUrl);
      return {
        status: "success",
        imageUrl: dataUrl,
        source: "tmdb",
      };
    }
  }

  // 3. Try Wikipedia
  const wikiUrl = await getWikipediaImage(person.name);
  if (wikiUrl) {
    const dataUrl = await fetchViaProxy(wikiUrl);
    if (dataUrl) {
      await cacheImage(person.id, dataUrl);
      return {
        status: "success",
        imageUrl: dataUrl,
        source: "wikipedia",
      };
    }
  }

  // 4. All sources failed
  return {
    status: "error",
    imageUrl: null,
    source: null,
    error: "No image found",
  };
}

/**
 * Prefetch images for multiple people (background loading)
 */
export async function prefetchImages(people: Person[]): Promise<void> {
  // Process in parallel with limited concurrency
  const concurrency = 3;
  const queue = [...people];

  const workers = Array(concurrency).fill(null).map(async () => {
    while (queue.length > 0) {
      const person = queue.shift();
      if (person) {
        await fetchPersonImage(person);
      }
    }
  });

  await Promise.all(workers);
}
