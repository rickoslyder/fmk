<brainstorming>
Let me analyze this comprehensive FMK PWA specification and plan the implementation approach.

**Key Technical Decisions:**
1. **No backend database** - All data in IndexedDB via Dexie.js
2. **PWA-first** - Service worker, manifest, offline support critical
3. **Mobile-first, drunk-proof UX** - Large tap targets (48px+), minimal text input
4. **AI integration** - Claude/OpenAI for custom category generation with LLM validation
5. **Image waterfall** - TMDB → Wikipedia → Image search with caching

**Critical Dependencies:**
- Dexie.js must be set up before any data operations
- Pre-built category data must exist before home page works
- Game context must exist before gameplay components
- PWA config needed early for testing offline behavior
- shadcn/ui components needed before building custom components

**Complexity Assessment:**
- **High**: Game state machine, AI category generation, image fetching waterfall
- **Medium**: Offline support, admin panel, pass-and-play multiplayer
- **Low**: Onboarding, settings, history, share functionality

**Logical Implementation Order:**
1. Foundation (Next.js, Tailwind, shadcn/ui, project structure)
2. Database layer (Dexie schema, hooks, initialization)
3. Pre-built data (category JSON files)
4. Design system (CSS variables, typography, colors)
5. Core UI components (reusable across features)
6. Onboarding flow (gates the entire app)
7. Home page with categories
8. Game engine and state management
9. Gameplay UI components
10. AI integration for custom categories
11. Image fetching system
12. Offline support (service worker)
13. History and settings
14. Admin panel
15. Sound/haptics
16. Testing
17. Polish and optimization

**Key Considerations:**
- Steps should be atomic and testable
- Each step should produce working (even if incomplete) functionality
- Dependencies must be strictly ordered
- Max 20 files per step, ideally fewer
- Include user instructions for external configurations

Let me create the detailed implementation plan now.
</brainstorming>

# Implementation Plan

## 1. Project Foundation

- [ ] Step 1.1: Initialize Next.js project with TypeScript and base configuration
  - **Task**: Create a new Next.js 14+ project with App Router, TypeScript, and configure basic settings. Set up the initial project structure with placeholder directories.
  - **Files**:
    - `package.json`: Initialize with Next.js, React 19, TypeScript dependencies
    - `tsconfig.json`: TypeScript configuration with strict mode and path aliases
    - `next.config.js`: Basic Next.js configuration (PWA config added later)
    - `.env.local.example`: Template for environment variables
    - `.gitignore`: Standard Next.js gitignore
    - `src/app/layout.tsx`: Root layout with basic HTML structure
    - `src/app/page.tsx`: Placeholder home page
    - `src/app/globals.css`: Tailwind imports and CSS variable placeholders
  - **Step Dependencies**: None
  - **User Instructions**: Run `npx create-next-app@latest fmk --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` first, then apply these file changes. Install additional dependencies: `npm install dexie framer-motion @vercel/kv`

- [ ] Step 1.2: Configure Tailwind CSS with custom design system
  - **Task**: Set up Tailwind configuration with the FMK color palette, typography scale, and spacing system defined in the spec. Configure dark theme as default.
  - **Files**:
    - `tailwind.config.ts`: Full Tailwind config with custom colors (primary pink, FMK semantic colors), extended typography, spacing scale, and animation utilities
    - `src/app/globals.css`: CSS variables for colors, fonts, implement the design system from spec
  - **Step Dependencies**: Step 1.1
  - **User Instructions**: None

- [ ] Step 1.3: Install and configure shadcn/ui components
  - **Task**: Initialize shadcn/ui and install the required base components with dark theme configuration.
  - **Files**:
    - `components.json`: shadcn/ui configuration
    - `src/lib/utils/cn.ts`: Class name utility (clsx + tailwind-merge)
    - `src/components/ui/button.tsx`: Button component with FMK variants (primary, secondary, ghost, fmk)
    - `src/components/ui/card.tsx`: Card component
    - `src/components/ui/dialog.tsx`: Dialog/modal component
    - `src/components/ui/drawer.tsx`: Bottom sheet drawer for mobile
    - `src/components/ui/slider.tsx`: Slider for age range
    - `src/components/ui/switch.tsx`: Toggle switch
    - `src/components/ui/toast.tsx`: Toast notifications
    - `src/components/ui/toaster.tsx`: Toast container
  - **Step Dependencies**: Step 1.2
  - **User Instructions**: Run `npx shadcn@latest init` and select "New York" style, then run `npx shadcn@latest add button card dialog drawer slider switch toast` to install base components

