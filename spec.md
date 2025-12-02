<specification_planning>

## 1. Core System Architecture & Key Workflows

### Architecture Approach
- **Offline-first PWA**: Service worker caches static assets + pre-built category data; IndexedDB stores all dynamic data
- **No backend database**: All persistent data lives in IndexedDB (Dexie.js). Server only provides:
  - Static pre-built category JSON
  - AI API routes for custom category generation
  - Daily challenge data (simple JSON file or KV store)
  - Admin panel for challenge curation
- **Edge-optimized**: Leverage Vercel Edge Functions for AI proxy routes

### Key Workflows
1. **First Launch**: Splash → Onboarding (2-3 screens) → Preferences → Home
2. **Quick Play**: Home → Category Select → Game Loop (3 people → assign F/M/K) → Results → Next Round
3. **Custom Category**: Input prompt → AI generates list → LLM validates → User reviews/edits → Save to IndexedDB
4. **Pass-and-Play**: Setup players → Each player takes turn (pass device) → Round summary
5. **Admin Flow**: Password gate → View/curate daily challenges → Batch schedule

### Challenges
- Image fetching waterfall needs robust fallback handling and caching
- AI rate limiting for custom categories (consider debouncing/throttling)
- Service worker cache invalidation strategy for fresh content
- Handling large IndexedDB storage for cached images

---

## 2. Project Structure

```
/src
  /app
    /(game)              # Main game routes (grouped for shared layout)
      /page.tsx          # Home/category selection
      /play/page.tsx     # Active gameplay
      /history/page.tsx  # Past rounds
      /settings/page.tsx # Preferences
    /(admin)
      /admin/page.tsx    # Protected admin panel
    /api
      /ai/generate/route.ts      # AI category generation
      /ai/validate/route.ts      # LLM judge validation
      /daily-challenge/route.ts  # Fetch daily challenge
      /images/proxy/route.ts     # Image proxy for CORS
    /layout.tsx
    /manifest.ts         # PWA manifest
  /components
    /ui                  # shadcn/ui components
    /game                # Game-specific components
    /onboarding          # Onboarding screens
    /admin               # Admin components
  /lib
    /db.ts               # Dexie.js database setup
    /hooks               # Custom React hooks
    /utils               # Utility functions
    /ai.ts               # AI client helpers
    /images.ts           # Image fetching waterfall
  /data
    /categories          # Pre-built category JSON files
  /types
    /index.ts            # TypeScript types
/public
  /icons                 # PWA icons
  /sounds                # SFX files
```

---

## 3. Feature Specifications Breakdown

### 3.1 Core Gameplay
- **Game state machine**: idle → selecting → playing → reviewing → complete
- **FMK assignment UI**: Drag-and-drop or tap-to-assign with clear visual slots
- **Skip logic**: Remove person from current round, fetch replacement from pool
- **Timer implementation**: Optional countdown with configurable duration
- **Sound/haptics**: Trigger on assignment, timer warning, round complete

### 3.2 Onboarding
- Swipeable carousel (3 screens max)
- Preference capture: gender filter, age range slider
- Skip button always visible
- Store "onboarded" flag in localStorage

### 3.3 Categories & Content
- Pre-built categories loaded from static JSON (bundled in build)
- Custom category flow: prompt → API call → validation → review modal → save
- Person data structure needs: id, name, category, imageUrl, fallbackUrls[], bio, metadata (gender, birthYear, etc.)

### 3.4 Image Fetching Waterfall
- Priority: TMDB (actors) → Wikidata/Wikipedia → Bing Image Search
- Cache fetched images as base64 in IndexedDB
- Display placeholder during fetch, skeleton on failure

### 3.5 Offline Support
- Service worker caches: shell, static assets, pre-built category JSON
- IndexedDB stores: preferences, custom lists, game history, cached images
- Sync strategy: Background sync when online to fetch new daily challenges

---

## 4. Database Schema (IndexedDB via Dexie.js)

### Tables Needed
1. **preferences**: User settings (single row, key-value style)
2. **categories**: Custom categories created by user
3. **people**: All people (from pre-built + custom)
4. **customLists**: User-created lists of people
5. **gameHistory**: Past rounds with assignments
6. **cachedImages**: Base64 image blobs keyed by URL
7. **dailyChallenges**: Cached daily challenge data

### Indexing Strategy
- People indexed by: category, gender, id
- GameHistory indexed by: timestamp, category
- CachedImages indexed by: url, timestamp (for LRU eviction)

---

## 5. Server Actions & API Routes

### AI Routes
- `POST /api/ai/generate`: Takes category prompt, returns person list
- `POST /api/ai/validate`: LLM judge scores list quality, returns pass/fail + suggestions

### Image Proxy
- `GET /api/images/proxy?url=...`: Proxies external images to avoid CORS, returns base64

### Daily Challenge
- `GET /api/daily-challenge`: Returns today's challenge (3 people)
- Admin: `POST /api/daily-challenge` to set/update

### Edge Cases
- AI rate limiting (429 handling)
- Image fetch failures (graceful degradation)
- Large response handling for AI generation

---

## 6. Design System

### Visual Style
- Bold, playful, slightly cheeky
- High contrast for drunk-proof readability
- Color palette: vibrant primary (hot pink/coral?), dark background, white text
- Large typography: 18px+ body, 24px+ headings

### Component Patterns
- Card-based person display with prominent photos
- Bottom-sheet modals for settings/selection
- Gesture-friendly (swipe, tap, drag)
- Micro-animations for feedback (assignment confirmation, timer tick)

### Drunk-Proof Requirements
- Minimum 48px tap targets
- No double-taps required
- Confirmation for destructive actions only
- Auto-advancing where possible

---

## 7. Component Architecture

### Server Components
- Home page (fetches daily challenge)
- Category list (static data)
- Admin panel (fetches challenge queue)

### Client Components
- GameBoard (manages game state, player turns)
- PersonCard (photo, name, assignment slot)
- Timer (countdown with visual/audio warnings)
- OnboardingCarousel (swipe-enabled)
- PreferencesForm (gender/age filters)

### State Management
- React Context for game state (current round, assignments, players)
- Dexie.js hooks for IndexedDB data
- localStorage for simple flags (onboarded, sound enabled)

---

## 8. Authentication

- **No user auth**: Guest-only mode
- **Admin auth**: Simple password check against env var
- Middleware protects /admin route
- Session stored in httpOnly cookie after password verification

---

## 9. Data Flow

- Pre-built data: Static JSON → SSG/ISR → Client hydration
- Custom data: Client → IndexedDB (Dexie.js) → React state
- AI flow: Client → API route → Anthropic/OpenAI → Client → IndexedDB
- Image flow: Client → Check IndexedDB cache → If miss, proxy route → Cache → Display

---

## 10. Payment Integration
- **N/A**: No payment required for personal-use app

---

## 11. Analytics
- Minimal tracking (personal use)
- Optional: PostHog for basic usage patterns if desired
- Events: game_started, round_completed, category_selected, custom_category_created

---

## 12. Testing Strategy

### Unit Tests (Vitest)
- Game logic (FMK assignment validation)
- Preference filtering
- Image waterfall logic

### E2E Tests (Playwright)
- Onboarding flow completion
- Full game round
- Offline gameplay
- PWA installation

### Challenges
- Testing IndexedDB (mock with fake-indexeddb)
- Testing service worker (intercept in Playwright)
- AI route mocking

</specification_planning>

---

# FMK Technical Specification

## 1. System Overview

### 1.1 Core Purpose & Value Proposition
FMK is a mobile-first Progressive Web App that digitizes the classic "Fuck, Marry, Kill" party game. It provides instant, frictionless gameplay with pre-built celebrity categories, AI-powered custom list generation, and full offline support. Designed for couples and friend groups, prioritizing a "drunk-proof" UX with large tap targets and minimal cognitive load.

