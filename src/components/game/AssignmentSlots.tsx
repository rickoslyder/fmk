"use client";

import { motion } from "framer-motion";
import { Heart, Gem, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Assignment, Person, CustomPerson } from "@/types";
import { cn } from "@/lib/utils";

interface AssignmentSlot {
  type: Assignment;
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
}

const slots: AssignmentSlot[] = [
  {
    type: "fuck",
    icon: <Heart className="h-6 w-6" />,
    label: "Fuck",
    color: "text-[hsl(var(--fmk-fuck))]",
    bgColor: "bg-[hsl(var(--fmk-fuck))]",
  },
  {
    type: "marry",
    icon: <Gem className="h-6 w-6" />,
    label: "Marry",
    color: "text-[hsl(var(--fmk-marry))]",
    bgColor: "bg-[hsl(var(--fmk-marry))]",
  },
  {
    type: "kill",
    icon: <Skull className="h-6 w-6" />,
    label: "Kill",
    color: "text-[hsl(var(--fmk-kill))]",
    bgColor: "bg-[hsl(var(--fmk-kill))]",
  },
];

interface AssignmentSlotsProps {
  onAssign: (assignment: Assignment) => void;
  disabledAssignments: Assignment[];
  selectedPerson: (Person | CustomPerson) | null;
}

export function AssignmentSlots({
  onAssign,
  disabledAssignments,
  selectedPerson,
}: AssignmentSlotsProps) {
  return (
    <div className="flex gap-3 justify-center">
      {slots.map((slot) => {
        const isDisabled = disabledAssignments.includes(slot.type);
        const canAssign = selectedPerson && !isDisabled;

        return (
          <motion.div
            key={slot.type}
            whileTap={canAssign ? { scale: 0.95 } : undefined}
          >
            <Button
              variant="outline"
              size="touch-lg"
              disabled={!canAssign}
              onClick={() => onAssign(slot.type)}
              className={cn(
                "flex flex-col gap-1 h-auto py-4 px-6 transition-all",
                canAssign && `hover:${slot.bgColor} hover:text-white hover:border-transparent`,
                isDisabled && "opacity-30"
              )}
            >
              <span className={cn(slot.color, isDisabled && "text-muted-foreground")}>
                {slot.icon}
              </span>
              <span className="text-xs font-medium">{slot.label}</span>
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}