- [ ] Step 1.4: Set up TypeScript types and constants
  - **Task**: Define all TypeScript interfaces and types for the application including Person, Category, Game state, Preferences, and API responses.
  - **Files**:
    - `src/types/index.ts`: Main type exports
    - `src/types/person.ts`: Person and CustomPerson interfaces
    - `src/types/category.ts`: Category and CustomCategory interfaces
    - `src/types/game.ts`: GameState, RoundState, GameAction types, state machine types
    - `src/types/preferences.ts`: Preferences and TimerConfig interfaces
    - `src/lib/constants.ts`: App-wide constants (default preferences, category IDs, etc.)
  - **Step Dependencies**: Step 1.1
  - **User Instructions**: None

## 2. Database Layer (IndexedDB)

- [ ] Step 2.1: Set up Dexie.js database schema
  - **Task**: Create the Dexie database instance with all required tables: preferences, categories, people, customLists, gameHistory, cachedImages, dailyChallenges. Define indexes for efficient queries.
  - **Files**:
    - `src/lib/db/schema.ts`: Dexie database class definition with all table interfaces and indexes
    - `src/lib/db/index.ts`: Database instance export and type-safe table accessors
  - **Step Dependencies**: Step 1.4
  - **User Instructions**: None

- [ ] Step 2.2: Create Dexie hooks for reactive data access
  - **Task**: Implement custom React hooks using Dexie's useLiveQuery for reactive data fetching from IndexedDB tables.
  - **Files**:
    - `src/lib/db/hooks.ts`: Custom hooks: usePreferences, useCategories, usePeople, useGameHistory, useCachedImage, useCustomLists
  - **Step Dependencies**: Step 2.1
  - **User Instructions**: None

- [ ] Step 2.3: Implement database initialization and migrations
  - **Task**: Create initialization function to seed default preferences and handle database version migrations. Include logic to detect first-time users.
  - **Files**:
    - `src/lib/db/init.ts`: initializeDatabase function with default preferences seeding
    - `src/lib/db/migrations.ts`: Version migration handlers for future schema changes
  - **Step Dependencies**: Step 2.2
  - **User Instructions**: None

## 3. Pre-built Category Data

- [ ] Step 3.1: Create pre-built category data files (Part 1)
  - **Task**: Create JSON data files for the first set of celebrity categories: Movie Stars, Musicians, Athletes, Reality TV Stars. Each category should have 30-50 people with complete metadata.
  - **Files**:
    - `src/data/categories/movie-stars.json`: 40+ movie stars with metadata
    - `src/data/categories/musicians.json`: 40+ musicians with metadata
    - `src/data/categories/athletes.json`: 40+ athletes with metadata
    - `src/data/categories/reality-tv.json`: 40+ reality TV personalities
  - **Step Dependencies**: Step 1.4
  - **User Instructions**: None

- [ ] Step 3.2: Create pre-built category data files (Part 2)
  - **Task**: Create JSON data files for remaining celebrity categories: Politicians, Comedians, Models, Influencers, Historical Figures, Fictional Characters, Royalty, Tech CEOs, Chefs.
  - **Files**:
    - `src/data/categories/politicians.json`: 30+ politicians
    - `src/data/categories/comedians.json`: 30+ comedians
    - `src/data/categories/models.json`: 30+ models
    - `src/data/categories/influencers.json`: 30+ influencers
    - `src/data/categories/historical.json`: 30+ historical figures
    - `src/data/categories/fictional.json`: 30+ fictional characters
    - `src/data/categories/royalty.json`: 25+ royalty members
    - `src/data/categories/tech-ceos.json`: 25+ tech executives
    - `src/data/categories/chefs.json`: 25+ chefs/food personalities
  - **Step Dependencies**: Step 3.1
  - **User Instructions**: None

- [ ] Step 3.3: Create category loader and index
  - **Task**: Implement a category loader that imports all category JSON files and provides functions to load categories into IndexedDB on first launch.
  - **Files**:
    - `src/data/categories/index.ts`: Category manifest, loader functions, category metadata (icons, names)
    - `src/lib/db/seed.ts`: Functions to seed pre-built categories and people into IndexedDB
  - **Step Dependencies**: Steps 3.1, 3.2, 2.3
  - **User Instructions**: None

## 4. Core Shared Components

- [ ] Step 4.1: Create shared layout components
  - **Task**: Build the shared header, bottom navigation, and main layout wrapper components for the game routes.
  - **Files**:
    - `src/components/shared/Header.tsx`: App header with title and settings icon
    - `src/components/shared/BottomNav.tsx`: Mobile bottom navigation bar (Home, History, Settings)
    - `src/components/shared/LoadingSpinner.tsx`: Loading indicator component
    - `src/components/shared/OfflineIndicator.tsx`: Banner showing offline status
    - `src/app/(game)/layout.tsx`: Game routes layout with header and bottom nav
  - **Step Dependencies**: Step 1.3
  - **User Instructions**: None

