# Noel's Wind and Waves: notes for coding agents

Read `README.md` first; it is the source of truth for features, the code map and configuration. This file only adds what an agent needs to work safely.

## Commands
- Install: `npm ci`. In an Amp orb, `.agents/setup` has already run it.
- Dev server: `npm run dev`. In an orb use `amp orb services ensure` (see `.amp/services.yaml`) and check the page through the portal.
- Check before any push: `npm run build`. There are no tests. `npm run lint` has no ESLint config yet and will prompt; do not rely on it.

## Rules that are easy to break
- `lib/spots.ts` holds the single `SPOTS` array that every list, filter and API route reads. Add or change spots there and nowhere else.
- The design system in `lib/theme.ts` uses a graphite background and exactly one signal color, amber, reserved for state that means something. Do not add a second accent.
- The app runs on live data with no key. AI features need `GEMINI_API_KEY` and are off without it; that is not a bug.
- Open-Meteo's free tier allows roughly 600 points a minute. The windfield route fills its grids across several requests on purpose. Do not hammer `/api/windfield` or "fix" the slow first load by fetching everything at once.
- Work on a feature branch and open a pull request. Do not push to `main`.
- Do not deploy. Pushing to GitHub does not deploy; production ships by hand with `vercel --prod --yes` from the owner's machine.

## Verifying UI work
A change is done when you have loaded the dashboard in a browser, switched the SESSION, MAP and ALMANAC panes, and said what you saw. Check phone width too; the app is an installable PWA.
