/** Gender options for filtering */
export type Gender = "male" | "female" | "other";

/** Base person interface for all person types */
export interface BasePerson {
  id: string;
  name: string;
  gender: Gender;
  birthYear?: number;
  imageUrl?: string;
  fallbackImageUrls?: string[];
  bio?: string;
}

/** Pre-built person from category data */
export interface Person extends BasePerson {
  categoryId: string;
  /** TMDB ID for actors/celebrities */
  tmdbId?: number;
  /** Wikipedia/Wikidata ID for fallback images */
  wikidataId?: string;
}

/** Custom person added by user */
export interface CustomPerson extends BasePerson {
  /** User-uploaded image stored as base64 */
  imageBase64?: string;
  /** When the person was added */
  createdAt: number;
  /** ID of the custom list this person belongs to */
  listId: string;
}

/** Person with cached image data */
export interface PersonWithImage extends Person {
  /** Cached image as base64 */
  cachedImage?: string;
  /** Image load status */
  imageStatus: "pending" | "loading" | "loaded" | "error";
}
