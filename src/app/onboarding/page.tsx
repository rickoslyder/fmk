"use client";

import { useRouter } from "next/navigation";
import { OnboardingCarousel } from "@/components/onboarding";
import { completeOnboarding } from "@/lib/db/init";
import { db } from "@/lib/db";
import type { Preferences } from "@/types";
import { DEFAULT_PREFERENCES } from "@/types";

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = async (preferences: Partial<Preferences>) => {
    // Save preferences to database
    const existingPrefs = await db.preferences.get("user-preferences");
    await db.preferences.put({
      ...(existingPrefs ?? DEFAULT_PREFERENCES),
      ...preferences,
      id: "user-preferences",
      onboardingComplete: true,
      updatedAt: Date.now(),
    });

    // Navigate to home
    router.replace("/");
  };

  const handleSkip = async () => {
    // Complete onboarding with defaults
    await completeOnboarding();
    router.replace("/");
  };

  return (
    <OnboardingCarousel
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}
