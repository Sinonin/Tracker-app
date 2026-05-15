# CONVENTIONS — Sinonin Group Management App

*This file codifies the architecture, principles, and discipline of the Sinonin Group Management App. It serves as both `CONVENTIONS.md` at the repo root and the Custom Instructions for the Claude Project. Sealed Friday, 15 May 2026 (Verden, CEST).*

---

## 1 · IDENTITY

The **Sinonin Group Management App** is a Progressive Web App for managing Dr. Seronei Chelulei Cheison's farming operations in Nandi County, Kenya — administered from Verden, Lower Saxony, Germany. It is a working production system used daily by field operators, not a prototype.

**Operations covered:**

- **Sinonin Tea** — greenleaf production across blocks (Cheptabach, Septonok, Mosop, Tabolwa, Sang'alo, Kugeroniot, Kipkorom, Sinonin, Bitonin, Kipkenda) delivered to Sireet and other factories
- **Kipkenda Poultry** — Layers, Cockerels, Growers, Chicks; egg production; incubation
- **Dorper Sheep** — flock census, gifting, deaths, edit-tag operations

**Architecture:**

```
PWA (Vercel, single-page)  →  Apps Script gate (Web App)  →  Google Sheets (source of truth)
```

The PWA is offline-capable. The gate enforces flag-based write controls (Control_Panel). All writes log to Audit_Log with payload and granted-by attribution.

---

## 2 · OPERATORS

| Person                  | Role                                            | Channel              |
| ----------------------- | ----------------------------------------------- | -------------------- |
| **Dr. Cheison**         | Principal — strategy, data review, escalations  | WhatsApp, PWA, sheet |
| **Elias**               | Tea field operator                              | PWA                  |
| **Victor**              | Tea field operator                              | PWA                  |
| **Faith**               | Poultry & egg collection                        | PWA                  |
| **Steve Rotich**        | Future shareable Vercel-link recipient (Phase 3)| Pending Admin UI     |

**Operator-on-ground supersedes principal's assumption.** If field data conflicts with the principal's expectation, the field data is the truth — until investigated and proven otherwise.

---

## 3 · TECHNICAL STACK

```
/index.html                    Single-file PWA (~17.5k lines, ~780 KB)
/service-worker.js             Cache + offline shell
/appsscript/                   Apps Script source (.gs files)
/mnt/user-data/outputs/        Deploy-ready snapshots
```

**Build approach:** no bundler, no transpilation. The PWA is hand-crafted vanilla JS + HTML + CSS, with heavy inline comments documenting every architectural decision. Comments survive — they are a record of why a choice was made, who sealed it, and when.

**No external runtime dependencies.** Tailwind-style classes are inlined; no CDN scripts in production paths.

---

## 4 · VERSIONING

| Layer        | Format                       | Example                       |
| ------------ | ---------------------------- | ----------------------------- |
| PWA          | `vMAJOR.MINOR.PATCH`         | `v6.9.4`                      |
| Apps Script  | `vMAJOR.MINOR.PATCH`         | `v5.0.35`                     |
| Cache key    | `sinonin-greenleaf-vN`       | `sinonin-greenleaf-v184`      |

**Rules:**

- Every PWA release bumps the cache key (forces fresh download on hard-refresh)
- Apps Script and PWA versions are independent but their cross-references in commits must match the deployed pair
- Patch bumps for fixes (most releases). Minor bumps when sealing a new principle or major UI surface. Major bumps when the architecture changes substantially.

**Commit message format:**

```
v6.9.4 + apps-script v5.0.35: <theme>

<2–4 sentence body explaining what and why>
```

---

## 5 · DEPLOY DISCIPLINE

**PWA:**

```bash
git add index.html service-worker.js
git commit -m "vX.Y.Z — <theme>"
git push   # Vercel auto-deploys (~2 min)
```

**Apps Script:**

1. Open Apps Script editor (Extensions → Apps Script in the spreadsheet)
2. Paste the full `.gs` file into the editor (atomic replacement; never inline-edit in browser editor)
3. Save (`Ctrl+S` / `Cmd+S`)
4. Deploy → Manage deployments → pencil-edit current Web App → Version: **New version** → Deploy
5. Verify the deployment URL is unchanged

**Deploy order when both change:** Apps Script **first**. The PWA pushes payloads against the gate; if the gate is on the old version, server-side reconciliation (rebuilds, backfills) won't trigger.

**Editor source ≠ deployed snapshot.** Maintain working copies in `/appsscript/vX.Y.Z-working.gs` and ship completed releases as `apps-script-vX.Y.Z-COMPLETE.gs` in `/mnt/user-data/outputs/`.

---

## 6 · SEALED OPERATIONAL PRINCIPLES

These are the rules that override any specific code or design decision. When in doubt, defer to these.

### 6.1 — *Kibegunee ng'woonin isoocho*
> "The taste of the pudding is in the eating."
>
> An architecture isn't real until operators (Elias, Victor, Faith) use it without calling Cheison. A gate isn't proven until a rejection actually fails in the Audit_Log. Sealed 29 April 2026.

### 6.2 — Every plucker is paid per kg
Every plucker — including operators Elias and Victor — is paid per kg plucked. There is no "self-plucked" pattern, no unpaid plucking, no exception. **Actuals without pluckers = missing data**, not legitimate self-pluck. Sealed 12 May 2026.

### 6.3 — Mortality entries are reputational
A mortality entry on the books is a permanent reputational mark on the operator responsible for the flock's care. Mortality entries are recorded **only when birds actually died**. Reconciliation of bookkeeping errors (mis-dated sales, ghost cohorts, transfer mistakes) is done by editing the offending entry at its source — never by inventing deaths. Sealed 15 May 2026 by Cheison: *"I'd rather edit the number in the sheets than record a haunting 'death of 15 birds' from 81 hatched that is a damning 19% mortality."*

### 6.4 — Fix data at the source, not the aggregate
When a downstream number looks wrong, ask whether an upstream entry was wrong — and correct that entry. Inventing reconciliation rows muddies the audit trail. The cleanest fix is almost always to edit the cell that was wrong in the first place. Sealed 15 May 2026.

### 6.5 — Forward-only architectural changes
When introducing new detection (duplicate banners, anomaly alerts, etc.), scope them with an activation timestamp. Historical data — accumulated before the architecture knew to watch — stays silent. *"I don't want to burn the midnight oil cleaning what is already clean."* Sealed 13 May 2026. Example: `DUPE_BANNER_ACTIVATION_TS = '2026-05-14T00:00:00.000Z'`.

### 6.6 — Operator on the ground has truth
When field data conflicts with the principal's assumption, the field data wins. Example: 14 May 2026 — Cheison submitted Sinonin 204.9 kg based on factory SMS total; Elias correctly split into Bitonin 121.8 + Kipkenda 83.1 = 204.9. Cheison deleted his row. Principle: *"I'll delete mine and stop making entries unless asked to."*

### 6.7 — Revenue is computed from Actuals
Tea revenue and equity are always computed from **Actuals** (factory-confirmed via SMS or weighing-shed receipt). Greenleaf plucker entries are for **payroll only**. Plucker sum < Actuals is expected. Any card or report that derives revenue from plucker sums is a bug.

### 6.8 — *Kiruogindet araap Cheison* in operator-facing toasts
Operator-facing locked-write toasts and authority attributions use **"Kiruogindet araap Cheison"** (Nandi: *Judge of the Cheison line*) — not "Mzee Cheison." Sealed in v6.8.0.

### 6.9 — Before adding a new surface, check why the existing surface isn't working
A bug surfacing on Home is usually a filter / sync / wire-up issue on an existing widget, not a missing surface. Adding a new card on top of a broken one is technical debt, not progress. Sealed 14 May 2026 (v6.8.6 → v6.8.7 → v6.8.8 lesson cycle).

### 6.10 — Never write to the server based on a field that can go stale
The PWA's `STATE.cohorts.current_count` can lag the server (server-side backfills don't always trigger PWA re-sync per row). Auto-repair logic that trusted local STATE wrote a wrong value (73) back to the sheet on 15 May 2026. Forward-looking rebaseline at migration time only — never retroactive repair from local state. Sealed 15 May 2026.

