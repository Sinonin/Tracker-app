# Sinonin Greenleaf — Deployment Guide

Five files in this bundle make up the app:

```
index.html          ← the app (open this first to preview in any browser)
manifest.json       ← tells Android "this is an installable app"
service-worker.js   ← enables offline use
icon.svg            ← vector icon
icon-192.png        ← Android launcher icon
icon-512.png        ← Android splash / high-res icon
```

All five must sit together in the same folder / URL path. The service worker will not register if any are missing.

---

## Running it locally (sanity check)

Open `index.html` in Chrome directly — the app runs, but the service worker will not activate because browsers require HTTPS (or `localhost`) for service workers. For a quick local test with HTTPS behaviour, run a local server from the folder:

```
python3 -m http.server 8080
```

Then visit `http://localhost:8080` in Chrome. The service worker will register and the app will survive a network drop.

---

## Hosting — three free options, pick one

### Option A · GitHub Pages (recommended if you already use Git)
1. Create a new repo called `greenleaf` under your account or the sinonin org.
2. Upload all five files to the repo root.
3. Repo → Settings → Pages → Source: `main` branch, root folder. Save.
4. Your app lives at `https://<you>.github.io/greenleaf/`. HTTPS is automatic.
5. Updates: push a new file, the clerk's app updates on next open.

### Option B · Netlify Drop (simplest, no account needed for a test)
1. Visit `https://app.netlify.com/drop`.
2. Drag the whole folder containing the five files onto the drop zone.
3. You get an HTTPS URL in ~20 seconds. Claim the site with a free account to keep it.

### Option C · Under your own domain on `sinonin.com`
If sinonin.com is on Blogger you cannot add a service worker there — Blogger disallows serving `.js` files outside the post context, which kills PWA install. Route instead via a subdomain:
- `app.sinonin.com` → point to Netlify, Cloudflare Pages, or GitHub Pages via a CNAME.
- Keep `sinonin.com` for your editorial Blogger content.
- This is the right long-term architecture: content stays on Blogger, apps live on the subdomain.

---

## Installing on the clerk's Android phone

Once hosted at an HTTPS URL, send the link by WhatsApp.

On the clerk's phone, Chrome (not Samsung Internet, not the in-app WhatsApp browser):

1. Open the link.
2. Chrome menu (⋮) → **Install app** (sometimes shown as **Add to Home screen**).
3. Confirm. The tea-leaf icon appears on the home screen.
4. Tapping it launches the app full-screen — no browser chrome, behaves exactly like a native app.

First launch caches the app shell. After that, the app opens instantly and works fully offline. Entries saved with no signal persist in the phone's IndexedDB-equivalent storage and are there whenever the clerk comes back.

---

## Data export — the bridge back to your Sheet

The clerk has no Google Drive access from the app; that's deliberate. At the end of each week or the day you reconcile wages, you do one of:

- **Clerk on site**: open the app → **Reports → Export CSV**. The CSV downloads to the phone's Downloads folder. Share it to you via WhatsApp or email.
- **You in Germany**: open the same app on your own phone or laptop (install it or just visit the URL). Your entries sync independently per device for now (this is the honest limitation — see next section).

Drop the CSV into your existing Kipkenda Consolidated Revenue workbook, or into the `Entries` tab of the AppSheet template if you go hybrid.

---

## The honest limitation — and the fix

This PWA stores data **locally on each device**. Two clerks with two phones produce two separate stores. That is fine when one clerk enters everything, but it is not true multi-device sync.

Two ways to solve it, in order of effort:

### Light fix — nightly CSV to WhatsApp
The clerk exports once a day, sends you the CSV. You consolidate.

### Proper fix — Google Sheets sync
Add ~60 lines of code to call the Google Sheets API when the phone is online. Each new entry posts to your sheet as a row; the app fetches the sheet on load to reconcile. This gives you true multi-device sync without giving up offline capability. It needs:
- A Google Cloud project with Sheets API enabled
- An OAuth client ID (free)
- A small edit to the app's `saveEntries` function

If you want this, say the word — it's a half-day job for me to wire up and document.

---

## Updating the rate card

Factory prices or bonuses change? Two places to edit in `index.html`:

```
const FACTORIES = [
  { name: "Sang'alo",  priceKg: 25.5, ... },
  ...
];

const SETTINGS = {
  teaCessPerKg: 0.22,
  transportActive: false,
  ...
};
```

Change the numbers, save the file, re-upload to your host. The service-worker version in this bundle will auto-refresh on the clerk's phone on next open (the `CACHE = 'sinonin-greenleaf-v1'` line in `service-worker.js` — bump to `v2` to force a cache refresh when you change logic).

---

## When to step up to a native Android app

Stay on PWA unless one of these forces your hand:

- You want **Play Store distribution** for brand presence or to charge for the app.
- You need deep device integration (Bluetooth scale pairing, NFC plucker cards).
- You need **push notifications** that work reliably when the app is closed — PWA push on Android is possible but fussy.

If any of those arrive, we rebuild as a Flutter project. The business logic in this PWA — the computation function, the reference data, the storage contract — translates directly. You don't throw the work away; you port it.

---

*Built April 2026. Questions? The logic lives in `index.html` between the `<script>` tags. It is readable Fraunces-adjacent JavaScript, not a framework. A competent developer can extend it in an afternoon.*