### 1.2 Key Workflows

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FIRST LAUNCH FLOW                           │
├─────────────────────────────────────────────────────────────────────┤
│  Splash Screen → Onboarding (3 swipes) → Set Preferences → Home    │
│                         ↓ [Skip Available]                          │
│                    Direct to Home                                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         CORE GAME LOOP                              │
├─────────────────────────────────────────────────────────────────────┤
│  Home → Select Category → Configure Round (players, timer) →       │
│  Game Screen (3 people displayed) → Assign F/M/K → Round Summary → │
│  [Next Round] or [End Game] → History                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      CUSTOM CATEGORY FLOW                           │
├─────────────────────────────────────────────────────────────────────┤
│  Tap "Create Custom" → Enter Prompt → AI Generates List →          │
│  LLM Validates Quality → User Reviews/Edits → Save to IndexedDB    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       PASS-AND-PLAY FLOW                            │
├─────────────────────────────────────────────────────────────────────┤
│  Setup: Enter Player Names → Player 1 Turn → "Pass Device" Screen →│
│  Player 2 Turn → ... → All Players Complete → Round Summary         │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.3 System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (PWA)                              │
├────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │   Next.js   │  │  React 19   │  │  Tailwind   │  │  shadcn/ui   │  │
│  │ App Router  │  │  Components │  │     CSS     │  │  Components  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────────┘  │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    Service Worker (Workbox)                      │  │
│  │  • Static asset caching  • Pre-built category data caching      │  │
│  │  • Offline fallback      • Background sync for daily challenge  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    IndexedDB (Dexie.js)                          │  │
│  │  • User preferences      • Custom categories & lists            │  │
│  │  • Game history          • Cached images (base64)               │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         VERCEL EDGE / SERVERLESS                       │
├────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐    │
│  │ /api/ai/generate│  │/api/ai/validate │  │/api/images/proxy    │    │
│  │ Custom category │  │ LLM quality     │  │ CORS bypass for     │    │
│  │ generation      │  │ validation      │  │ external images     │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘│
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                /api/daily-challenge                              │  │
│  │  GET: Fetch today's challenge  |  POST: Admin set challenge     │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                             │
├────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────────────────┐  │
│  │ Anthropic/   │  │    TMDB API   │  │  Wikipedia/Wikidata API    │  │
│  │ OpenAI API   │  │ (Actor photos)│  │  (Fallback images/bios)    │  │
│  └──────────────┘  └───────────────┘  └────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                   Vercel KV (Optional)                            │ │
│  │   • Daily challenge storage   • Admin session tokens             │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Project Structure

```
fmk/
├── src/
│   ├── app/
│   │   ├── (game)/                    # Grouped routes sharing game layout
│   │   │   ├── layout.tsx             # Game shell with nav
│   │   │   ├── page.tsx               # Home: category selection, daily challenge
│   │   │   ├── play/
│   │   │   │   └── page.tsx           # Active game screen
│   │   │   ├── setup/
│   │   │   │   └── page.tsx           # Round setup (players, timer config)
│   │   │   ├── history/
│   │   │   │   └── page.tsx           # Past rounds browser
│   │   │   ├── settings/
│   │   │   │   └── page.tsx           # Preferences editor
│   │   │   └── custom/
│   │   │       ├── page.tsx           # Custom category creator
│   │   │       └── lists/
│   │   │           └── page.tsx       # Custom people lists manager
│   │   ├── (admin)/
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx           # Admin dashboard
│   │   │   │   └── layout.tsx         # Admin auth wrapper
│   │   │   └── login/
│   │   │       └── page.tsx           # Admin login form
│   │   ├── api/
│   │   │   ├── ai/
│   │   │   │   ├── generate/
│   │   │   │   │   └── route.ts       # POST: Generate category from prompt
│   │   │   │   └── validate/
│   │   │   │       └── route.ts       # POST: LLM judge validation
│   │   │   ├── daily-challenge/
│   │   │   │   └── route.ts           # GET/POST: Daily challenge CRUD
│   │   │   ├── images/
│   │   │   │   └── proxy/
│   │   │   │       └── route.ts       # GET: CORS-bypassing image proxy
│   │   │   └── admin/
│   │   │       └── auth/
│   │   │           └── route.ts       # POST: Admin password verification
│   │   ├── layout.tsx                 # Root layout with PWA meta
│   │   ├── manifest.ts                # Dynamic PWA manifest
│   │   ├── globals.css                # Tailwind imports + custom CSS
│   │   └── not-found.tsx              # 404 page
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx             # Bottom sheet for mobile
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   ├── game/
│   │   │   ├── GameBoard.tsx          # Main game controller component
│   │   │   ├── PersonCard.tsx         # Individual person display card
│   │   │   ├── AssignmentSlot.tsx     # F/M/K drop zone
│   │   │   ├── Timer.tsx              # Countdown timer with audio
│   │   │   ├── RoundSummary.tsx       # End-of-round results
│   │   │   ├── PassDeviceScreen.tsx   # "Pass to next player" blocker
│   │   │   ├── SkipButton.tsx         # Skip person control
│   │   │   └── ExplainYourself.tsx    # Discussion prompt modal
│   │   ├── categories/
│   │   │   ├── CategoryGrid.tsx       # Category selection grid
│   │   │   ├── CategoryCard.tsx       # Individual category tile
│   │   │   ├── CustomCategoryForm.tsx # AI category generation form
│   │   │   └── CategoryReviewModal.tsx# Review/edit AI-generated list
│   │   ├── onboarding/
│   │   │   ├── OnboardingCarousel.tsx # Swipeable intro screens
│   │   │   ├── OnboardingSlide.tsx    # Individual slide content
│   │   │   └── PreferencesForm.tsx    # Initial preference capture
│   │   ├── history/
│   │   │   ├── HistoryList.tsx        # Scrollable past rounds
│   │   │   └── RoundCard.tsx          # Individual round preview
│   │   ├── admin/
│   │   │   ├── ChallengeEditor.tsx    # Daily challenge curation UI
│   │   │   ├── ChallengeBatchView.tsx # Multi-day batch editor
│   │   │   └── PersonPicker.tsx       # Person selection for challenges
│   │   └── shared/
│   │       ├── Header.tsx             # App header with settings
│   │       ├── BottomNav.tsx          # Mobile navigation bar
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── OfflineIndicator.tsx   # Shows when offline
│   │       └── InstallPrompt.tsx      # PWA install banner
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts               # Dexie database instance
│   │   │   ├── schema.ts              # Table definitions
│   │   │   ├── hooks.ts               # useLiveQuery hooks
│   │   │   └── migrations.ts          # Version migrations
│   │   ├── ai/
│   │   │   ├── client.ts              # AI API client wrapper
│   │   │   ├── prompts.ts             # System prompts for generation
│   │   │   └── validation.ts          # LLM judge logic
│   │   ├── images/
│   │   │   ├── fetcher.ts             # Waterfall image fetcher
│   │   │   ├── tmdb.ts                # TMDB API client
│   │   │   ├── wikipedia.ts           # Wikipedia/Wikidata client
│   │   │   └── cache.ts               # IndexedDB image caching
│   │   ├── game/
│   │   │   ├── engine.ts              # Game state machine
│   │   │   ├── scoring.ts             # (Future) scoring logic
│   │   │   └── selection.ts           # Person selection algorithm
│   │   ├── audio/
│   │   │   ├── manager.ts             # Sound effect controller
│   │   │   └── haptics.ts             # Vibration API wrapper
│   │   ├── utils/
│   │   │   ├── cn.ts                  # Class name merger (clsx + twMerge)
│   │   │   ├── storage.ts             # localStorage helpers
│   │   │   └── share.ts               # Web Share API wrapper
│   │   └── constants.ts               # App-wide constants
│   │
│   ├── data/
│   │   └── categories/                # Pre-built category JSON
│   │       ├── index.ts               # Category manifest/loader
│   │       ├── movie-stars.json
│   │       ├── athletes.json
│   │       ├── musicians.json
│   │       ├── politicians.json
│   │       ├── reality-tv.json
│   │       ├── comedians.json
│   │       ├── models.json
│   │       ├── influencers.json
│   │       ├── historical.json
│   │       ├── fictional.json
│   │       ├── royalty.json
│   │       ├── tech-ceos.json
│   │       └── chefs.json
│   │
│   ├── hooks/
│   │   ├── useGame.ts                 # Game state context hook
│   │   ├── usePreferences.ts          # Preferences from IndexedDB
│   │   ├── useOnboarding.ts           # Onboarding state
│   │   ├── useOnlineStatus.ts         # Network status detection
│   │   ├── useTimer.ts                # Countdown timer logic
│   │   └── useHaptics.ts              # Haptic feedback hook
│   │
│   ├── contexts/
│   │   ├── GameContext.tsx            # Game state provider
│   │   └── AudioContext.tsx           # Sound settings provider
│   │
│   └── types/
│       ├── index.ts                   # Shared type exports
│       ├── person.ts                  # Person entity types
│       ├── category.ts                # Category types
│       ├── game.ts                    # Game state types
│       └── preferences.ts             # User preferences types
│
├── public/
│   ├── icons/                         # PWA icons (72-512px)
│   │   ├── icon-72.png
│   │   ├── icon-96.png
│   │   ├── icon-128.png
│   │   ├── icon-192.png
│   │   ├── icon-384.png
│   │   ├── icon-512.png
│   │   └── maskable-512.png
│   ├── sounds/
│   │   ├── assign.mp3                 # FMK assignment sound
│   │   ├── tick.mp3                   # Timer tick
│   │   ├── warning.mp3                # Timer warning
│   │   ├── complete.mp3               # Round complete
│   │   └── skip.mp3                   # Skip person
│   ├── splash/                        # iOS/Android splash screens
│   └── offline.html                   # Offline fallback page
│
├── next.config.js                     # Next.js + PWA config
├── tailwind.config.ts                 # Tailwind configuration
├── tsconfig.json
├── package.json
└── .env.local                         # Environment variables
```

