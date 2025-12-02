import type { Gender } from "./person";
import type { TimerConfig } from "./game";

/** User preferences stored in IndexedDB */
export interface Preferences {
  id: "user-preferences";
  /** Gender filter for people shown */
  genderFilter: Gender[];
  /** Age range filter [min, max] */
  ageRange: [number, number];
  /** Sound effects enabled */
  soundEnabled: boolean;
  /** Haptic feedback enabled */
  hapticsEnabled: boolean;
  /** Default timer configuration */
  defaultTimerConfig: TimerConfig;
  /** Whether onboarding has been completed */
  onboardingComplete: boolean;
  /** When preferences were last updated */
  updatedAt: number;
}

/** Default preferences for new users */
export const DEFAULT_PREFERENCES: Preferences = {
  id: "user-preferences",
  genderFilter: ["male", "female", "other"],
  ageRange: [18, 100],
  soundEnabled: true,
  hapticsEnabled: true,
  defaultTimerConfig: {
    enabled: false,
    decisionTime: 30,
    discussionTime: 60,
    tickSound: true,
  },
  onboardingComplete: false,
  updatedAt: Date.now(),
};