- [ ] Step 4.2: Create error handling components
  - **Task**: Implement error boundary component and error pages for graceful error handling throughout the app.
  - **Files**:
    - `src/components/shared/ErrorBoundary.tsx`: React error boundary with retry functionality
    - `src/app/(game)/error.tsx`: Game route error page
    - `src/app/not-found.tsx`: 404 page with FMK styling
    - `src/app/error.tsx`: Root error page
  - **Step Dependencies**: Step 4.1
  - **User Instructions**: None

## 5. Onboarding Flow

- [ ] Step 5.1: Create onboarding hook and detection logic
  - **Task**: Implement hook to detect first-time users and manage onboarding state using localStorage.
  - **Files**:
    - `src/hooks/useOnboarding.ts`: Hook for checking/setting onboarding completion status
    - `src/lib/utils/storage.ts`: localStorage helper utilities with type safety
  - **Step Dependencies**: Step 2.2
  - **User Instructions**: None

- [ ] Step 5.2: Build onboarding carousel component
  - **Task**: Create the swipeable onboarding carousel with slide content and navigation dots. Implement gesture support for swiping between slides.
  - **Files**:
    - `src/components/onboarding/OnboardingCarousel.tsx`: Main carousel container with swipe gestures
    - `src/components/onboarding/OnboardingSlide.tsx`: Individual slide component with emoji, title, description
    - `src/components/onboarding/slides.ts`: Slide content data (3 slides as per spec)
  - **Step Dependencies**: Steps 1.3, 5.1
  - **User Instructions**: None

- [ ] Step 5.3: Build preferences form component
  - **Task**: Create the preferences form for gender filter selection, age range slider, and sound/haptics toggles. This appears on the final onboarding slide.
  - **Files**:
    - `src/components/onboarding/PreferencesForm.tsx`: Full preferences form with validation
    - `src/components/onboarding/GenderFilter.tsx`: Multi-select gender filter (male, female, any)
    - `src/components/onboarding/AgeRangeSlider.tsx`: Dual-handle age range slider component
  - **Step Dependencies**: Steps 1.3, 2.2
  - **User Instructions**: None

- [ ] Step 5.4: Create onboarding page and flow
  - **Task**: Build the onboarding page that combines the carousel and preferences form, with skip functionality and completion handling.
  - **Files**:
    - `src/app/(onboarding)/layout.tsx`: Minimal layout for onboarding (no nav)
    - `src/app/(onboarding)/onboarding/page.tsx`: Onboarding page combining all components
  - **Step Dependencies**: Steps 5.2, 5.3
  - **User Instructions**: None

- [ ] Step 5.5: Add onboarding gate to app entry
  - **Task**: Update root layout and home page to check onboarding status and redirect first-time users. Initialize database on app load.
  - **Files**:
    - `src/app/layout.tsx`: Add database initialization provider
    - `src/components/providers/DatabaseProvider.tsx`: Provider that initializes DB on mount
    - `src/components/providers/OnboardingGate.tsx`: Client component that redirects to onboarding if needed
  - **Step Dependencies**: Steps 2.3, 5.4
  - **User Instructions**: None

## 6. Home Page & Category Selection

- [ ] Step 6.1: Create category display components
  - **Task**: Build the category card and grid components for displaying available categories on the home page.
  - **Files**:
    - `src/components/categories/CategoryCard.tsx`: Individual category tile with icon, name, people count
    - `src/components/categories/CategoryGrid.tsx`: Responsive grid layout for category cards
    - `src/components/categories/DailyChallengeCard.tsx`: Featured daily challenge card (pinned at top)
  - **Step Dependencies**: Steps 1.3, 2.2
  - **User Instructions**: None

- [ ] Step 6.2: Build home page
  - **Task**: Implement the home page with category grid, daily challenge card, and "Create Custom" option. Load categories from IndexedDB.
  - **Files**:
    - `src/app/(game)/page.tsx`: Home page with category selection, daily challenge display
  - **Step Dependencies**: Steps 4.1, 6.1, 3.3
  - **User Instructions**: None

## 7. Game State Management

- [ ] Step 7.1: Implement game engine logic
  - **Task**: Create the core game engine with state machine, person selection algorithm, and round management logic.
  - **Files**:
    - `src/lib/game/engine.ts`: Game state machine, transitions, validation
    - `src/lib/game/selection.ts`: Person selection algorithm with preference filtering, used ID exclusion
    - `src/lib/game/scoring.ts`: Placeholder for future scoring logic
  - **Step Dependencies**: Step 1.4
  - **User Instructions**: None

