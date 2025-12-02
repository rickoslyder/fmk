"use client";

import { useState } from "react";
import { Settings, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { usePreferences, useUpdatePreferences } from "@/lib/db/hooks";
import { clearAllData } from "@/lib/db/init";
import type { Gender } from "@/types";
import { cn } from "@/lib/utils";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Men" },
  { value: "female", label: "Women" },
  { value: "other", label: "Other" },
];

export default function SettingsPage() {
  const preferences = usePreferences();
  const updatePreferences = useUpdatePreferences();
  const [isSaving, setIsSaving] = useState(false);

  if (!preferences) {
    return <div className="p-4">Loading...</div>;
  }

  const handleGenderToggle = async (gender: Gender) => {
    const newFilter = preferences.genderFilter.includes(gender)
      ? preferences.genderFilter.filter((g) => g !== gender)
      : [...preferences.genderFilter, gender];

    // Don't allow empty filter
    if (newFilter.length === 0) return;

    setIsSaving(true);
    await updatePreferences({ genderFilter: newFilter });
    setIsSaving(false);
  };

  const handleAgeChange = async (value: number[]) => {
    setIsSaving(true);
    await updatePreferences({ ageRange: value as [number, number] });
    setIsSaving(false);
  };

  const handleSoundToggle = async (enabled: boolean) => {
    setIsSaving(true);
    await updatePreferences({ soundEnabled: enabled });
    setIsSaving(false);
  };

  const handleHapticsToggle = async (enabled: boolean) => {
    setIsSaving(true);
    await updatePreferences({ hapticsEnabled: enabled });
    setIsSaving(false);
  };

  const handleReset = async () => {
    if (confirm("This will clear all data and restart the app. Continue?")) {
      await clearAllData();
      window.location.reload();
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Settings className="h-5 w-5" />
        Settings
      </h1>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Gender Filter */}
          <div>
            <label className="text-sm font-medium mb-3 block">Show me</label>
            <div className="flex gap-2">
              {GENDER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleGenderToggle(option.value)}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-lg font-medium transition-colors touch-target",
                    preferences.genderFilter.includes(option.value)
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
              Age range: {preferences.ageRange[0]} - {preferences.ageRange[1] === 100 ? "100+" : preferences.ageRange[1]}
            </label>
            <Slider
              defaultValue={preferences.ageRange}
              min={18}
              max={100}
              step={1}
              onValueCommit={handleAgeChange}
              className="py-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sound & Haptics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Sound effects</label>
            <Switch
              checked={preferences.soundEnabled}
              onCheckedChange={handleSoundToggle}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Haptic feedback</label>
            <Switch
              checked={preferences.hapticsEnabled}
              onCheckedChange={handleHapticsToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reset */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleReset}
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All Data
          </Button>
        </CardContent>
      </Card>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground">
        FMK v0.1.0
      </p>
    </div>
  );
}
