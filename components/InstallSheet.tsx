"use client";

import { useEffect, useState } from "react";
import { sharePage } from "@/lib/share";
import { C } from "@/lib/theme";

const MONO = "'JetBrains Mono', monospace";

// Chrome/Edge on Android (and desktop) fire this; iOS Safari never does.
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
    </svg>
  );
}

function AddSquareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M12 8.5v7M8.5 12h7" />
    </svg>
  );
}

/* Depersonalized mockups of the three iOS moments, drawn in the app's own style. */

function BrowserBarMock() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderRadius: 16, border: `1px solid ${C.line}`, background: C.raised,
      padding: "8px 8px 8px 16px",
    }}>
      <span style={{ fontSize: 12, color: C.mute, fontFamily: MONO }}>noels-wind-and-waves.vercel.app</span>
      <span style={{
        display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: "50%",
        background: "rgba(255,176,0,0.12)", color: C.amber, boxShadow: `0 0 0 2px ${C.amber}`,
      }}>
        <ShareIcon />
      </span>
    </div>
  );
}

function ShareMenuMock() {
  return (
    <div style={{ borderRadius: 16, border: `1px solid ${C.line}`, background: C.raised, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10, opacity: 0.35 }}>
        <div style={{ height: 10, width: 128, borderRadius: 999, background: C.line }} />
        <div style={{ height: 10, width: 96, borderRadius: 999, background: C.line }} />
      </div>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: `1px solid ${C.line}`, background: "rgba(255,176,0,0.06)", padding: "10px 16px",
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Add to Home Screen</span>
        <span style={{ color: C.amber }}><AddSquareIcon /></span>
      </div>
    </div>
  );
}

function AddDialogMock() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderRadius: 16, border: `1px solid ${C.line}`, background: C.raised, padding: "10px 16px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 10,
          background: C.bg, flexShrink: 0,
        }}>
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <path d="M14 2 C8 2 3 7 3 13 C3 20 14 26 14 26 C14 26 25 20 25 13 C25 7 20 2 14 2Z"
              fill="none" stroke={C.amber} strokeWidth="1.5" />
            <path d="M14 8 L19 20 L14 17 L9 20 Z" fill={C.amber} opacity={0.9} />
            <path d="M14 8 L9 20 L14 17 L19 20 Z" fill={C.amber} opacity={0.3} />
          </svg>
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Wind and Waves</span>
      </div>
      <span style={{
        borderRadius: 999, background: C.amber, color: "#14161a",
        padding: "4px 14px", fontSize: 12, fontWeight: 700,
      }}>Add</span>
    </div>
  );
}

function StepCaption({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p style={{ marginBottom: 6, fontSize: 13, fontWeight: 500, color: C.mute, display: "flex", alignItems: "flex-start", gap: 8 }}>
      <span style={{
        display: "inline-flex", flexShrink: 0, alignItems: "center", justifyContent: "center",
        width: 20, height: 20, borderRadius: "50%", background: C.amber, color: "#14161a",
        fontSize: 11, fontWeight: 800, fontFamily: MONO,
      }}>
        {n}
      </span>
      <span style={{ paddingTop: 1 }}>{children}</span>
    </p>
  );
}

export function InstallSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share it with a friend");

  useEffect(() => {
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent));
    setInstalled(
      window.matchMedia?.("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true,
    );
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 3000,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        className="animate-sheet-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 420,
          borderRadius: "24px 24px 0 0",
          background: "rgba(27,30,36,0.98)",
          border: `1px solid ${C.line}`,
          borderBottom: "none",
          boxShadow: "0 -20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,176,0,0.08)",
          padding: 20,
          paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: MONO, fontSize: 18, fontWeight: 800, color: C.ink, letterSpacing: "-0.01em" }}>
            Get the app
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ fontSize: 18, color: C.mute, background: "none", border: "none", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {installed ? (
          <p style={{ fontSize: 14, lineHeight: 1.5, color: C.ink }}>
            You already have it. Wind and Waves is on your home screen and opens full-screen like an app.
          </p>
        ) : installEvent ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 14, lineHeight: 1.4, color: C.ink }}>
              One tap puts Wind and Waves on your home screen. It opens full-screen, like an app.
            </p>
            <button
              onClick={async () => {
                await installEvent.prompt();
                onClose();
              }}
              className="pressable"
              style={{
                width: "100%", borderRadius: 12, background: C.amber, border: "none",
                padding: "10px 0", fontSize: 14, fontWeight: 700, color: "#14161a", cursor: "pointer",
              }}
            >
              Install Wind and Waves
            </button>
          </div>
        ) : (
          <div>
            {!ios && (
              <p style={{ marginBottom: 12, fontSize: 14, lineHeight: 1.4, color: C.ink }}>
                On your phone, open <span style={{ fontWeight: 700 }}>noels-wind-and-waves.vercel.app</span>, then:
              </p>
            )}
            <ol style={{ display: "flex", flexDirection: "column", gap: 16, listStyle: "none" }}>
              <li>
                <StepCaption n={1}>
                  Tap <span style={{ fontWeight: 700, color: C.ink }}>Share</span> in Safari (or whichever browser you use)
                </StepCaption>
                <BrowserBarMock />
              </li>
              <li>
                <StepCaption n={2}>
                  Scroll down, tap <span style={{ fontWeight: 700, color: C.ink }}>Add to Home Screen</span>
                </StepCaption>
                <ShareMenuMock />
              </li>
              <li>
                <StepCaption n={3}>
                  Tap <span style={{ fontWeight: 700, color: C.ink }}>Add</span>
                </StepCaption>
                <AddDialogMock />
              </li>
            </ol>
            {!ios && (
              <p style={{ marginTop: 12, fontSize: 11, lineHeight: 1.5, color: C.mute }}>
                On Android it&rsquo;s one tap: choose <span style={{ fontWeight: 600 }}>Install</span> from the browser menu.
              </p>
            )}
          </div>
        )}

        <button
          onClick={async () => {
            if ((await sharePage()) === "copied") {
              setShareLabel("Link copied");
              setTimeout(() => setShareLabel("Share it with a friend"), 2000);
            }
          }}
          className="pressable"
          style={{
            marginTop: 16, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            borderRadius: 12, border: `1px solid ${C.line}`, background: "rgba(255,255,255,0.04)",
            padding: "10px 0", fontSize: 13, fontWeight: 600, color: C.ink, cursor: "pointer",
          }}
        >
          <ShareIcon />
          {shareLabel}
        </button>

        <p style={{ marginTop: 12, textAlign: "center", fontSize: 11, color: C.mute }}>
          No app store, nothing to download. It&rsquo;s free.
        </p>
      </div>
    </div>
  );
}
