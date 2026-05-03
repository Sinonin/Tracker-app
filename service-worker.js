// Sinonin Group Management App — Service Worker
// v5.9.3 — safer update + dynamic API handling (03 May 2026)
//
// CHANGE LOG:
//   v5.0.3 (28 Apr 2026): network-first for shell, cache-first for assets,
//                          skipWaiting + clients.claim for zero-touch updates.
//   v5.9.3 (03 May 2026): defensive precache, broader API detection, proper
//                          fallback responses, cache-buster discipline,
//                          SKIP_WAITING message handler.
//
// STRATEGY:
//   - App shell (navigation, index.html, manifest, SW): network-first.
//   - Static assets (icons, logo, fonts): cache-first with background refresh.
//   - Google Apps Script/API traffic: network-only, never cached.
//   - Install uses best-effort precache so a font/icon failure cannot kill
//     SW install (Promise.allSettled with per-URL .catch).
//
// COMMITMENT: when this SW deploys cleanly, future updates require ZERO
// operator action. A Vercel deploy → operators see new version on next app
// open or next pull-to-refresh. No "clear browser data" instructions ever.

const CACHE = 'sinonin-greenleaf-v102';

const SHELL_FILES = [
  './',
  './index.html',
  './service-worker.js',
  './manifest.json'
];

const ASSET_FILES = [
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './logo.png',
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap'
];

const ALL_PRECACHE = [...SHELL_FILES, ...ASSET_FILES];

// ============================================================
// INSTALL — best-effort precache, then activate immediately
// ============================================================
// v5.9.3 — Promise.allSettled with per-URL .catch ensures a single
// flaky URL (e.g., Google Fonts CDN hiccup) cannot kill the SW install.
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.allSettled(
      ALL_PRECACHE.map((url) => cache.add(url).catch((err) => {
        console.warn('[SW] precache skipped:', url, err && err.message ? err.message : err);
      }))
    );
    await self.skipWaiting();
  })());
});

// ============================================================
// ACTIVATE — delete old caches, claim all open clients immediately
// ============================================================
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    clients.forEach((client) => client.postMessage({ type: 'SW_ACTIVATED', cache: CACHE }));
  })());
});

// ============================================================
// MESSAGE — allow client to request immediate update activation
// ============================================================
// v5.9.3 — Enables future "update available, tap to apply" UX where
// the client posts {type: 'SKIP_WAITING'} when the user confirms.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// ============================================================
// FETCH — strategy depends on what's being requested
// ============================================================
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Dynamic cloud/API reads: always fresh, never cached.
  if (isDynamicApiRequest(url)) {
    event.respondWith(networkOnlyJson(req));
    return;
  }

  if (isShellRequest(req, url)) {
    event.respondWith(networkFirst(req));
    return;
  }

  event.respondWith(cacheFirst(req));
});

// v5.9.3 — Broader API detection: Apps Script doGet often redirects to
// script.googleusercontent.com for the actual response payload. The
// hostname check on both domains plus the /macros/s/ pathname check
// catches all variants reliably.
function isDynamicApiRequest(url) {
  return url.hostname === 'script.google.com' ||
         url.hostname === 'script.googleusercontent.com' ||
         url.pathname.includes('/macros/s/');
}

function isShellRequest(req, url) {
  if (req.mode === 'navigate') return true;
  const path = url.pathname;
  return path === '/' || path === '' || path.endsWith('/index.html') ||
         path.endsWith('/service-worker.js') || path.endsWith('/manifest.json');
}

// v5.9.3 — Network-only for API: cache:no-store + credentials:omit ensures
// freshness and prevents cookie leak cross-origin. Proper 503 on offline
// (not implicit 200) for HTTP-correct semantics.
async function networkOnlyJson(req) {
  try {
    return await fetch(req, { cache: 'no-store', credentials: 'omit' });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, offline: true, source: 'service-worker' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  }
}

// v5.9.3 — Network-first with cache:no-store bypasses HTTP cache layer to
// prevent stale shell serves at the browser level. Falls back to cache only
// when network actually fails.
async function networkFirst(req) {
  try {
    const res = await fetch(req, { cache: 'no-store' });
    if (res && res.status === 200) {
      const clone = res.clone();
      caches.open(CACHE).then((cache) => cache.put(req, clone)).catch(() => {});
    }
    return res;
  } catch (err) {
    const cached = await caches.match(req);
    if (cached) return cached;
    if (req.mode === 'navigate') return caches.match('./index.html');
    return new Response('Offline', { status: 503 });
  }
}

// Cache-first: serve cached, refresh in background for next time.
async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) {
    refreshCache(req);
    return cached;
  }
  try {
    const res = await fetch(req);
    if (shouldCache(req, res)) {
      const clone = res.clone();
      caches.open(CACHE).then((cache) => cache.put(req, clone)).catch(() => {});
    }
    return res;
  } catch (err) {
    if (req.mode === 'navigate') return caches.match('./index.html');
    return new Response('Offline', { status: 503 });
  }
}

// v5.9.3 — Extracted helper, used by cacheFirst for background refresh.
function refreshCache(req) {
  fetch(req).then((res) => {
    if (shouldCache(req, res)) {
      const clone = res.clone();
      caches.open(CACHE).then((cache) => cache.put(req, clone)).catch(() => {});
    }
  }).catch(() => {});
}

// v5.9.3 — Formalized eligibility check. Used by both cacheFirst paths so
// the rule cannot drift between first-fetch and background-refresh sites.
function shouldCache(req, res) {
  if (!res || res.status !== 200) return false;
  const url = new URL(req.url);
  if (isDynamicApiRequest(url)) return false;
  return req.url.startsWith(self.location.origin) ||
         url.hostname === 'fonts.googleapis.com' ||
         url.hostname === 'fonts.gstatic.com';
}
