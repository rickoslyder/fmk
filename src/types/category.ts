import type { Person } from "./person";

/** Category types */
export type CategoryType = "prebuilt" | "custom" | "random" | "daily";

/** Category icon identifiers */
export type CategoryIcon =
  | "film"
  | "music"
  | "trophy"
  | "tv"
  | "landmark"
  | "mic"
  | "camera"
  | "smartphone"
  | "scroll"
  | "wand"
  | "crown"
  | "building"
  | "chef-hat"
  | "sparkles"
  | "shuffle"
  | "calendar";

/** Base category interface */
export interface BaseCategory {
  id: string;
  name: string;
  description?: string;
  icon: CategoryIcon;
  type: CategoryType;
}

/** Pre-built category with people data */
export interface Category extends BaseCategory {
  type: "prebuilt";
  /** Number of people in this category */
  peopleCount: number;
}

/** Custom category created by AI */
export interface CustomCategory extends BaseCategory {
  type: "custom";
  /** The prompt used to generate this category */
  prompt: string;
  /** When the category was created */
  createdAt: number;
  /** People in this custom category */
  people: Person[];
}

/** Daily challenge category */
export interface DailyChallenge extends BaseCategory {
  type: "daily";
  /** Date for this challenge (YYYY-MM-DD) */
  date: string;
  /** The three people for this challenge */
  people: [Person, Person, Person];
  /** Whether this was auto-generated or curated */
  curated: boolean;
}

/** Category metadata for display */
export interface CategoryMeta {
  id: string;
  name: string;
  icon: CategoryIcon;
  description?: string;
  peopleCount: number;
}

/** AI generation request */
export interface GenerateCategoryRequest {
  prompt: string;
  count?: number;
  genderFilter?: ("male" | "female" | "other")[];
  ageRange?: [number, number];
}

/** AI generation response */
export interface GenerateCategoryResponse {
  success: boolean;
  category?: CustomCategory;
  error?: string;
  validationScore?: number;
}
