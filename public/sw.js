// Minimal service worker: network-first with a cache fallback so the app
// shell still opens offline. Live data is always fetched fresh when online —
// /api/* is explicitly bypassed below since app/api/spots and
// app/api/windfield deliberately control their own (no-store /
// short-TTL) caching, and this SW must never re-freeze either.
const CACHE = "wind-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  e.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return res;
      })
      .catch(() => caches.match(request)),
  );
});
