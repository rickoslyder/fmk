# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FMK is a mobile-first PWA for playing "Fuck, Marry, Kill" with customizable categories. Core gameplay is implemented with 10 pre-built categories and ~350 people.

## Commands

```bash
npm run dev          # Development server (http://localhost:3000)
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run linting
```

## Technology Stack

- **Framework**: Next.js 15.1, React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS, shadcn/ui components, Framer Motion
- **Data**: IndexedDB via Dexie.js (offline-first, no backend)
- **Hosting**: Designed for Vercel

## Architecture

### Directory Structure
```
src/
├── app/
│   ├── (game)/           # Main routes with Header/BottomNav layout
│   │   ├── page.tsx      # Home - category selection
│   │   ├── setup/        # Game configuration (mode, timer)
│   │   ├── play/         # Active gameplay
│   │   ├── history/      # Past games
│   │   ├── settings/     # Preferences
│   │   └── custom/       # Custom categories (placeholder)
│   └── onboarding/       # First-launch flow
├── components/
│   ├── ui/               # shadcn/ui (button, card, dialog, slider, switch, toast)
│   ├── game/             # PersonCard, AssignmentSlots, Timer, RoundSummary
│   ├── categories/       # CategoryCard, CategoryGrid, DailyChallengeCard
│   ├── onboarding/       # OnboardingCarousel, PreferencesForm
│   ├── shared/           # Header, BottomNav, LoadingSpinner
│   └── providers/        # DatabaseProvider, OnboardingGate
├── contexts/
│   └── GameContext.tsx   # Game state management with reducer
├── lib/
│   ├── db/               # Dexie schema, hooks, init, seed
│   ├── game/             # Engine (state machine), selection algorithm
│   └── utils.ts          # cn() helper
├── data/categories/      # Pre-built JSON (movie-stars, musicians, athletes, etc.)
├── types/                # TypeScript interfaces
└── hooks/                # useGame, use-toast
```

### Game Flow
1. **Onboarding**: First-time users set gender/age preferences
2. **Home**: Select category or daily challenge
3. **Setup**: Choose solo/pass-and-play, optional timer
4. **Play**: Tap person → tap F/M/K slot → repeat 3x
5. **Review**: See assignments, next round or end

### State Machine
`idle → selecting → playing → reviewing → complete`

### Data Model
- **Preferences**: Stored in IndexedDB, accessed via `usePreferences()` hook
- **People**: Seeded from JSON on first load, queried from IndexedDB
- **Game State**: React context with reducer pattern

## Key Files

- `src/contexts/GameContext.tsx` - Game state provider and actions
- `src/lib/game/engine.ts` - State machine and reducer logic
- `src/lib/game/selection.ts` - Person filtering and random selection
- `src/lib/db/hooks.ts` - Dexie reactive hooks
- `src/data/categories/index.ts` - Category loader and helpers

## Categories (Pre-built)

10 categories with 25-40 people each:
- movie-stars, musicians, athletes, reality-tv, politicians
- comedians, influencers, tech-ceos, models, chefs

## Not Yet Implemented

- AI category generation (Claude API integration)
- Image fetching (TMDB/Wikipedia waterfall)
- Daily challenges (Vercel KV)
- Admin panel
- PWA service worker
- Sound effects / haptics

## Design Principles

- **Drunk-proof UX**: 48px+ touch targets, minimal text input
- **Offline-first**: All data in IndexedDB
- **Dark theme default**: FMK brand colors (pink/green/red for F/M/K)