---

## 3. Feature Specification

### 3.1 Onboarding Flow

**User Story**: As a first-time user, I want a quick introduction to the game and to set my preferences so I can start playing immediately.

**Implementation Steps**:

1. **Detect First Launch**
   - Check `localStorage.getItem('fmk_onboarded')`
   - If null/false, redirect to onboarding; else render home

2. **Onboarding Carousel** (3 slides max)
   - Slide 1: "Welcome to FMK" - Brief game explanation with playful illustration
   - Slide 2: "How to Play" - Visual showing 3 people → F/M/K assignment
   - Slide 3: "Set Your Preferences" - Inline preference form

3. **Preference Form Fields**
   ```typescript
   interface OnboardingPreferences {
     genderFilter: ('male' | 'female' | 'any')[];
     ageRange: { min: number; max: number };
     soundEnabled: boolean;
     hapticsEnabled: boolean;
   }
   ```

4. **Skip Behavior**
   - Skip button visible on all slides (top-right)
   - Skipping sets default preferences:
     ```typescript
     const defaults: OnboardingPreferences = {
       genderFilter: ['any'],
       ageRange: { min: 18, max: 99 },
       soundEnabled: true,
       hapticsEnabled: true,
     };
     ```

5. **Completion**
   - Save preferences to IndexedDB
   - Set `localStorage.setItem('fmk_onboarded', 'true')`
   - Navigate to home

**Edge Cases**:
- User clears browser storage → Re-show onboarding
- User changes mind mid-onboarding → Back navigation works
- Very narrow screens → Slides remain single-column, scrollable

---

### 3.2 Core Gameplay

**User Story**: As a player, I want to see 3 people and assign each one to Fuck, Marry, or Kill so I can play the game.

**Game State Machine**:
```typescript
type GameState = 
  | { phase: 'idle' }
  | { phase: 'setup'; category: Category; players: Player[] }
  | { phase: 'playing'; round: RoundState }
  | { phase: 'reviewing'; round: CompletedRound }
  | { phase: 'complete'; history: CompletedRound[] };

interface RoundState {
  people: [Person, Person, Person];
  assignments: Partial<Record<PersonId, 'F' | 'M' | 'K'>>;
  currentPlayer: Player;
  timerStartedAt?: number;
}
```

**Implementation Steps**:

1. **Category Selection** (Home page)
   - Grid of category cards with icons
   - Daily Challenge card pinned at top
   - "Create Custom" card at bottom
   - Tap category → Navigate to setup

2. **Round Setup** (`/setup` page)
   - Solo mode: Single implicit player
   - Pass-and-play: Enter 2-8 player names (large input fields)
   - Timer config: Toggle switches for decision/debate timers, duration picker
   - "Start Game" button (large, bottom of screen)

3. **Game Screen** (`/play` page)
   - Three PersonCards displayed horizontally (scrollable on very small screens)
   - Three AssignmentSlots at bottom: F | M | K
   - Tap PersonCard → Opens action sheet to assign
   - Or drag PersonCard to slot
   - Visual feedback: Slot highlights on valid drop, person card dims when assigned

4. **Assignment Logic**
   ```typescript
   function assignPerson(personId: string, choice: 'F' | 'M' | 'K') {
     // Check if choice already used
     if (Object.values(assignments).includes(choice)) {
       // Swap: find previous person with this choice, unassign
       const prevPerson = Object.entries(assignments)
         .find(([_, c]) => c === choice)?.[0];
       if (prevPerson) delete assignments[prevPerson];
     }
     assignments[personId] = choice;
     
     // Check completion
     if (Object.keys(assignments).length === 3) {
       triggerRoundComplete();
     }
   }
   ```

5. **Round Completion**
   - Play success sound + haptic
   - Show RoundSummary modal:
     - Display assignments with person photos
     - "Explain Yourself" button (optional)
     - "Next Round" / "End Game" buttons

6. **Pass-and-Play Flow**
   - After each player submits, show PassDeviceScreen
   - Large text: "Pass to [Next Player Name]"
   - Tap anywhere to continue (reveals next player's round)

**Edge Cases**:
- User tries to assign same choice twice → Auto-swap behavior
- Timer expires → Auto-submit current assignments (incomplete = random fill)
- Skip person → Replace with next from category pool; if pool exhausted, disable skip
- No network + no cached people for category → Show error, offer cached categories

---

### 3.3 Skip Functionality

**User Story**: As a player, I want to skip a person I don't recognize so I can play with people I know.

**Implementation**:
```typescript
async function skipPerson(personId: string, roundState: RoundState) {
  const category = roundState.category;
  const usedIds = new Set([
    ...roundState.people.map(p => p.id),
    ...roundState.skippedIds,
  ]);
  
  const replacement = await findReplacementPerson(category, usedIds);
  
  if (!replacement) {
    toast.error("No more people available in this category!");
    return;
  }
  
  roundState.people = roundState.people.map(p => 
    p.id === personId ? replacement : p
  );
  roundState.skippedIds.push(personId);
}
```

---

### 3.4 Timer System

**User Story**: As a player, I want optional timers to add pressure and excitement.

**Implementation**:
```typescript
interface TimerConfig {
  decisionTimer: { enabled: boolean; seconds: number };
  debateTimer: { enabled: boolean; seconds: number };
}

// Default values
const defaultTimerConfig: TimerConfig = {
  decisionTimer: { enabled: false, seconds: 30 },
  debateTimer: { enabled: false, seconds: 60 },
};
```

**Timer Component Behavior**:
- Circular countdown display
- Audio tick at 5 seconds remaining
- Warning vibration at 3 seconds
- Expiration: Flash red, play buzzer, auto-advance

---

### 3.5 Game History

**User Story**: As a player, I want to view past rounds for laughs and memories.

**Implementation**:
```typescript
interface HistoryEntry {
  id: string;
  timestamp: number;
  category: { id: string; name: string };
  players: string[];
  rounds: {
    people: Array<{ id: string; name: string; imageUrl: string }>;
    assignments: Record<string, Record<string, 'F' | 'M' | 'K'>>;
  }[];
}
```

**Display**:
- Reverse chronological list
- Each entry shows: Date, category, player count, thumbnail of people
- Tap to expand → Full round details with assignments per player
- Swipe left to delete entry

---

### 3.6 Custom Category Generation

**User Story**: As a player, I want to create custom categories using AI so I can play with any group of people.

**Flow**:
1. User enters prompt (e.g., "90s boy band members")
2. Client calls `/api/ai/generate` with prompt
3. AI returns list of 20-50 people with metadata
4. Client calls `/api/ai/validate` for quality check
5. If validation fails, show suggestions; user can retry or proceed
6. User reviews list in modal, can remove/edit entries
7. Confirm saves to IndexedDB

**API Implementation** (`/api/ai/generate/route.ts`):
```typescript
export async function POST(request: Request) {
  const { prompt } = await request.json();
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: CATEGORY_GENERATION_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });
  
  // Parse structured output
  const people = parseGeneratedPeople(response.content);
  
  return NextResponse.json({ people });
}

const CATEGORY_GENERATION_PROMPT = `
You are generating a list of real public figures for a party game.
Given a category prompt, return 30 well-known people who fit that category.

Return JSON array with this structure:
{
  "people": [
    {
      "name": "Full Name",
      "searchName": "name for image search",
      "description": "Brief 1-line description of why famous",
      "gender": "male" | "female" | "non-binary",
      "birthYear": number | null,
      "category": "original category prompt"
    }
  ]
}

Guidelines:
- Include diverse representation (gender, ethnicity, era)
- Focus on recognizable figures (famous enough to have photos)
- Avoid controversial figures or those inappropriate for party games
- birthYear can be null for fictional characters
`;
```

**Validation API** (`/api/ai/validate/route.ts`):
```typescript
export async function POST(request: Request) {
  const { people, originalPrompt } = await request.json();
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: VALIDATION_PROMPT,
    messages: [{
      role: 'user',
      content: `Category: ${originalPrompt}\n\nPeople: ${JSON.stringify(people)}`
    }],
  });
  
  return NextResponse.json(parseValidation(response.content));
}

const VALIDATION_PROMPT = `
You are a quality judge for a party game category.
Score the list on:
1. Relevance (do they fit the category?)
2. Recognition (would most people know them?)
3. Appropriateness (suitable for party game?)
4. Diversity (good mix of gender, era, etc?)

Return JSON:
{
  "passed": boolean,
  "score": number (1-100),
  "issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1"]
}
`;
```

---

### 3.7 Image Fetching Waterfall

**User Story**: As a player, I want to see photos of each person so I know who they are.