- [ ] Step 7.2: Create game context provider
  - **Task**: Implement React context for game state management with reducer pattern, exposing actions like startGame, assignPerson, skipPerson, nextRound, endGame.
  - **Files**:
    - `src/contexts/GameContext.tsx`: Game state provider with full reducer implementation
    - `src/hooks/useGame.ts`: Hook to access game context
  - **Step Dependencies**: Steps 7.1, 2.2
  - **User Instructions**: None

## 8. Gameplay UI Components

- [ ] Step 8.1: Create person card component
  - **Task**: Build the PersonCard component that displays a person's photo, name, and assignment status. Include loading and error states for images.
  - **Files**:
    - `src/components/game/PersonCard.tsx`: Person display card with image, name overlay, assignment badge
    - `src/components/game/PersonCardSkeleton.tsx`: Loading skeleton for person cards
  - **Step Dependencies**: Step 1.3
  - **User Instructions**: None

- [ ] Step 8.2: Create assignment UI components
  - **Task**: Build the F/M/K assignment slots and related interaction components.
  - **Files**:
    - `src/components/game/AssignmentSlot.tsx`: Individual F/M/K slot component
    - `src/components/game/AssignmentSlots.tsx`: Container with all three slots
    - `src/components/game/SkipButton.tsx`: Skip person button with confirmation
  - **Step Dependencies**: Step 1.3
  - **User Instructions**: None

- [ ] Step 8.3: Create timer component
  - **Task**: Build the countdown timer component with visual display, audio ticks, and warning states.
  - **Files**:
    - `src/components/game/Timer.tsx`: Circular countdown timer with visual and audio feedback
    - `src/hooks/useTimer.ts`: Timer logic hook with pause/resume/reset
  - **Step Dependencies**: Step 1.3
  - **User Instructions**: None

- [ ] Step 8.4: Create round summary and pass-device components
  - **Task**: Build components shown at end of round: summary display and pass-device blocker for multiplayer.
  - **Files**:
    - `src/components/game/RoundSummary.tsx`: End-of-round results display with assignments
    - `src/components/game/PassDeviceScreen.tsx`: Full-screen "pass to next player" blocker
    - `src/components/game/ExplainYourself.tsx`: Discussion prompt modal
  - **Step Dependencies**: Step 8.1
  - **User Instructions**: None

- [ ] Step 8.5: Build game setup page
  - **Task**: Create the setup page where users configure players (solo vs pass-and-play), timer settings, and start the game.
  - **Files**:
    - `src/app/(game)/setup/page.tsx`: Game setup page with player entry, timer config
    - `src/components/game/PlayerInput.tsx`: Player name entry component (for pass-and-play)
    - `src/components/game/TimerConfig.tsx`: Timer configuration toggles and duration picker
  - **Step Dependencies**: Steps 7.2, 8.3
  - **User Instructions**: None

- [ ] Step 8.6: Build main game board component
  - **Task**: Create the GameBoard component that orchestrates gameplay, displaying people cards, handling assignments, managing turns.
  - **Files**:
    - `src/components/game/GameBoard.tsx`: Main game controller component integrating all game UI
  - **Step Dependencies**: Steps 7.2, 8.1, 8.2, 8.3, 8.4
  - **User Instructions**: None

- [ ] Step 8.7: Build game play page
  - **Task**: Create the play page that hosts the game board and manages the active game session.
  - **Files**:
    - `src/app/(game)/play/page.tsx`: Active game screen hosting GameBoard
  - **Step Dependencies**: Steps 4.1, 8.6
  - **User Instructions**: None

## 9. Game History

- [ ] Step 9.1: Create history components
  - **Task**: Build components for displaying past game rounds in a scrollable list with expandable details.
  - **Files**:
    - `src/components/history/HistoryList.tsx`: Scrollable list of past games
    - `src/components/history/RoundCard.tsx`: Individual round preview card
    - `src/components/history/RoundDetail.tsx`: Expanded round detail view with all assignments
  - **Step Dependencies**: Steps 1.3, 2.2
  - **User Instructions**: None

- [ ] Step 9.2: Build history page
  - **Task**: Create the history page that displays all past game rounds with ability to expand and delete.
  - **Files**:
    - `src/app/(game)/history/page.tsx`: Past rounds browser page
  - **Step Dependencies**: Steps 4.1, 9.1
  - **User Instructions**: None

## 10. Settings Page

