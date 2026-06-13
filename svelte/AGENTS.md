# AGENTS.md - Jejak Tumbuh Frontend (Svelte)

## Project Overview

**Jejak Tumbuh** is a SvelteKit rewrite of the **Langkah Kecil** Vue.js application.
It is a child development tracking PWA (Pendamping Anak).

## Tech Stack

- **Framework**: SvelteKit + Svelte 5 (runes)
- **Styling**: Tailwind CSS 3.4
- **State**: Svelte writable/derived stores
- **Database**: Dexie (IndexedDB)
- **Icons**: Material Symbols Outlined + @iconify/svelte
- **Build**: Vite 6
- **PWA**: vite-plugin-pwa

## Primary Color (Hero Color)

```
rgb(23, 108, 51) / #176C33
```

## Directory Structure

```
src/
├── app.html          # HTML template
├── app.css           # Global CSS (Tailwind + custom)
├── routes/
│   ├── +layout.svelte
│   └── +page.svelte  # Main app page
└── lib/
    ├── assets/       # CSS
    ├── components/   # Reusable UI components
    ├── composables/  # Svelte modules (useInstall, useNotifications, etc.)
    ├── config/       # appConfig.js
    ├── data/         # Static data (pilars, skills, activities, etc.)
    ├── db.js         # IndexedDB (Dexie)
    ├── layouts/      # AppHeader, DesktopHeader, AppSidebar, BottomNav
    ├── pages/        # Page-level components (LoginPage, etc.)
    ├── services/     # API client (api.js)
    ├── stores/       # Svelte stores (app, auth, anak, tools, activity)
    └── utils/        # Utility functions
```

## Vue → Svelte Conversion Reference

| Vue Pattern | Svelte 5 Equivalent |
|---|---|
| `<script setup>` | `<script>` with `$props()`, `$state()`, `$derived()` |
| `ref()` | `$state()` or `writable()` store |
| `computed()` | `$derived()` or `derived()` store |
| `watch()` | `$effect()` |
| `defineProps` | `let { ...props } = $props()` |
| `defineEmits` | callback props |
| `v-if` | `{#if}` |
| `v-for` | `{#each}` |
| `v-show` | CSS `{#if}` or class binding |
| `v-model` | `bind:value` |
| Pinia `defineStore` | `writable()` + exported functions |
| Vue composables | Svelte modules with stores |

## API & Backend

Same backend as Langkah Kecil (Laravel + Sanctum).
API base URL configured via `VITE_API_URL` env variable.

## Activity Card Templates

### Location

```
src/lib/pages/activity/
├── index.js              # Barrel export
├── StoryCard.svelte      # storytelling (with reader modal + TTS)
├── RoleplayCard.svelte   # bermain_peran
├── GameCard.svelte       # permainan
├── ScriptCard.svelte     # monolog
├── ProjectCard.svelte    # proyek_kreatif
├── SongCard.svelte       # musik_gerak
├── PuzzleCard.svelte     # puzzle
├── ExerciseCard.svelte   # mindfulness
├── OutdoorCard.svelte    # outdoor
├── ExperimentCard.svelte # ilmu_pengetahuan
└── WorksheetCard.svelte  # worksheet
```

### How Activity Types Are Defined

In `src/lib/data/activities.js`, each activity type has metadata and a content key:

```js
const defaultMeta = {
  storytelling: { emoji: '📖', title: 'Story Telling', desc: '...', color: '#4CAF50', bg: '#E8F5E9', feature: 'story' },
  bermain_peran: { emoji: '🎭', title: 'Bermain Peran', desc: '...', color: '#FF9800', bg: '#FFF3E0', feature: 'roleplay' },
  // ... etc
}
```

Each type has different content fields normalized from API:

| Type | Content Key | Fields |
|---|---|---|
| storytelling | stories | pages[], moral, image |
| bermain_peran | roles | roles[], pages[] |
| permainan | games | how, rules[] |
| monolog | scripts | script, tips[] |
| proyek_kreatif | projects | duration, difficulty, materials[], steps[] |
| musik_gerak | songs | lyrics, moves[] |
| puzzle | puzzles | questions[] |
| mindfulness | exercises | steps[], benefit |
| outdoor | activities | steps[], observation |
| ilmu_pengetahuan | experiments | materials[], steps[], explanation |
| worksheet | worksheets | (special - uses worksheetTypes) |

### How to Create a New Activity Card

1. **Create card file** in `src/lib/pages/activity/NewCard.svelte`
2. **Props**: `{ item, bg, onclick }` — item has all normalized fields, bg is the background color, onclick opens the detail
3. **Export** from `src/lib/pages/activity/index.js`
4. **Register** in `src/lib/pages/ActivityTab.svelte`:
   - Import the card component
   - Add to `cardMap` object: `{ ..., new_type: NewCard }`

### Card Template Structure

```svelte
<script>
  let { item, bg, onclick } = $props()
</script>

<button class="bento-card group bg-canvas-cream rounded-[24px] overflow-hidden border-4 border-[#B7D9BC] shadow-md cursor-pointer transition-all hover:shadow-lg flex flex-col text-left w-full"
  {onclick}>
  <div class="p-5 flex flex-col flex-1">
    <!-- Header with emoji + badge -->
    <div class="flex items-start justify-between mb-3">
      <div class="w-12 h-12 rounded-[16px] flex items-center justify-center text-2xl border-2 border-white shadow-sm" style="background: {bg}">
        {item.emoji || '🎯'}
      </div>
      <!-- Optional: count badge -->
    </div>
    <h3 class="font-headline-md text-headline-md mb-2">{item.title}</h3>
    {#if item.desc}
      <p class="text-sm text-on-surface-variant mb-3 line-clamp-2">{item.desc}</p>
    {/if}
    <!-- Optional: content preview -->
    <!-- Footer action -->
    <div class="flex items-center gap-2 text-primary font-label-lg mt-auto pt-3 border-t-2 border-[#B7D9BC]/50">
      <span class="material-symbols-outlined text-xl">icon_name</span>
      Action Text
      <span class="material-symbols-outlined text-xl ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
    </div>
  </div>
</button>
```

### StoryCard Special Case

StoryCard has an embedded reader modal with:
- Page navigation (swipe + buttons)
- TTS (Text-to-Speech) with Indonesian voice (`id-ID`)
- Moral/lesson screen at the end
- Floating illustration animation

### ActivityTab Integration

In `ActivityTab.svelte`, cards are rendered dynamically:

```svelte
import { StoryCard, RoleplayCard, ... } from './activity/index.js'

const cardMap = {
  storytelling: StoryCard,
  bermain_peran: RoleplayCard,
  // ...
}

<!-- In template -->
{#each sortedItems as item (item.title)}
  {@const Card = cardMap[selectedType?.key]}
  {#if Card}
    <Card {item} bg={selectedType.bg} onclick={() => handleItemClick(item)} />
  {:else}
    <!-- Fallback generic card -->
  {/if}
{/each}
```
