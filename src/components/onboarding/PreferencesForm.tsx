"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import type { Gender, Preferences } from "@/types";
import { DEFAULT_PREFERENCES } from "@/types";
import { cn } from "@/lib/utils";

interface PreferencesFormProps {
  onComplete: (preferences: Partial<Preferences>) => void;
  isSubmitting?: boolean;
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Men" },
  { value: "female", label: "Women" },
  { value: "other", label: "Other" },
];

export function PreferencesForm({ onComplete, isSubmitting }: PreferencesFormProps) {
  const [genderFilter, setGenderFilter] = useState<Gender[]>(
    DEFAULT_PREFERENCES.genderFilter
  );
  const [ageRange, setAgeRange] = useState<[number, number]>(
    DEFAULT_PREFERENCES.ageRange
  );
  const [soundEnabled, setSoundEnabled] = useState(
    DEFAULT_PREFERENCES.soundEnabled
  );
  const [hapticsEnabled, setHapticsEnabled] = useState(
    DEFAULT_PREFERENCES.hapticsEnabled
  );

  const toggleGender = (gender: Gender) => {
    setGenderFilter((prev) => {
      if (prev.includes(gender)) {
        // Don't allow removing the last one
        if (prev.length === 1) return prev;
        return prev.filter((g) => g !== gender);
      }
      return [...prev, gender];
    });
  };

  const handleSubmit = () => {
    onComplete({
      genderFilter,
      ageRange,
      soundEnabled,
      hapticsEnabled,
    });
  };

  return (
    <div className="space-y-6">
      {/* Gender Filter */}
      <div>
        <label className="text-sm font-medium mb-3 block">Show me</label>
        <div className="flex gap-2">
          {GENDER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleGender(option.value)}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg font-medium transition-colors touch-target",
                genderFilter.includes(option.value)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Age Range */}
      <div>
        <label className="text-sm font-medium mb-3 block">
          Age range: {ageRange[0]} - {ageRange[1] === 100 ? "100+" : ageRange[1]}
        </label>
        <Slider
          defaultValue={ageRange}
          min={18}
          max={100}
          step={1}
          onValueChange={(value) => setAgeRange(value as [number, number])}
          className="py-4"
        />
      </div>

      {/* Sound & Haptics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Sound effects</label>
          <Switch
            checked={soundEnabled}
            onCheckedChange={setSoundEnabled}
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Haptic feedback</label>
          <Switch
            checked={hapticsEnabled}
            onCheckedChange={setHapticsEnabled}
          />
        </div>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        size="touch-lg"
        className="w-full mt-4"
      >
        {isSubmitting ? "Starting..." : "Let's Play!"}
      </Button>
    </div>
  );
}
