import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Noel's Wind and Waves",
    short_name: "Wind & Waves",
    description:
      "Live wind and waves for kite and surf spots across North Carolina, New York, New Jersey & Puerto Rico — NOAA HRRR, buoys & marine swell.",
    start_url: "/",
    display: "standalone",
    background_color: "#14161a",
    theme_color: "#14161a",
    icons: [
      { src: "/icons/manifest-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/manifest-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/manifest-512-maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
