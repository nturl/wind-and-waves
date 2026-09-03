import type { ReactElement } from "react";

// Shared app-icon art: a bold kite silhouette on the app's graphite ground —
// reads at 16px. Amber matches the header logo mark and the app's single
// signal accent; the tail is the same amber at low opacity, echoing the
// header logo's two-tone kite. `pad` shrinks the kite for maskable icons so
// the silhouette stays inside the safe zone (~80% of the canvas).
export function iconArt(size: number, pad = 0): ReactElement {
  const inner = size - pad * 2;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#14161a",
      }}
    >
      <svg width={inner} height={inner} viewBox="0 0 28 28" fill="none">
        <path
          d="M14 2 C8 2 3 7 3 13 C3 20 14 26 14 26 C14 26 25 20 25 13 C25 7 20 2 14 2Z"
          fill="none"
          stroke="#ffb000"
          strokeWidth="2"
        />
        <path d="M14 8 L19 20 L14 17 L9 20 Z" fill="#ffb000" opacity={0.9} />
        <path d="M14 8 L9 20 L14 17 L19 20 Z" fill="#ffb000" opacity={0.3} />
      </svg>
    </div>
  );
}
