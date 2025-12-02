"use client";

import { useState } from "react";
import { Wand2, Loader2, AlertCircle, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Person } from "@/types";

interface CustomCategoryFormProps {
  onGenerate: (people: Person[], categoryName: string) => void;
  isOffline?: boolean;
}

const LOADING_MESSAGES = [
  "Connecting to AI...",
  "Searching the web for people...",
  "Finding famous faces...",
  "Gathering celebrity data...",
  "Almost there...",
];

export function CustomCategoryForm({ onGenerate, isOffline }: CustomCategoryFormProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[] | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    setLoadingMessage(LOADING_MESSAGES[0]);

    // Cycle through loading messages
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[messageIndex]);
    }, 2000);

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

      // Always store debug info
      if (data.debug) {
        setDebugInfo(data.debug);
        console.log("[Debug Log]", data.debug);
      }

      // Log the full response for debugging
      console.log("[Full API Response]", JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate category");
      }

      // Check if we got any people
      if (!data.people || data.people.length === 0) {
        // Keep debug info visible for this error case
        throw new Error(`No people were generated (provider: ${data.provider || "unknown"}). Check debug info below.`);
      }

      console.log(`Generated ${data.people.length} people using ${data.provider || "unknown"}`);
      onGenerate(data.people, data.categoryName);
    } catch (err) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      clearInterval(messageInterval);
      setIsLoading(false);
      setLoadingMessage("");
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
          <CardContent className="p-3 space-y-2">
            <div className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {debugInfo && debugInfo.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowDebug(!showDebug)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Bug className="h-3 w-3" />
                  {showDebug ? "Hide" : "Show"} debug info
                </button>
                {showDebug && (
                  <pre className="mt-2 text-xs bg-background/50 p-2 rounded overflow-x-auto max-h-48 overflow-y-auto">
                    {debugInfo.join("\n")}
                  </pre>
                )}
              </div>
            )}
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
          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              <span>Generating...</span>
            </div>
            {loadingMessage && (
              <span className="text-xs opacity-75 mt-1">{loadingMessage}</span>
            )}
          </div>
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
