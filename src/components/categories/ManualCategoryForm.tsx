"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Play, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Person } from "@/types";

// Simple unique ID generator
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface ManualCategoryFormProps {
  onSave: (people: Person[], categoryName: string) => void;
  onSaveAndPlay: (people: Person[], categoryName: string) => void;
}

interface PersonEntry {
  id: string;
  name: string;
  gender: "male" | "female" | "other" | "";
  birthYear: string;
}

const currentYear = new Date().getFullYear();

export function ManualCategoryForm({ onSave, onSaveAndPlay }: ManualCategoryFormProps) {
  const [categoryName, setCategoryName] = useState("");
  const [people, setPeople] = useState<PersonEntry[]>([
    { id: generateId(), name: "", gender: "", birthYear: "" },
    { id: generateId(), name: "", gender: "", birthYear: "" },
    { id: generateId(), name: "", gender: "", birthYear: "" },
  ]);

  const addPerson = () => {
    setPeople((prev) => [
      ...prev,
      { id: generateId(), name: "", gender: "", birthYear: "" },
    ]);
  };

  const removePerson = (id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePerson = (id: string, field: keyof PersonEntry, value: string) => {
    setPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const getValidPeople = (): Person[] => {
    return people
      .filter((p) => p.name.trim() && p.gender)
      .map((p) => ({
        id: generateId(),
        name: p.name.trim(),
        gender: p.gender as "male" | "female" | "other",
        birthYear: p.birthYear ? parseInt(p.birthYear) : undefined,
        categoryId: categoryName.trim() || "custom-list",
      }));
  };

  const validPeople = getValidPeople();
  const canSave = categoryName.trim() && validPeople.length >= 3;

  const handleSave = () => {
    if (canSave) {
      onSave(validPeople, categoryName.trim());
    }
  };

  const handleSaveAndPlay = () => {
    if (canSave) {
      onSaveAndPlay(validPeople, categoryName.trim());
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Name */}
      <div>
        <label htmlFor="categoryName" className="text-sm font-medium mb-2 block">
          Category Name
        </label>
        <input
          id="categoryName"
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="e.g., My Friends, Coworkers, etc."
          className="w-full px-4 py-3 rounded-lg bg-secondary border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* People List */}
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          People ({validPeople.length} valid, need 3+)
        </label>

        {people.map((person, index) => (
          <Card key={person.id}>
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Person {index + 1}
                </span>
                {people.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePerson(person.id)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <input
                type="text"
                value={person.name}
                onChange={(e) => updatePerson(person.id, "name", e.target.value)}
                placeholder="Name"
                className="w-full px-3 py-2 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />

              <div className="flex gap-2">
                <select
                  value={person.gender}
                  onChange={(e) => updatePerson(person.id, "gender", e.target.value)}
                  className="flex-1 px-3 py-2 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>

                <input
                  type="number"
                  value={person.birthYear}
                  onChange={(e) => updatePerson(person.id, "birthYear", e.target.value)}
                  placeholder="Birth year"
                  min="1900"
                  max={currentYear}
                  className="w-28 px-3 py-2 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addPerson}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Person
        </Button>
      </div>

      {/* Validation Message */}
      {!canSave && (
        <p className="text-sm text-muted-foreground text-center">
          {!categoryName.trim()
            ? "Enter a category name"
            : `Add ${3 - validPeople.length} more valid ${validPeople.length === 2 ? "person" : "people"} (name + gender required)`}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={!canSave}
          className="flex-1"
          size="touch-lg"
        >
          <Save className="h-5 w-5 mr-2" />
          Save
        </Button>
        <Button
          onClick={handleSaveAndPlay}
          disabled={!canSave}
          className="flex-1"
          size="touch-lg"
        >
          <Play className="h-5 w-5 mr-2" />
          Play Now
        </Button>
      </div>
    </div>
  );
}