**Waterfall Strategy**:
```typescript
async function fetchPersonImage(person: Person): Promise<string | null> {
  // 1. Check IndexedDB cache
  const cached = await db.cachedImages.get(person.id);
  if (cached && !isExpired(cached)) return cached.base64;
  
  // 2. Try TMDB (for actors/entertainers)
  if (person.category?.includes('movie') || person.category?.includes('tv')) {
    const tmdbImage = await tryTMDB(person.searchName);
    if (tmdbImage) {
      await cacheImage(person.id, tmdbImage);
      return tmdbImage;
    }
  }
  
  // 3. Try Wikipedia/Wikidata
  const wikiImage = await tryWikipedia(person.searchName);
  if (wikiImage) {
    await cacheImage(person.id, wikiImage);
    return wikiImage;
  }
  
  // 4. Try image search (via proxy)
  const searchImage = await tryImageSearch(person.searchName);
  if (searchImage) {
    await cacheImage(person.id, searchImage);
    return searchImage;
  }
  
  // 5. Return placeholder
  return null;
}
```

**TMDB Client** (`/lib/images/tmdb.ts`):
```typescript
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

export async function searchTMDB(name: string): Promise<string | null> {
  const res = await fetch(
    `${TMDB_BASE}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(name)}`
  );
  const data = await res.json();
  
  if (data.results?.[0]?.profile_path) {
    return `${TMDB_IMAGE_BASE}${data.results[0].profile_path}`;
  }
  return null;
}
```

**Image Proxy** (`/api/images/proxy/route.ts`):
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  
  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
  }
  
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  
  return NextResponse.json({
    data: `data:${contentType};base64,${base64}`,
  });
}
```

---

### 3.8 Offline Support

**User Story**: As a player, I want to play the game without internet so I can use it anywhere.

**Service Worker Strategy** (using `@ducanh2912/next-pwa` or similar):

```javascript
// next.config.js
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 31536000 } },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: { cacheName: 'images', expiration: { maxEntries: 100, maxAgeSeconds: 2592000 } },
    },
    {
      urlPattern: /\/api\/daily-challenge/,
      handler: 'NetworkFirst',
      options: { cacheName: 'daily-challenge', networkTimeoutSeconds: 3 },
    },
  ],
});

module.exports = withPWA({
  // Next.js config
});
```

**IndexedDB Caching**:
- Pre-built category data cached on first load
- Images cached as base64 blobs with LRU eviction (max 100MB)
- Game history persisted across sessions
- Background sync for new daily challenges

**Offline Detection Hook**:
```typescript
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}
```

---

### 3.9 Daily Challenge

**User Story**: As a player, I want a curated daily challenge to keep the game fresh.

**Data Structure**:
```typescript
interface DailyChallenge {
  date: string; // YYYY-MM-DD
  people: [PersonId, PersonId, PersonId];
  title?: string; // Optional theme
  curatedBy: 'auto' | 'admin';
}
```

**Fetch Logic**:
```typescript
// /api/daily-challenge/route.ts
export async function GET() {
  const today = new Date().toISOString().split('T')[0];
  
  // Try to get curated challenge from KV/DB
  let challenge = await kv.get(`challenge:${today}`);
  
  if (!challenge) {
    // Auto-generate using random selection
    challenge = await generateDailyChallenge(today);
    await kv.set(`challenge:${today}`, challenge, { ex: 86400 });
  }
  
  return NextResponse.json(challenge);
}
```

---

### 3.10 Admin Panel

**User Story**: As an admin, I want to curate daily challenges and manage content.

**Auth Flow**:
```typescript
// /api/admin/auth/route.ts
export async function POST(request: Request) {
  const { password } = await request.json();
  
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  
  const token = crypto.randomUUID();
  await kv.set(`admin:session:${token}`, true, { ex: 86400 }); // 24h expiry
  
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400,
  });
  
  return response;
}
```

**Admin Dashboard Features**:
- Calendar view of upcoming challenges
- Batch editor: Set challenges for next 7 days
- Auto-generated suggestions (accept/modify/reject)
- Person browser with search/filter

---

### 3.11 Custom People Lists

**User Story**: As a player, I want to save custom lists of people (including personal contacts) for reuse.

**Data Structure**:
```typescript
interface CustomList {
  id: string;
  name: string;
  createdAt: number;
  people: CustomPerson[];
}

interface CustomPerson {
  id: string;
  name: string;
  imageUrl?: string; // base64 for uploads
  isPersonal: boolean; // true = personal contact (uploaded photo)
}
```

**Photo Upload**:
```typescript
function handlePhotoUpload(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Resize if needed
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let { width, height } = img;
        if (width > height && width > MAX_SIZE) {
          height = (height / width) * MAX_SIZE;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width = (width / height) * MAX_SIZE;
          height = MAX_SIZE;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

---

### 3.12 Sound & Haptics

**User Story**: As a player, I want audio and haptic feedback for a more immersive experience.

**Audio Manager**:
```typescript
class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  
  async preload() {
    const soundFiles = ['assign', 'tick', 'warning', 'complete', 'skip'];
    for (const name of soundFiles) {
      const audio = new Audio(`/sounds/${name}.mp3`);
      audio.preload = 'auto';
      this.sounds.set(name, audio);
    }
  }
  
  play(sound: string) {
    if (!this.enabled) return;
    const audio = this.sounds.get(sound);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {}); // Ignore autoplay errors
    }
  }
  
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

export const audioManager = new AudioManager();
```

**Haptics Wrapper**:
```typescript
export function vibrate(pattern: number | number[]) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

export const haptics = {
  light: () => vibrate(10),
  medium: () => vibrate(25),
  heavy: () => vibrate(50),
  success: () => vibrate([10, 50, 10]),
  warning: () => vibrate([50, 30, 50]),
};
```

---

### 3.13 Share Functionality

**User Story**: As a player, I want to share a link to start a session with friends.

**Implementation**:
```typescript
async function shareGame(category?: string) {
  const url = new URL(window.location.origin);
  if (category) {
    url.searchParams.set('category', category);
  }
  
  const shareData = {
    title: 'FMK Game',
    text: 'Play Fuck, Marry, Kill with me!',
    url: url.toString(),
  };
  
  if (navigator.share && navigator.canShare(shareData)) {
    await navigator.share(shareData);
  } else {
    await navigator.clipboard.writeText(url.toString());
    toast.success('Link copied to clipboard!');
  }
}
```

---

## 4. Database Schema

### 4.1 IndexedDB Tables (Dexie.js)

```typescript
// /lib/db/schema.ts
import Dexie, { Table } from 'dexie';

export interface Preferences {
  id: 'main'; // Single row
  genderFilter: string[];
  ageRange: { min: number; max: number };
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  defaultTimerConfig: TimerConfig;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  isCustom: boolean;
  createdAt: number;
  personIds: string[];
}

export interface Person {
  id: string;
  name: string;
  searchName: string;
  description: string;
  gender: 'male' | 'female' | 'non-binary';
  birthYear: number | null;
  categoryId: string;
  imageUrl: string | null;
  fallbackUrls: string[];
  isPersonal: boolean;
}

export interface CustomList {
  id: string;
  name: string;
  createdAt: number;
  personIds: string[];
}

export interface GameHistoryEntry {
  id: string;
  timestamp: number;
  categoryId: string;
  categoryName: string;
  players: string[];
  rounds: RoundRecord[];
}

export interface RoundRecord {
  people: Array<{ id: string; name: string; imageUrl: string | null }>;
  assignments: Record<string, Record<string, 'F' | 'M' | 'K'>>; // playerId -> personId -> choice
}

export interface CachedImage {
  id: string; // personId or URL hash
  base64: string;
  cachedAt: number;
  size: number; // bytes
}

export interface DailyChallengeCache {
  date: string;
  personIds: [string, string, string];
  title?: string;
  fetchedAt: number;
}

class FMKDatabase extends Dexie {
  preferences!: Table<Preferences>;
  categories!: Table<Category>;
  people!: Table<Person>;
  customLists!: Table<CustomList>;
  gameHistory!: Table<GameHistoryEntry>;
  cachedImages!: Table<CachedImage>;
  dailyChallenges!: Table<DailyChallengeCache>;

  constructor() {
    super('fmk-db');
    
    this.version(1).stores({
      preferences: 'id',
      categories: 'id, isCustom, createdAt',
      people: 'id, categoryId, gender, [categoryId+gender]',
      customLists: 'id, createdAt',
      gameHistory: 'id, timestamp, categoryId',
      cachedImages: 'id, cachedAt',
      dailyChallenges: 'date, fetchedAt',
    });
  }
}

export const db = new FMKDatabase();
```

### 4.2 Table Relationships

```
┌──────────────┐       ┌──────────────┐
│  categories  │──────<│    people    │
│              │       │              │
│ id (PK)      │       │ id (PK)      │
│ name         │       │ categoryId   │──┐
│ isCustom     │       │ name         │  │
│ personIds[]  │       │ gender       │  │
└──────────────┘       └──────────────┘  │
                              ▲          │
                              │          │
┌──────────────┐              │          │
│ customLists  │──────────────┘          │
│              │  (references people)    │
│ id (PK)      │                         │
│ personIds[]  │                         │
└──────────────┘                         │
                                         │
┌──────────────┐                         │
│ gameHistory  │                         │
│              │  (embeds person data)   │
│ id (PK)      │                         │
│ categoryId   │─────────────────────────┘
│ rounds[]     │
└──────────────┘
```

### 4.3 Data Initialization

```typescript
// /lib/db/init.ts
import { db } from './schema';
import { prebuiltCategories } from '@/data/categories';

export async function initializeDatabase() {
  // Check if already initialized
  const categoryCount = await db.categories.count();
  if (categoryCount > 0) return;
  
  // Initialize preferences with defaults
  await db.preferences.put({
    id: 'main',
    genderFilter: ['any'],
    ageRange: { min: 18, max: 99 },
    soundEnabled: true,
    hapticsEnabled: true,
    defaultTimerConfig: {
      decisionTimer: { enabled: false, seconds: 30 },
      debateTimer: { enabled: false, seconds: 60 },
    },
  });
  
  // Load pre-built categories
  for (const category of prebuiltCategories) {
    await db.categories.put({
      id: category.id,
      name: category.name,
      icon: category.icon,
      isCustom: false,
      createdAt: Date.now(),
      personIds: category.people.map(p => p.id),
    });
    
    for (const person of category.people) {
      await db.people.put({
        ...person,
        categoryId: category.id,
        isPersonal: false,
      });
    }
  }
}
```

---

## 5. Server Actions

### 5.1 AI Generation Action

```typescript
// /lib/ai/actions.ts
'use server';

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

interface GeneratedPerson {
  name: string;
  searchName: string;
  description: string;
  gender: 'male' | 'female' | 'non-binary';
  birthYear: number | null;
}

interface GenerationResult {
  success: boolean;
  people?: GeneratedPerson[];
  error?: string;
}

export async function generateCategory(prompt: string): Promise<GenerationResult> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: `You generate lists of real public figures for a party game.
Given a category, return 30 well-known people who fit.

Return ONLY valid JSON:
{
  "people": [
    {
      "name": "Full Name",
      "searchName": "search query for image",
      "description": "1-line why famous",
      "gender": "male" | "female" | "non-binary",
      "birthYear": number | null
    }
  ]
}

Guidelines:
- Diverse representation
- Famous enough to have photos online
- No highly controversial figures
- birthYear null for fictional characters`,
      messages: [{ role: 'user', content: `Category: ${prompt}` }],
    });
    
    const content = response.content[0];
    if (content.type !== 'text') {
      return { success: false, error: 'Unexpected response type' };
    }
    
    const parsed = JSON.parse(content.text);
    return { success: true, people: parsed.people };
  } catch (error) {
    console.error('AI generation error:', error);
    return { success: false, error: 'Failed to generate category' };
  }
}

interface ValidationResult {
  passed: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
}

export async function validateCategory(
  people: GeneratedPerson[],
  originalPrompt: string
): Promise<ValidationResult> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: `You judge party game category quality.

Score on:
1. Relevance to category
2. Recognition (famous enough?)
3. Appropriateness for party game
4. Diversity (gender, era, etc.)

Return JSON only:
{
  "passed": boolean (score > 70),
  "score": 1-100,
  "issues": ["issue1"],
  "suggestions": ["suggestion1"]
}`,
    messages: [{
      role: 'user',
      content: `Category: "${originalPrompt}"

People:
${people.map(p => `- ${p.name}: ${p.description}`).join('\n')}`,
    }],
  });
  
  const content = response.content[0];
  if (content.type !== 'text') {
    return { passed: true, score: 75, issues: [], suggestions: [] };
  }
  
  return JSON.parse(content.text);
}
```

### 5.2 Image Fetching Actions

```typescript
// /lib/images/actions.ts
'use server';

interface ImageResult {
  url: string | null;
  source: 'tmdb' | 'wikipedia' | 'search' | null;
}

export async function fetchPersonImage(
  name: string,
  searchName: string,
  category?: string
): Promise<ImageResult> {
  // 1. Try TMDB for entertainment categories
  if (category?.match(/movie|tv|actor|celebrity/i)) {
    const tmdbUrl = await searchTMDB(searchName);
    if (tmdbUrl) return { url: tmdbUrl, source: 'tmdb' };
  }
  
  // 2. Try Wikipedia/Wikidata
  const wikiUrl = await searchWikipedia(searchName);
  if (wikiUrl) return { url: wikiUrl, source: 'wikipedia' };
  
  // 3. Fallback to image search (requires proxy)
  // Note: This would need a proper image search API
  return { url: null, source: null };
}

async function searchTMDB(query: string): Promise<string | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return null;
  
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    
    if (data.results?.[0]?.profile_path) {
      return `https://image.tmdb.org/t/p/w500${data.results[0].profile_path}`;
    }
  } catch (error) {
    console.error('TMDB search error:', error);
  }
  return null;
}

