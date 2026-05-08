// Sinonin Group Management App — Service Worker
// v6.3.10 — Tea "Plucker Kg" label · Poultry=gold(eggshell) Sireet=deeper-green theming (07 May 2026 Verden)
// v6.3.9 — Tea quick-add: Pluckers→Greenleaf (07 May 2026 Verden)
// v6.3.8 — Hero cards as distinct chips (07 May 2026 Verden)
// v6.3.7 — Vaccination pill: drop "TAP to record" suffix (07 May 2026 Verden)
// v6.3.6 — census ReferenceError fix · Quick Add cards in one row (07 May 2026 Verden)
// v6.3.5 — Quick Add: +Income(Tea) +Litter(Poultry) · Hatch→Incubation · Farm=ivory · Notifications always-on (07 May 2026 Verden)
// v6.3.4 — Quick Add cards · Home alert spacing · Per-card theming (07 May 2026 Verden)
// v6.3.3 — Poultry bird grid: 2 rows × 3 cols (07 May 2026 Verden)
// v6.3.2 — CEO cockpit: Farm/Tea/Poultry/Sireet horizon cards · alerts below (07 May 2026 Verden)
// v6.3.1 — Decision-Home: Tea/Poultry panels with Add CTAs · Pulse line · Poultry headline (07 May 2026 Verden)
// v6.3.0 — IUX overhaul: 6-tab nav · executive dashboard · Action Cards (07 May 2026 Verden)
// v6.3.0-rc6 — Action Cards alert banner: hatch decisions today (07 May 2026 Verden)
// v6.3.0-rc5 — Sireet equity headline card with Today/MTD/YTD/All horizons (07 May 2026 Verden)
// v6.3.0-rc4 — Group Income + Group Margin with Today/MTD/YTD/All horizons (07 May 2026 Verden)
// v6.3.0-rc3 — Hero greeting + date single-row left-aligned · Nandi "Chamgei chemogeet" (07 May 2026 Verden)
// v6.3.0-rc2 — Hatch prefill bug fix: data-incmode selector + populate-before-select (07 May 2026 Verden)
// v6.3.0-rc1 — Domain-organized navigation: Home/Tea/Poultry/Other/Insights/Admin (07 May 2026 Verden)
// v6.2.5 — Eggs Income unit-aware aggregation + remove admin hint tooltip (06 May 2026 Verden)
// v6.2.4 — Delete tautological vaccination preview card (Cheison post-dinner observation, 05 May 2026)
// v6.2.3 — Vaccination submit button visible + preview layout (05 May 2026 Lübeck dinner-time)
// v6.2.2 — Comprehensive cloud-replace-local for all 6 transactional types (05 May 2026 Lübeck late evening)
// v6.2.1 — birdCensus cloud-replace-local + stale-cache migration (05 May 2026 Lübeck late evening)
// v6.2.0 — Cloud-hydrate STATE.litterChanges for cross-device viewing (05 May 2026 Lübeck evening)
// v6.1.9 — Remove spurious IS_ADMIN guard from litter + cohort sync (05 May 2026 Lübeck)
// v6.1.8 — Bar text overflow fix for phone screens (04 May 2026)
// v6.1.7 — Queue durability for cohort + litter (04 May 2026)
// v6.1.6 — Litter date picker fix + admin reset/edit options (04 May 2026)
// v6.1.5 — Litter bar inversion + native picker + admin overwrite gate (04 May 2026)
// v6.1.4 — Bar contrast inverse-color + deep litter tracking (04 May 2026)
// v6.1.3 — AbortSignal preview fix + empty-houses placeholder (04 May 2026)
// v6.1.2 — Marek's dropdown bug + bar text contrast (04 May 2026)
// v6.1.1 — Quarantine card rollup fix (04 May 2026)
// v6.1.0 — Lifecycle SM + tap-to-record + vaccine cleanup (04 May 2026)
// v6.0.1 — Text-in-bar incubation cards + Marek's prep prompt (04 May 2026)
// v6.0.0 — Lifecycle SM + Vaccinations bundle (04 May 2026)
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

const CACHE = 'sinonin-greenleaf-v152';

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
