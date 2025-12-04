import type {
  GameState,
  GameAction,
  GameStatus,
  Round,
  GameSession,
  Player,
  TimerConfig,
  Assignment,
  Person,
  CustomPerson,
} from "@/types";

/** Initial game state */
export const initialGameState: GameState = {
  status: "idle",
  session: null,
  currentRound: null,
  selectedPerson: null,
  usedPersonIds: new Set(),
  error: null,
};

/** Generate a unique ID */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/** Create a new round */
function createRound(
  people: [Person | CustomPerson, Person | CustomPerson, Person | CustomPerson],
  playerId?: string
): Round {
  return {
    id: generateId(),
    people,
    assignments: [],
    skipped: [],
    playerId,
    timestamp: Date.now(),
  };
}

/** Create a new game session */
function createSession(
  categoryId: string,
  categoryName: string,
  mode: "solo" | "pass-and-play",
  players: Player[],
  timerConfig: TimerConfig,
  customPeople?: Person[]
): GameSession {
  return {
    id: generateId(),
    mode,
    categoryId,
    categoryName,
    players,
    rounds: [],
    currentRoundIndex: 0,
    timerConfig,
    startedAt: Date.now(),
    customPeople,
  };
}

/** Game state reducer */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME": {
      const { categoryId, categoryName, mode, players, timerConfig, customPeople } = action.payload;
      const session = createSession(categoryId, categoryName, mode, players, timerConfig, customPeople);

      return {
        ...state,
        status: "selecting",
        session,
        currentRound: null,
        selectedPerson: null,
        usedPersonIds: new Set(),
        error: null,
      };
    }

    case "SET_ROUND_PEOPLE": {
      if (!state.session) {
        return { ...state, error: "No active session" };
      }

      const people = action.payload;
      const currentPlayerId =
        state.session.mode === "pass-and-play"
          ? state.session.players[state.session.currentRoundIndex % state.session.players.length]?.id
          : undefined;

      const round = createRound(people, currentPlayerId);

      // Add people to used set
      const newUsedIds = new Set(state.usedPersonIds);
      people.forEach((p) => newUsedIds.add(p.id));

      return {
        ...state,
        status: "playing",
        currentRound: round,
        usedPersonIds: newUsedIds,
        error: null,
      };
    }

    case "SELECT_PERSON": {
      return {
        ...state,
        selectedPerson: action.payload,
        error: null,
      };
    }

    case "ASSIGN_PERSON": {
      if (!state.currentRound) {
        return { ...state, error: "No active round" };
      }

      const { person, assignment } = action.payload;

      // Check if assignment already used
      const existingAssignments = state.currentRound.assignments.map((a) => a.assignment);
      if (existingAssignments.includes(assignment)) {
        return { ...state, error: `${assignment} already assigned` };
      }

      const newAssignments = [
        ...state.currentRound.assignments,
        { person, assignment },
      ];

      const updatedRound: Round = {
        ...state.currentRound,
        assignments: newAssignments,
      };

      // Check if round is complete (3 assignments)
      const isComplete = newAssignments.length === 3;

      return {
        ...state,
        status: isComplete ? "reviewing" : "playing",
        currentRound: updatedRound,
        selectedPerson: null,
        error: null,
      };
    }

    case "SKIP_PERSON": {
      if (!state.currentRound) {
        return { ...state, error: "No active round" };
      }

      const person = action.payload;
      const updatedRound: Round = {
        ...state.currentRound,
        skipped: [...state.currentRound.skipped, person],
        // Remove from people array
        people: state.currentRound.people.filter((p) => p.id !== person.id) as [
          Person | CustomPerson,
          Person | CustomPerson,
          Person | CustomPerson
        ],
      };

      return {
        ...state,
        currentRound: updatedRound,
        selectedPerson: null,
      };
    }

    case "REPLACE_PERSON": {
      if (!state.currentRound) {
        return { ...state, error: "No active round" };
      }

      const { oldPerson, newPerson } = action.payload;

      // Replace the old person with the new one in the people array
      const newPeople = state.currentRound.people.map((p) =>
        p.id === oldPerson.id ? newPerson : p
      ) as [Person | CustomPerson, Person | CustomPerson, Person | CustomPerson];

      const updatedRound: Round = {
        ...state.currentRound,
        people: newPeople,
        skipped: [...state.currentRound.skipped, oldPerson],
      };

      // Add the new person to used IDs
      const newUsedIds = new Set(state.usedPersonIds);
      newUsedIds.add(newPerson.id);

      return {
        ...state,
        currentRound: updatedRound,
        usedPersonIds: newUsedIds,
        selectedPerson: null,
        error: null,
      };
    }

    case "COMPLETE_ROUND": {
      if (!state.session || !state.currentRound) {
        return { ...state, error: "No active round" };
      }

      const completedRound: Round = {
        ...state.currentRound,
        timeTaken: Date.now() - state.currentRound.timestamp,
      };

      const updatedSession: GameSession = {
        ...state.session,
        rounds: [...state.session.rounds, completedRound],
        currentRoundIndex: state.session.currentRoundIndex + 1,
      };

      return {
        ...state,
        status: "selecting",
        session: updatedSession,
        currentRound: null,
        selectedPerson: null,
        error: null,
      };
    }

    case "NEXT_ROUND": {
      return {
        ...state,
        status: "selecting",
        currentRound: null,
        selectedPerson: null,
        error: null,
      };
    }

    case "END_GAME": {
      if (!state.session) {
        return initialGameState;
      }

      const completedSession: GameSession = {
        ...state.session,
        completedAt: Date.now(),
      };

      return {
        ...state,
        status: "complete",
        session: completedSession,
      };
    }

    case "RESET": {
      return initialGameState;
    }

    case "SET_ERROR": {
      return {
        ...state,
        error: action.payload,
      };
    }

    default:
      return state;
  }
}

/** Check if an assignment is valid */
export function isValidAssignment(
  state: GameState,
  assignment: Assignment
): boolean {
  if (!state.currentRound) return false;

  const usedAssignments = state.currentRound.assignments.map((a) => a.assignment);
  return !usedAssignments.includes(assignment);
}

/** Get remaining assignments */
export function getRemainingAssignments(state: GameState): Assignment[] {
  if (!state.currentRound) return ["fuck", "marry", "kill"];

  const usedAssignments = state.currentRound.assignments.map((a) => a.assignment);
  return (["fuck", "marry", "kill"] as Assignment[]).filter(
    (a) => !usedAssignments.includes(a)
  );
}

/** Get unassigned people */
export function getUnassignedPeople(
  state: GameState
): (Person | CustomPerson)[] {
  if (!state.currentRound) return [];

  const assignedIds = new Set(
    state.currentRound.assignments.map((a) => a.person.id)
  );

  return state.currentRound.people.filter((p) => !assignedIds.has(p.id));
}
