// Sinonin Group Management App — Service Worker
// v6.11.107 — Security Fix 3 (client): write-token injected into every gate request via the gatePost_ choke-point (reads window.TENANT_CONFIG.writeToken). Pairs with Apps Script v5.0.80. INERT until per-tenant config.js carries writeToken AND Control_Panel WRITE_TOKEN matches AND REQUIRE_WRITE_TOKEN=TRUE; until then behaviour is identical to v6.11.106. Cache bump only on the SW side. Cache v329 → v330.
// v6.11.36 — Sireet equity computes for 2026 again (Cheison, 29 May 2026, Verden). sireetRate() trusted STATE.factories[Sireet].shares blindly, but the v5.0.48 Tea_Factories cloud-read doesn't carry a shares column — so after the first cloud sync, sireet.shares was undefined → Number(undefined)||0 → 0 → every Ksh on the Insights "Equity by year" table for the live (2026) year zeroed out. Past-year ledger entries (≤ 2025) were rolled before v5.0.48 landed with the seeded shares=5 still authoritative, so they read correctly. Fix: sireetRate() returns the canonical 5 KES/kg (a sealed commercial term, WoW § 3) unless STATE.factories carries a positive finite shares override. PWA-only. Cache v258 → v259.
// v6.11.35 — Tea two-leaves-and-a-bud icon, propagated (Cheison, 29 May 2026, Verden). The existing SVG icon on the Plucker Kg quick-add card (a proper two-leaves-and-a-bud, v6.3.20) is now extracted to a shared TEA_LEAF_SVG constant + .tea-leaf-icon CSS class, and used in the 4 genuinely tea-product spots where 🌿 (fern emoji) previously stood in: the Sales cascade unit card, the unit-icon helper, the product-icon helper, and the Economics view umbrella header. Three textContent → innerHTML conversions in the sales crumb code so the SVG renders (labels escapeHtml'd). The 5 decorative uses of 🌿 in renderNoActivityHint (Sunday/Saturday/early-morning "all calm" messages) are intentionally kept — fern emoji reads correctly as "fresh/quiet" there, not as a tea claim. Cache v257 → v258. PWA-only.
// v6.11.34 — #CleaningFriday pass 1: removed 14 dead functions (Cheison, 29 May 2026, Verden). Excised pluckerKey/actualKey/expenseKey/bankedKey/poultryKey/eggCollectionKey/houseKey/birdCensusKey/incubationKey (a superseded set of storage-key dedup helpers, replaced by id-based dedup), plus adminRejectMsg, cowGestationDays, lactationDays, forceFlushDorper, filterEntries. 68 lines, 3.4KB. All 14 verified zero residual references before removal. typedConfirm deliberately retained pending an explicit call on whether destructive ops need a typed-confirmation guardrail. Behaviour-neutral; cache v256 -> v257.
// v6.11.33 — Silent plucker-drop fix (Cheison, 29 May 2026, Cheptabach). PLUCKERS.find(p => p.id === r.pluckerId) used strict equality against a parseInt-d dataset.pid. When the Roster cell is text-typed in the sheet (e.g. an apostrophe-prefixed '1001), getValues() returns the id as a String — the strict check fails and submitBatch SKIPPED the entry with only a console.error. Rudisha (#35) and Chebunmoi (#1001) vanished from the 29 May Cheptabach batch this way. Two fixes: (1) coerce id to Number at the cloud roster merge boundary so PLUCKERS always carries numeric ids; (2) tolerant Number() match in both submitBatch and submitQuick, plus an explicit on-screen warning toast listing any skipped ids and total kg — never silent again. PWA-only.
// v6.11.32 — Catalogue picker on receipt/invoice lines (Cheison, 29 May 2026, Verden). Each line now carries a 📋 button that opens a Unit -> Product -> Variant cascade reading the same PRODUCTS_/VARIANTS_ entries from Control_Panel that the Sales POS uses, then writes the canonical label into the description. Portfolio language and invoice language can't drift apart, and the operator stops retyping what the system already knows. The desc remains editable for one-off / catch-all items. PWA-only; v5.0.57 Apps Script changes are independent (sheet tab arrangement menu).
// v6.11.31 — Cohort sale misattribution fix (Cheison/Victor 28 May 2026). The sale form captures the operator-picked cohort_id (§ 7.6), but autoDecrementCohortOnSale ignored it and decremented the FIFO-oldest cohort at the stage. With the 04 May and 27 Apr cohorts both at "Chicks 1–7 days", a sale from 04 May silently drained 27 Apr, so 04 May still read as full and counts "twisted". The decrement now honors the picked cohort_id; FIFO remains only as a fallback for rows carrying no cohort_id. PWA-only. NOTE: does not retro-correct counts already mis-decremented, nor the separate cloud-count sync — both still to investigate.
// v6.11.30 — Batch write data-loss fix (Cheison/Victor 28 May 2026, Sangalo). submitBatch and the batch-expense path fired every entry in parallel (Promise.all), overwhelming the Apps Script gate; throttled requests HTTP-errored, fell through to the no-cors Form fallback that reports success without confirming the write, and were silently lost (never gated, never queued, not in the sheet) — 2 of 12 pluckers vanished. Both batch paths now send sequentially, so every write is confirmed against the gate and real failures are queued for retry. PWA-only.
// v6.11.29 — Receipt/invoice print fits one page (Cheison 28 May 2026 Verden). The print window used svg{width:100%} with no page orientation, so in landscape the document stretched to full width and its proportional height spilled onto a second page even with a single line item. Now forces @page{size:portrait} (receipts/invoices are portrait documents) and caps the SVG at max-height:275mm so it shrinks to one A4 page. PWA-only.
// v6.11.28 — Storage null-safety fix (Cheison 28 May 2026 Verden). The tenant-stamp cache purge wrote storageSet(k, null) across all data keys, persisting the literal string "null"; storageGet and the dupe/gap/bird-population ack getters then parsed "null" back to null and crashed on .length / [key] (updateSyncIndicator, applyCloudResponse ack merges, flushPendingAcks, findActualDuplicates). Fix: purge now removeItem()s keys instead of writing null (root cause), and storageGet + all ack/queue getters coalesce a parsed null to their default — which also heals storage already holding "null" on the next load, no clearing needed. Not related to the receipt work. PWA-only; no Apps Script or config change.
// v6.11.27 — Receipt/invoice config additions (Cheison 28 May 2026 Verden): paymentMethods + paymentTerms (printed on invoices) and a VAT placeholder (vatRate/vatNote). VAT is invisible at rate 0 and renders a Subtotal/VAT(incl.)/Total breakdown once a rate is set — ready for registration without a spurious 0% line today. config.js receipt block extended across all tenants. PWA + config only.
// v6.11.26 — Receipt accountability lock (Cheison 28 May 2026 Verden). Receipts can now ONLY be issued from a recorded sale (the 🧾 on the sale row), never minted from scratch — closes the abuse vector of manufacturing a receipt for a purchase that never happened. The standalone builder is now INVOICE-only (invoices legitimately precede payment). Type toggle removed; entry point fixes the document type. Post-sale toast nudges toward the 🧾. PWA-only; Apps Script unchanged.
// v6.11.25 — Receipt-from-sale integration (Cheison 28 May 2026 Verden). Each recorded sale row gets a 🧾 clickable that opens the receipt builder pre-filled from that sale (product, qty, unit price, buyer) — no re-entry, no dummy sale, no double-counting. On issue, the existing sale row is stamped durably via Apps Script v5.0.55 sale-receipt action (Receipt Type/ID/Issued), surviving cloud re-hydration; row shows 🧾✓ once receipted.
// v6.11.24 — Receipt/Invoice engine (infrastructure phase). Build-a-document flow from Sales: type (Receipt/Invoice), line items with optional batch/cohort, server-allocated number (Apps Script v5.0.54 receipt-number action, atomic via LockService, tenant prefix from config.js). Branded SVG document -> Print/PDF, PNG export, Web Share (WhatsApp/email). Config receipt block added to all tenants. No income writeback or product codes yet (deferred). (Cheison 28 May 2026 Verden)
// v6.11.23 — Factory chart re-clustered by MONTH instead of factory (Cheison 28 May 2026 Verden). Months are the stable axis (oldest->newest, current = MTD, tinted); within each month only factories that actually delivered render, colour-coded with a legend. Sparse/absent factories (Kapchorwa rare-route, Sangalo gaps) no longer leave permanent empty clusters. Shared kg scale, hover/tap for exact kg + expected
// v6.11.22 — Factory chart reworked into a single clustered chart: factories side by side, each a cluster of 3 month-bars (oldest→newest, brass = current MTD) on a shared kg scale. Exact kg + expected income reveal on hover (pointer) or tap (touch) per bar — global Labels toggle removed, tighter use of space (Cheison 28 May 2026 Verden)
// v6.11.21 — Cess folded into netPerKg (TEA_CESS_KG, flat 0.22/kg all factories) so expected income = price − cess − transport − equity everywhere (hero MTD/YTD, factory recon, Insights all read netPerKg). Hero sub-label updated. Factory reconciliation gains Chart view: per-factory kg bars × 3 months with toggle-able expected-income labels, Chart⇄Numbers toggle (Cheison 28 May 2026 Verden)
// v6.11.20 — Factory reconciliation months clarified: calendar-month boundaries (Mar/Apr whole months, May month-to-date). Current month now tagged "MTD" so the partial-vs-complete distinction is explicit — Cheison reconciles against complete prior months, not a rolling window (Cheison 28 May 2026 Verden)
// v6.11.19 — Cost model + factory reconciliation. (1) Shared Overhead via EXPENSE_ONLY_UNITS CP key — expense-only allocation, excluded from Sales/clusters. (2) Insights tea section restructured into Sinonin Tea umbrella (sum of all blocks) with owned per-field + Leased Tea subtotal (LEASED_BLOCKS CP key) + leased per-field. (3) No-distribution preserved — every cost sits where tagged. (4) Factory reconciliation widget on panel-tea: per-factory last-3-months GL delivered (kg→expected) vs booked income (Banked source=factory), gap shown. Booked matches production period if present else banking-date month (Cheison 28 May 2026 Verden)
// v6.11.18 — Two fixes: (1) Sales duplicate "Tea"/"Sinonin Tea" — teaInBusinessUnits detection changed from exact slug match (=== TEA) to word-boundary regex so "Sinonin Tea" suppresses the auto-prepend. (2) "Whole farm" removed as a selectable expense allocation in both single + batch forms (forced-choice placeholder, allocation now required at submit); historical Whole-farm expenses still render in their own Insights bucket (Cheison 28 May 2026 Verden)
// v6.11.17 — Tenant URL externalized to config.js. index.html now byte-identical across Sinonin/Birei/Kibois repos; only config.js differs per tenant. TENANT_APPS_SCRIPT_URL sourced from window.TENANT_CONFIG.appsScriptUrl loaded synchronously via <script src="config.js"> in head. Service worker precaches config.js as shell (network-first) so URL rotations propagate on next online load. Each tenant repo gets its own 3-line config.js (Cheison 27 May 2026 Verden)
// v6.11.16 — Always full fetch. The runCloudSync since=lastSyncDate path was architecturally incompatible with applyCloudResponse REPLACE semantics: incremental fetch returned only entries dated >= lastSyncDate, then replaced STATE.actuals/entries/expenses/banked/poultry wholesale — wiping historical entries from device memory after every auto-sync. Symptom: Cheison saw "no factory-confirmed actual for Sireet on 22 May" toast despite the actual being on the sheet — STATE.actuals had only today entries. Fix: PWA no longer passes since= parameter; cloud-side keeps the param for forward compat. Bandwidth cost negligible — six tables total a few hundred rows (Cheison 27 May 2026 Verden)
// v6.11.15 — HOTFIX: Factories cloud-load consumer was missing. v6.11.10 emptied DEFAULT_FACTORIES claiming "cloud-load via data.teaFactories is sole source" — but no such consumer existed in the PWA; the Apps Script v5.0.48+ returned teaFactories but PWA only read K_FACTORIES localStorage. After v6.11.9 cache-stamp purge wiped K_FACTORIES, factories list became permanently empty. Three-part fix: (1) added Array.isArray(data.teaFactories) cloud-load consumer that maps sheet rows to STATE.factories (active rows only); (2) re-introduced DEFAULT_FACTORIES_SINONIN with 3 active factories (Sireet, Sangalo, Kapchorwa) as emergency boot-window fallback; (3) boot-load applies fallback for Sinonin tenant via _isSinoninTenant() check when K_FACTORIES is empty (Cheison 27 May 2026 Verden)
// v6.11.14 — Sireet ledger MERGE logic. v6.11.13 restore branch fired only when years[] was empty, but Cheison's K_SIREET_LEDGER had partial entries (2024+2025 from rolloverClosedYearsIfNeeded reading actuals during broken v6.11.10 boot) so restore was bypassed and Insights showed 2026-only. New logic: for Sinonin devices ALWAYS reconstruct from DEFAULT_SIREET_LEDGER as base, overlay any non-zero stored entries (operator/auto values for closed-out years). Saves back so subsequent boots have consistent ledger (Cheison 27 May 2026 Verden)
// v6.11.13 — HOTFIX: Restore Sinonin Sireet Equity historical ledger lost by v6.11.10 boot-window gate. _isSinoninTenant() checks BOTH tcfg("FARM_NAME") AND localStorage.cachedFarmName (durable across K_* cache purges) so Sinonin device recognises itself even when controlPanel is briefly empty post-purge. Boot-load auto-restores DEFAULT_SIREET_LEDGER when device is Sinonin AND K_SIREET_LEDGER is empty/null, then SAVES BACK to storage so subsequent boots use the restored data (Cheison 27 May 2026 Verden)
// v6.11.12 — Notifications-area poultry cleanup: home-urgent-hatch-progress widget tagged data-product="poultry" so HIDDEN_PRODUCTS catches it; renderActionCards skips HATCH + LITTER alert sources when poultry hidden; hasUpcomingHatches forced false when poultry hidden so banner header does not say "Coming up"; renderHomeUrgentHatchProgress early-returns + clears container when poultry hidden (Cheison 27 May 2026 Verden)
// v6.11.11 — Cluster cards now derived from BUSINESS_UNITS Control_Panel value. panel-crops + panel-livestock card grids are empty in HTML; renderCropsHub/renderLivestockHub populate them from tcfg("BUSINESS_UNITS"), classified via _isLivestockUnit substring matcher (poultry/dairy/dorper/goats/sheep/cow/cattle/birds/chicken). Removes the last hardcoded leak (Chelabaal visible on Birei + Kibois despite their BUSINESS_UNITS not declaring it). Re-render hook added to applyControlPanelToUI (Cheison 27 May 2026 Verden)
// v6.11.10 — Remaining hardcoded Sinonin defaults removed: DEFAULT_FACTORIES emptied (cloud Tea_Factories sheet authoritative); DEFAULT_SIREET_LEDGER fallback gated to FARM_NAME contains "Sinonin"; panel-poultry section gets data-product="poultry"; Sireet Equity card gets data-hide-key for granular HIDDEN_PRODUCTS matching (Cheison 27 May 2026 Verden)
// v6.11.9 — Tenant cache stamp purges cross-tenant data on tenant switch (closes Sinonin pluckers leaking onto Kibois). BUSINESS_OPTIONS → tenantBusinessUnits(); Kipkenda Poultry h3 labels dynamic via poultryUnitLabel(); data-product=poultry added to home poultry section so HIDDEN_PRODUCTS hides it (Cheison 27 May 2026 Verden)
// v6.11.8 — Five-fix bundle: tcfg-based BLOCKS + BUSINESS_UNITS in legacy dropdowns; DEFAULT_PLUCKERS emptied (cloud is sole source per tenant); sheep/cow event log row card styling; Sales-cascade poultry routes to legacy cohort-aware form (Cheison 27 May 2026 Verden)
// v6.11.7 — Admin entry-point consolidation: header Admin button removed; bottom-nav Admin button now carries the full padlock-state machine and is the sole Admin entry point (Cheison 27 May 2026 Verden)
// v6.11.6 — Admin auth unification: bottom-nav Admin button delegates click to header Admin button so triple-tap + passphrase gate applies to BOTH entry points (Cheison 27 May 2026)
// v6.11.5 — Phase B: cluster nav (HOME/CROPS/LIVESTOCK/SALES/INSIGHTS/ADMIN, 6 tabs) + de-Sinoninification (egg collectors from Control_Panel, section heading "Tea" not "Sinonin Tea", generic placeholders) — paint not walls (Cheison 27 May 2026 Verden)
// v6.11.4 — Gift payment method (amount=0 allowed) — Cheison's Broken Eggs gift gap (27 May 2026)
// v6.11.3 — FIX: Tea dedup in salesBusinessUnits when Tea is declared in BUSINESS_UNITS (Cheison Kibois catch, 27 May 2026)
// v6.11.2 — HOTFIX: define escapeHtml helper. v6.11.1 deploy crashed mid-Sales-render leaving empty-state message visible (Cheison browser-console catch, 27 May 2026 Verden)
// v6.11.1 — syncSale protocol fix (action/payload/source, was broken kind/data) + grounded against real Apps Script writeXEntry pattern (27 May 2026, Cheison's appendBanked + Kiraka catches)
// v6.11.0 — Phase A: Unified SALES tab · POS cascade · BUSINESS_UNITS / PRODUCTS_<UNIT> / VARIANTS_<UNIT>_<PRODUCT> Control_Panel keys · receipt fields seated in data model (26 May 2026 Verden, Birei/Kibois Sales unblock)
// v6.10.15 — Egg horizon 10 → 15 days (catering window) — Elias inventory accuracy (26 May 2026 Verden)
// v6.10.14 — DASHBOARD_ORDER per-tenant card sequencing · Coffee + Sugar Cane placeholders · strapline wrap (25 May 2026 Verden, Birei Dairy-led)
// v6.10.13 — HIDDEN_PRODUCTS · DAIRY_LABEL · DORPER_LABEL · splash uses cached FARM_NAME (25 May 2026 Verden, Birei tenant-isation)
// v6.10.12 — TENANT_APPS_SCRIPT_URL consolidation · STRAPLINE/ABOUT_TEXT/BRAND_MOTTO via Control_Panel (25 May 2026 Verden, Birei brand)
// v6.10.11 — Product-aware stage dropdown · prevents Chicken+Normal-eggs nonsense (25 May 2026 Verden)
// v6.10.10 — Cohort_id preserved in cloudToLocalPoultry · egg-batch dropdown 10-day window (25 May 2026 Verden evening)
// v6.10.9 — Cache bust v216 for Sinonin smoke test rev (25 May 2026 Verden)
// v6.10.9 — Compute fix: inBaseline cohorts only deduct TAGGED post-census sales (no double-count via stagesPassed)
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

// v6.11.37 — Hatch composition: Normal/Deformed/Died-at-emergence → cohort seed (30 May 2026 Verden)
// v6.11.38 — Candling placeholder: Fertile-eggs field on Record hatch (30 May 2026 Verden)
// v6.11.39 — Deformed birds route to per-hatch quarantine cohort (suffix -Q) (30 May 2026 Verden)
// v6.11.40 — Cohort sell-delta: server-relative decrement, no client absolutes (31 May 2026 Verden)
// v6.11.41 — Egg-batch picker nets collected − sold; sold-off batches hidden (31 May 2026 Verden)
// v6.11.42 — Egg per-grade sub-batches: base=Normal, _SA, _B clear independently (31 May 2026 Verden)
const CACHE = 'sinonin-greenleaf-v330';

const SHELL_FILES = [
  './',
  './index.html',
  './config.js',
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
  // v6.11.17 — config.js is shell: each tenant's URL config must follow the 
  // same network-first policy as index.html so a URL rotation in the repo 
  // propagates on next online load. Falls back to cache when offline.
  return path === '/' || path === '' || path.endsWith('/index.html') ||
         path.endsWith('/config.js') ||
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