async function searchWikipedia(query: string): Promise<string | null> {
  try {
    // Use Wikidata for more reliable image fetching
    const sparqlQuery = `
      SELECT ?image WHERE {
        ?item rdfs:label "${query}"@en.
        ?item wdt:P18 ?image.
      } LIMIT 1
    `;
    
    const res = await fetch(
      `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`
    );
    const data = await res.json();
    
    if (data.results?.bindings?.[0]?.image?.value) {
      return data.results.bindings[0].image.value;
    }
  } catch (error) {
    console.error('Wikipedia search error:', error);
  }
  return null;
}
```

### 5.3 Daily Challenge Actions

```typescript
// /lib/daily-challenge/actions.ts
'use server';

import { kv } from '@vercel/kv';
import { db } from '@/lib/db';

interface DailyChallenge {
  date: string;
  people: Array<{ id: string; name: string; imageUrl: string | null }>;
  title?: string;
  curatedBy: 'auto' | 'admin';
}

export async function getDailyChallenge(): Promise<DailyChallenge> {
  const today = new Date().toISOString().split('T')[0];
  
  // Try cached/curated challenge
  const cached = await kv.get<DailyChallenge>(`challenge:${today}`);
  if (cached) return cached;
  
  // Auto-generate
  const challenge = await generateDailyChallenge(today);
  await kv.set(`challenge:${today}`, challenge, { ex: 86400 });
  
  return challenge;
}

async function generateDailyChallenge(date: string): Promise<DailyChallenge> {
  // Get all available people
  const allPeople = await db.people.toArray();
  
  // Apply some variety (don't repeat recent challenges)
  const recentChallenges = await db.dailyChallenges
    .orderBy('fetchedAt')
    .reverse()
    .limit(7)
    .toArray();
  
  const recentIds = new Set(recentChallenges.flatMap(c => c.personIds));
  const availablePeople = allPeople.filter(p => !recentIds.has(p.id));
  
  // Random selection with some constraints
  const shuffled = availablePeople.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);
  
  return {
    date,
    people: selected.map(p => ({
      id: p.id,
      name: p.name,
      imageUrl: p.imageUrl,
    })),
    curatedBy: 'auto',
  };
}

