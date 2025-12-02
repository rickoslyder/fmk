"use client";

import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Person } from "@/types";

interface CustomCategoryFormProps {
  onGenerate: (people: Person[], categoryName: string) => void;
  isOffline?: boolean;
}

export function CustomCategoryForm({ onGenerate, isOffline }: CustomCategoryFormProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          count: 30,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate category");
      }

      onGenerate(data.people, data.categoryName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const examplePrompts = [
    "90s sitcom actors",
    "Famous chefs with TV shows",
    "Olympic gold medalists",
    "British musicians",
    "Silicon Valley founders",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="prompt" className="text-sm font-medium mb-2 block">
          Describe your category
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Famous chefs with TV shows..."
          className="w-full h-24 px-4 py-3 rounded-lg bg-secondary border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          disabled={isLoading || isOffline}
        />
      </div>

      {/* Example prompts */}
      <div className="flex flex-wrap gap-2">
        {examplePrompts.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setPrompt(example)}
            className="text-xs px-3 py-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            disabled={isLoading}
          >
            {example}
          </button>
        ))}
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-3 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {isOffline && (
        <Card className="border-yellow-500 bg-yellow-500/10">
          <CardContent className="p-3 text-sm text-yellow-500">
            AI generation requires an internet connection
          </CardContent>
        </Card>
      )}

      <Button
        type="submit"
        size="touch-lg"
        className="w-full"
        disabled={!prompt.trim() || isLoading || isOffline}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="h-5 w-5 mr-2" />
            Generate Category
          </>
        )}
      </Button>
    </form>
  );
}
