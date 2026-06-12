# StackLinks — Agent Guide

## Stack
- Alpine.js 3.x, SortableJS 1.15, Tailwind CSS v4, Vite 6.x, plain JS (no TypeScript)

## Dependencies
| Package | Type | Purpose |
|---------|------|---------|
| alpinejs | runtime | SPA reactivity |
| lucide | runtime | Icons |
| sortablejs | runtime | Drag & drop link reordering |
| vite | dev | Bundler |
| tailwindcss | dev | CSS framework |
| @tailwindcss/vite | dev | Tailwind Vite plugin |
| vite-plugin-pwa | dev | PWA manifest + service worker |

## Commands
| Action | Command |
|--------|---------|
| Install | `npm install` |
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Preview build | `npm run preview` |

No test, lint, or typecheck commands exist.

## Vite config quirks (read `vite.config.js` before touching)
- `root: "src"` — Vite resolves from `src/`, not project root
- `publicDir: "public"` — resolves from root, so static assets live in `src/public/`
- `base: "./"` — required for GitHub Pages relative paths
- `outDir: "../dist"` — relative to root, so output goes to project root `dist/`

## Module structure
| File | Responsibility |
|------|----------------|
| `src/main.js` | Alpine component (state, CRUD, init, theme, import/export, debug) |
| `src/clock.js` | Pure `formatTime` / `formatDate` helpers (token replacement + locale-aware month/weekday names) |
| `src/icons.js` | `popularIcons` array (180+ entries), `brandIconUrl`, `faviconUrl`, `fetchSvgIcons` |
| `src/weather.js` | `weatherFromCode` (WMO code → icon/desc), `fetchCity` (Nominatim), weather cache helpers |
| `src/dnd.js` | SortableJS wrapper: `refreshDnD` — finds visible `.links-grid`, creates/destroys Sortable instance |

## Data model
- **Fixed links**: `src/public/links.json` — sections with `fixed: true` can't be edited/deleted in UI
- **User customizations**: `localStorage` key `stacklinks` — shape: `{ customizations: { addedSections, editedSections, addedLinks, linkOrder }, theme, iconStyle, settings, activeTab }`
- **Merge logic** (in `main.js:mergeData`): fixed sections + editedSection overrides + addedSections + `linkOrder` per section → `section.links`
- **Custom links** are identified by presence of an `id` field; fixed links from JSON have no `id`
- **Link reorder** persisted via `linkOrder[sectionId]` array of link IDs; SortableJS handles drag, dispatches `links-reordered` custom event on `document.body`

## Key implementation details
- **Icons**: Simple Icons CDN (`https://cdn.simpleicons.org/{slug}`) → fallback to Google Favicons on error
- **Weather**: Open-Meteo API (free, no key), geolocation, 10 min cache in `localStorage` key `weather_cache_v2` (managed via `weather.js`)
- **City detection**: Nominatim reverse geocoding, fetched after weather data, cached alongside temperature
- **Dark mode**: `applyTheme()` toggles `.dark` on `<html>`, persisted in localStorage
- **Drag & drop**: SortableJS on `.links-grid` with 200ms delay for touch, `[draggable="true"]` selector; `afterRender()` re-inits after every data mutation
- **Entry point**: `src/index.html` → loads `src/main.js` (Alpine `app` component) and `src/style.css` (Tailwind)
- **PWA**: `vite-plugin-pwa` with `autoUpdate` registration; `theme_color: "#4f46e5"`, `display: standalone`

## Deploy
- Push to `main` → GitHub Actions builds + deploys to GitHub Pages
- No manual deploy needed
