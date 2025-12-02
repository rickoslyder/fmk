// Person types
export type {
  Gender,
  BasePerson,
  Person,
  CustomPerson,
  PersonWithImage,
} from "./person";

// Category types
export type {
  CategoryType,
  CategoryIcon,
  BaseCategory,
  Category,
  CustomCategory,
  DailyChallenge,
  CategoryMeta,
  GenerateCategoryRequest,
  GenerateCategoryResponse,
} from "./category";

// Game types
export type {
  Assignment,
  GameMode,
  GameStatus,
  PersonAssignment,
  TimerConfig,
  Player,
  Round,
  GameSession,
  GameState,
  GameAction,
  GameHistoryEntry,
} from "./game";

// Player types
export type { SavedPlayer } from "./player";
export { DEFAULT_PLAYER_SETTINGS, AVATAR_COLORS } from "./player";

// Preferences types
export type { Preferences } from "./preferences";
export { DEFAULT_PREFERENCES } from "./preferences";
