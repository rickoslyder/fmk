"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Play, Users, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { getCategoryById } from "@/data/categories";
import { usePreferences, useSavedPlayers } from "@/lib/db/hooks";
import { db } from "@/lib/db";
import { PlayerManager } from "@/components/players";
import type { GameMode, TimerConfig, SavedPlayer } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category") || "movie-stars";
  const preferences = usePreferences();
  const savedPlayers = useSavedPlayers();

  const category = getCategoryById(categoryId);
  const categoryName = category?.name ?? categoryId === "random" ? "Random Mix" : categoryId === "daily" ? "Daily Challenge" : "Unknown";

  const [mode, setMode] = useState<GameMode>("solo");
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDuration, setTimerDuration] = useState(30);

  const canStart = mode === "solo" || selectedPlayerIds.length >= 2;

  const handleStart = async () => {
    const timerConfig: TimerConfig = {
      enabled: timerEnabled,
      decisionTime: timerDuration,
      discussionTime: 0,
      tickSound: preferences?.soundEnabled ?? true,
    };

    // Get selected players with their settings
    let players: Array<{ id: string; name: string; genderFilter: string[]; ageRange: [number, number] }> = [];

    if (mode === "pass-and-play" && savedPlayers) {
      players = selectedPlayerIds
        .map((id) => savedPlayers.find((p) => p.id === id))
        .filter((p): p is SavedPlayer => p !== undefined)
        .map((p) => ({
          id: p.id,
          name: p.name,
          genderFilter: p.genderFilter,
          ageRange: p.ageRange,
        }));

      // Update lastPlayedAt for selected players
      for (const playerId of selectedPlayerIds) {
        await db.savedPlayers.update(playerId, { lastPlayedAt: Date.now() });
      }
    } else {
      players = [{
        id: "solo",
        name: "Player",
        genderFilter: preferences?.genderFilter || ["male", "female", "other"],
        ageRange: preferences?.ageRange || [18, 99],
      }];
    }

    // Store game config in sessionStorage for the play page
    sessionStorage.setItem("fmk-game-config", JSON.stringify({
      categoryId,
      categoryName,
      mode,
      timerConfig,
      players,
    }));

    router.push("/play");
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">{categoryName}</h1>
          <p className="text-sm text-muted-foreground">Game Setup</p>
        </div>
      </div>

      {/* Mode Selection */}
      <section>
        <h2 className="text-sm font-medium mb-3">Game Mode</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card
            className={cn(
              "cursor-pointer transition-all",
              mode === "solo" && "ring-2 ring-primary"
            )}
            onClick={() => setMode("solo")}
          >
            <CardContent className="flex flex-col items-center gap-2 p-4">
              <User className="h-8 w-8 text-primary" />
              <span className="font-medium">Solo</span>
              <span className="text-xs text-muted-foreground text-center">
                Play by yourself
              </span>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-all",
              mode === "pass-and-play" && "ring-2 ring-primary"
            )}
            onClick={() => setMode("pass-and-play")}
          >
            <CardContent className="flex flex-col items-center gap-2 p-4">
              <Users className="h-8 w-8 text-primary" />
              <span className="font-medium">Pass & Play</span>
              <span className="text-xs text-muted-foreground text-center">
                Take turns with friends
              </span>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Player Selection (Pass & Play only) */}
      {mode === "pass-and-play" && (
        <section>
          <h2 className="text-sm font-medium mb-3">Select Players</h2>
          <PlayerManager
            selectedPlayerIds={selectedPlayerIds}
            onSelectionChange={setSelectedPlayerIds}
            minPlayers={2}
            maxPlayers={10}
          />
        </section>
      )}

      {/* Timer Options */}
      <section>
        <h2 className="text-sm font-medium mb-3">Timer (Optional)</h2>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span>Enable Timer</span>
              </div>
              <Switch
                checked={timerEnabled}
                onCheckedChange={setTimerEnabled}
              />
            </div>

            {timerEnabled && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Duration:</span>
                <div className="flex gap-2">
                  {[15, 30, 60].map((seconds) => (
                    <Button
                      key={seconds}
                      variant={timerDuration === seconds ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimerDuration(seconds)}
                    >
                      {seconds}s
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Start Button */}
      <Button
        onClick={handleStart}
        size="touch-lg"
        className="w-full"
        disabled={!canStart}
      >
        <Play className="h-5 w-5 mr-2" />
        {mode === "pass-and-play" && selectedPlayerIds.length < 2
          ? `Select ${2 - selectedPlayerIds.length} more player${2 - selectedPlayerIds.length !== 1 ? "s" : ""}`
          : "Start Game"}
      </Button>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <SetupContent />
    </Suspense>
  );
}