- [ ] Step 10.1: Create settings components
  - **Task**: Build the settings/preferences editor components for updating gender filter, age range, sound, and haptics.
  - **Files**:
    - `src/components/settings/SettingsForm.tsx`: Full settings form reusing onboarding components
    - `src/components/settings/SoundToggle.tsx`: Sound on/off toggle with preview
    - `src/components/settings/HapticsToggle.tsx`: Haptics on/off toggle
  - **Step Dependencies**: Steps 5.3, 2.2
  - **User Instructions**: None

- [ ] Step 10.2: Build settings page
  - **Task**: Create the settings page with preferences editor and app information.
  - **Files**:
    - `src/app/(game)/settings/page.tsx`: Settings page with all preference controls
  - **Step Dependencies**: Steps 4.1, 10.1
  - **User Instructions**: None

## 11. Image Fetching System

- [ ] Step 11.1: Create TMDB client
  - **Task**: Implement TMDB API client for fetching actor/celebrity photos.
  - **Files**:
    - `src/lib/images/tmdb.ts`: TMDB API client with search and image URL generation
  - **Step Dependencies**: Step 1.4
  - **User Instructions**: Create a TMDB account and get an API key from https://www.themoviedb.org/settings/api. Add `TMDB_API_KEY` to your `.env.local`

- [ ] Step 11.2: Create Wikipedia/Wikidata client
  - **Task**: Implement Wikipedia/Wikidata API client for fetching person images and bios as fallback.
  - **Files**:
    - `src/lib/images/wikipedia.ts`: Wikidata SPARQL client for image fetching
  - **Step Dependencies**: Step 1.4
  - **User Instructions**: None

- [ ] Step 11.3: Create image proxy API route
  - **Task**: Build API route to proxy external images for CORS bypass and return base64 encoded data.
  - **Files**:
    - `src/app/api/images/proxy/route.ts`: Image proxy endpoint with error handling
  - **Step Dependencies**: None
  - **User Instructions**: None

- [ ] Step 11.4: Implement image caching and waterfall fetcher
  - **Task**: Create the image fetching waterfall that tries TMDB → Wikipedia → proxy, with IndexedDB caching and LRU eviction.
  - **Files**:
    - `src/lib/images/cache.ts`: IndexedDB image caching with LRU eviction
    - `src/lib/images/fetcher.ts`: Waterfall image fetcher orchestrating all sources
  - **Step Dependencies**: Steps 11.1, 11.2, 11.3, 2.1
  - **User Instructions**: None

- [ ] Step 11.5: Create image loading hook and component
  - **Task**: Build a React hook and component for loading person images with the waterfall fetcher and displaying loading/error states.
  - **Files**:
    - `src/hooks/usePersonImage.ts`: Hook for fetching and caching person images
    - `src/components/shared/PersonImage.tsx`: Image component with loading skeleton and fallback
  - **Step Dependencies**: Step 11.4
  - **User Instructions**: None

- [ ] Step 11.6: Integrate images into person cards
  - **Task**: Update PersonCard component to use the new image loading system.
  - **Files**:
    - `src/components/game/PersonCard.tsx`: Update to use PersonImage component with waterfall loading
  - **Step Dependencies**: Steps 8.1, 11.5
  - **User Instructions**: None

## 12. AI Integration for Custom Categories

- [ ] Step 12.1: Create AI client and prompts
  - **Task**: Set up Anthropic SDK client and define system prompts for category generation and validation.
  - **Files**:
    - `src/lib/ai/client.ts`: Anthropic client initialization
    - `src/lib/ai/prompts.ts`: System prompts for generation and validation
  - **Step Dependencies**: None
  - **User Instructions**: Get an Anthropic API key from https://console.anthropic.com and add `ANTHROPIC_API_KEY` to your `.env.local`. Run `npm install @anthropic-ai/sdk`

- [ ] Step 12.2: Create AI generation API route
  - **Task**: Build the API route for generating custom categories from user prompts using Claude.
  - **Files**:
    - `src/app/api/ai/generate/route.ts`: POST endpoint for category generation
  - **Step Dependencies**: Step 12.1
  - **User Instructions**: None

- [ ] Step 12.3: Create AI validation API route
  - **Task**: Build the API route for LLM judge validation of generated categories.
  - **Files**:
    - `src/app/api/ai/validate/route.ts`: POST endpoint for validation scoring
  - **Step Dependencies**: Step 12.1
  - **User Instructions**: None

- [ ] Step 12.4: Create custom category UI components
  - **Task**: Build the custom category creation form and review/edit modal.
  - **Files**:
    - `src/components/categories/CustomCategoryForm.tsx`: AI prompt input form
    - `src/components/categories/CategoryReviewModal.tsx`: Review and edit generated list modal
    - `src/components/categories/GeneratedPersonRow.tsx`: Editable row for generated person
  - **Step Dependencies**: Step 1.3
  - **User Instructions**: None

