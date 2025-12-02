"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import {
  gameReducer,
  initialGameState,
  selectThreePeople,
  hasEnoughPeople,
  getRemainingAssignments,
  getUnassignedPeople,
} from "@/lib/game";
import { getPeopleByCategory, getRandomPeople } from "@/data/categories";
import type {
  GameState,
  GameMode,
  Player,
  TimerConfig,
  Assignment,
  Person,
  CustomPerson,
  Gender,
} from "@/types";

interface GameContextValue extends GameState {
  // Actions
  startGame: (
    categoryId: string,
    categoryName: string,
    mode: GameMode,
    players: Player[],
    timerConfig: TimerConfig
  ) => void;
  loadNextRound: (genderFilter: Gender[], ageRange: [number, number]) => boolean;
  selectPerson: (person: Person | CustomPerson) => void;
  assignPerson: (person: Person | CustomPerson, assignment: Assignment) => void;
  skipPerson: (person: Person | CustomPerson, replacement: Person | CustomPerson) => void;
  completeRound: () => void;
  nextRound: () => void;
  endGame: () => void;
  reset: () => void;

  // Computed
  remainingAssignments: Assignment[];
  unassignedPeople: (Person | CustomPerson)[];
  canContinue: (genderFilter: Gender[], ageRange: [number, number]) => boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  const startGame = useCallback(
    (
      categoryId: string,
      categoryName: string,
      mode: GameMode,
      players: Player[],
      timerConfig: TimerConfig
    ) => {
      dispatch({
        type: "START_GAME",
        payload: { categoryId, categoryName, mode, players, timerConfig },
      });
    },
    []
  );

  const loadNextRound = useCallback(
    (genderFilter: Gender[], ageRange: [number, number]): boolean => {
      if (!state.session) return false;

      const categoryId = state.session.categoryId;
      let people: Person[];

      if (categoryId === "random") {
        people = getRandomPeople(100);
      } else {
        people = getPeopleByCategory(categoryId);
      }

      const selection = selectThreePeople(people, {
        excludeIds: state.usedPersonIds,
        genderFilter,
        ageRange,
      });

      if (!selection) {
        dispatch({ type: "SET_ERROR", payload: "Not enough eligible people remaining" });
        return false;
      }

      dispatch({ type: "SET_ROUND_PEOPLE", payload: selection });
      return true;
    },
    [state.session, state.usedPersonIds]
  );

  const selectPerson = useCallback((person: Person | CustomPerson) => {
    dispatch({ type: "SELECT_PERSON", payload: person });
  }, []);

  const assignPerson = useCallback(
    (person: Person | CustomPerson, assignment: Assignment) => {
      dispatch({ type: "ASSIGN_PERSON", payload: { person, assignment } });
    },
    []
  );

  const skipPerson = useCallback(
    (person: Person | CustomPerson, replacement: Person | CustomPerson) => {
      dispatch({ type: "SKIP_PERSON", payload: person });
      // Note: In a real implementation, you'd need to handle replacement
      // For now, the round would just have fewer people
    },
    []
  );

  const completeRound = useCallback(() => {
    dispatch({ type: "COMPLETE_ROUND" });
  }, []);

  const nextRound = useCallback(() => {
    dispatch({ type: "NEXT_ROUND" });
  }, []);

  const endGame = useCallback(() => {
    dispatch({ type: "END_GAME" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const canContinue = useCallback(
    (genderFilter: Gender[], ageRange: [number, number]): boolean => {
      if (!state.session) return false;

      const categoryId = state.session.categoryId;
      let people: Person[];

      if (categoryId === "random") {
        people = getRandomPeople(100);
      } else {
        people = getPeopleByCategory(categoryId);
      }

      return hasEnoughPeople(people, {
        excludeIds: state.usedPersonIds,
        genderFilter,
        ageRange,
      });
    },
    [state.session, state.usedPersonIds]
  );

  const value: GameContextValue = {
    ...state,
    startGame,
    loadNextRound,
    selectPerson,
    assignPerson,
    skipPerson,
    completeRound,
    nextRound,
    endGame,
    reset,
    remainingAssignments: getRemainingAssignments(state),
    unassignedPeople: getUnassignedPeople(state),
    canContinue,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
