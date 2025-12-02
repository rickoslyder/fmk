"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TimerProps {
  duration: number;
  onComplete: () => void;
  onTick?: () => void;
  isPaused?: boolean;
  showWarning?: boolean;
  warningThreshold?: number;
  className?: string;
}

export function Timer({
  duration,
  onComplete,
  onTick,
  isPaused = false,
  showWarning = true,
  warningThreshold = 10,
  className,
}: TimerProps) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    setRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (isPaused || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          onComplete();
          return 0;
        }
        // Play tick sound in warning zone
        if (prev <= warningThreshold && onTick) {
          onTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, remaining, onComplete, onTick, warningThreshold]);

  const percentage = (remaining / duration) * 100;
  const isWarning = showWarning && remaining <= warningThreshold;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2",
        className
      )}
    >
      {/* Circular progress */}
      <div className="relative h-20 w-20">
        <svg className="h-20 w-20 -rotate-90 transform">
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-secondary"
          />
          {/* Progress circle */}
          <motion.circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={226}
            strokeDashoffset={226 - (226 * percentage) / 100}
            className={cn(
              "transition-all duration-300",
              isWarning ? "text-destructive" : "text-primary"
            )}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "text-lg font-bold tabular-nums",
              isWarning && "text-destructive animate-pulse"
            )}
          >
            {formatTime(remaining)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function useTimer(duration: number) {
  const [remaining, setRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, remaining]);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsComplete(false);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    setRemaining(duration);
    setIsRunning(false);
    setIsComplete(false);
  }, [duration]);

  return {
    remaining,
    isRunning,
    isComplete,
    start,
    pause,
    resume,
    reset,
  };
}
