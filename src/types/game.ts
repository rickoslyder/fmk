import type { Person, CustomPerson } from "./person";

/** FMK assignment type */
export type Assignment = "fuck" | "marry" | "kill";

/** Game mode */
export type GameMode = "solo" | "pass-and-play";

/** Game state machine states */
export type GameStatus =
  | "idle"
  | "setup"
  | "selecting"
  | "playing"
  | "reviewing"
  | "complete";

/** A single assignment in a round */
export interface PersonAssignment {
  person: Person | CustomPerson;
  assignment: Assignment;
}

/** Timer configuration */
export interface TimerConfig {
  enabled: boolean;
  /** Decision time in seconds */
  decisionTime: number;
  /** Discussion time in seconds (0 = disabled) */
  discussionTime: number;
  /** Whether to play tick sounds */
  tickSound: boolean;
}

/** Player in pass-and-play mode */
export interface Player {
  id: string;
  name: string;
}

/** A single round of the game */
export interface Round {
  id: string;
  /** The three people presented */
  people: [Person | CustomPerson, Person | CustomPerson, Person | CustomPerson];
  /** Assignments made (filled as player assigns) */
  assignments: PersonAssignment[];
  /** People that were skipped */
  skipped: (Person | CustomPerson)[];
  /** Player who played this round (for pass-and-play) */
  playerId?: string;
  /** Time taken to complete (in ms) */
  timeTaken?: number;
  /** When this round was played */
  timestamp: number;
}

/** Complete game session */
export interface GameSession {
  id: string;
  mode: GameMode;
  categoryId: string;
  categoryName: string;
  players: Player[];
  rounds: Round[];
  currentRoundIndex: number;
  timerConfig: TimerConfig;
  startedAt: number;
  completedAt?: number;
}

/** Current game state */
export interface GameState {
  status: GameStatus;
  session: GameSession | null;
  currentRound: Round | null;
  /** Currently selected person for assignment */
  selectedPerson: (Person | CustomPerson) | null;
  /** IDs of people already used in this session */
  usedPersonIds: Set<string>;
  /** Error message if any */
  error: string | null;
}

/** Game actions for reducer */
export type GameAction =
  | { type: "START_GAME"; payload: { categoryId: string; categoryName: string; mode: GameMode; players: Player[]; timerConfig: TimerConfig } }
  | { type: "SET_ROUND_PEOPLE"; payload: [Person | CustomPerson, Person | CustomPerson, Person | CustomPerson] }
  | { type: "SELECT_PERSON"; payload: Person | CustomPerson }
  | { type: "ASSIGN_PERSON"; payload: { person: Person | CustomPerson; assignment: Assignment } }
  | { type: "SKIP_PERSON"; payload: Person | CustomPerson }
  | { type: "REPLACE_PERSON"; payload: { oldPerson: Person | CustomPerson; newPerson: Person | CustomPerson } }
  | { type: "COMPLETE_ROUND" }
  | { type: "NEXT_ROUND" }
  | { type: "END_GAME" }
  | { type: "RESET" }
  | { type: "SET_ERROR"; payload: string };

/** Saved game history entry */
export interface GameHistoryEntry {
  id: string;
  mode: GameMode;
  categoryId: string;
  categoryName: string;
  players: Player[];
  rounds: Round[];
  totalRounds: number;
  playedAt: number;
}