- [ ] Step 12.5: Build custom category page
  - **Task**: Create the custom category creation page with full flow: prompt → generate → validate → review → save.
  - **Files**:
    - `src/app/(game)/custom/page.tsx`: Custom category creator page
  - **Step Dependencies**: Steps 4.1, 12.2, 12.3, 12.4
  - **User Instructions**: None

## 13. Custom People Lists

- [ ] Step 13.1: Create custom list components
  - **Task**: Build components for managing custom people lists including personal contacts.
  - **Files**:
    - `src/components/lists/CustomListCard.tsx`: Custom list display card
    - `src/components/lists/PersonEntryForm.tsx`: Form for adding person with optional photo upload
    - `src/components/lists/PhotoUploader.tsx`: Photo upload component with resize/crop
  - **Step Dependencies**: Step 1.3
  - **User Instructions**: None

- [ ] Step 13.2: Build custom lists page
  - **Task**: Create the custom people lists management page.
  - **Files**:
    - `src/app/(game)/custom/lists/page.tsx`: Custom lists manager page
  - **Step Dependencies**: Steps 4.1, 13.1, 2.2
  - **User Instructions**: None

## 14. Daily Challenge System

- [ ] Step 14.1: Create daily challenge API route
  - **Task**: Build API route for fetching and auto-generating daily challenges using Vercel KV.
  - **Files**:
    - `src/app/api/daily-challenge/route.ts`: GET/POST endpoints for daily challenge
    - `src/lib/daily-challenge/generate.ts`: Auto-generation logic for challenges
  - **Step Dependencies**: Step 2.2
  - **User Instructions**: Set up Vercel KV from your Vercel dashboard and add the KV environment variables to `.env.local`: `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`

- [ ] Step 14.2: Integrate daily challenge into home page
  - **Task**: Update home page to fetch and display the daily challenge with proper loading states.
  - **Files**:
    - `src/app/(game)/page.tsx`: Add daily challenge fetching and display
    - `src/components/categories/DailyChallengeCard.tsx`: Update with loading states and data fetching
  - **Step Dependencies**: Steps 6.2, 14.1
  - **User Instructions**: None

## 15. Admin Panel

- [ ] Step 15.1: Create admin auth middleware and API
  - **Task**: Implement admin authentication with password check against env var and session management.
  - **Files**:
    - `src/middleware.ts`: Middleware protecting admin routes
    - `src/app/api/admin/auth/route.ts`: POST endpoint for password verification
  - **Step Dependencies**: None
  - **User Instructions**: Add `ADMIN_PASSWORD` to your `.env.local` with a secure password

- [ ] Step 15.2: Build admin login page
  - **Task**: Create the admin login page with password form.
  - **Files**:
    - `src/app/(admin)/login/page.tsx`: Admin login form page
    - `src/app/(admin)/layout.tsx`: Admin layout wrapper
  - **Step Dependencies**: Step 15.1
  - **User Instructions**: None

- [ ] Step 15.3: Create admin dashboard components
  - **Task**: Build admin components for daily challenge curation.
  - **Files**:
    - `src/components/admin/ChallengeEditor.tsx`: Single day challenge editor
    - `src/components/admin/ChallengeBatchView.tsx`: Multi-day batch editor with calendar
    - `src/components/admin/PersonPicker.tsx`: Searchable person selector
  - **Step Dependencies**: Step 1.3
  - **User Instructions**: None

- [ ] Step 15.4: Build admin dashboard page
  - **Task**: Create the admin dashboard page with challenge curation tools.
  - **Files**:
    - `src/app/(admin)/admin/page.tsx`: Admin dashboard with challenge management
  - **Step Dependencies**: Steps 15.2, 15.3
  - **User Instructions**: None

## 16. Sound & Haptics

- [ ] Step 16.1: Create audio manager and haptics utilities
  - **Task**: Implement audio manager for sound effects and haptics wrapper for vibration feedback.
  - **Files**:
    - `src/lib/audio/manager.ts`: Audio manager class with preloading and playback
    - `src/lib/audio/haptics.ts`: Haptics wrapper using Navigator.vibrate
  - **Step Dependencies**: None
  - **User Instructions**: Add sound effect files to `public/sounds/`: `assign.mp3`, `tick.mp3`, `warning.mp3`, `complete.mp3`, `skip.mp3`. You can use royalty-free sounds from sites like freesound.org

