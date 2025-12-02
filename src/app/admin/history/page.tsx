"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import type { GameHistoryEntry } from "@/types";
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Users,
  Heart,
  Gem,
  Skull,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function HistoryPage() {
  const [games, setGames] = useState<GameHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGame, setExpandedGame] = useState<string | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);

  const loadGames = async () => {
    try {
      const history = await db.gameHistory
        .orderBy("playedAt")
        .reverse()
        .toArray();
      setGames(history);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleClearHistory = async () => {
    try {
      await db.gameHistory.clear();
      setGames([]);
      setClearConfirm(false);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  const handleDeleteGame = async (id: string) => {
    try {
      await db.gameHistory.delete(id);
      setGames((prev) => prev.filter((g) => g.id !== id));
    } catch (error) {
      console.error("Failed to delete game:", error);
    }
  };

  const getAssignmentIcon = (assignment: string) => {
    switch (assignment) {
      case "fuck":
        return <Heart className="h-4 w-4 text-[hsl(var(--fmk-fuck))]" />;
      case "marry":
        return <Gem className="h-4 w-4 text-[hsl(var(--fmk-marry))]" />;
      case "kill":
        return <Skull className="h-4 w-4 text-[hsl(var(--fmk-kill))]" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Game History</h1>
          <p className="text-muted-foreground mt-1">
            {games.length} games recorded
          </p>
        </div>
        {games.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => setClearConfirm(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {games.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>No games have been played yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {games.map((game) => (
            <Card key={game.id}>
              <CardContent className="p-4">
                {/* Game header */}
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setExpandedGame(
                      expandedGame === game.id ? null : game.id
                    )
                  }
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-medium">{game.categoryName}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(game.playedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(game.playedAt).toLocaleTimeString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {game.rounds.length} rounds
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGame(game.id);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {expandedGame === game.id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded rounds */}
                {expandedGame === game.id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    {game.rounds.map((round, roundIndex) => (
                      <div key={roundIndex} className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Round {roundIndex + 1}
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {round.assignments.map((assignment, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 p-2 rounded bg-secondary"
                            >
                              {getAssignmentIcon(assignment.assignment)}
                              <span className="text-sm truncate">
                                {assignment.person.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Clear confirmation dialog */}
      <Dialog open={clearConfirm} onOpenChange={setClearConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear All History</DialogTitle>
            <DialogDescription>
              This will permanently delete all {games.length} game records. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearHistory}>
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
