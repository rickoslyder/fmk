"use client";

import { History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGameHistory } from "@/lib/db/hooks";
import { clearGameHistory } from "@/lib/db/init";

export default function HistoryPage() {
  const history = useGameHistory();

  const handleClear = async () => {
    if (confirm("Are you sure you want to clear all history?")) {
      await clearGameHistory();
    }
  };

  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <History className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">No History Yet</h2>
        <p className="text-muted-foreground">
          Your past games will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Game History</h1>
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <Trash2 className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      <div className="space-y-3">
        {history.map((game) => (
          <Card key={game.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{game.categoryName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {game.totalRounds} rounds • {new Date(game.playedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
