"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameProvider, useGame } from "@/contexts/GameContext";
import { PersonCard, AssignmentSlots, Timer, RoundSummary } from "@/components/game";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/shared/LoadingSpinner";
import { usePreferences } from "@/lib/db/hooks";
import { useFeedback } from "@/hooks/useFeedback";
import type { GameMode, TimerConfig, Assignment, Person, CustomPerson, Gender } from "@/types";
import { Home } from "lucide-react";
import Link from "next/link";

interface PlayerConfig {
  id: string;
  name: string;
  genderFilter: Gender[];
  ageRange: [number, number];
}

interface GameConfig {
  categoryId: string;
  categoryName: string;
  mode: GameMode;
  timerConfig: TimerConfig;
  players?: PlayerConfig[];
}

function GameContent() {
  const router = useRouter();
  const preferences = usePreferences();
  const { feedback } = useFeedback();
  const {
    status,
    session,
    currentRound,
    selectedPerson,
    error,
    remainingAssignments,
    unassignedPeople,
    startGame,
    loadNextRound,
    selectPerson,
    assignPerson,
    completeRound,
    nextRound,
    endGame,
    reset,
    canContinue,
  } = useGame();

  const [config, setConfig] = useState<GameConfig | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // Get current player settings
  const getCurrentPlayerSettings = useCallback((): { genderFilter: Gender[]; ageRange: [number, number] } => {
    if (config?.players && config.players.length > 0 && config.mode === "pass-and-play") {
      const currentPlayer = config.players[currentPlayerIndex % config.players.length];
      return {
        genderFilter: currentPlayer.genderFilter as Gender[],
        ageRange: currentPlayer.ageRange,
      };
    }
    // Default to first player (solo) or global preferences
    if (config?.players && config.players.length > 0) {
      return {
        genderFilter: config.players[0].genderFilter as Gender[],
        ageRange: config.players[0].ageRange,
      };
    }
    return {
      genderFilter: preferences?.genderFilter || ["male", "female", "other"],
      ageRange: preferences?.ageRange || [18, 99],
    };
  }, [config, currentPlayerIndex, preferences]);

  const currentPlayer = config?.players?.[currentPlayerIndex % (config?.players?.length || 1)];

  // Load game config from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("fmk-game-config");
    if (stored) {
      const parsed = JSON.parse(stored) as GameConfig;
      setConfig(parsed);
      sessionStorage.removeItem("fmk-game-config");
    } else if (status === "idle") {
      // No config, go back to home
      router.replace("/");
    }
  }, [router, status]);

  // Start game when config is loaded
  useEffect(() => {
    if (config && status === "idle" && preferences) {
      startGame(
        config.categoryId,
        config.categoryName,
        config.mode,
        config.mode === "solo" ? [{ id: "solo", name: "Player" }] : [],
        config.timerConfig
      );
    }
  }, [config, status, preferences, startGame]);

  // Load first round when game is started
  useEffect(() => {
    if (status === "selecting" && preferences) {
      const settings = getCurrentPlayerSettings();
      loadNextRound(settings.genderFilter, settings.ageRange);
    }
  }, [status, preferences, loadNextRound, getCurrentPlayerSettings]);

  const handleAssign = (assignment: Assignment) => {
    if (selectedPerson) {
      assignPerson(selectedPerson, assignment);
      feedback("assign");
    }
  };

  const handleSelectPerson = (person: Person | CustomPerson) => {
    selectPerson(person);
    feedback("tap");
  };

  const handleNextRound = () => {
    completeRound();
    feedback("success");
    // Advance to next player in pass-and-play mode
    if (config?.mode === "pass-and-play" && config.players && config.players.length > 0) {
      setCurrentPlayerIndex((prev) => prev + 1);
    }
  };

  const handleEndGame = () => {
    reset();
    router.replace("/");
  };

  const handleTimerComplete = () => {
    // Auto-end game or force assignment
    // For now, just complete the round if possible
  };

  const handleTimerTick = useCallback(() => {
    feedback("tick");
  }, [feedback]);

  // Loading state
  if (!config || !preferences || status === "idle") {
    return <LoadingScreen message="Starting game..." />;
  }

  // Selecting state (loading next round)
  if (status === "selecting" && !currentRound) {
    return <LoadingScreen message="Loading round..." />;
  }

  // Review state
  if (status === "reviewing" && currentRound) {
    // Get next player's settings for canContinue check
    const nextPlayerIndex = config?.mode === "pass-and-play" && config.players && config.players.length > 0
      ? (currentPlayerIndex + 1) % config.players.length
      : 0;
    const nextPlayerSettings = config?.players?.[nextPlayerIndex];
    const continueSettings = nextPlayerSettings
      ? { genderFilter: nextPlayerSettings.genderFilter as Gender[], ageRange: nextPlayerSettings.ageRange }
      : { genderFilter: preferences?.genderFilter || ["male", "female", "other"] as Gender[], ageRange: preferences?.ageRange || [18, 99] as [number, number] };

    return (
      <RoundSummary
        round={currentRound}
        categoryName={session?.categoryName || config?.categoryName || "FMK"}
        onNextRound={handleNextRound}
        onEndGame={handleEndGame}
        canContinue={canContinue(continueSettings.genderFilter, continueSettings.ageRange)}
        currentPlayerName={currentPlayer?.name}
        nextPlayerName={config?.mode === "pass-and-play" ? config.players?.[nextPlayerIndex]?.name : undefined}
      />
    );
  }

  // Complete state
  if (status === "complete") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Game Complete!</h2>
        <p className="text-muted-foreground mb-6">
          You played {session?.rounds.length ?? 0} rounds
        </p>
        <Link href="/">
          <Button size="touch-lg">
            <Home className="h-5 w-5 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  // Playing state
  if (status === "playing" && currentRound) {
    const usedAssignments = currentRound.assignments.map((a) => a.assignment);

    return (
      <div className="flex flex-col min-h-[calc(100vh-8rem)] p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-bold">{session?.categoryName}</h1>
            <p className="text-sm text-muted-foreground">
              Round {(session?.rounds.length ?? 0) + 1}
              {currentPlayer && ` • ${currentPlayer.name}'s turn`}
            </p>
          </div>
          {config.timerConfig.enabled && (
            <Timer
              duration={config.timerConfig.decisionTime}
              onComplete={handleTimerComplete}
              onTick={handleTimerTick}
            />
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Person cards */}
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-3 w-full max-w-md">
            <AnimatePresence mode="popLayout">
              {currentRound.people.map((person) => {
                const assignment = currentRound.assignments.find(
                  (a) => a.person.id === person.id
                )?.assignment;

                return (
                  <PersonCard
                    key={person.id}
                    person={person}
                    assignment={assignment}
                    isSelected={selectedPerson?.id === person.id}
                    onClick={() => !assignment && handleSelectPerson(person)}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mb-4">
          {selectedPerson ? (
            <p className="text-sm">
              Assign <span className="font-bold">{selectedPerson.name}</span>:
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Tap a person to select them
            </p>
          )}
        </div>

        {/* Assignment slots */}
        <AssignmentSlots
          onAssign={handleAssign}
          disabledAssignments={usedAssignments}
          selectedPerson={selectedPerson}
        />
      </div>
    );
  }

  // Fallback
  return <LoadingScreen message="Loading..." />;
}

export default function PlayPage() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
