// Routines — small daily auto-respawning practices.
// XP scales gently: 5 for trivial, 8 for moderate, 10 for demanding.
// All values are in the design doc at docs/plans/2026-05-24-routines-design.md.

export const ROUTINE_PRESETS = [
  // ── Fitness ─────────────────────────────────────────────
  { id: "pushups_20",   title: "20 push-ups",        category: "fitness", xp: 8,  icon: "💪" },
  { id: "walk_8k",      title: "8,000 steps",        category: "fitness", xp: 8,  icon: "🚶" },
  { id: "stretch_10",   title: "Stretch 10 min",     category: "fitness", xp: 5,  icon: "🧎" },
  { id: "cardio_20",    title: "20 min cardio",      category: "fitness", xp: 10, icon: "🏃" },

  // ── Mind ────────────────────────────────────────────────
  { id: "meditate_10",  title: "Meditate 10 min",    category: "mind",    xp: 8,  icon: "🧘" },
  { id: "read_20",      title: "Read 20 pages",      category: "mind",    xp: 8,  icon: "📖" },
  { id: "journal",      title: "Journal entry",      category: "mind",    xp: 5,  icon: "📓" },
  { id: "no_phone_am",  title: "No phone first hr",  category: "mind",    xp: 10, icon: "📵" },

  // ── School ──────────────────────────────────────────────
  { id: "review_notes", title: "Review notes 15min", category: "school",  xp: 8,  icon: "📝" },
  { id: "flashcards",   title: "20 flashcards",      category: "school",  xp: 5,  icon: "🗂️" },
  { id: "read_chapter", title: "Read 1 chapter",     category: "school",  xp: 10, icon: "📚" },
  { id: "practice_30",  title: "Practice 30 min",    category: "school",  xp: 8,  icon: "✏️" },

  // ── Work ────────────────────────────────────────────────
  { id: "inbox_zero",   title: "Inbox to zero",      category: "work",    xp: 8,  icon: "📧" },
  { id: "deep_work_1",  title: "1 hr deep work",     category: "work",    xp: 10, icon: "🎯" },
  { id: "plan_day",     title: "Plan tomorrow",      category: "work",    xp: 5,  icon: "🗓️" },
  { id: "ship_one",     title: "Ship one thing",     category: "work",    xp: 8,  icon: "🚀" },

  // ── Life ────────────────────────────────────────────────
  { id: "floss",        title: "Floss",              category: "life",    xp: 5,  icon: "🦷" },
  { id: "hydrate",      title: "Drink 2L water",     category: "life",    xp: 5,  icon: "💧" },
  { id: "make_bed",     title: "Make the bed",       category: "life",    xp: 5,  icon: "🛏️" },
  { id: "tidy_10",      title: "10 min tidy-up",     category: "life",    xp: 8,  icon: "🧹" },
];

export const MAX_ACTIVE_ROUTINES     = 5;
export const ROUTINE_XP_DAILY_CAP    = 40;
export const ROUTINE_AUTO_UNSUB_DAYS = 7;

export const getRoutinePreset = (presetId) =>
  ROUTINE_PRESETS.find((p) => p.id === presetId) || null;