---

## 7 · DATA MODEL

### 7.1 — Cohorts

```
Cohort_ID           e.g. COH-KP16APR264
Date_Origin         hatch date (ISO yyyy-mm-dd)
Initial_Count       historical hatch count (rarely changes)
Current_Count       live remaining (after sales/mortality)
Sold_Count          recomputed by backfill from sales rows
Mortality_Count     recomputed by backfill from mortality rows
Stage               'Chicks 1-7 days' | 'Chicks 7-28 days' | 'Growers' | 'Layers' | 'Cockerels' | 'Quarantine' | 'Deformities' | 'Retired birds'
House               physical location
Status              'incubating' | 'active' | 'hatched' | 'cancelled' | (empty = active, permissive default)
```

### 7.2 — Stage transitions (auto-aging)

| Age (days from origin) | Stage              |
| ---------------------- | ------------------ |
| 0–7                    | Chicks 1–7 days    |
| 8–28                   | Chicks 7–28 days   |
| 29–140                 | Growers            |
| 141+                   | Layers             |
| (manual)               | Cockerels          |

Auto-aging runs on every `renderHome()`. Cockerels are assigned manually — never auto.

### 7.3 — Live count computation (per-cohort, stagesPassed)

For each cohort whose **current** stage is the target stage:

```
stagesPassed = { every stage the cohort has been through since origin }
sales_matched = SUM(sales WHERE stage ∈ stagesPassed AND date ≥ origin)
mort_matched  = SUM(mortality WHERE stage ∈ stagesPassed AND date ≥ origin)
cohort_live   = Initial_Count − sales_matched − mort_matched

stage_live = baseline_from_census + SUM(cohort_live across cohorts in this stage)
```

