"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingSlide } from "./OnboardingSlide";
import { PreferencesForm } from "./PreferencesForm";
import { ONBOARDING_SLIDES } from "./slides";
import type { Preferences } from "@/types";
import { cn } from "@/lib/utils";

interface OnboardingCarouselProps {
  onComplete: (preferences: Partial<Preferences>) => void;
  onSkip: () => void;
}

export function OnboardingCarousel({ onComplete, onSkip }: OnboardingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;
  const isFirstSlide = currentIndex === 0;

  const goNext = () => {
    if (!isLastSlide) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goPrev = () => {
    if (!isFirstSlide) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleComplete = async (preferences: Partial<Preferences>) => {
    setIsSubmitting(true);
    try {
      await onComplete(preferences);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSlide = ONBOARDING_SLIDES[currentIndex];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Skip button */}
      <div className="flex justify-end p-4">
        <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
          Skip
        </Button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <OnboardingSlide key={currentSlide.id} slide={currentSlide}>
            {isLastSlide && (
              <PreferencesForm
                onComplete={handleComplete}
                isSubmitting={isSubmitting}
              />
            )}
          </OnboardingSlide>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-6 space-y-4">
        {/* Dots */}
        <div className="flex justify-center gap-2">
          {ONBOARDING_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentIndex ? "bg-primary" : "bg-muted"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        {!isLastSlide && (
          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={goPrev}
              disabled={isFirstSlide}
              size="touch"
              className={cn(isFirstSlide && "invisible")}
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back
            </Button>
            <Button onClick={goNext} size="touch">
              Next
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