- [ ] Step 16.2: Create audio context and hooks
  - **Task**: Build React context and hooks for managing sound settings and triggering effects.
  - **Files**:
    - `src/contexts/AudioContext.tsx`: Audio settings provider
    - `src/hooks/useHaptics.ts`: Hook for triggering haptic feedback
    - `src/hooks/useAudio.ts`: Hook for playing sound effects
  - **Step Dependencies**: Steps 16.1, 2.2
  - **User Instructions**: None

- [ ] Step 16.3: Integrate sound and haptics into game components
  - **Task**: Add sound and haptic feedback triggers to game components (assignment, skip, timer, round complete).
  - **Files**:
    - `src/components/game/GameBoard.tsx`: Add audio/haptic triggers
    - `src/components/game/Timer.tsx`: Add tick sound and warning vibration
    - `src/components/game/AssignmentSlots.tsx`: Add assignment feedback
  - **Step Dependencies**: Step 16.2
  - **User Instructions**: None

## 17. Share Functionality

- [ ] Step 17.1: Create share utilities
  - **Task**: Implement Web Share API wrapper with clipboard fallback.
  - **Files**:
    - `src/lib/utils/share.ts`: Share utility with Web Share API and clipboard fallback
  - **Step Dependencies**: None
  - **User Instructions**: None

- [ ] Step 17.2: Add share functionality to game
  - **Task**: Add share buttons to appropriate locations (category selection, round summary).
  - **Files**:
    - `src/components/game/ShareButton.tsx`: Share button component
    - `src/components/game/RoundSummary.tsx`: Add share option
    - `src/components/categories/CategoryCard.tsx`: Add share option
  - **Step Dependencies**: Steps 8.4, 17.1
  - **User Instructions**: None

## 18. PWA Configuration

- [ ] Step 18.1: Configure PWA manifest
  - **Task**: Create dynamic PWA manifest with app metadata, icons, and theme colors.
  - **Files**:
    - `src/app/manifest.ts`: Dynamic PWA manifest generation
  - **Step Dependencies**: None
  - **User Instructions**: Create PWA icons and add to `public/icons/`: `icon-72.png`, `icon-96.png`, `icon-128.png`, `icon-192.png`, `icon-384.png`, `icon-512.png`, `maskable-512.png`. Use a tool like https://maskable.app to generate maskable icons

- [ ] Step 18.2: Configure service worker with next-pwa
  - **Task**: Set up next-pwa for service worker generation with appropriate caching strategies.
  - **Files**:
    - `next.config.js`: Add next-pwa configuration with runtime caching rules
    - `public/offline.html`: Offline fallback page
  - **Step Dependencies**: Step 18.1
  - **User Instructions**: Run `npm install @ducanh2912/next-pwa`

- [ ] Step 18.3: Create PWA install prompt
  - **Task**: Build component to prompt users to install the PWA on supported platforms.
  - **Files**:
    - `src/components/shared/InstallPrompt.tsx`: PWA install prompt banner
    - `src/hooks/useInstallPrompt.ts`: Hook for managing install prompt state
  - **Step Dependencies**: Step 18.2
  - **User Instructions**: None

- [ ] Step 18.4: Add PWA meta tags and splash screens
  - **Task**: Update root layout with all required PWA meta tags and configure iOS splash screens.
  - **Files**:
    - `src/app/layout.tsx`: Add comprehensive PWA meta tags
  - **Step Dependencies**: Step 18.1
  - **User Instructions**: Create iOS splash screen images for various device sizes and add to `public/splash/`

## 19. Offline Support Enhancement

- [ ] Step 19.1: Implement online status detection
  - **Task**: Create hook for detecting online/offline status and add visual indicator.
  - **Files**:
    - `src/hooks/useOnlineStatus.ts`: Network status detection hook
    - `src/components/shared/OfflineIndicator.tsx`: Update with animation and better styling
  - **Step Dependencies**: Step 4.1
  - **User Instructions**: None

- [ ] Step 19.2: Add offline fallback behaviors
  - **Task**: Implement graceful degradation for features that require network (AI generation, daily challenge).
  - **Files**:
    - `src/components/categories/CustomCategoryForm.tsx`: Add offline disabled state
    - `src/components/categories/DailyChallengeCard.tsx`: Show cached challenge when offline
  - **Step Dependencies**: Steps 19.1, 12.4, 14.2
  - **User Instructions**: None

## 20. Testing

- [ ] Step 20.1: Set up testing infrastructure
  - **Task**: Configure Vitest for unit tests and Playwright for E2E tests.
  - **Files**:
    - `vitest.config.ts`: Vitest configuration
    - `playwright.config.ts`: Playwright configuration
    - `src/test/setup.ts`: Test setup with mocks
  - **Step Dependencies**: None
  - **User Instructions**: Run `npm install -D vitest @testing-library/react @playwright/test fake-indexeddb`

