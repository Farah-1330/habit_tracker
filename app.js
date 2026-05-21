

// ─── State

let habits = [];     
let checks = {};     
let weekOffset = 0;  
let editingId = null; 

// ─── Storage 

function save() {
  localStorage.setItem("streak_habits", JSON.stringify(habits));
  localStorage.setItem("streak_checks", JSON.stringify(checks));
}

function load() {
  try {
    const h = localStorage.getItem("streak_habits");
    const c = localStorage.getItem("streak_checks");
    if (h) habits = JSON.parse(h);
    if (c) checks = JSON.parse(c);
  } catch (e) {
    habits = [];
    checks = {};
  }
}

// ─── Date helpers 

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayStr() {
  return toDateStr(new Date());
}

function getMondayOf(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, …
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays() {
  const today = new Date();
  const monday = getMondayOf(today);
  monday.setDate(monday.getDate() + weekOffset * 7);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatShort(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Streak calculation
function calcStreak(habitId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayKey = toDateStr(today) + "_" + habitId;
  const todayChecked = !!checks[todayKey];

  const startDate = new Date(today);
  if (!todayChecked) {
    startDate.setDate(startDate.getDate() - 1);
  }

  const habit = habits.find(h => h.id === habitId);
  if (!habit) return 0;
  const createdDate = new Date(habit.createdAt);
  createdDate.setHours(0, 0, 0, 0);

  let streak = 0;
  const cursor = new Date(startDate);

  while (cursor >= createdDate) {
    const key = toDateStr(cursor) + "_" + habitId;
    if (checks[key]) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// ─── Render 

function render() {
  const days = getWeekDays();
  const today = todayStr();
  const isFutureWeek = days[0] > new Date(today + "T23:59:59");

  const rangeEl = document.getElementById("weekRange");
  rangeEl.textContent = `${formatShort(days[0])} – ${formatShort(days[6])}`;

  const todayBtn = document.getElementById("goToday");
  if (weekOffset === 0) {
    todayBtn.classList.add("hidden");
  } else {
    todayBtn.classList.remove("hidden");
  }

  const nextBtn = document.getElementById("nextWeek");
  nextBtn.disabled = weekOffset >= 0;
  nextBtn.style.opacity = weekOffset >= 0 ? "0.35" : "1";
  nextBtn.style.pointerEvents = weekOffset >= 0 ? "none" : "auto";

  const emptyState = document.getElementById("emptyState");
  const gridWrapper = document.getElementById("gridWrapper");

  if (habits.length === 0) {
    emptyState.classList.remove("hidden");
    gridWrapper.classList.add("hidden");
    return;
  } else {
    emptyState.classList.add("hidden");
    gridWrapper.classList.remove("hidden");
  }

  // ── Day headers
  const headRow = document.getElementById("dayHeaders");

  while (headRow.children.length > 1) {
    headRow.removeChild(headRow.lastChild);
  }

  days.forEach((day, i) => {
    const ds = toDateStr(day);
    const isToday = ds === today;
    const th = document.createElement("th");
    th.className = "day-header" + (isToday ? " today" : "");
    th.setAttribute("scope", "col");
    th.setAttribute("aria-label", day.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
    th.innerHTML = `
      <span class="day-name">${DAY_NAMES[i]}</span>
      <span class="day-num">${day.getDate()}</span>
    `;
    headRow.appendChild(th);
  });

  const streakTh = document.createElement("th");
  streakTh.className = "streak-header";
  streakTh.setAttribute("scope", "col");
  streakTh.innerHTML = `<span>Streak</span>`;
  headRow.appendChild(streakTh);

  const tbody = document.getElementById("habitRows");
  tbody.innerHTML = "";

  habits.forEach(habit => {
    const tr = document.createElement("tr");
    tr.className = "habit-row";
    tr.setAttribute("data-id", habit.id);

    const nameTd = document.createElement("td");
    nameTd.className = "habit-name-cell";
    nameTd.innerHTML = `
      <div class="habit-name-wrap">
        <span class="habit-name" title="${escHtml(habit.name)}">${escHtml(habit.name)}</span>
        <div class="habit-actions" role="group" aria-label="Actions for ${escHtml(habit.name)}">
          <button class="action-btn rename" data-id="${habit.id}" aria-label="Rename ${escHtml(habit.name)}">✎</button>
          <button class="action-btn delete" data-id="${habit.id}" aria-label="Delete ${escHtml(habit.name)}">✕</button>
        </div>
      </div>
    `;
    tr.appendChild(nameTd);

    days.forEach((day, i) => {
      const ds = toDateStr(day);
      const isToday = ds === today;
      const isFuture = ds > today;
      const key = ds + "_" + habit.id;
      const checked = !!checks[key];

      const td = document.createElement("td");
      td.className = "check-cell" +
        (isToday ? " is-today" : "") +
        (isFuture ? " future" : "");

      const btn = document.createElement("button");
      btn.className = "check-btn" + (checked ? " checked" : "");
      btn.setAttribute("data-key", key);
      btn.setAttribute("aria-label",
        `${checked ? "Uncheck" : "Check"} ${habit.name} for ${DAY_NAMES[i]}`
      );
      btn.setAttribute("aria-pressed", String(checked));
      btn.setAttribute("role", "checkbox");
      btn.innerHTML = `<span class="checkmark" aria-hidden="true">✓</span>`;

      if (!isFuture) {
        btn.addEventListener("click", () => toggleCheck(key, btn));
      }

      td.appendChild(btn);
      tr.appendChild(td);
    });

    const streakTd = document.createElement("td");
    streakTd.className = "streak-cell";
    const streak = calcStreak(habit.id);
    streakTd.innerHTML = `
      <span class="streak-badge ${streak > 0 ? "active" : ""}">
        ${streak > 0 ? `<span class="streak-fire" aria-hidden="true">🔥</span>` : ""}
        ${streak}d
      </span>
    `;
    tr.appendChild(streakTd);

    tbody.appendChild(tr);
  });

  tbody.querySelectorAll(".action-btn.rename").forEach(btn => {
    btn.addEventListener("click", () => openRename(btn.dataset.id));
  });
  tbody.querySelectorAll(".action-btn.delete").forEach(btn => {
    btn.addEventListener("click", () => deleteHabit(btn.dataset.id));
  });
}

// ─── Toggle check

function toggleCheck(key, btn) {
  if (checks[key]) {
    delete checks[key];
    btn.classList.remove("checked");
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("aria-label", btn.getAttribute("aria-label").replace("Uncheck", "Check"));
  } else {
    checks[key] = true;
    btn.classList.add("checked");
    btn.setAttribute("aria-pressed", "true");
  }
  save();

  updateStreakBadges();
}

function updateStreakBadges() {
  document.querySelectorAll(".habit-row").forEach(row => {
    const id = row.dataset.id;
    const streak = calcStreak(id);
    const badge = row.querySelector(".streak-badge");
    if (badge) {
      badge.className = "streak-badge" + (streak > 0 ? " active" : "");
      badge.innerHTML = `
        ${streak > 0 ? `<span class="streak-fire" aria-hidden="true">🔥</span>` : ""}
        ${streak}d
      `;
    }
  });
}

// ─── Modal 

function openModal(title = "New Habit", defaultValue = "") {
  editingId = null; // reset, set externally if renaming
  const overlay = document.getElementById("modalOverlay");
  const input = document.getElementById("habitInput");
  document.getElementById("modalTitle").textContent = title;
  input.value = defaultValue;
  overlay.classList.add("open");
  setTimeout(() => input.focus(), 60);
}

function closeModal() {
  const overlay = document.getElementById("modalOverlay");
  overlay.classList.remove("open");
  editingId = null;
}

function openRename(id) {
  const habit = habits.find(h => h.id === id);
  if (!habit) return;
  editingId = id;
  document.getElementById("modalTitle").textContent = "Rename Habit";
  const input = document.getElementById("habitInput");
  input.value = habit.name;
  document.getElementById("modalOverlay").classList.add("open");
  setTimeout(() => { input.focus(); input.select(); }, 60);
}

function saveModal() {
  const input = document.getElementById("habitInput");
  const name = input.value.trim();
  if (!name) {
    input.focus();
    input.style.borderColor = "var(--danger)";
    setTimeout(() => (input.style.borderColor = ""), 1000);
    return;
  }

  if (editingId) {
    const habit = habits.find(h => h.id === editingId);
    if (habit) habit.name = name;
  } else {
    habits.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      createdAt: new Date().toISOString(),
    });
  }

  save();
  closeModal();
  render();
}

function deleteHabit(id) {
  if (!confirm("Delete this habit? All its check data will be lost.")) return;
  habits = habits.filter(h => h.id !== id);

  Object.keys(checks).forEach(k => {
    if (k.endsWith("_" + id)) delete checks[k];
  });
  save();
  render();
}

// ─── HTML escape

function escHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Event listeners

document.getElementById("openModal").addEventListener("click", () => {
  editingId = null;
  openModal("New Habit", "");
});

document.getElementById("openModalEmpty").addEventListener("click", () => {
  editingId = null;
  openModal("New Habit", "");
});

document.getElementById("modalCancel").addEventListener("click", closeModal);
document.getElementById("modalSave").addEventListener("click", saveModal);

document.getElementById("habitInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveModal();
  if (e.key === "Escape") closeModal();
});

document.getElementById("modalOverlay").addEventListener("click", (e) => {
  if (e.target === document.getElementById("modalOverlay")) closeModal();
});

document.getElementById("prevWeek").addEventListener("click", () => {
  weekOffset--;
  render();
});

document.getElementById("nextWeek").addEventListener("click", () => {
  if (weekOffset < 0) {
    weekOffset++;
    render();
  }
});

document.getElementById("goToday").addEventListener("click", () => {
  weekOffset = 0;
  render();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ─── Init

load();
render();