// Admin action
export async function setCuratedChallenge(
  date: string,
  personIds: [string, string, string],
  title?: string
): Promise<void> {
  const people = await db.people.bulkGet(personIds);
  
  const challenge: DailyChallenge = {
    date,
    people: people.map(p => ({
      id: p!.id,
      name: p!.name,
      imageUrl: p!.imageUrl,
    })),
    title,
    curatedBy: 'admin',
  };
  
  await kv.set(`challenge:${date}`, challenge, { ex: 86400 * 7 }); // 7 day TTL
}
```

---

## 6. Design System

### 6.1 Visual Style

**Color Palette**:
```css
:root {
  /* Primary - Hot Pink/Coral */
  --primary: #FF4D6D;
  --primary-hover: #FF3355;
  --primary-muted: #FF4D6D20;
  
  /* Secondary - Electric Purple */
  --secondary: #7C3AED;
  --secondary-hover: #6D28D9;
  
  /* Backgrounds */
  --background: #0F0F1A;
  --background-elevated: #1A1A2E;
  --background-card: #252542;
  
  /* Text */
  --foreground: #FFFFFF;
  --foreground-muted: #A0A0B0;
  
  /* Semantic */
  --fuck: #FF4D6D;      /* Hot pink */
  --marry: #10B981;     /* Emerald green */
  --kill: #6B7280;      /* Slate gray */
  
  /* States */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #FF4D6D 0%, #FF6B8A 100%);
  --gradient-card: linear-gradient(180deg, #252542 0%, #1A1A2E 100%);
}
```

**Typography**:
```css
:root {
  /* Font Family - Using system fonts for performance */
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 
               "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  
  /* Or import a playful font like Nunito/Poppins */
  --font-display: 'Nunito', var(--font-sans);
  
  /* Sizes - Large for drunk-proof readability */
  --text-xs: 0.875rem;    /* 14px */
  --text-sm: 1rem;        /* 16px */
  --text-base: 1.125rem;  /* 18px - body text minimum */
  --text-lg: 1.25rem;     /* 20px */
  --text-xl: 1.5rem;      /* 24px */
  --text-2xl: 1.875rem;   /* 30px */
  --text-3xl: 2.25rem;    /* 36px */
  --text-4xl: 3rem;       /* 48px */
  
  /* Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

**Spacing Scale**:
```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

**Drunk-Proof Requirements**:
- All tap targets minimum 48x48px (12x12 Tailwind units)
- Minimum 18px font for body text
- High contrast ratios (WCAG AAA for important elements)
- Clear visual hierarchy with generous spacing
- No small toggles or checkboxes; use large switches/buttons

### 6.2 Core Components

**Button Variants**:
```typescript
// Tailwind classes for button variants
const buttonVariants = {
  primary: `
    bg-gradient-to-r from-primary to-primary-hover
    text-white font-semibold
    min-h-[48px] px-6 rounded-xl
    active:scale-95 transition-transform
    shadow-lg shadow-primary/25
  `,
  secondary: `
    bg-background-elevated border-2 border-primary/50
    text-primary font-semibold
    min-h-[48px] px-6 rounded-xl
    active:scale-95 transition-transform
  `,
  ghost: `
    bg-transparent text-foreground-muted
    min-h-[48px] px-4 rounded-xl
    hover:bg-background-elevated
    active:scale-95 transition-transform
  `,
  fmk: {
    fuck: `bg-fuck text-white min-h-[64px] rounded-2xl font-bold text-xl`,
    marry: `bg-marry text-white min-h-[64px] rounded-2xl font-bold text-xl`,
    kill: `bg-kill text-white min-h-[64px] rounded-2xl font-bold text-xl`,
  },
};
```

**Card Component**:
```typescript
// PersonCard.tsx
interface PersonCardProps {
  person: Person;
  assigned?: 'F' | 'M' | 'K';
  onTap?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function PersonCard({ person, assigned, onTap, size = 'md' }: PersonCardProps) {
  const sizeClasses = {
    sm: 'w-24 h-32',
    md: 'w-32 h-44',
    lg: 'w-40 h-56',
  };
  
  const assignedOverlay = {
    F: 'bg-fuck/80 ring-4 ring-fuck',
    M: 'bg-marry/80 ring-4 ring-marry',
    K: 'bg-kill/80 ring-4 ring-kill',
  };
  
  return (
    <button
      onClick={onTap}
      className={cn(
        sizeClasses[size],
        'relative rounded-2xl overflow-hidden',
        'bg-background-card',
        'active:scale-95 transition-transform',
        'focus:outline-none focus:ring-2 focus:ring-primary',
        assigned && 'opacity-75'
      )}
    >
      {/* Image */}
      <div className="absolute inset-0">
        {person.imageUrl ? (
          <img
            src={person.imageUrl}
            alt={person.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-card flex items-center justify-center">
            <span className="text-4xl">👤</span>
          </div>
        )}
      </div>
      
      {/* Name overlay */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <p className="text-white font-semibold text-sm line-clamp-2">
          {person.name}
        </p>
      </div>
      
      {/* Assignment badge */}
      {assigned && (
        <div className={cn(
          'absolute top-2 right-2 w-10 h-10 rounded-full',
          'flex items-center justify-center',
          'text-white font-bold text-lg',
          assignedOverlay[assigned]
        )}>
          {assigned}
        </div>
      )}
    </button>
  );
}
```

**Assignment Slots**:
```typescript
// AssignmentSlots.tsx
interface AssignmentSlotsProps {
  assignments: Partial<Record<string, 'F' | 'M' | 'K'>>;
  onAssign: (choice: 'F' | 'M' | 'K') => void;
  activeChoice?: 'F' | 'M' | 'K';
}

export function AssignmentSlots({ assignments, onAssign, activeChoice }: AssignmentSlotsProps) {
  const slots: Array<{ choice: 'F' | 'M' | 'K'; label: string; color: string }> = [
    { choice: 'F', label: 'Fuck', color: 'bg-fuck' },
    { choice: 'M', label: 'Marry', color: 'bg-marry' },
    { choice: 'K', label: 'Kill', color: 'bg-kill' },
  ];
  
  const getAssignedCount = (choice: 'F' | 'M' | 'K') =>
    Object.values(assignments).filter(c => c === choice).length;
  
  return (
    <div className="flex gap-4 justify-center p-4">
      {slots.map(({ choice, label, color }) => (
        <button
          key={choice}
          onClick={() => onAssign(choice)}
          disabled={getAssignedCount(choice) > 0}
          className={cn(
            'flex-1 max-w-[120px] min-h-[80px]',
            'rounded-2xl border-4 border-dashed',
            'flex flex-col items-center justify-center gap-1',
            'transition-all duration-200',
            getAssignedCount(choice) > 0 
              ? `${color} border-transparent opacity-50` 
              : `border-gray-600 ${activeChoice === choice ? color : 'bg-background-elevated'}`,
            activeChoice === choice && 'scale-110 shadow-lg'
          )}
        >
          <span className="text-2xl font-bold text-white">{choice}</span>
          <span className="text-xs text-white/70">{label}</span>
        </button>
      ))}
    </div>
  );
}
```

---

## 7. Component Architecture

### 7.1 Server Components

**Home Page** (`/app/(game)/page.tsx`):
```typescript
import { getDailyChallenge } from '@/lib/daily-challenge/actions';
import { CategoryGrid } from '@/components/categories/CategoryGrid';
import { DailyChallengeCard } from '@/components/game/DailyChallengeCard';

export default async function HomePage() {
  const dailyChallenge = await getDailyChallenge();
  
  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      <header className="text-center py-6">
        <h1 className="text-4xl font-bold text-primary">FMK</h1>
        <p className="text-foreground-muted mt-2">Fuck. Marry. Kill.</p>
      </header>
      
      <Suspense fallback={<DailyChallengeCardSkeleton />}>
        <DailyChallengeCard challenge={dailyChallenge} />
      </Suspense>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <CategoryGrid />
      </section>
    </div>
  );
}
```

**Error Boundary**:
```typescript
// /app/(game)/error.tsx
'use client';

export default function GameError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
      <span className="text-6xl mb-4">😵</span>
      <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
      <p className="text-foreground-muted mb-6">
        {error.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={reset}
        className="bg-primary text-white px-6 py-3 rounded-xl font-semibold"
      >
        Try Again
      </button>
    </div>
  );
}
```

### 7.2 Client Components

**Game Board** (`/components/game/GameBoard.tsx`):
```typescript
'use client';

import { useState, useCallback } from 'react';
import { useGame } from '@/hooks/useGame';
import { PersonCard } from './PersonCard';
import { AssignmentSlots } from './AssignmentSlots';
import { Timer } from './Timer';
import { RoundSummary } from './RoundSummary';
import { haptics, audioManager } from '@/lib/audio';

interface GameBoardProps {
  categoryId: string;
  players: string[];
  timerConfig: TimerConfig;
}

