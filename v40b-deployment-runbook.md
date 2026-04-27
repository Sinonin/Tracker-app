# v40b — Cloud Plucker Roster Sync · Deployment Runbook

**Goal.** End the era of manually exporting/importing JSON between devices. Plucker roster updates flow through a 6th Google Form to the Sheet, and back to every device's PWA on next cloud fetch.

**Estimated time:** 20-30 minutes if everything works on first try; 45-60 if we hit a snag.

**You'll deploy in five stages.** Each stage is independently verifiable. **Do not proceed to the next stage until the current one is verified.**

---

## Stage 0 — Backup first

Before touching anything, **export a JSON backup from each device.** Settings → Backup & Restore → Export backup (JSON). Save both files to your Drive or email them to yourself. This is your rollback point if anything goes sideways.

This costs you 30 seconds and protects you against the next 30 minutes.

---

## Stage 1 — Create the Plucker_Roster Sheet tab

The Form already exists. Now we need the Sheet to receive its submissions.

1. Open your Sinonin Ledger Sheet.
2. Find the Plucker Roster Form connection: **Tools → Manage form** (or look for the form-linked tab Google Forms creates automatically when you set up a destination).
3. **If a tab named "Plucker_Roster" doesn't exist yet:**
   - Open the Sinonin Plucker Roster Form (Forms editor)
   - Click **Responses** → **green Sheets icon** → **Select existing spreadsheet** → choose **Sinonin Ledger** → **Select**
   - Google will create a new tab. Rename it to exactly `Plucker_Roster` (capital P, capital R, underscore).

**Verify Stage 1:** The Sheet has a tab called `Plucker_Roster` with these column headers in row 1:
- `Timestamp`
- `Plucker ID`
- `First Name and Surname`
- `Primary block`
- `Bonus eligibility flag`
- `Notes`

If the headers don't match exactly, the Apps Script reader won't find the columns. Edit the Form's question titles to match if needed, OR adjust the Apps Script `rosterMap` to match your headers.

---

## Stage 2 — Test the Form by submitting one row manually

Before deploying any code, prove the Form → Sheet pipeline works.

1. Open the Form's prefilled URL you generated earlier (the one with Salomon Kiptangus prefilled).
2. **Tweak it to use a clearly-test-only entry:**
   - ID: `999`
   - Name: `Test Entry — Delete Me`
   - Primary block: `All farms`
   - Bonus eligibility: `Bonus Eligible`
   - Notes: `Stage 2 test`
3. Submit.
4. Check the `Plucker_Roster` tab in the Sheet. You should see one row with the values above and a Timestamp.

**Verify Stage 2:** Test row appears in `Plucker_Roster`. **Delete the test row before proceeding** (right-click → Delete row).

If Stage 2 fails: the Form isn't connected to the Sheet correctly. Don't proceed. Fix the connection first.

---

## Stage 3 — Deploy Apps Script v4

Now upgrade the Apps Script from v3 to v4. v4 only adds `readRoster` — it doesn't change any existing behaviour.

1. Open the Sinonin Ledger Sheet → **Extensions → Apps Script**.
2. **Before pasting v4: copy the current v3 code into a comment block at the top** as a safety backup. (Or just trust git — but a quick paste-into-comment takes 10 seconds.)
3. Open `sinonin-ledger-endpoint-v4.gs` (the file I just produced).
4. Select all (Ctrl/Cmd+A), copy.
5. In Apps Script editor, select all of the existing code, delete it, paste v4.
6. **Save** (Ctrl/Cmd+S).
7. **Deploy → Manage deployments → select the existing deployment → pencil icon → Version: New version → Description: "v4 - roster reader" → Deploy**.
8. URL stays the same. No PWA change needed for the URL.

**Verify Stage 3:** Open the Apps Script URL in your browser (the same URL the PWA uses). You should see a JSON response that now includes a `roster` key with an empty array `[]` (no rows yet, but the field exists).

