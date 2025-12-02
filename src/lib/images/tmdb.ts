/**
 * TMDB API client for fetching celebrity photos
 * Docs: https://developer.themoviedb.org/docs
 */

const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

/** Image sizes available from TMDB */
export type TMDBImageSize = "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original";

/** TMDB person search result */
interface TMDBPersonResult {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
}

/** TMDB search response */
interface TMDBSearchResponse {
  page: number;
  results: TMDBPersonResult[];
  total_pages: number;
  total_results: number;
}

/** TMDB person details */
interface TMDBPersonDetails {
  id: number;
  name: string;
  profile_path: string | null;
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
  images?: {
    profiles: Array<{
      file_path: string;
      width: number;
      height: number;
    }>;
  };
}

/**
 * Build a TMDB image URL
 */
export function getTMDBImageUrl(
  path: string | null,
  size: TMDBImageSize = "w342"
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * Search for a person by name
 */
export async function searchPerson(name: string): Promise<TMDBPersonResult | null> {
  if (!TMDB_API_KEY) {
    console.warn("TMDB_API_KEY not configured");
    return null;
  }

  try {
    const url = new URL(`${TMDB_BASE_URL}/search/person`);
    url.searchParams.set("api_key", TMDB_API_KEY);
    url.searchParams.set("query", name);
    url.searchParams.set("include_adult", "false");

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error("TMDB search failed:", response.status);
      return null;
    }

    const data: TMDBSearchResponse = await response.json();

    // Return the most popular result
    if (data.results.length > 0) {
      return data.results[0];
    }

    return null;
  } catch (error) {
    console.error("TMDB search error:", error);
    return null;
  }
}

/**
 * Get person details by TMDB ID (includes multiple images)
 */
export async function getPersonDetails(tmdbId: number): Promise<TMDBPersonDetails | null> {
  if (!TMDB_API_KEY) {
    console.warn("TMDB_API_KEY not configured");
    return null;
  }

  try {
    const url = new URL(`${TMDB_BASE_URL}/person/${tmdbId}`);
    url.searchParams.set("api_key", TMDB_API_KEY);
    url.searchParams.set("append_to_response", "images");

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error("TMDB person details failed:", response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("TMDB person details error:", error);
    return null;
  }
}

/**
 * Get image URL for a person by TMDB ID
 */
export async function getPersonImageByTMDBId(
  tmdbId: number,
  size: TMDBImageSize = "w342"
): Promise<string | null> {
  const details = await getPersonDetails(tmdbId);
  if (!details) return null;

  return getTMDBImageUrl(details.profile_path, size);
}

/**
 * Get image URL for a person by name (search + get image)
 */
export async function getPersonImageByName(
  name: string,
  size: TMDBImageSize = "w342"
): Promise<string | null> {
  const person = await searchPerson(name);
  if (!person) return null;

  return getTMDBImageUrl(person.profile_path, size);
}