export function GameBoard({ categoryId, players, timerConfig }: GameBoardProps) {
  const {
    state,
    currentRound,
    assignPerson,
    skipPerson,
    nextRound,
    endGame,
  } = useGame({ categoryId, players });
  
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  
  const handlePersonTap = useCallback((personId: string) => {
    setSelectedPerson(personId);
  }, []);
  
  const handleAssign = useCallback((choice: 'F' | 'M' | 'K') => {
    if (!selectedPerson) return;
    
    assignPerson(selectedPerson, choice);
    haptics.medium();
    audioManager.play('assign');
    setSelectedPerson(null);
  }, [selectedPerson, assignPerson]);
  
  if (state.phase === 'reviewing') {
    return (
      <RoundSummary
        round={state.completedRound}
        onNextRound={nextRound}
        onEndGame={endGame}
      />
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Header with player name and timer */}
      <header className="flex items-center justify-between p-4">
        <div>
          <p className="text-foreground-muted text-sm">Current Player</p>
          <p className="text-xl font-bold">{currentRound.currentPlayer}</p>
        </div>
        {timerConfig.decisionTimer.enabled && (
          <Timer
            seconds={timerConfig.decisionTimer.seconds}
            onExpire={() => handleTimeExpire()}
          />
        )}
      </header>
      
      {/* People cards */}
      <div className="flex-1 flex items-center justify-center gap-4 p-4">
        {currentRound.people.map((person) => (
          <PersonCard
            key={person.id}
            person={person}
            assigned={currentRound.assignments[person.id]}
            onTap={() => handlePersonTap(person.id)}
            size="lg"
          />
        ))}
      </div>
      
      {/* Assignment slots */}
      <div className="pb-8">
        <AssignmentSlots
          assignments={currentRound.assignments}
          onAssign={handleAssign}
          activeChoice={selectedPerson ? undefined : undefined}
        />
        
        {/* Skip button */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => selectedPerson && skipPerson(selectedPerson)}
            disabled={!selectedPerson}
            className="text-foreground-muted text-sm underline disabled:opacity-50"
          >
            Don't know them? Skip
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Onboarding Carousel**:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PreferencesForm } from './PreferencesForm';
import { db } from '@/lib/db';

const slides = [
  {
    title: 'Welcome to FMK',
    description: 'The classic party game, now in your pocket.',
    emoji: '🎉',
  },
  {
    title: 'How to Play',
    description: 'You\'ll see 3 people. Decide who to Fuck, Marry, or Kill.',
    emoji: '🤔',
  },
];

export function OnboardingCarousel() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const handleComplete = async (preferences: Preferences) => {
    await db.preferences.put({ ...preferences, id: 'main' });
    localStorage.setItem('fmk_onboarded', 'true');
    router.push('/');
  };
  
  const handleSkip = async () => {
    // Set default preferences
    await db.preferences.put({
      id: 'main',
      genderFilter: ['any'],
      ageRange: { min: 18, max: 99 },
      soundEnabled: true,
      hapticsEnabled: true,
      defaultTimerConfig: {
        decisionTimer: { enabled: false, seconds: 30 },
        debateTimer: { enabled: false, seconds: 60 },
      },
    });
    localStorage.setItem('fmk_onboarded', 'true');
    router.push('/');
  };
  
  const isLastSlide = currentSlide === slides.length;
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 text-foreground-muted text-sm z-10"
      >
        Skip
      </button>
      
      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {!isLastSlide ? (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="text-center"
            >
              <span className="text-8xl block mb-6">{slides[currentSlide].emoji}</span>
              <h1 className="text-3xl font-bold mb-4">{slides[currentSlide].title}</h1>
              <p className="text-foreground-muted text-lg">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full max-w-md"
            >
              <h1 className="text-2xl font-bold mb-6 text-center">Set Your Preferences</h1>
              <PreferencesForm onComplete={handleComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Navigation */}
      <div className="p-6">
        {!isLastSlide && (
          <button
            onClick={() => setCurrentSlide(s => s + 1)}
            className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg"
          >
            {currentSlide === slides.length - 1 ? 'Set Preferences' : 'Next'}
          </button>
        )}
        
        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[...slides, { id: 'form' }].map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                i === currentSlide ? 'bg-primary' : 'bg-gray-600'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 8. Authentication & Authorization

### 8.1 Guest Mode (Default)
- No authentication required for gameplay
- All data stored locally in IndexedDB
- No server-side user state

### 8.2 Admin Panel Authentication

**Middleware** (`/middleware.ts`):
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = request.nextUrl.pathname === '/login';
  
  if (!isAdminRoute || isLoginRoute) {
    return NextResponse.next();
  }
  
  const adminToken = request.cookies.get('admin_token')?.value;
  
  if (!adminToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Token validation happens in the API/page
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
```

**Login Page** (`/app/(admin)/login/page.tsx`):
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      if (res.ok) {
        router.push('/admin');
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Access</h1>
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="w-full p-4 rounded-xl bg-background-elevated text-white mb-4"
        />
        
        {error && <p className="text-error text-sm mb-4">{error}</p>}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Enter'}
        </button>
      </form>
    </div>
  );
}
```

---

## 9. Data Flow

### 9.1 State Management Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        CLIENT-SIDE STATE                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────┐    ┌──────────────────┐                     │
│  │   React Context  │    │  Dexie.js Hooks  │                     │
│  │   (Game State)   │    │  (Persistent)    │                     │
│  └────────┬─────────┘    └────────┬─────────┘                     │
│           │                       │                                │
│           ▼                       ▼                                │
│  ┌─────────────────────────────────────────────────────┐          │
│  │              Component Tree                          │          │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │          │
│  │  │GameBoard│  │Settings │  │ History │             │          │
│  │  └─────────┘  └─────────┘  └─────────┘             │          │
│  └─────────────────────────────────────────────────────┘          │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│                       PERSISTENT STORAGE                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────┐    ┌──────────────────┐                     │
│  │    IndexedDB     │    │   localStorage   │                     │
│  │   (Dexie.js)     │    │  (Simple flags)  │                     │
│  │                  │    │                  │                     │
│  │ • preferences    │    │ • onboarded      │                     │
│  │ • categories     │    │ • sound_enabled  │                     │
│  │ • people         │    │                  │                     │
│  │ • gameHistory    │    │                  │                     │
│  │ • customLists    │    │                  │                     │
│  │ • cachedImages   │    │                  │                     │
│  └──────────────────┘    └──────────────────┘                     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 9.2 Game Context Provider

```typescript
// /contexts/GameContext.tsx
'use client';

import { createContext, useContext, useReducer, useCallback } from 'react';
import type { GameState, GameAction, Person } from '@/types';
import { db } from '@/lib/db';
import { selectPeopleForRound } from '@/lib/game/selection';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startGame: (categoryId: string, players: string[]) => Promise<void>;
  assignPerson: (personId: string, choice: 'F' | 'M' | 'K') => void;
  skipPerson: (personId: string) => Promise<void>;
  nextRound: () => Promise<void>;
  endGame: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

const initialState: GameState = { phase: 'idle' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        phase: 'playing',
        categoryId: action.categoryId,
        players: action.players,
        currentPlayerIndex: 0,
        rounds: [],
        currentRound: action.initialRound,
      };
    
    case 'ASSIGN_PERSON':
      if (state.phase !== 'playing') return state;
      const newAssignments = { ...state.currentRound.assignments };
      
      // Clear previous assignment with same choice
      for (const [pid, choice] of Object.entries(newAssignments)) {
        if (choice === action.choice) delete newAssignments[pid];
      }
      newAssignments[action.personId] = action.choice;
      
      const isComplete = Object.keys(newAssignments).length === 3;
      
      if (isComplete) {
        return {
          ...state,
          phase: 'reviewing',
          completedRound: {
            ...state.currentRound,
            assignments: newAssignments,
            completedAt: Date.now(),
          },
        };
      }
      
      return {
        ...state,
        currentRound: { ...state.currentRound, assignments: newAssignments },
      };
    
    case 'SKIP_PERSON':
      if (state.phase !== 'playing') return state;
      return {
        ...state,
        currentRound: {
          ...state.currentRound,
          people: state.currentRound.people.map(p =>
            p.id === action.personId ? action.replacement : p
          ),
          skippedIds: [...state.currentRound.skippedIds, action.personId],
        },
      };
    
    case 'NEXT_ROUND':
      return {
        ...state,
        phase: 'playing',
        rounds: [...state.rounds, state.completedRound!],
        currentRound: action.newRound,
        currentPlayerIndex: 
          (state.currentPlayerIndex + 1) % state.players.length,
      };
    
    case 'END_GAME':
      return {
        phase: 'complete',
        rounds: state.phase === 'reviewing' 
          ? [...state.rounds, state.completedRound!]
          : state.rounds,
      };
    
    default:
      return state;
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  const startGame = useCallback(async (categoryId: string, players: string[]) => {
    const people = await selectPeopleForRound(categoryId, []);
    dispatch({
      type: 'START_GAME',
      categoryId,
      players,
      initialRound: {
        people,
        assignments: {},
        skippedIds: [],
        startedAt: Date.now(),
      },
    });
  }, []);
  
  const assignPerson = useCallback((personId: string, choice: 'F' | 'M' | 'K') => {
    dispatch({ type: 'ASSIGN_PERSON', personId, choice });
  }, []);
  
  const skipPerson = useCallback(async (personId: string) => {
    if (state.phase !== 'playing') return;
    const usedIds = new Set([
      ...state.currentRound.people.map(p => p.id),
      ...state.currentRound.skippedIds,
    ]);
    const [replacement] = await selectPeopleForRound(state.categoryId!, usedIds, 1);
    if (replacement) {
      dispatch({ type: 'SKIP_PERSON', personId, replacement });
    }
  }, [state]);
  
  const nextRound = useCallback(async () => {
    if (state.phase !== 'reviewing') return;
    const usedIds = new Set(state.rounds.flatMap(r => r.people.map(p => p.id)));
    const people = await selectPeopleForRound(state.categoryId!, usedIds);
    dispatch({
      type: 'NEXT_ROUND',
      newRound: {
        people,
        assignments: {},
        skippedIds: [],
        startedAt: Date.now(),
      },
    });
  }, [state]);
  
  const endGame = useCallback(() => {
    dispatch({ type: 'END_GAME' });
  }, []);
  
  return (
    <GameContext.Provider value={{
      state,
      dispatch,
      startGame,
      assignPerson,
      skipPerson,
      nextRound,
      endGame,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
```

---

## 10. Stripe Integration

**Not applicable** - This is a personal-use app with no payment requirements.

---

## 11. PostHog Analytics

### 11.1 Analytics Strategy (Optional/Minimal)

Since this is primarily a personal-use app, analytics are optional but can be useful for understanding usage patterns.

**Events to Track**:
```typescript
// /lib/analytics.ts
import posthog from 'posthog-js';

export const analytics = {
  init() {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: 'https://app.posthog.com',
        capture_pageview: false, // Manual page tracking
        persistence: 'localStorage',
      });
    }
  },
  
  track(event: string, properties?: Record<string, unknown>) {
    posthog.capture(event, properties);
  },
  
  // Predefined events
  gameStarted(category: string, playerCount: number) {
    this.track('game_started', { category, player_count: playerCount });
  },
  
  roundCompleted(category: string, roundNumber: number) {
    this.track('round_completed', { category, round_number: roundNumber });
  },
  
  categoryCreated(prompt: string, personCount: number) {
    this.track('custom_category_created', { 
      prompt_length: prompt.length, 
      person_count: personCount 
    });
  },
  
  personSkipped(category: string) {
    this.track('person_skipped', { category });
  },
  
  dailyChallengeStarted() {
    this.track('daily_challenge_started');
  },
};
```

### 11.2 Privacy Considerations
- No PII collection
- Minimal event data
- User can disable analytics (check `soundEnabled` preference as proxy)
- No cross-session tracking needed

---

## 12. Testing

### 12.1 Unit Tests (Vitest)

**Game Logic Tests**:
```typescript
// __tests__/game/engine.test.ts
import { describe, it, expect } from 'vitest';
import { gameReducer, assignPerson, isRoundComplete } from '@/lib/game/engine';

describe('Game Engine', () => {
  describe('assignPerson', () => {
    it('should assign a person to a choice', () => {
      const state = {
        assignments: {},
      };
      const result = assignPerson(state, 'person-1', 'F');
      expect(result.assignments['person-1']).toBe('F');
    });
    
    it('should swap if choice already used', () => {
      const state = {
        assignments: { 'person-1': 'F' },
      };
      const result = assignPerson(state, 'person-2', 'F');
      expect(result.assignments['person-1']).toBeUndefined();
      expect(result.assignments['person-2']).toBe('F');
    });
    
    it('should allow different choices for different people', () => {
      let state = { assignments: {} };
      state = assignPerson(state, 'person-1', 'F');
      state = assignPerson(state, 'person-2', 'M');
      state = assignPerson(state, 'person-3', 'K');
      
      expect(Object.keys(state.assignments)).toHaveLength(3);
      expect(isRoundComplete(state)).toBe(true);
    });
  });
  
  describe('isRoundComplete', () => {
    it('should return false for incomplete assignments', () => {
      expect(isRoundComplete({ assignments: { 'p1': 'F' } })).toBe(false);
      expect(isRoundComplete({ assignments: { 'p1': 'F', 'p2': 'M' } })).toBe(false);
    });
    
    it('should return true when all three assigned', () => {
      expect(isRoundComplete({
        assignments: { 'p1': 'F', 'p2': 'M', 'p3': 'K' }
      })).toBe(true);
    });
  });
});
```

**Preference Filtering Tests**:
```typescript
// __tests__/game/selection.test.ts
import { describe, it, expect } from 'vitest';
import { filterPeopleByPreferences } from '@/lib/game/selection';

describe('Person Selection', () => {
  const mockPeople = [
    { id: '1', name: 'Person 1', gender: 'male', birthYear: 1990 },
    { id: '2', name: 'Person 2', gender: 'female', birthYear: 1985 },
    { id: '3', name: 'Person 3', gender: 'male', birthYear: 1970 },
    { id: '4', name: 'Person 4', gender: 'non-binary', birthYear: 1995 },
  ];
  
  it('should filter by gender', () => {
    const prefs = { genderFilter: ['female'], ageRange: { min: 18, max: 99 } };
    const result = filterPeopleByPreferences(mockPeople, prefs);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });
  
  it('should filter by age range', () => {
    const prefs = { genderFilter: ['any'], ageRange: { min: 30, max: 45 } };
    const result = filterPeopleByPreferences(mockPeople, prefs);
    // Person born 1985 (age ~40) and 1970 (age ~55) - only 1985 fits
    expect(result.map(p => p.id)).toContain('2');
  });
  
  it('should return all for "any" gender filter', () => {
    const prefs = { genderFilter: ['any'], ageRange: { min: 18, max: 99 } };
    const result = filterPeopleByPreferences(mockPeople, prefs);
    expect(result).toHaveLength(4);
  });
});
```

### 12.2 E2E Tests (Playwright)

**Key User Flows**:

```typescript
// e2e/onboarding.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ context }) => {
    // Clear localStorage to simulate first launch
    await context.addInitScript(() => {
      window.localStorage.clear();
    });
  });
  
  test('should complete onboarding with default preferences', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to onboarding
    await expect(page).toHaveURL('/onboarding');
    
    // Swipe through slides
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    
    // Should be on preferences slide
    await expect(page.locator('h1')).toContainText('Preferences');
    
    // Submit with defaults
    await page.click('button:has-text("Start Playing")');
    
    // Should be on home page
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('FMK');
  });
  
  test('should skip onboarding', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Skip")');
    await expect(page).toHaveURL('/');
  });
});
```

```typescript
// e2e/gameplay.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Core Gameplay', () => {
  test.beforeEach(async ({ context, page }) => {
    // Mark as onboarded
    await context.addInitScript(() => {
      window.localStorage.setItem('fmk_onboarded', 'true');
    });
    await page.goto('/');
  });
  
  test('should play a complete round', async ({ page }) => {
    // Select a category
    await page.click('[data-testid="category-movie-stars"]');
    
    // Setup page
    await expect(page).toHaveURL('/setup');
    await page.click('button:has-text("Start Game")');
    
    // Game page
    await expect(page).toHaveURL('/play');
    
    // Should see 3 person cards
    const personCards = page.locator('[data-testid="person-card"]');
    await expect(personCards).toHaveCount(3);
    
    // Tap first person
    await personCards.first().click();
    
    // Tap "Fuck" slot
    await page.click('[data-testid="slot-F"]');
    
    // Tap second person
    await personCards.nth(1).click();
    await page.click('[data-testid="slot-M"]');
    
    // Tap third person
    await personCards.nth(2).click();
    await page.click('[data-testid="slot-K"]');
    
    // Should show round summary
    await expect(page.locator('h2')).toContainText('Round Complete');
  });
  
  test('should skip a person', async ({ page }) => {
    await page.click('[data-testid="category-movie-stars"]');
    await page.click('button:has-text("Start Game")');
    
    // Get first person's name
    const firstPersonName = await page
      .locator('[data-testid="person-card"] p')
      .first()
      .textContent();
    
    // Tap first person then skip
    await page.locator('[data-testid="person-card"]').first().click();
    await page.click('button:has-text("Skip")');
    
    // Person should be different
    const newPersonName = await page
      .locator('[data-testid="person-card"] p')
      .first()
      .textContent();
    
    expect(newPersonName).not.toBe(firstPersonName);
  });
});
```

```typescript
// e2e/offline.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Offline Support', () => {
  test('should work offline after initial load', async ({ page, context }) => {
    // First visit while online
    await page.goto('/');
    
    // Wait for service worker to cache
    await page.waitForTimeout(2000);
    
    // Go offline
    await context.setOffline(true);
    
    // Should still show home page
    await page.reload();
    await expect(page.locator('h1')).toContainText('FMK');
    
    // Should show offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Categories should still be accessible
    await page.click('[data-testid="category-movie-stars"]');
    await expect(page).toHaveURL('/setup');
  });
});
```

---

## Appendix: Environment Variables

```bash
# .env.local

# AI Provider (choose one)
ANTHROPIC_API_KEY=sk-ant-...
# Or: OPENAI_API_KEY=sk-...

# Image APIs
TMDB_API_KEY=...

# Admin
ADMIN_PASSWORD=your-secure-password

# Vercel KV (for daily challenges)
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=...
```

---

## Appendix: Pre-built Category Data Structure

```typescript
// /data/categories/movie-stars.json
{
  "id": "movie-stars",
  "name": "Movie Stars",
  "icon": "🎬",
  "people": [
    {
      "id": "ms-001",
      "name": "Timothée Chalamet",
      "searchName": "Timothée Chalamet actor",
      "description": "Oscar-nominated actor known for Dune and Call Me By Your Name",
      "gender": "male",
      "birthYear": 1995,
      "imageUrl": null,
      "fallbackUrls": []
    },
    {
      "id": "ms-002", 
      "name": "Zendaya",
      "searchName": "Zendaya actress",
      "description": "Emmy-winning actress known for Euphoria and Spider-Man films",
      "gender": "female",
      "birthYear": 1996,
      "imageUrl": null,
      "fallbackUrls": []
    }
    // ... 30-50 more entries per category
  ]
}
```

---

This specification should provide comprehensive guidance for implementing the FMK PWA. The modular architecture allows for Phase 2 features (multi-device sync, native apps) to be added without major refactoring.