If Stage 3 fails (the URL returns an error or the JSON doesn't include `roster`): the Apps Script has a syntax bug or the Sheet tab doesn't exist. Click **View execution log** in Apps Script to see the error. Common issue: tab name typo (`Plucker_Roster` vs `Plucker Roster`).

**Rollback Stage 3:** Paste the v3 code back from your comment-block backup, redeploy. URL stays the same; PWA continues working as before.

---

## Stage 4 — Deploy PWA v4.0

Now the PWA changes that consume the roster from cloud and push new pluckers to the Form.

1. Upload the new `index.html` and `service-worker.js` to Vercel.
2. Wait for green deployment.
3. On phone and tablet: **close the PWA fully (swipe away from recent apps) and reopen.** Do NOT uninstall.
4. The cache will swap from v42 → v43 automatically.

**Verify Stage 4:**
- Settings → About reads "v4.0"
- Settings → Pluckers shows the existing roster
- The plucker addition form now has a "Primary block / farm" dropdown and "Notes" field

---

## Stage 5 — End-to-end test

Now prove cloud sync works end-to-end.

1. **On Device A:** Settings → Pluckers → Add a test plucker. Use ID `998`, Name `Test Cloud Sync`, Primary block `All farms`, Bonus eligible OFF, Notes `Cloud sync verification`.
2. **On Device A immediately:** Open the Sheet's `Plucker_Roster` tab. Within ~30 seconds, you should see this test row appear.
3. **On Device B:** Settings → Sync queue → tap "Resync All". Wait for completion.
4. **On Device B:** Settings → Pluckers. The "Test Cloud Sync" plucker (ID 998) should now appear in the list.

**Verify Stage 5 success:** Test plucker appears on both devices.

**Cleanup after Stage 5:** Don't worry about removing the test plucker — it lives at ID 998, far from your real roster (which goes up to ~65). It can stay or you can delete the row from the Plucker_Roster tab in the Sheet later.

---

## What to do if anything misbehaves

**Most common failure:** Stage 5 shows the plucker on Device A but not Device B.

Possible causes:
1. Device B hasn't actually triggered a cloud fetch — try closing and reopening the PWA on Device B.
2. Apps Script v4 isn't deployed correctly — recheck Stage 3.
3. Form push failed silently — check the Sheet's Plucker_Roster tab. If the test plucker isn't there, it never reached the cloud. Look in Settings → Sync queue on Device A — is anything queued?

**Hard rollback:**
- Apps Script: paste v3 code back, redeploy.
- PWA: revert Vercel to the previous deployment.
- The Form and Plucker_Roster sheet tab can stay — they don't break anything.

**If you're stuck:** tell me which Stage failed and what you observed. We'll debug from there.

---

## What changes in your daily workflow

**Before v40b:** Adding a plucker on phone meant exporting JSON, sharing it to tablet, importing on tablet. Three steps, all manual, all error-prone.

**After v40b:** Add a plucker on any device. Within 30 seconds, the row reaches the Sheet. Other devices see it on next cloud fetch (automatic on app open, or manual via Resync All in Settings).

**For Elias and Victor:** they don't do anything different. They keep adding pluckers via the PWA. Their entries flow to the Sheet just like greenleaf, expenses, and poultry do.

**One caveat to know about:**
- Cloud roster is **last-write-wins**. If you add "Vivian" with bonus=true on phone and Elias adds "Vivian" with bonus=false on tablet at the same time, whichever submission Google timestamps later wins. In practice this isn't an issue (you don't add the same plucker twice), but worth knowing.

---

## Files in this build

- `sinonin-ledger-endpoint-v4.gs` — Apps Script with roster reader (deploy in Stage 3)
- `index.html` — PWA v4.0 (deploy in Stage 4)
- `service-worker.js` — Cache v43 (deploy in Stage 4)
- `v40b-deployment-runbook.md` — this file

That's it. No new files for the Form (already exists), no new files for the Sheet (just a new tab).

---

**Right First Time, Stage by Stage. PMI discipline.**
