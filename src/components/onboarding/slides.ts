export interface OnboardingSlide {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "welcome",
    emoji: "🎉",
    title: "Welcome to FMK!",
    description:
      "The classic party game, now on your phone. Pick 3 people and decide: who do you Fuck, Marry, or Kill?",
  },
  {
    id: "how-to-play",
    emoji: "🎮",
    title: "How to Play",
    description:
      "Choose a category, get 3 people, and assign each one. Play solo or pass the phone around with friends!",
  },
  {
    id: "preferences",
    emoji: "⚙️",
    title: "Set Your Preferences",
    description:
      "Customize who you see. You can always change these later in settings.",
  },
];
