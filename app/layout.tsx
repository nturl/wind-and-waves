import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:       "Noel's Wind and Waves — NC · NY · NJ · PR Wind & Surf Tracker",
  description: "Live wind and waves for my kite and surf spots across North Carolina, New York, New Jersey & Puerto Rico — NOAA HRRR, buoys & marine swell, showing the sea-breeze the global models miss.",
  manifest:    "/manifest.json",
  appleWebApp: {
    capable:         true,
    statusBarStyle:  "black-translucent",
    title:           "Wind and Waves",
  },
};

export const viewport: Viewport = {
  themeColor: "#14161a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className="h-screen overflow-hidden antialiased">
        {children}
        {/* Pulse: Noel's own first-party analytics. */}
        <script defer data-site="kite" src="https://pulse-nturls-projects.vercel.app/p.js" />
      </body>
    </html>
  );
}
