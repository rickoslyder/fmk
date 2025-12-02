import type { Gender } from "./person";

/** Saved player profile with individual settings */
export interface SavedPlayer {
  id: string;
  name: string;
  /** Optional avatar/color identifier */
  avatarColor: string;
  /** Player-specific gender filter preferences */
  genderFilter: Gender[];
  /** Player-specific age range [min, max] */
  ageRange: [number, number];
  /** When this player was created */
  createdAt: number;
  /** When this player was last active */
  lastPlayedAt?: number;
}

/** Default settings for new players */
export const DEFAULT_PLAYER_SETTINGS = {
  genderFilter: ["male", "female", "other"] as Gender[],
  ageRange: [18, 99] as [number, number],
};

/** Available avatar colors */
export const AVATAR_COLORS = [
  "#ec4899", // pink (primary)
  "#8b5cf6", // purple
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
  "#f97316", // orange
];
