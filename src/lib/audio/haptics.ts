/**
 * Haptic feedback manager for FMK game
 * Uses Vibration API for mobile devices
 */

type HapticType =
  | "light"   // Brief tap
  | "medium"  // Standard interaction
  | "heavy"   // Significant action
  | "success" // Positive feedback
  | "error"   // Negative feedback
  | "select"; // Selection made

// Vibration patterns (in milliseconds)
// [vibrate, pause, vibrate, pause, ...]
const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [30, 50, 30], // Short-pause-short
  error: [50, 30, 50, 30, 50], // Three pulses
  select: [15, 30, 40], // Short-pause-longer
};

let hapticsEnabled = true;

/**
 * Check if vibration is supported
 */
function isVibrationSupported(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

/**
 * Trigger haptic feedback
 */
export function triggerHaptic(type: HapticType): void {
  if (!hapticsEnabled || !isVibrationSupported()) return;

  try {
    navigator.vibrate(HAPTIC_PATTERNS[type]);
  } catch {
    // Vibration may fail silently on some devices
  }
}

/**
 * Enable or disable haptics
 */
export function setHapticsEnabled(enabled: boolean): void {
  hapticsEnabled = enabled;
}

/**
 * Check if haptics are enabled
 */
export function isHapticsEnabled(): boolean {
  return hapticsEnabled;
}

/**
 * Check if haptics are available on this device
 */
export function areHapticsAvailable(): boolean {
  return isVibrationSupported();
}
