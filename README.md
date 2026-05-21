# streak. — Habit Tracker

A clean, minimal weekly habit tracker. Add habits, tick them off each day, and watch your streaks grow.
---

## How to run

No build step, no dependencies — it's plain HTML, CSS, and JavaScript.

**Option 1 — just open it:**
```
open index.html
```
Double-click `index.html` in your file manager, or drag it into any browser.

**Option 2 — local server (recommended, avoids any browser security warnings):**

If you have Python installed:
```bash
cd habit-tracker
python3 -m http.server 3000
```
Then open `http://localhost:3000` in your browser.

Or with Node.js:
```bash
npx serve .
```

That's it. No installs, no `npm install`, nothing else needed.

---

## What it does

- Add, rename, and delete habits
- Weekly grid — habits on the left, days of the week across the top
- Click any cell to toggle a checkmark
- Today's column is highlighted so you always know where you are
- Streak counter per habit (consecutive days including today if checked)
- Navigate to previous weeks and see historical data
- Everything saves to `localStorage` — survives page reloads

---

## Stack

Vanilla HTML + CSS + JavaScript. No frameworks, no build tools. Just three files.
