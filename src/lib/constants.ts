import type { CategoryMeta } from "@/types";

/** App name */
export const APP_NAME = "FMK";

/** App description */
export const APP_DESCRIPTION = "The Party Game";

/** Minimum touch target size in pixels */
export const MIN_TOUCH_TARGET = 48;

/** Maximum age for filtering */
export const MAX_AGE = 100;

/** Minimum age for filtering */
export const MIN_AGE = 18;

/** Default number of people to generate for custom categories */
export const DEFAULT_CUSTOM_CATEGORY_SIZE = 30;

/** Maximum cached images in IndexedDB (LRU eviction) */
export const MAX_CACHED_IMAGES = 500;

/** Image cache expiry in milliseconds (7 days) */
export const IMAGE_CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;

/** Timer tick interval in milliseconds */
export const TIMER_TICK_INTERVAL = 1000;

/** Timer warning threshold in seconds */
export const TIMER_WARNING_THRESHOLD = 10;

/** Pre-built category IDs */
export const CATEGORY_IDS = {
  MOVIE_STARS: "movie-stars",
  MUSICIANS: "musicians",
  ATHLETES: "athletes",
  REALITY_TV: "reality-tv",
  POLITICIANS: "politicians",
  COMEDIANS: "comedians",
  MODELS: "models",
  INFLUENCERS: "influencers",
  HISTORICAL: "historical",
  FICTIONAL: "fictional",
  ROYALTY: "royalty",
  TECH_CEOS: "tech-ceos",
  CHEFS: "chefs",
} as const;

/** Pre-built category metadata */
export const CATEGORY_META: CategoryMeta[] = [
  {
    id: CATEGORY_IDS.MOVIE_STARS,
    name: "Movie Stars",
    icon: "film",
    description: "Hollywood actors and actresses",
    peopleCount: 0, // Will be populated from data
  },
  {
    id: CATEGORY_IDS.MUSICIANS,
    name: "Musicians",
    icon: "music",
    description: "Singers, bands, and music artists",
    peopleCount: 0,
  },
  {
    id: CATEGORY_IDS.ATHLETES,
    name: "Athletes",
    icon: "trophy",
    description: "Sports stars from all leagues",
    peopleCount: 0,
  },
  {
    id: CATEGORY_IDS.REALITY_TV,
    name: "Reality TV Stars",
    icon: "tv",
    description: "Reality show personalities",
    peopleCount: 0,
  },
  {
    id: CATEGORY_IDS.POLITICIANS,
    name: "Politicians",
    icon: "landmark",
    description: "World leaders and politicians",
    peopleCount: 0,
  },
  {
    id: CATEGORY_IDS.COMEDIANS,
    name: "Comedians",
    icon: "mic",
    description: "Stand-up comics and funny people",
    peopleCount: 0,
  },
  {
    id: CATEGORY_IDS.MODELS,
    name: "Models",
    icon: "camera",
    description: "Fashion and runway models",
    peopleCount: 0,
  },
  {
    id: CATEGORY_IDS.INFLUENCERS,
    name: "Influencers",
    icon: "smartphone",
    description: "Social media personalities",
    peopleCount: 0,
  },
  {
    id: CATEGORY_IDS.HISTORICAL,
    name: "Historical Figures",
    icon: "scroll",
    description: "Famous people from history",
    peopleCount: 0,
  },
  {
    id: CATEGORY_IDS.FICTIONAL,
    name: "Fictional Characters",
    icon: "wand",
    description: "Characters from TV and film",
    peopleCount: 0,
  },
  {
    id: CATEGORY_IDS.ROYALTY,
    name: "Royalty",
    icon: "crown",
    description: "Kings, queens, and royal family",
    peopleCount: 0,
  },
  {
    id: CATEGORY_IDS.TECH_CEOS,
    name: "Tech CEOs",
    icon: "building",
    description: "Tech industry leaders",
    peopleCount: 0,
  },
  {
    id: CATEGORY_IDS.CHEFS,
    name: "Chefs",
    icon: "chef-hat",
    description: "Celebrity chefs and food personalities",
    peopleCount: 0,
  },
];

/** LocalStorage keys */
export const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: "fmk-onboarding-complete",
  THEME: "fmk-theme",
} as const;

/** API routes */
export const API_ROUTES = {
  AI_GENERATE: "/api/ai/generate",
  AI_VALIDATE: "/api/ai/validate",
  DAILY_CHALLENGE: "/api/daily-challenge",
  IMAGE_PROXY: "/api/images/proxy",
} as const;
