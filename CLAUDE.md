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
│   │   └── custom/       # AI + manual custom categories
│   ├── api/
│   │   ├── ai/           # Claude API for category generation
│   │   │   ├── generate/ # Generate custom categories
│   │   │   └── validate/ # Validate generated lists
│   │   └── images/proxy/ # CORS proxy for external images
│   └── onboarding/       # First-launch flow
├── components/
│   ├── ui/               # shadcn/ui (button, card, dialog, slider, switch, toast)
│   ├── game/             # PersonCard, AssignmentSlots, Timer, RoundSummary
│   ├── categories/       # CategoryCard, CategoryGrid, CustomCategoryForm, ManualCategoryForm
│   ├── onboarding/       # OnboardingCarousel, PreferencesForm
│   ├── shared/           # Header, BottomNav, LoadingSpinner
│   ├── pwa/              # InstallBanner, OfflineIndicator
│   └── providers/        # DatabaseProvider, OnboardingGate
├── contexts/
│   └── GameContext.tsx   # Game state management with reducer
├── lib/
│   ├── ai/               # Anthropic client and prompts
│   ├── audio/            # Sound effects and haptic feedback
│   ├── db/               # Dexie schema, hooks, init, seed
│   ├── game/             # Engine (state machine), selection algorithm
│   ├── images/           # TMDB/Wikipedia fetcher with caching
│   ├── share/            # Web Share API utilities
│   └── utils.ts          # cn() helper
├── hooks/
│   ├── usePersonImage.ts # Image loading with caching
│   ├── useFeedback.ts    # Sound + haptic feedback
│   ├── usePWA.ts         # PWA install prompt
│   └── useOnlineStatus.ts
├── data/categories/      # Pre-built JSON (movie-stars, musicians, athletes, etc.)
├── types/                # TypeScript interfaces
public/
├── manifest.json         # PWA manifest
├── sw.js                 # Service worker
└── icons/                # PWA icons
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

## Implemented Features

- **AI Category Generation**: Claude API creates custom categories from user prompts
- **Image Fetching**: TMDB → Wikipedia waterfall with IndexedDB caching (LRU eviction)
- **Manual Custom Lists**: Create your own lists without AI
- **Sound Effects**: Web Audio API synthesized sounds for UI feedback
- **Haptic Feedback**: Vibration API for mobile devices
- **Share Results**: Web Share API with clipboard fallback
- **PWA Support**: Manifest, service worker, install prompt
- **Offline Mode**: Offline indicator, graceful degradation

## Admin Panel

Access at `/admin`. Features:

- **Dashboard**: Stats overview (people, categories, games, cache size)
- **Categories**: View/manage pre-built and custom categories
- **Category Detail**: Add/edit/delete people within categories
- **People**: Browse all people with search and filters
- **Game History**: View/delete game records with round details
- **Image Cache**: View cached images, clear cache
- **Database**: Export/import data, re-seed, clear user data

## Not Yet Implemented

- Daily challenges (Vercel KV) - explicitly deferred
- PNG icons (currently SVG placeholder)

## Environment Variables

```bash
ANTHROPIC_API_KEY=    # Required for AI category generation
TMDB_API_KEY=         # Optional for celebrity images
```

## Design Principles

- **Drunk-proof UX**: 48px+ touch targets, minimal text input
- **Offline-first**: All data in IndexedDB
- **Dark theme default**: FMK brand colors (pink/green/red for F/M/K)
