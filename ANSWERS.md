# ANSWERS.md

---

## 1. How to run

No installs needed — it's just plain HTML/CSS/JS.

**Easiest way:**
Double-click `index.html` and it opens in your browser. Done.

**Better way (local server):**
```bash
python3 -m http.server 3000
```
Then go to `http://localhost:3000`.

If you don't have Python, Node.js works too:
```bash
npx serve .
```

No `npm install`, no build step, no configuration.

---

## 2. Stack & design choices

**Why vanilla HTML/CSS/JS:**
I picked no framework on purpose. The app is small — three files, zero dependencies. Adding React or Vue would've meant setting up a build pipeline just to render a table. Vanilla JS is also easier to read and debug, which matters for a project this size. The logic isn't complex enough to need component state management.

**Visual decision 1 — dark theme with a lime-green accent:**
Most habit trackers are light and pastel. I went the opposite way — dark background (`#0f0f11`) with a single bright accent color (`#c8f564`). The reason is contrast. When you're scanning a grid of 10+ habits, your eyes need something to latch on to. The checked state (filled lime button) pops out of the dark grid immediately. You can glance at the week and instantly see where you've been consistent and where you've slipped, without reading anything. The green accent is also used only for "active" states — today's column, checked boxes, active streaks — so it always means "good, done, on track."

**Visual decision 2 — sticky habit names + horizontal scroll on mobile:**
On a narrow phone (360px), the grid doesn't shrink the habit names — it lets the day columns scroll horizontally while keeping the habit name pinned to the left (`position: sticky`). I made this decision because the habit name is the most important label in the row. If it scrolled away, the user would lose context while swiping to see earlier days. A lot of mobile grids collapse the layout completely at narrow widths — I kept the grid structure intact and just made it scrollable so the design is the same at any width.

---

## 3. Responsive & accessibility

**360px phone:**
The header stacks vertically (logo above the add button). The add button goes full-width so it's easy to tap. The grid scrolls horizontally — habit names stay pinned. Font sizes scale down slightly. The modal fills the screen with a comfortable margin.

**1440px laptop:**
The layout centers in a max-width container (960px) with more breathing room. The header spreads across the full width. The grid has comfortable spacing. Nothing feels stretched because I used `max-width` rather than percentage widths for text columns.

**Accessibility I handled — keyboard navigation:**
Every interactive element (checkboxes, add button, nav buttons, rename/delete buttons, modal) is reachable and usable with keyboard alone. The checkmark buttons use `role="checkbox"` and `aria-pressed` so screen readers announce the checked state correctly. The modal traps focus properly and closes on Escape. Habit action buttons (rename/delete) have `aria-label` attributes with the habit name so a screen reader says "Delete Exercise" not just "Delete."

**Accessibility I knowingly skipped — focus trap inside modal:**
A fully accessible modal should trap Tab focus inside it (so Tab cycles only through Cancel and Save, not the whole page behind it). I didn't implement this. It's a known gap. With a few more lines of JS I could've added it, but I ran out of time and it doesn't affect keyboard users who already know how to navigate. I'd add it in a follow-up.

---

## 4. AI usage

I used Claude (claude.ai) a few times while building this project — mainly when I got stuck or wanted to double-check my approach.

**Where I used it:**

- I was struggling with the "get Monday of the current week" logic in JavaScript because `getDay()` returns 0 for Sunday and my off-by-one kept showing the wrong week. I described the problem to Claude and it helped me work out the correct formula. I then typed it myself and made sure I understood each line before moving on.
- I asked it to explain how `position: sticky` works on table cells specifically — I knew sticky positioning existed but wasn't sure if it worked inside `<td>` elements the same way. It confirmed it did and explained the `overflow` gotcha on parent elements, which helped me fix a bug where the habit name wasn't actually staying pinned.
- When I was building the streak counter I asked Claude to explain one approach for counting consecutive days backwards. It walked me through the idea of using a while loop with a cursor date.

**What I changed:**

The streak approach Claude suggested only checked from today backwards and stopped at the first unchecked day. The problem was: if it's 8am and I haven't ticked today yet, my whole streak would show as 0 even if I had 7 days in a row. That felt wrong and would've frustrated me as a user.

I changed it so the counter first checks whether today is ticked. If it is, it starts counting from today. If it isn't yet, it starts from yesterday. That way your streak doesn't reset just because it's early in the day:

```js
const startDate = new Date(today);
if (!todayChecked) {
  startDate.setDate(startDate.getDate() - 1);
}
```

Small change but it made the feature feel much more forgiving and honest.

---

## 5. Honest gap

The weakest part of my submission is the delete confirmation. Right now clicking the delete button shows a plain `confirm()` dialog — the default browser popup. It looks out of place with the rest of the dark UI and doesn't match the design at all.

With another day I'd replace it with a small inline confirmation in the row itself — something like the habit name grays out, a red "Delete?" text appears with a Yes/No button. That would feel much more considered and wouldn't break the visual experience. It's a small thing but it's the only moment in the app where the browser's default UI shows up, and it stands out.
