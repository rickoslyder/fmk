"use client";

import { useEffect, useState } from "react";
import { initializeDatabase } from "@/lib/db/init";
import { seedCategories } from "@/lib/db/seed";
import { LoadingScreen } from "@/components/shared/LoadingSpinner";

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        // Initialize database with default preferences
        await initializeDatabase();
        // Seed category data
        await seedCategories();
        setIsInitialized(true);
      } catch (err) {
        console.error("Failed to initialize database:", err);
        setError("Failed to initialize the app. Please refresh the page.");
      }
    }

    init();
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-destructive">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isInitialized) {
    return <LoadingScreen message="Setting up..." />;
  }

  return <>{children}</>;
}
