"use client";

import { useCallback, useEffect } from "react";
import { usePreferences } from "@/lib/db/hooks";
import {
  playSound,
  setSoundEnabled,
  initAudio,
  triggerHaptic,
  setHapticsEnabled,
} from "@/lib/audio";

type FeedbackType =
  | "tap"      // Button press, selection
  | "swipe"    // Card swipe
  | "assign"   // Assignment made (F/M/K)
  | "success"  // Round complete, game win
  | "error"    // Invalid action
  | "tick"     // Timer tick
  | "reveal";  // Card reveal

/**
 * Hook for providing audio and haptic feedback
 * Respects user preferences from settings
 */
export function useFeedback() {
  const preferences = usePreferences();

  // Sync preferences with audio/haptics systems
  useEffect(() => {
    if (preferences) {
      setSoundEnabled(preferences.soundEnabled);
      setHapticsEnabled(preferences.hapticsEnabled);
    }
  }, [preferences]);

  // Initialize audio context on mount
  useEffect(() => {
    initAudio();
  }, []);

  const feedback = useCallback((type: FeedbackType) => {
    // Map feedback types to sound/haptic types
    switch (type) {
      case "tap":
        playSound("tap");
        triggerHaptic("light");
        break;
      case "swipe":
        playSound("swipe");
        triggerHaptic("medium");
        break;
      case "assign":
        playSound("assign");
        triggerHaptic("select");
        break;
      case "success":
        playSound("success");
        triggerHaptic("success");
        break;
      case "error":
        playSound("error");
        triggerHaptic("error");
        break;
      case "tick":
        playSound("tick");
        triggerHaptic("light");
        break;
      case "reveal":
        playSound("reveal");
        triggerHaptic("heavy");
        break;
    }
  }, []);

  return { feedback };
}