- [ ] Step 20.2: Write game engine unit tests
  - **Task**: Create unit tests for core game logic including assignment, state transitions, and selection algorithm.
  - **Files**:
    - `src/__tests__/game/engine.test.ts`: Game engine unit tests
    - `src/__tests__/game/selection.test.ts`: Person selection tests
  - **Step Dependencies**: Steps 7.1, 20.1
  - **User Instructions**: None

- [ ] Step 20.3: Write E2E tests for critical flows
  - **Task**: Create Playwright E2E tests for onboarding, gameplay, and offline functionality.
  - **Files**:
    - `e2e/onboarding.spec.ts`: Onboarding flow tests
    - `e2e/gameplay.spec.ts`: Core gameplay E2E tests
    - `e2e/offline.spec.ts`: Offline functionality tests
  - **Step Dependencies**: Steps 20.1, 5.4, 8.7
  - **User Instructions**: None

## 21. Final Polish

- [ ] Step 21.1: Add loading states and skeletons throughout
  - **Task**: Ensure all data-loading components have proper skeleton/loading states.
  - **Files**:
    - `src/components/categories/CategoryGridSkeleton.tsx`: Category grid loading skeleton
    - `src/components/history/HistoryListSkeleton.tsx`: History list loading skeleton
    - `src/components/game/GameBoardSkeleton.tsx`: Game board loading skeleton
  - **Step Dependencies**: Steps 6.1, 9.1, 8.6
  - **User Instructions**: None

- [ ] Step 21.2: Add animations and micro-interactions
  - **Task**: Implement smooth animations for page transitions, card interactions, and assignment feedback using Framer Motion.
  - **Files**:
    - `src/components/game/PersonCard.tsx`: Add assignment animation
    - `src/components/game/AssignmentSlots.tsx`: Add slot fill animation
    - `src/components/onboarding/OnboardingCarousel.tsx`: Enhance slide transition animations
  - **Step Dependencies**: Steps 8.1, 8.2, 5.2
  - **User Instructions**: None

- [ ] Step 21.3: Accessibility improvements
  - **Task**: Add proper ARIA labels, focus management, and keyboard navigation throughout the app.
  - **Files**:
    - `src/components/game/GameBoard.tsx`: Add keyboard controls for assignments
    - `src/components/game/PersonCard.tsx`: Add proper ARIA labels
    - `src/components/ui/button.tsx`: Ensure focus visible styles
  - **Step Dependencies**: Steps 8.6, 8.1
  - **User Instructions**: None

- [ ] Step 21.4: Performance optimization
  - **Task**: Implement performance optimizations including image lazy loading, component code splitting, and IndexedDB query optimization.
  - **Files**:
    - `src/components/shared/PersonImage.tsx`: Add lazy loading with intersection observer
    - `src/lib/db/hooks.ts`: Optimize queries with proper indexes
    - `next.config.js`: Add bundle analyzer and optimization settings
  - **Step Dependencies**: Steps 11.5, 2.2
  - **User Instructions**: Run `npm install @next/bundle-analyzer` for bundle analysis

---

## Summary

This implementation plan breaks down the FMK PWA into **67 atomic steps** across **21 major sections**. The plan follows a logical progression:

1. **Foundation (Steps 1-4)**: Project setup, design system, database layer, and pre-built content
2. **Core Flows (Steps 5-10)**: Onboarding, home page, game engine, gameplay UI, history, and settings
3. **Advanced Features (Steps 11-17)**: Image fetching, AI integration, custom lists, daily challenges, admin panel, sound/haptics, and sharing
4. **PWA & Polish (Steps 18-21)**: PWA configuration, offline support, testing, and final polish

**Key Implementation Considerations:**

1. **Offline-First**: IndexedDB (Dexie.js) is the primary data store. Ensure all critical data is cached before enabling gameplay.

2. **Mobile-First UX**: Every component should be designed for touch with 48px+ tap targets. Test on mobile throughout development.

3. **Progressive Enhancement**: Core gameplay works offline; AI features gracefully degrade when offline.

4. **Image Strategy**: The waterfall fetcher (TMDB → Wikipedia → proxy) needs robust error handling since images are critical for gameplay.

5. **State Management**: Game state uses React Context with reducer pattern; persistent data uses Dexie hooks for reactivity.

6. **External Dependencies**: Several steps require API keys (TMDB, Anthropic) and Vercel services (KV). Set these up early.

7. **Testing Strategy**: Unit tests cover game logic; E2E tests cover critical user journeys. IndexedDB is mocked using fake-indexeddb.

The plan ensures each step produces working (though possibly incomplete) functionality, allowing for incremental testing and validation throughout the development process.