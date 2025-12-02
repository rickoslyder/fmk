"use client";

import { motion } from "framer-motion";
import type { OnboardingSlide as SlideType } from "./slides";

interface OnboardingSlideProps {
  slide: SlideType;
  children?: React.ReactNode;
}

export function OnboardingSlide({ slide, children }: OnboardingSlideProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center px-6 py-8"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-6xl mb-6">{slide.emoji}</div>
      <h2 className="text-2xl font-bold mb-4">{slide.title}</h2>
      <p className="text-muted-foreground text-lg max-w-sm">{slide.description}</p>
      {children && <div className="mt-8 w-full max-w-sm">{children}</div>}
    </motion.div>
  );
}
