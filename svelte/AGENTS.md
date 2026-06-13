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
