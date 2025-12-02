"use client";

import { useState, useEffect } from "react";
import { Check, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import type { Person } from "@/types";

interface CategoryReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  people: Person[];
  onSaveAndPlay: (people: Person[]) => void;
  onSave: (people: Person[]) => void;
}

export function CategoryReviewModal({
  isOpen,
  onClose,
  categoryName,
  people: initialPeople,
  onSaveAndPlay,
  onSave,
}: CategoryReviewModalProps) {
  const [people, setPeople] = useState(initialPeople);

  // Update people when initialPeople changes (e.g., when new category is generated)
  useEffect(() => {
    setPeople(initialPeople);
  }, [initialPeople]);

  const handleRemovePerson = (personId: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== personId));
  };

  const handleSaveAndPlay = () => {
    if (people.length >= 3) {
      onSaveAndPlay(people);
    }
  };

  const handleSave = () => {
    if (people.length >= 3) {
      onSave(people);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Review: {categoryName}</DialogTitle>
          <DialogDescription>
            {people.length} people generated. Remove any you don&apos;t want.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-2">
          {people.map((person) => (
            <Card key={person.id} className="group">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{person.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {person.gender} • {person.birthYear ? `${currentYear - person.birthYear} years old` : "Age unknown"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePerson(person.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}

          {people.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No people remaining. Generate a new category.
            </p>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {people.length < 3 && (
            <p className="text-sm text-destructive text-center">
              Need at least 3 people to play
            </p>
          )}
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={people.length < 3}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={handleSaveAndPlay}
              disabled={people.length < 3}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Play Now
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
