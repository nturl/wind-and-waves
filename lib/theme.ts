// Shared tokens + kite logic for "The Instrument" skin.
// Amber is the single signal accent (status / GO / live window / best mark);
// everything else stays cold graphite so the amber reads as meaning, not decor.

export const C = {
  bg:    "#14161a",
  panel: "#1b1e24",
  raised:"#22262c",
  line:  "#2a2e34",
  ink:   "#e7e6e2",
  mute:  "#8b8f96",
  amber: "#ffb000",
} as const;

// Regions stay legible but muted — distinguishable tints that never fight amber.
export const REGION_COLORS: Record<string, string> = {
  NC: "#5f9ea0", // muted teal
  NY: "#9caf7a", // muted olive
  NJ: "#c08a5e", // muted terracotta
  PR: "#9a86b5", // muted lavender
};

export type Verdict = "GO" | "MARGINAL" | "NO";

// One go/no-go call from the live average, matching the wind ramp:
// 15–30 kt is the rideable (amber) window; the shoulders are marginal.
export function kiteVerdict(avg: number | null): Verdict {
  if (avg == null) return "NO";
  if (avg >= 15 && avg <= 30) return "GO";
  if (avg >= 11 && avg < 15)  return "MARGINAL";
  if (avg > 30 && avg <= 35)  return "MARGINAL";
  return "NO";
}

// Swell quality from period alone, matching surf-wind-watch/watch.py's
// thresholds: >= 7s reads as real groundswell; 4-6s is locally wind-driven slop.
export function swellQuality(periodS: number | null): "groundswell" | "wind slop" | null {
  if (periodS == null) return null;
  if (periodS >= 7) return "groundswell";
  if (periodS >= 4) return "wind slop";
  return null;
}

// "1.2m @ 9s" / "1.2m" when period isn't available.
export function formatSwell(waveHeightM: number | null, periodS: number | null): string {
  const height = waveHeightM != null ? `${waveHeightM.toFixed(1)}m` : "—";
  return periodS != null ? `${height} @ ${Math.round(periodS)}s` : height;
}
