# Noel's Wind and Waves

A kite and surf wind dashboard for NC, NY, NJ, and Puerto Rico. It pulls NOAA's 3km HRRR model and live observations instead of relying on the coarse global models most wind apps show, so it catches the afternoon coastal sea breeze that those apps miss.

Live at [noels-wind-and-waves.vercel.app](https://noels-wind-and-waves.vercel.app).

## What it does

- **Spot dashboard** ([app/page.tsx](app/page.tsx)): a live ticker of every spot's wind, a filterable spot list (by region and by type — kite spot, buoy, airport), and a right-hand pane that toggles between **SESSION** (a go/no-go verdict for right now), **MAP**, and **ALMANAC** (a week table).
- **31 spots** across 4 regions ([lib/spots.ts](lib/spots.ts)): NC (5), NY (6), NJ (2), PR (18) — 16 kite spots, 5 buoys, 10 airports.
- **Live-vs-model gap badge**: for mainland US kite spots, [lib/wind.ts](lib/wind.ts) fetches both NOAA's 3km HRRR model and the coarser global ECMWF model and flags any spot where they disagree by 5kt or more — this gap is the whole reason the app exists (a global-model app can show near-zero wind at a spot that HRRR and reality both show is firing).
- **Surf conditions**: wave height, period, and direction from the Open-Meteo Marine API in each spot's map popup, tagged groundswell (≥7s period) or wind slop (4–6s).
- **Animated wind-flow map**: [app/api/windfield/route.ts](app/api/windfield/route.ts) serves two live wind-velocity grids (a 1° regional grid and an 8° whole-earth grid) that [components/KiteMap.tsx](components/KiteMap.tsx) renders as flowing particles, swapping grids by zoom level.
- **AI features** (Gemini 2.0 Flash, [lib/gemini.ts](lib/gemini.ts)): a regional conditions summary, per-spot condition analysis, a kite-size recommendation, and a chat coach. Gated behind `GEMINI_API_KEY` — see Limits below.
- **Installable PWA**: a "Get the app" button in the header opens an install sheet ([components/InstallSheet.tsx](components/InstallSheet.tsx)) — a one-tap native prompt on Chrome/Edge, a manual Add-to-Home-Screen walkthrough on iOS Safari (which never fires the native prompt).

## How it works

[lib/spots.ts](lib/spots.ts) holds the single `SPOTS` array that drives the whole app — every UI list, filter, and API route reads from it. [lib/wind.ts](lib/wind.ts) fans each spot out to the right upstream source by type and region: `api.weather.gov` for airports, NDBC realtime buoy feeds, and Open-Meteo for forecasts — mainland kite spots get HRRR plus a parallel ECMWF call for the gap calculation, while Puerto Rico spots (outside HRRR's coverage) use Open-Meteo's `best_match` model instead.

The map basemap is Esri's World Dark Gray Canvas (swapped in after CARTO began watermarking its free keyless tiles). The whole UI runs on a small design system in [lib/theme.ts](lib/theme.ts) — a graphite background with exactly one signal color, amber, reserved for state that means something (a GO verdict, the live-data badge, a best-mark reading).

The windfield route works around Open-Meteo's free-tier rate limit (roughly 600 points/minute) by filling each grid incrementally across repeated requests — progress is banked in memory and a field is only published once it completes, so a cold start takes a few polls to fully converge.

## Run locally

Requires Node with Next 14.2.5 / React 18 (pinned in [package.json](package.json)).

```bash
npm install
npm run dev     # next dev
npm run build   # next build
npm run start   # next start
npm run lint    # next lint
```

## Configuration

| Var | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Required for every AI feature (chat, regional summary, condition analysis, kite-size recommendation) — read in [lib/gemini.ts](lib/gemini.ts) and the `app/api/ai/*` routes. Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). Not set in this machine's `.env.local`, so the AI features are unverified end-to-end here. |
| `NODE_ENV` | Optional; commented out by default in `.env.local.example`. |

## Deploy

Vercel project `noels-wind-and-waves` (linked via `.vercel/project.json`). Pushing to GitHub does **not** trigger a deploy.

```bash
vercel --prod --yes
```

Canonical URL is noels-wind-and-waves.vercel.app; `pr-kite-dashboard-v3.vercel.app` and `noels-waves-and-wind.vercel.app` stay attached as aliases so old links keep working.

## Code map

| Path | Purpose |
| --- | --- |
| [app/page.tsx](app/page.tsx) | Main dashboard: ticker, filters, spot list, SESSION/MAP/ALMANAC panes |
| [lib/spots.ts](lib/spots.ts) | The spot registry — the single source of truth for every region/spot/type |
| [lib/wind.ts](lib/wind.ts) | Fetches and normalizes NOAA, NDBC, and Open-Meteo data per spot |
| [lib/gemini.ts](lib/gemini.ts) | Gemini prompts for chat, summaries, and recommendations |
| [lib/theme.ts](lib/theme.ts) | "The Instrument" design system + verdict/quality formatting helpers |
| [components/KiteMap.tsx](components/KiteMap.tsx) | Leaflet map: spot markers, basemap, wind-particle layer |
| [app/api/windfield/route.ts](app/api/windfield/route.ts) | Serves the two wind-velocity grids behind the particle animation |
| [app/api/spots/route.ts](app/api/spots/route.ts) | Per-spot live data, dispatched by spot type |
| [app/api/ai/*](app/api/ai) | Gemini-backed chat, condition analysis, kite-size routes |
| [components/InstallSheet.tsx](components/InstallSheet.tsx), [ServiceWorkerRegister.tsx](components/ServiceWorkerRegister.tsx) | PWA install flow |

## Tests

None. No test files, no test script. Verification has been `next build` / `next lint` plus manual browser checks against live data after each deploy.

## Limits and non-goals

- The AI features (chat, summaries, kite-size recommendation) have never been exercised end-to-end on this machine — there is no `GEMINI_API_KEY` in the local `.env.local`.
- Four offshore Puerto Rico buoys are omitted from the spot list; they were offline for an extended stretch at last check.
- The Mayagüez airport spot (and possibly others in PR) currently falls back to Open-Meteo instead of NOAA, because `api.weather.gov`'s station endpoint for it returns 404.
- The wind-particle map is a visualization interpolated from sparse forecast points on a fixed grid, not a physically modeled continuous flow.
- No automated tests — see Tests above.

## Status

Live, actively iterated. Last commit 2026-09-03 (PWA install flow: manifest, icons, service worker, install sheet).

## Credits and license

Weather and ocean data: [NOAA](https://www.weather.gov/) (`api.weather.gov`, NDBC buoys) and [Open-Meteo](https://open-meteo.com/) (forecast and marine APIs). Basemap: Esri World Dark Gray Canvas. AI: Google Gemini. No LICENSE file; personal project, not distributed.