Mirrored in both:
- Apps Script `rebuildLivePopulationSheet` (v5.0.35+)
- PWA `computeStageLive` (v6.9.4+)

### 7.4 — Stage transition rebaseline (forward-only)

When a cohort auto-promotes, the migration sets `initial_count = current_count` **only for fresh cohorts whose current_count is reliable**. Legacy cohorts with stale local STATE are NOT auto-repaired (sealed 15 May 2026 — see 6.10).

### 7.5 — Bird_Population_Live (server aggregate)

Refreshed automatically by `writeCohortEntry` as a post-action on any **stage change**. Calls `applyCohortBackfill(cohort_id)` then `rebuildLivePopulationSheet()`. Bug-handling wraps these in try/catch — primary cohort write succeeds even if rebuild fails.

### 7.6 — Future structural fix
The current per-cohort math uses `stagesPassed` as a workaround for the missing `Cohort_ID` column on the Poultry Sales sheet. The clean fix is to add that column, update `writePoultryEntry`, update the PWA sales form, update both rebuild functions to match by `cohort_id` (with stage fallback). Backlogged.

---

## 8 · UI SURFACES (HOME TAB)

```
panel-home
├── #actual-dupe-banner       Forward-only duplicate-actuals warning
├── hero greeting + date
├── 4 metric cards            Sireet revenue · current month · YTD · ...
├── #action-cards             "Attention today" / "Coming up" / "All caught up"
│    ├── ac-list              Text alerts (overdue hatches, vaccinations, etc.)
│    └── #home-urgent-hatch-progress    Rich .ip-card widget for hatches ≤7 days
└── (further down)             Recent activity, recent actuals, etc.
```

**Notification hierarchy:**

1. **`#actual-dupe-banner`** — revenue integrity issue, forward-only scope
2. **`#action-cards`** — operator decisions ("Coming up" if only soft items; "Attention today" if urgent; "All caught up" if empty)
3. **`#home-urgent-hatch-progress`** — rich progress widget INSIDE action-cards, replaces the "All caught up" placeholder when batches are due ≤7 days

The hatch widget reuses `.ip-card` classes from the Poultry-tab Incubation card (same visual language). Phase classes:

- `phase-early` — Day 0 through Day 13 (calm)
- `phase-approach` — Day 14+ AND daysToHatch < 7 (amber, "PREP Marek")
- `phase-ready` — Day 20–22 (green, "TAP to record")
- `phase-overdue` — Day 23+ (red, "RECORD HATCH · Nd late")

---

## 9 · ALERT TIERS (PLUCKER ↔ ACTUAL RECONCILIATION)

| Gap (pluckers vs actual) | Behavior                                                                  | Tone                |
| ------------------------ | ------------------------------------------------------------------------- | ------------------- |
| 0–5%                     | Silent                                                                    | Normal              |
| 5–20%                    | Soft confirm toast: *"Please confirm all entries are made"* *(planned)*   | Friendly nudge      |
| ≥ 20%                    | Sharp warning: *"Weighbridge gap: pluckers X vs actual Y..."*             | Stop and check      |
| Actual > 10 kg AND 0 pluckers | Reminder: *"Record pluckers later"* (not "self-plucked")             | Honest framing      |

The 5% tier is parked (v6.9.0 backlog item); the others are live.

---

## 10 · DUPLICATE-ACTUALS PROTECTION

Two layers, both forward-only:

**Submit-time guard** (`submitActual` in PWA): when a `(date, factory, block)` triple already exists in `STATE.actuals`, show a confirm dialog before submitting a second row. Operator can cancel and edit the sheet, or proceed (creates a known duplicate that surfaces in the banner).

**Home banner** (`renderActualDupeBanner`): scans `STATE.actuals` for groups sharing `(date, factory, block)`. Surfaces ONLY groups with at least one row submitted after `DUPE_BANNER_ACTIVATION_TS` (currently `'2026-05-14T00:00:00.000Z'`). Each unacked duplicate group shows in a persistent banner with **OK · both legit** and **Corrected** actions. Ack persists in `localStorage` per row-signature (count + sorted kg values); new duplicates trigger fresh acks.

---

## 11 · CODE CONVENTIONS

