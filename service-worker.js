// Sinonin Group Management App — Service Worker
// v5.0.3 — Auto-update fix (28 Apr 2026)
//
// PROBLEM IT SOLVES:
//   Operators (Elias, Victor) reported having to manually clear browser data
//   to receive updates. Root cause: previous SW was cache-first for index.html,
//   meaning new code uploaded to Vercel never reached operators until they
//   nuked cache.
//
// NEW STRATEGY — "stale-while-revalidate" for the app shell:
//   - index.html, manifest.json, service-worker.js → NETWORK-FIRST
//     (try fetching fresh; fall back to cache only when offline)
//   - icons, fonts, logos → CACHE-FIRST (rare changes, performance matters)
//   - When a new SW version is detected, skipWaiting() activates it immediately
//   - clients.claim() takes control of all open tabs without requiring a hard
//     refresh — operators see new code on their next navigation/pull-to-refresh
//
// COMMITMENT: when this SW deploys cleanly, future updates require ZERO
// operator action. A Vercel deploy → operators see new version on next app
// open or next pull-to-refresh. No "clear browser data" instructions ever.

const CACHE = 'sinonin-greenleaf-v66';

// Files that MUST be fresh — network-first, cache as fallback only
const SHELL_FILES = [
  './',
  './index.html',
  './service-worker.js',
  './manifest.json'
];

// Files where we can cheerfully serve cached versions — they rarely change
const ASSET_FILES = [
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './logo.png',
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap'
];

const ALL_PRECACHE = [...SHELL_FILES, ...ASSET_FILES];

// ============================================================
// INSTALL — pre-cache everything, then activate immediately
// ============================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ALL_PRECACHE))
      .then(() => self.skipWaiting())  // Don't wait for old SW to release control
  );
});

// ============================================================
// ACTIVATE — delete old caches, claim all open clients immediately
// ============================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())  // Take control of all open tabs NOW
      .then(() => {
        // Notify all clients that a new version is active so they can refresh
        return self.clients.matchAll({ includeUncontrolled: true });
      })
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_ACTIVATED', cache: CACHE });
        });
      })
  );
});

// ============================================================
// FETCH — strategy depends on what's being requested
// ============================================================
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GETs (POST writes go to Apps Script / Forms — never cached)
  if (req.method !== 'GET') return;

  // Apps Script reads are dynamic — always fresh, never cached
  if (req.url.includes('script.google.com')) {
    event.respondWith(fetch(req).catch(() => new Response(JSON.stringify({
      ok: false, offline: true
    }), { headers: { 'Content-Type': 'application/json' } })));
    return;
  }

  const url = new URL(req.url);
  const isShell = isShellRequest(req, url);

  if (isShell) {
    event.respondWith(networkFirst(req));
  } else {
    event.respondWith(cacheFirst(req));
  }
});

// Decide whether a request should use network-first
function isShellRequest(req, url) {
  if (req.mode === 'navigate') return true;
  const path = url.pathname;
  if (path === '/' || path === '' || path.endsWith('/index.html')) return true;
  if (path.endsWith('/service-worker.js')) return true;
  if (path.endsWith('/manifest.json')) return true;
  return false;
}

// Network-first: try network, fall back to cache. Update cache when network succeeds.
function networkFirst(req) {
  return fetch(req)
    .then((res) => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(req, clone));
      }
      return res;
    })
    .catch(() => {
      return caches.match(req).then((cached) => {
        if (cached) return cached;
        if (req.mode === 'navigate') return caches.match('./index.html');
        return new Response('Offline', { status: 503 });
      });
    });
}

// Cache-first: serve cached, fetch in background to refresh next time
function cacheFirst(req) {
  return caches.match(req).then((cached) => {
    if (cached) {
      fetch(req).then((res) => {
        if (res && res.status === 200) {
          caches.open(CACHE).then((c) => c.put(req, res));
        }
      }).catch(() => { /* offline — keep cached version */ });
      return cached;
    }
    return fetch(req).then((res) => {
      if (res && res.status === 200 &&
          (req.url.startsWith(self.location.origin) || req.url.includes('fonts.g'))) {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(req, clone));
      }
      return res;
    }).catch(() => {
      if (req.mode === 'navigate') return caches.match('./index.html');
    });
  });
}
