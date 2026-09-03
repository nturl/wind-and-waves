import { ImageResponse } from "next/og";
import { iconArt } from "@/lib/icon-art";

export const dynamic = "force-static";

// Maskable icons get cropped to a circle/rounded-square by the OS, so the
// kite silhouette is padded to sit inside the central ~80% safe zone.
export function GET() {
  return new ImageResponse(iconArt(512, 51), { width: 512, height: 512 });
}
