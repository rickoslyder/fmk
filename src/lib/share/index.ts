/**
 * Share functionality for FMK game results
 * Uses Web Share API with clipboard fallback
 */

import type { Round, Assignment } from "@/types";

export interface ShareResult {
  success: boolean;
  method: "webshare" | "clipboard" | "none";
  error?: string;
}

/**
 * Check if Web Share API is available
 */
export function canWebShare(): boolean {
  return typeof navigator !== "undefined" && "share" in navigator;
}

/**
 * Check if clipboard API is available
 */
export function canCopyToClipboard(): boolean {
  return typeof navigator !== "undefined" && "clipboard" in navigator;
}

/**
 * Format assignment for display
 */
function formatAssignment(assignment: Assignment): string {
  switch (assignment) {
    case "fuck":
      return "💕 F";
    case "marry":
      return "💍 M";
    case "kill":
      return "💀 K";
    default:
      return assignment;
  }
}

/**
 * Generate share text for a round
 */
export function generateRoundShareText(
  round: Round,
  categoryName: string
): string {
  const assignments = round.assignments
    .map((a) => `${formatAssignment(a.assignment)}: ${a.person.name}`)
    .join("\n");

  return `FMK: ${categoryName}\n\n${assignments}\n\nPlay at ${typeof window !== "undefined" ? window.location.origin : "fmk.app"}`;
}

/**
 * Generate share text for a full game session
 */
export function generateSessionShareText(
  rounds: Round[],
  categoryName: string
): string {
  const roundTexts = rounds.map((round, index) => {
    const assignments = round.assignments
      .map((a) => `${formatAssignment(a.assignment)}: ${a.person.name}`)
      .join(" | ");
    return `Round ${index + 1}: ${assignments}`;
  });

  return `FMK Game - ${categoryName}\n\n${roundTexts.join("\n")}\n\n${rounds.length} rounds played!\n\nPlay at ${typeof window !== "undefined" ? window.location.origin : "fmk.app"}`;
}

/**
 * Share content using Web Share API or clipboard fallback
 */
export async function shareContent(
  title: string,
  text: string,
  url?: string
): Promise<ShareResult> {
  // Try Web Share API first
  if (canWebShare()) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return { success: true, method: "webshare" };
    } catch (err) {
      // User cancelled or share failed
      if (err instanceof Error && err.name === "AbortError") {
        return { success: false, method: "none", error: "Share cancelled" };
      }
      // Fall through to clipboard
    }
  }

  // Fallback to clipboard
  if (canCopyToClipboard()) {
    try {
      const fullText = url ? `${text}\n\n${url}` : text;
      await navigator.clipboard.writeText(fullText);
      return { success: true, method: "clipboard" };
    } catch (err) {
      return {
        success: false,
        method: "clipboard",
        error: "Failed to copy to clipboard",
      };
    }
  }

  return {
    success: false,
    method: "none",
    error: "Sharing not supported on this device",
  };
}

/**
 * Share a round result
 */
export async function shareRound(
  round: Round,
  categoryName: string
): Promise<ShareResult> {
  const text = generateRoundShareText(round, categoryName);
  return shareContent("FMK Round Result", text);
}

/**
 * Share a full game session
 */
export async function shareSession(
  rounds: Round[],
  categoryName: string
): Promise<ShareResult> {
  const text = generateSessionShareText(rounds, categoryName);
  return shareContent("FMK Game Result", text);
}
