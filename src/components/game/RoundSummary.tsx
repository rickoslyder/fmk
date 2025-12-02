"use client";

import { motion } from "framer-motion";
import { ArrowRight, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Round, Assignment } from "@/types";
import { cn } from "@/lib/utils";

interface RoundSummaryProps {
  round: Round;
  onNextRound: () => void;
  onEndGame: () => void;
  canContinue: boolean;
}

const assignmentLabels: Record<Assignment, string> = {
  fuck: "Fuck",
  marry: "Marry",
  kill: "Kill",
};

const assignmentColors: Record<Assignment, string> = {
  fuck: "text-[hsl(var(--fmk-fuck))]",
  marry: "text-[hsl(var(--fmk-marry))]",
  kill: "text-[hsl(var(--fmk-kill))]",
};

export function RoundSummary({
  round,
  onNextRound,
  onEndGame,
  canContinue,
}: RoundSummaryProps) {
  // Sort assignments in F-M-K order
  const sortedAssignments = [...round.assignments].sort((a, b) => {
    const order: Assignment[] = ["fuck", "marry", "kill"];
    return order.indexOf(a.assignment) - order.indexOf(b.assignment);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-4"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold">Round Complete!</h2>
        <p className="text-muted-foreground mt-1">Here&apos;s what you chose:</p>
      </div>

      {/* Assignments */}
      <div className="space-y-3">
        {sortedAssignments.map((item, index) => (
          <motion.div
            key={item.person.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <span className="font-medium">{item.person.name}</span>
                <span
                  className={cn(
                    "font-bold uppercase",
                    assignmentColors[item.assignment]
                  )}
                >
                  {assignmentLabels[item.assignment]}
                </span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Skipped people */}
      {round.skipped.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Skipped: {round.skipped.map((p) => p.name).join(", ")}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {canContinue ? (
          <Button onClick={onNextRound} size="touch-lg" className="w-full">
            Next Round
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        ) : (
          <p className="text-center text-muted-foreground text-sm">
            No more eligible people remaining!
          </p>
        )}
        <Button
          onClick={onEndGame}
          variant="outline"
          size="touch"
          className="w-full"
        >
          <Home className="h-5 w-5 mr-2" />
          End Game
        </Button>
      </div>
    </motion.div>
  );
}
