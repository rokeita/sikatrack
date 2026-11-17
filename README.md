# SikaTrack

Simple bookkeeping for Ghanaian small businesses. Record today's sales and
expenses, see profit at a glance, and check weekly and monthly summaries.

## What it does (v0.2 — installable app)

- Today's sales, expenses and profit in GH₵
- Add Sale / Add Expense with categories, an optional note and a date
- History grouped by day, with delete
- Weekly (Mon–Sun) and monthly summaries
- Installable on Android: add to Home screen, opens full-screen like an app, works offline (manifest + service worker)
- Sample entries on first run, clearly marked SAMPLE, clearable with one button
- All records stay in the browser's local storage — offline, nothing is sent anywhere

## Run it

No build step, no install. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

then open http://127.0.0.1:8000

On Android Chrome, tap the ⋮ menu → "Add to Home screen" to install it.

## Stack

Plain HTML, CSS and JavaScript. No framework, no dependencies — chosen so it
runs anywhere, including a phone, with zero toolchain.

## Next ideas

- Edit an entry instead of delete + re-add
- Monthly profit chart
- Export records as CSV
- Shop name + currency settings
