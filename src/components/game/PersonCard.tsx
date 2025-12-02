"use client";

import { motion } from "framer-motion";
import { User, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { usePersonImage } from "@/hooks/usePersonImage";
import type { Person, CustomPerson, Assignment } from "@/types";
import { cn } from "@/lib/utils";

interface PersonCardProps {
  person: Person | CustomPerson;
  assignment?: Assignment;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

const assignmentColors: Record<Assignment, string> = {
  fuck: "from-[hsl(var(--fmk-fuck))] to-[hsl(var(--fmk-fuck))]/80",
  marry: "from-[hsl(var(--fmk-marry))] to-[hsl(var(--fmk-marry))]/80",
  kill: "from-[hsl(var(--fmk-kill))] to-[hsl(var(--fmk-kill))]/80",
};

const assignmentLabels: Record<Assignment, string> = {
  fuck: "FUCK",
  marry: "MARRY",
  kill: "KILL",
};

export function PersonCard({
  person,
  assignment,
  isSelected,
  onClick,
  className,
}: PersonCardProps) {
  const currentYear = new Date().getFullYear();
  const age = person.birthYear ? currentYear - person.birthYear : null;
  const { imageUrl, status } = usePersonImage(person);

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card
        onClick={onClick}
        className={cn(
          "relative overflow-hidden cursor-pointer transition-all touch-target",
          "aspect-[3/4] flex flex-col items-center justify-center",
          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          assignment && "opacity-80",
          className
        )}
      >
        {/* Image or placeholder */}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary to-secondary/50">
          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-muted-foreground/50 animate-spin" />
            </div>
          )}

          {status === "error" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}

          {status === "success" && imageUrl && (
            <img
              src={imageUrl}
              alt={person.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>

        {/* Name overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 z-10">
          <h3 className="font-semibold text-white text-sm truncate">
            {person.name}
          </h3>
          {age && (
            <p className="text-xs text-white/70">{age} years old</p>
          )}
        </div>

        {/* Assignment badge */}
        {assignment && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              "absolute inset-0 flex items-center justify-center z-20",
              "bg-gradient-to-br",
              assignmentColors[assignment]
            )}
          >
            <span className="text-2xl font-black text-white drop-shadow-lg">
              {assignmentLabels[assignment]}
            </span>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
