# Sinonin Greenleaf

Daily plucker returns — a Progressive Web App for Sinonin Tea, Nandi County, Kenya.

Field clerks capture each plucker's kilograms, block of origin, and delivery factory. The app computes wage, cess, bonus, shares and total value on the spot, persists entries offline, and exports CSV for reconciliation into the master workbook.

## Version 2.0

Rebuilt from v1 with four significant additions:

- **Five-tab bottom navigation** — Home, Records, Add (central), Insights, Settings.
- **Batch entry mode** — enter kilograms for all 28 pluckers on one screen for a day's worth of harvest in a single save. Quick Entry remains for single verified entries.
- **In-app rate card editor** — every factory's six parameters (price, wage, bonus, greenleaf, transport, shares) are editable from the phone. Add new factories without touching the code.
- **Bonus-retained economics** — the calculation model now correctly separates cash-now (paid with the weighbridge receipt) from accrued value (bonus and greenleaf bonus, paid later), matching how Sireet and Chebut actually settle.

## Stack

Single-file vanilla HTML / CSS / JavaScript. No build step, no framework, no CDN dependencies for app chrome. Offline-capable via service worker. Data stored locally on device.

## Files

| File | Purpose |
|---|---|
| `index.html` | The app — UI, logic, reference data |
| `manifest.json` | PWA manifest (installability) |
| `service-worker.js` | Offline cache |
| `icon.svg` / `icon-192.png` / `icon-512.png` | App icons |
| `DEPLOY.md` | Hosting, install, and update guide |

## Running locally

```
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deployment

Push to the `Tracker-app` GitHub repository. Vercel (linked to the repo) auto-deploys on every commit, typically landing in under thirty seconds. The URL is the one Vercel assigns at import; a custom domain (e.g. `app.sinonin.com`) can be added later via a CNAME record.

## Editing factory rates

From the phone: open the app, tap **Settings** in the bottom nav, edit any value in any factory's rate card — it saves on blur. Add new factories from the dashed card at the bottom of that screen.

From the code (rarely needed): `DEFAULT_FACTORIES` in `index.html` holds the baseline. The in-app editor writes overrides to device storage; a user's **Reset rate cards** action restores the defaults from code.

Bump `CACHE` in `service-worker.js` after any code change to force a clean reload on installed phones (already bumped to `v2` for this release).

## Reference data

- **Blocks**: Sinonin, Cheptabach, Bitonin, Kipkenda, Kipkorom, Sangalo
- **Pluckers**: 28 entries with per-plucker bonus eligibility flags drawn from the source PDF
- **Factories**: Sang'alo, Sireet, Chebut, Kapchorua (Sireet is the current primary buyer)
- **Tea cess**: 0.22 Ksh/kg, applied to every entry regardless of factory or block

## License

© 2026 Sinonin Biotech GmbH. All rights reserved.