**Comments are first-class.** Inline comments document architectural decisions, version that introduced changes, the bug history, who sealed the principle, and when. Example:

```js
// v6.9.4 — PER-COHORT live computation replaces stage-bucketed sales 
// deduction. Background: ... Concretely: COH-KP16APR264 had 60 sales 
// tagged 'Chicks 1-7 days'; when the cohort promoted on 15 May 2026, 
// those sales no longer matched the new stage's filter ...
```

Comments survive refactors. The codebase **is** the chronicle.

**Naming:**

- Functions: `camelCase`, descriptive verbs (`renderHome`, `submitActual`, `computeStageLive`)
- Constants: `UPPER_SNAKE_CASE` (`HATCH_PREP_HORIZON_DAYS`, `DUPE_BANNER_ACTIVATION_TS`)
- localStorage keys: `K_*` (`K_ACTUALS`, `K_INCUBATION`, `K_ACTUAL_DUPE_ACKS`)
- Private helpers: `_underscorePrefix` (`_dupeKey`, `_stageForAge`)
- Sealed comments include version and date: `// v6.9.4 (15 May 2026) — ...`

**File structure inside `index.html`:**

```
<!DOCTYPE html>
<html>
  <head>
    <style>     ← All CSS (~1500 lines)
  </head>
  <body>
    <section class="panel" id="panel-home">…</section>
    <section class="panel" id="panel-tea">…</section>
    <section class="panel" id="panel-poultry">…</section>
    <section class="panel" id="panel-records">…</section>
    <section class="panel" id="panel-settings">…</section>
    <nav>…</nav>
    <script>   ← All JS (~14000 lines, biggest function: renderHome)
  </body>
</html>
```

---

## 12 · TONE & COMMUNICATION

**Writing register:**

- Technical context (deploy guides, code reviews): direct, precise, magazine-style flourishes for theme intros, real numbers and named operators
- Operator-facing UI (toasts, banner messages): friendly Nandi-flavored, never blaming
- Essays and op-eds for `cheison.com` / `sinonin.com`: punchy magazine prose, drop caps, pull quotes, justified text, serif typography (Playfair Display, EB Garamond, Cinzel)

**Sign-off:** 🫖⚔️🐔🪶🐑 (tea · architecture · poultry · sheep · earth)

**Nandi vocabulary used in-product and in-conversation:**

| Phrase                              | Meaning                                                          |
| ----------------------------------- | ---------------------------------------------------------------- |
| Chamgei                             | Hi                                                               |
| Chamgei chemogeet                   | Hi Boss (universal Home greeting)                                |
| Chorweetnyuu                        | My friend                                                        |
| Saisere                             | Bye                                                              |
| Kongoi                              | Thank you                                                        |
| Kongoi muu                          | Thank you very much                                              |
| *Kibegunee ng'woonin isoocho*       | Trust, but prove (operating principle)                           |
| *Kiruogindet araap Cheison*         | Judge of the Cheison line (in operator-facing locked-write toasts) |

Use Nandi naturally, not performatively. In English text, italicize sealed-principle phrases the first time they appear in any document; subsequent uses in the same document can be unadorned.

---

## 13 · ACTIVE BACKLOG (NEXT WORK)

In order of priority, with last-seen version:

1. **5% gap soft-confirm toast** at plucker save (parked v6.9.0)
   - Three design questions pending Cheison answers: which save triggers, exact wording, toast vs modal
2. **`Cohort_ID` column on Poultry Sales sheet** (structural)
   - Add column, update `writePoultryEntry`, update PWA sales form, update both rebuild functions, backfill historical sales
3. **Phase 3 Admin UI** (Steve Rotich enablement)
   - In-app toggle, scheduled grant windows, panic revoke
4. **Reservations / deposits tracker** (sealed 11 May)
5. **Hatch idempotency** by batch_id
6. **Vaccination schedule editor** in Settings
7. **Per-cohort vaccination history viz**
8. **Coffee Lite / Maize Lite trackers** (low priority)

---

## 14 · DEPLOYMENT MEMORY

Currently in production (as of 15 May 2026):

```
PWA           v6.9.4 (cache v184)
Apps Script   v5.0.35
```

Last shipped bundle:
- v6.9.4: per-cohort live count via stagesPassed
- v5.0.35: same fix server-side + auto-rebuild on stage promotion

---

## 15 · CLOSING NOTE

The Sinonin Group Management App is a working tool, not a portfolio piece. Every line in production exists because a real operator needed it on a real morning. Every comment in source exists because a real bug or a real conversation prompted it. The architecture should serve the operator, not the architect.

When in doubt:

> *Kibegunee ng'woonin isoocho.*  
> Trust, but prove.  
> The taste of the pudding is in the eating.

🫖⚔️🐔🪶🐑
