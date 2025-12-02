/**
 * Sound effects manager for FMK game
 * Uses Web Audio API for low-latency sound playback
 */

type SoundType =
  | "tap"
  | "swipe"
  | "assign"
  | "success"
  | "error"
  | "tick"
  | "reveal";

// Sound configuration
const SOUNDS: Record<SoundType, { frequency: number; duration: number; type: OscillatorType; volume: number }> = {
  tap: { frequency: 800, duration: 50, type: "sine", volume: 0.2 },
  swipe: { frequency: 400, duration: 100, type: "sine", volume: 0.15 },
  assign: { frequency: 600, duration: 80, type: "triangle", volume: 0.25 },
  success: { frequency: 880, duration: 200, type: "sine", volume: 0.3 },
  error: { frequency: 200, duration: 150, type: "sawtooth", volume: 0.2 },
  tick: { frequency: 1000, duration: 30, type: "sine", volume: 0.15 },
  reveal: { frequency: 523, duration: 300, type: "triangle", volume: 0.25 },
};

// Multi-tone sounds (success/reveal have melodic sequences)
const MELODIC_SOUNDS: Partial<Record<SoundType, number[]>> = {
  success: [523, 659, 784], // C5, E5, G5 - major chord arpeggio
  reveal: [392, 494, 587], // G4, B4, D5 - major chord
};

let audioContext: AudioContext | null = null;
let soundEnabled = true;

/**
 * Initialize or get audio context
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      console.warn("Web Audio API not supported");
      return null;
    }
  }

  // Resume context if suspended (browser autoplay policy)
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

/**
 * Play a single tone
 */
function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  startTime: number = 0
): void {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime + startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration / 1000);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime + startTime);
  oscillator.stop(ctx.currentTime + startTime + duration / 1000);
}

/**
 * Play a sound effect
 */
export function playSound(sound: SoundType): void {
  if (!soundEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const config = SOUNDS[sound];
  const melodicSequence = MELODIC_SOUNDS[sound];

  if (melodicSequence) {
    // Play melodic sequence with slight delays
    melodicSequence.forEach((freq, index) => {
      playTone(ctx, freq, config.duration, config.type, config.volume, index * 0.08);
    });
  } else {
    playTone(ctx, config.frequency, config.duration, config.type, config.volume);
  }
}

/**
 * Enable or disable sounds
 */
export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

/**
 * Check if sounds are enabled
 */
export function isSoundEnabled(): boolean {
  return soundEnabled;
}

/**
 * Initialize audio context on user interaction
 * Call this early to ensure sounds work later
 */
export function initAudio(): void {
  getAudioContext();
}
