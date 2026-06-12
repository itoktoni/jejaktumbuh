# Halo Bunda — Project Documentation

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Data Models](#data-models)
- [Navigation Flow](#navigation-flow)
- [Component Hierarchy](#component-hierarchy)
- [Design System](#design-system)
- [PWA Configuration](#pwa-configuration)
- [Getting Started](#getting-started)

---

## Overview

**Halo Bunda** ("Hello Mom") is a Progressive Web App (PWA) designed as a **child development companion** for Indonesian parents. It focuses on holistic child character development across **8 pillars** with **32 sub-skills**, providing interactive activities, progress tracking, and gamification features.

### Key Features

| Feature | Description |
|---------|-------------|
| 8 Development Pillars | Spiritual, Character, Creativity, Discipline, Independence, Social, Emotion, Health |
| 32 Sub-Skill Areas | Each pillar has 4 sub-skills with dedicated activities |
| 9 Activity Types | Story Telling, Roleplay, Games, Monolog, Creative Projects, Music & Movement, Puzzles, Mindfulness, Outdoor Exploration |
| Interactive Readers | Story reader (swipe + TTS), Roleplay (chat-bubble), Puzzle (scoring), Project (step-by-step) |
| Academic Challenges | Track Qur'an memorization, math, language with point system |
| Daily Schedule | Time-based activity planner with auto-reset |
| Checklist System | Grouped checklists with progress bars |
| Progress Tracking | Per-child skill progress with evaluation questionnaires |
| Share Cards | Generate shareable PNG images via html2canvas |
| Referral System | Unique referral codes with landing page |
| Multi-child Support | Multiple child profiles per parent |
| Gamification | Points, levels, missions, sound effects |
| PWA | Installable, offline support, native-like experience |

---

## Tech Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Vue 3 (Composition API) | ^3.5.13 | UI framework with `<script setup>` syntax |
| **State Management** | Pinia | ^3.0.4 | Centralized state management |
| **Database** | Dexie.js | ^4.4.3 | IndexedDB wrapper for client-side storage |
| **Build Tool** | Vite | ^6.3.5 | Dev server + bundler |
| **CSS Framework** | Tailwind CSS | ^3.4.17 | Utility-first CSS |
| **CSS Processing** | PostCSS + Autoprefixer | ^8.5.3 | CSS transformations |
| **PWA** | vite-plugin-pwa (Workbox) | ^1.3.0 | Service worker + manifest |
| **Image Capture** | html2canvas-pro | ^2.0.4 | Generate shareable images |
| **Fonts** | Nunito Sans (Google Fonts) | CDN | Typography (400-800 weights) |
| **Icons** | Material Symbols Outlined | CDN | Icon system |
| **TTS** | Web Speech API | Browser | Text-to-speech for stories |
| **Audio** | Web Audio API | Browser | Sound effects |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @vitejs/plugin-vue | ^5.2.3 | Vue SFC support for Vite |
| autoprefixer | ^10.4.21 | CSS vendor prefixes |
| postcss | ^8.5.3 | CSS processing |
| tailwindcss | ^3.4.17 | CSS framework |
| vite | ^6.3.5 | Build tool |

---

## Project Structure

```
family/
├── .env                              # Environment variables
├── .gitignore                        # Git ignore rules
├── index.html                        # Main HTML entry point (SPA)
├── aktivitas.html                    # Standalone prototype - Activity page
├── share.html                        # Standalone prototype - Share card
├── sub.html                          # Standalone prototype - Main page
├── package.json                      # NPM dependencies
├── postcss.config.js                 # PostCSS config
├── tailwind.config.js                # Tailwind design system
├── vite.config.js                    # Vite + PWA config
├── yarn.lock / package-lock.json     # Lockfiles
│
├── public/
│   ├── favicon.svg                   # App favicon
│   └── icons/
│       ├── icon-192.svg              # PWA icon 192x192
│       └── icon-512.svg              # PWA icon 512x512
│
└── src/
    ├── main.js                       # Vue app entry (Pinia setup)
    ├── App.vue                       # Root component (routing + layout)
    ├── db.js                         # Dexie database layer
    │
    ├── assets/
    │   └── main.css                  # Global CSS (Tailwind + custom)
    │
    ├── composables/
    │   ├── useAppData.js             # Data seeding (legacy)
    │   └── useInstall.js             # PWA install prompt
    │
    ├── data/
    │   ├── pilars.js                 # 8 pillars + 32 sub-skills + activities
    │   ├── challenge.js              # Challenge seed data
    │   └── evaluasi.js               # Evaluation questionnaires
    │
    ├── layouts/
    │   ├── AppHeader.vue             # Mobile top bar + drawer menu
    │   ├── AppSidebar.vue            # Desktop sidebar (280px)
    │   └── BottomNav.vue             # Mobile bottom navigation
    │
    ├── pages/
    │   ├── PilarTab.vue              # Home - Pillar grid
    │   ├── PilarSubList.vue          # Sub-skill list (legacy)
    │   ├── AktivitasPage.vue         # Activity type selector
    │   ├── AktivitasDetailPage.vue   # Activity detail router
    │   ├── StoryReader.vue           # Story reader (swipe + TTS)
    │   ├── RoleplayReader.vue        # Roleplay dialog reader
    │   ├── PuzzleReader.vue          # Interactive quiz
    │   ├── ProjectReader.vue         # Step-by-step guide
    │   ├── ProgressTab.vue           # Child progress tracking
    │   ├── ToolsTab.vue              # Tools hub (challenges, schedule, checklist)
    │   ├── ChallengePage.vue         # Academic challenge tracker
    │   ├── JadwalPage.vue            # Daily schedule
    │   ├── ChecklistPage.vue         # Checklist management
    │   ├── ProfileTab.vue            # User profile + child management
    │   ├── PoinTab.vue               # Gamification view
    │   └── ReferralPage.vue          # Referral landing page
    │
    ├── components/
    │   ├── AnakSelector.vue          # Child dropdown selector
    │   ├── AppButton.vue             # Multi-variant button
    │   ├── AppCheckbox.vue           # Custom checkbox
    │   ├── AppInput.vue              # Text input
    │   ├── AppModal.vue              # Bottom-sheet / center modal
    │   ├── AppRadio.vue              # Radio button
    │   ├── AppRange.vue              # Range slider
    │   ├── AppSelect.vue             # Select dropdown
    │   ├── AppTextarea.vue           # Textarea input
    │   ├── AppToggle.vue             # Toggle switch
    │   ├── ShareCard.vue             # Shareable challenge card
    │   └── ShareChecklistCard.vue    # Shareable checklist card
    │
    ├── stores/
    │   ├── appStore.js               # App-level state (tabs, navigation)
    │   ├── anakStore.js              # Child profiles (CRUD)
    │   └── toolsStore.js             # Tools data (challenges, schedules, checklists)
    │
    └── utils/
        ├── age.js                    # Age calculation utility
        ├── share.js                  # Share-to-image + referral codes
        └── sound.js                  # Web Audio sound effects
```

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (PWA)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────────┐  │
│  │  Layouts  │    │  Stores  │    │    Data Layer        │  │
│  │           │    │  (Pinia) │    │                      │  │
│  │ • Header  │◄──►│ • app    │◄──►│ • Dexie (IndexedDB)  │  │
│  │ • Sidebar │    │ • anak   │    │ • pilars.js          │  │
│  │ • BottomNav│   │ • tools  │    │ • challenge.js       │  │
│  └─────┬────┘    └─────┬────┘    │ • evaluasi.js        │  │
│        │               │         └──────────────────────┘  │
│        ▼               ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Pages (Vue SFC)                   │   │
│  │                                                     │   │
│  │  PilarTab ──► AktivitasPage ──► AktivitasDetailPage │   │
│  │                                      │              │   │
│  │                    ┌─────────────────┼──────────┐   │   │
│  │                    ▼         ▼       ▼          ▼   │   │
│  │              StoryReader  Roleplay  Puzzle  Project  │   │
│  │                                                     │   │
│  │  ProgressTab ──► Evaluation Modal                   │   │
│  │  ToolsTab ──► ChallengePage / JadwalPage / Checklist│   │
│  │  ProfileTab ──► Child Management / Billing / Referral│  │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Shared Components                   │   │
│  │  AppButton, AppModal, AppInput, AppCheckbox, etc.   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Utilities                         │   │
│  │  age.js │ share.js │ sound.js                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Browser APIs                            │   │
│  │  Web Speech (TTS) │ Web Audio │ Web Share │ PWA     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action
    │
    ▼
Component (Page)
    │
    ├──► Pinia Store (state mutation)
    │        │
    │        ▼
    │    Dexie.js (IndexedDB persistence)
    │
    └──► Utility (share/sound/age)
             │
             ▼
         Browser API (Web Share / Web Audio / TTS)
```

### State Management Pattern

```
┌─────────────────────────────────────────┐
│              Pinia Stores               │
├─────────────────────────────────────────┤
│                                         │
│  appStore                               │
│  ├── activeTab: String                  │
│  ├── selectedPilar: Object | null       │
│  ├── userName: String                   │
│  └── switchTab(tab) / selectPilar(p)    │
│                                         │
│  anakStore                              │
│  ├── daftarAnak: Array                  │
│  ├── selectedAnakId: Number             │
│  ├── loadAnak() / addAnak() / update()  │
│  ├── allHistory (computed)              │
│  └── resetSubpilar(anakId, key)         │
│                                         │
│  toolsStore                             │
│  ├── challenges: Array                  │
│  ├── schedules: Array                   │
│  ├── checklists: Array                  │
│  ├── loadTools(anakId)                  │
│  ├── addChallenge() / editChallenge()   │
│  ├── addPoints() / removePoints()       │
│  ├── addSchedule() / toggleSchedule()   │
│  └── addChecklist() / toggleItem()      │
│                                         │
└─────────────────────────────────────────┘
```

---

## Data Models

### Dexie Database Schema (`HaloBunda`)

```javascript
db.version(1).stores({
  anak:             '++id, nama',
  challenges:       '++id, anakId, category',
  challengeHistory: '++id, anakId, category',
  checklists:       '++id, anakId',
  schedules:        '++id, anakId',
  settings:         'key'
})
```

### Entity Relationship

```
┌─────────────┐       ┌─────────────────┐
│    Anak      │       │   Challenges    │
│  (Children)  │       │                 │
├─────────────┤       ├─────────────────┤
│ id (PK)     │◄──┐   │ id (PK)        │
│ nama        │   ├───│ anakId (FK)    │
│ gender      │   │   │ category       │
│ emoji       │   │   │ title          │
│ bg          │   │   │ notes          │
│ tanggal     │   │   │ emoji          │
│ bulan       │   │   │ bg / color     │
│ tahun       │   │   │ points         │
│ skills[]    │   │   │ maxPoints      │
│ completed[] │   │   └─────────────────┘
│ history[]   │   │
└─────────────┘   │   ┌─────────────────┐
                  │   │ ChallengeHistory │
                  │   ├─────────────────┤
                  ├───│ anakId (FK)     │
                  │   │ category        │
                  │   │ title / emoji   │
                  │   │ maxPoints       │
                  │   └─────────────────┘
                  │
                  │   ┌─────────────────┐
                  │   │   Checklists    │
                  │   ├─────────────────┤
                  ├───│ anakId (FK)     │
                  │   │ title           │
                  │   │ items[]         │
                  │   │   ├ label       │
                  │   │   └ done        │
                  │   └─────────────────┘
                  │
                  │   ┌─────────────────┐
                  │   │   Schedules     │
                  │   ├─────────────────┤
                  └───│ anakId (FK)     │
                      │ time            │
                      │ label           │
                      │ done            │
                      └─────────────────┘

┌─────────────────┐
│    Settings      │
├─────────────────┤
│ key (PK)        │
│ value           │
└─────────────────┘
```

### Anak (Child) Detail

```javascript
{
  id: Number,
  nama: String,              // "Raka"
  gender: String,            // "Laki-laki" | "Perempuan"
  emoji: String,             // "👦" | "👧"
  bg: String,                // "#E3F2FD" | "#FCE4EC"
  tanggal: Number,           // Day of birth
  bulan: Number,             // Month of birth
  tahun: Number,             // Year of birth
  skills: [                  // Active skills being developed
    {
      key: String,           // "bersyukur"
      emoji: String,
      title: String,
      pilar: String,         // Parent pillar key
      progress: Number,      // 0-100
      color: String
    }
  ],
  completedSkills: [         // Finished skills
    { key, emoji, title, pilar, color }
  ],
  history: [                 // Activity log
    { date: String, action: String, emoji: String, color: String }
  ]
}
```

### 8 Development Pillars

| # | Pillar | Sub-Skills |
|---|--------|------------|
| 1 | Spiritual (🤲) | Bersyukur, Berdoa, Menghormati, Peduli Sesama |
| 2 | Character (💎) | Jujur, Bertanggung Jawab, Disiplin, Santun |
| 3 | Creativity (🎨) | Menggambar, Bercerita, Musik, Eksplorasi |
| 4 | Discipline (⏰) | Aturan, Waktu, Fokus, Konsisten |
| 5 | Independence (🌱) | Mandiri, Problem Solving, Keputusan, Self-Care |
| 6 | Social (🤝) | Berbagi, Kerjasama, Empati, Komunikasi |
| 7 | Emotion (💗) | Identifikasi Emosi, Regulasi, Ekspresi, Resiliensi |
| 8 | Health (🏃) | Kebersihan, Nutrisi, Olahraga, Tidur |

---

## Navigation Flow

### Custom Tab-Based Routing (No Vue Router)

The app uses **custom tab-based navigation** with `history.pushState` for browser back button support.

```
┌─────────────────────────────────────────────────────────────────┐
│                        App Entry Point                          │
│                                                                 │
│  URL has ?ref= parameter?                                       │
│  ├── YES ──► ReferralPage (full-screen landing)                 │
│  └── NO  ──► Main App                                          │
│              │                                                  │
│              ├──► Check first load ──► Seed default data        │
│              │                                                  │
│              └──► Render Layout + Active Tab                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     Tab Navigation Map                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   HOME   │  │ PROGRESS │  │  TOOLS   │  │ PROFILE  │       │
│  │  (pilar) │  │          │  │          │  │          │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │              │              │              │             │
│       ▼              ▼              ▼              ▼             │
│  PilarTab       ProgressTab     ToolsTab       ProfileTab       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Additional tabs (accessible via drawer menu):          │   │
│  │  challenge │ jadwal │ checklist │ poin                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Home Tab (Pilar) Navigation Flow

```
PilarTab (Home)
│
├── 8 Pillar Cards (grid)
│   │
│   └── Click Pillar ──► Inline Expand (sub-skill list)
│       │
│       └── Click Sub-skill ──► AktivitasPage
│           │
│           └── 9 Activity Type Cards
│               │
│               └── Click Activity ──► AktivitasDetailPage
│                   │
│                   ├── Story ──► StoryReader (modal)
│                   │   ├── Swipe through pages
│                   │   ├── TTS read-aloud
│                   │   └── Celebration + Moral
│                   │
│                   ├── Roleplay ──► RoleplayReader (modal)
│                   │   ├── Chat-bubble dialog
│                   │   └── TTS per character
│                   │
│                   ├── Puzzle ──► PuzzleReader (modal)
│                   │   ├── Questions + hints
│                   │   └── Score evaluation
│                   │
│                   ├── Project ──► ProjectReader (modal)
│                   │   ├── Materials list
│                   │   └── Step-by-step guide
│                   │
│                   └── Other types ──► Detail view
│
└── Tips card (bottom)
```

### Progress Tab Flow

```
ProgressTab
│
├── Child Accordion Cards
│   │
│   ├── Active Skills (with progress bars)
│   │   │
│   │   └── "Evaluasi" button ──► AppModal
│   │       ├── 5 yes/no questions
│   │       ├── Score calculation
│   │       └── Progress update
│   │
│   ├── "Bagikan" button ──► ShareCard ──► Web Share API
│   │
│   └── Completed Skills
│       ├── "Hapus" button ──► Move back to active
│       └── "Bagikan" button ──► Share
```

### Tools Tab Flow

```
ToolsTab
│
├── AnakSelector (choose child)
│
├── ChallengePage
│   ├── Active challenges (per category)
│   │   ├── +/- Point buttons (with sound)
│   │   ├── Edit / Delete
│   │   └── Share ──► ShareCard
│   ├── Add Challenge form (modal)
│   └── History tab
│
├── JadwalPage
│   ├── Schedule cards (time + done toggle)
│   ├── Auto-reset daily
│   └── Add Schedule form (modal)
│
└── ChecklistPage
    ├── Checklist groups with progress bars
    ├── Checkbox items
    ├── Add item
    └── Share ──► ShareChecklistCard
```

### Profile Tab Flow

```
ProfileTab
│
├── User Profile
│   ├── Edit name / gender
│   └── Change password
│
├── Child Management
│   ├── List children
│   ├── Add child (name, gender, birth date)
│   ├── Edit child
│   └── Delete child (cascade delete all data)
│
├── Billing Plans
│   ├── Free / Premium / Family
│   └── (UI only, no payment integration)
│
└── Referral
    ├── Generate referral code
    └── Share referral link
```

---

## Component Hierarchy

```
App.vue
│
├── [Conditional] ReferralPage
│
└── Main Layout
    │
    ├── AppSidebar (Desktop ≥1024px)
    │   ├── User profile section
    │   ├── Tab navigation links
    │   ├── Daily tip
    │   └── Notification section
    │
    ├── AppHeader (Mobile <1024px)
    │   ├── Hamburger menu button
    │   └── Drawer sidebar (challenge, jadwal, checklist tabs)
    │
    ├── <main> Content Area
    │   │
    │   ├── PilarTab
    │   │   ├── Pilar cards (8)
    │   │   ├── AktivitasPage
    │   │   │   └── AktivitasDetailPage
    │   │   │       ├── StoryReader (AppModal)
    │   │   │       ├── RoleplayReader (AppModal)
    │   │   │       ├── PuzzleReader (AppModal)
    │   │   │       └── ProjectReader (AppModal)
    │   │   └── Tips section
    │   │
    │   ├── ProgressTab
    │   │   ├── Child cards (AnakSelector)
    │   │   ├── Skill progress bars
    │   │   ├── AppModal (evaluation)
    │   │   ├── AppButton
    │   │   └── ShareCard
    │   │
    │   ├── ToolsTab
    │   │   ├── AnakSelector
    │   │   ├── ChallengePage
    │   │   │   ├── AppModal, AppInput, AppSelect, AppTextarea
    │   │   │   ├── AppButton
    │   │   │   └── ShareCard
    │   │   ├── JadwalPage
    │   │   │   ├── AppModal, AppInput
    │   │   │   └── AppButton
    │   │   └── ChecklistPage
    │   │       ├── AppCheckbox, AppModal, AppInput
    │   │       ├── AppButton
    │   │       └── ShareChecklistCard
    │   │
    │   ├── ProfileTab
    │   │   ├── AppInput, AppSelect, AppButton
    │   │   ├── AppModal (child management)
    │   │   └── Billing / Referral sections
    │   │
    │   └── PoinTab (static)
    │
    └── BottomNav (Mobile <1024px)
        └── 4 tabs: Home, Progress, Tools, Profile
```

### Shared Components

| Component | Props | Purpose |
|-----------|-------|---------|
| `AppButton` | variant, size, icon, loading, block | Multi-variant button (primary/secondary/outline/ghost/danger) |
| `AppModal` | modelValue, title | Bottom-sheet (mobile) / centered (desktop) modal |
| `AppInput` | modelValue, label, icon, error, hint | Text input with validation display |
| `AppCheckbox` | modelValue, label, description | Custom checkbox with v-model |
| `AppRadio` | modelValue, value, label, description | Radio button |
| `AppRange` | modelValue, label, min, max, suffix | Range slider |
| `AppSelect` | modelValue, label, options, placeholder | Styled select dropdown |
| `AppTextarea` | modelValue, label, placeholder, rows | Textarea input |
| `AppToggle` | modelValue, label, description | Toggle switch |
| `AnakSelector` | - | Child dropdown (reads from anakStore) |
| `ShareCard` | title, childName, points, emoji | Offscreen shareable image |
| `ShareChecklistCard` | title, items, childName | Offscreen shareable image |

---

## Design System

### Color Palette

```
Primary (Green)
├── primary: #176c33          ├── primary-container: #6dbe7b
├── on-primary: #ffffff       ├── on-primary-container: #004b1e
├── primary-fixed: #a2f6ad    ├── primary-fixed-dim: #86d993
└── inverse-primary: #86d993  └── surface-tint: #176c33

Secondary (Brown)
├── secondary: #8e4e14        ├── secondary-container: #ffab69
├── on-secondary: #ffffff     ├── on-secondary-container: #783d01
└── secondary-fixed: #ffdcc4  └── secondary-fixed-dim: #ffb780

Tertiary (Blue)
├── tertiary: #006494         ├── tertiary-container: #69b4eb
├── on-tertiary: #ffffff      ├── on-tertiary-container: #004568
└── tertiary-fixed: #cbe6ff   └── tertiary-fixed-dim: #8ecdff

Error (Red)
├── error: #ba1a1a            ├── error-container: #ffdad6
├── on-error: #ffffff         └── on-error-container: #93000a

Semantic
├── canvas-cream: #FFF9F3     ├── growth-green: #6DBE7B
├── warm-bonding: #F4A261     ├── friendly-sky: #7CC6FE
├── success-soft: #E1F2E5     └── warning-soft: #FDF0E6

Surface
├── surface: #fef8f2          ├── surface-bright: #fef8f2
├── surface-dim: #dfd9d3      ├── surface-variant: #e7e2dc
├── surface-container: #f3ede7
├── surface-container-low: #f8f3ed
├── surface-container-high: #ede7e1
├── surface-container-highest: #e7e2dc
└── surface-container-lowest: #ffffff
```

### Typography

```css
Font Family: Nunito Sans (all weights: 400, 600, 700, 800)

headline-lg:  32px / 40px / 800    (page titles)
headline-md:  22px / 30px / 700    (section headers)
headline-lg-mobile: 26px / 34px / 800
body-lg:      19px / 28px / 400    (body text large)
body-md:      17px / 26px / 400    (body text default)
label-lg:     15px / 22px / 700    (labels, buttons)
label-sm:     13px / 18px / 600    (small labels, badges)
base:         17px / 26px          (default)
lg:           19px / 28px
xl:           21px / 30px
2xl:          25px / 34px
3xl:          31px / 38px
```

### Spacing System

```css
unit:           8px     (base unit)
stack-sm:       8px     (small vertical gap)
stack-md:       16px    (medium vertical gap)
stack-lg:       32px    (large vertical gap)
gutter:         16px    (horizontal gap)
margin-mobile:  20px    (mobile side margins)
margin-desktop: 40px    (desktop side margins)
```

### Border Radius

```css
DEFAULT:  0.25rem   (4px - subtle rounding)
lg:       0.5rem    (8px - cards, inputs)
xl:       0.75rem   (12px - larger cards)
full:     9999px    (pills, circles)
```

### Shadows

```css
Card shadow: 0 4px 20px rgba(0,0,0,0.04)
Modal shadow: 0 -4px 20px rgba(0,0,0,0.1)
```

### Responsive Breakpoints

```
Mobile:  < 1024px  → BottomNav + AppHeader + drawer menu
Desktop: ≥ 1024px  → AppSidebar (280px fixed) + no bottom nav
```

### Animations

```css
fadeInUp: Content entrance animation
scale(0.95): Active/tap state (mobile)
scale(0.98): Active/tap state (desktop)
bounce: Gamification elements
slide-up: Modal entrance
```

---

## PWA Configuration

### Manifest

| Property | Value |
|----------|-------|
| name | Halo Bunda |
| short_name | Halo Bunda |
| description | Aplikasi Pengembangan Anak |
| theme_color | #176c33 |
| background_color | #FFF9F3 |
| display | standalone |
| orientation | portrait |
| start_url | / |

### Service Worker (Workbox)

| Cache Strategy | Resources | Max Age |
|----------------|-----------|---------|
| **Precache** | All static assets (JS, CSS, HTML, SVG, PNG, WOFF2) | - |
| **CacheFirst** | Google Fonts (CSS) | 1 year |
| **CacheFirst** | Google Fonts (files) | 1 year |
| **CacheFirst** | Unsplash images | 30 days |
| **CacheFirst** | Google user content images | 30 days |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Yarn or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd family

# Install dependencies
yarn install
# or
npm install

# Start development server
yarn dev
# or
npm run dev

# Build for production
yarn build
# or
npm run build

# Preview production build
yarn preview
# or
npm run preview
```

### Environment Variables

```env
VITE_APP_NAME=Halo Bunda
VITE_APP_TAGLINE=Pendamping Anak
VITE_APP_URL=https://halobunda.app
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## Browser API Usage

| API | Usage | File |
|-----|-------|------|
| **Web Speech API** | Text-to-speech for story/roleplay readers | `StoryReader.vue`, `RoleplayReader.vue` |
| **Web Audio API** | Sound effects on point add/remove | `utils/sound.js` |
| **Web Share API** | Share images via native share sheet | `utils/share.js` |
| **Clipboard API** | Fallback: copy referral link to clipboard | `utils/share.js` |
| **IndexedDB** | Client-side data persistence | `db.js` (via Dexie) |
| **History API** | Back button navigation support | `App.vue`, `PilarTab.vue` |
| **BeforeInstallPrompt** | PWA install prompt | `composables/useInstall.js` |

---

*Generated: 2026-06-07 | Halo Bunda v1.0.0*
