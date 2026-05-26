# Routines — design

Daily auto-respawning practices that sit below Today's Quests on Home.
Lighter weight than tasks: small XP, per-routine streaks, no Feed posts,
no impact on the main user streak.

## Decisions locked in brainstorming

- **Name:** Routines
- **Placement:** new section on Home, directly below Today's Quests
- **Lifecycle:** auto-respawn each day (subscription model, not one-shot)
- **Library:** preset-only for v1 (~20 curated entries across 5 categories)
- **Active cap:** 5 subscriptions at a time
- **XP per completion:** fixed by preset, range 5–10
- **XP routing:** adds to `totalXP` + `categoryXP`, *bypasses* `categoryXPToday`
- **Daily routine XP cap:** 40 XP/day across all routines
- **Streak:** per-routine only; does **not** feed the main user streak
- **Stakes on miss:** the per-routine streak resets to 0. No XP deduction.
- **Auto-unsubscribe:** any routine not completed for 7 consecutive days is dropped
- **Social:** completions do not create Feed posts and do not advance Circle streaks

## Data model

### `src/constants/routinesData.js` (new, static)

```js
export const ROUTINE_PRESETS = [
  // Fitness
  { id: "pushups_20",   title: "20 push-ups",        category: "fitness", xp: 8,  icon: "💪" },
  { id: "walk_8k",      title: "8,000 steps",        category: "fitness", xp: 8,  icon: "🚶" },
  { id: "stretch_10",   title: "Stretch 10 min",     category: "fitness", xp: 5,  icon: "🧎" },
  { id: "cardio_20",    title: "20 min cardio",      category: "fitness", xp: 10, icon: "🏃" },
  // Mind
  { id: "meditate_10",  title: "Meditate 10 min",    category: "mind",    xp: 8,  icon: "🧘" },
  { id: "read_20",      title: "Read 20 pages",      category: "mind",    xp: 8,  icon: "📖" },
  { id: "journal",      title: "Journal entry",      category: "mind",    xp: 5,  icon: "📓" },
  { id: "no_phone_am",  title: "No phone first hr",  category: "mind",    xp: 10, icon: "📵" },
  // School
  { id: "review_notes", title: "Review notes 15min", category: "school",  xp: 8,  icon: "📝" },
  { id: "flashcards",   title: "20 flashcards",      category: "school",  xp: 5,  icon: "🗂️" },
  { id: "read_chapter", title: "Read 1 chapter",     category: "school",  xp: 10, icon: "📚" },
  { id: "practice_30",  title: "Practice 30 min",    category: "school",  xp: 8,  icon: "✏️" },
  // Work
  { id: "inbox_zero",   title: "Inbox to zero",      category: "work",    xp: 8,  icon: "📧" },
  { id: "deep_work_1",  title: "1 hr deep work",     category: "work",    xp: 10, icon: "🎯" },
  { id: "plan_day",     title: "Plan tomorrow",      category: "work",    xp: 5,  icon: "🗓️" },
  { id: "ship_one",     title: "Ship one thing",     category: "work",    xp: 8,  icon: "🚀" },
  // Life
  { id: "floss",        title: "Floss",              category: "life",    xp: 5,  icon: "🦷" },
  { id: "hydrate",      title: "Drink 2L water",     category: "life",    xp: 5,  icon: "💧" },
  { id: "make_bed",     title: "Make the bed",       category: "life",    xp: 5,  icon: "🛏️" },
  { id: "tidy_10",      title: "10 min tidy-up",     category: "life",    xp: 8,  icon: "🧹" },
];

export const MAX_ACTIVE_ROUTINES   = 5;
export const ROUTINE_XP_DAILY_CAP  = 40;
export const ROUTINE_AUTO_UNSUB_DAYS = 7;
```

### State additions on `useGameState`

```js
state.routines = [
  {
    presetId: "meditate_10",
    subscribedAt: 1748000000000,
    streak: 12,
    longestStreak: 30,
    lastCompletedDay: "2026-05-24", // YYYY-MM-DD or null
    completedToday: false,
  },
  // ...up to 5
];

state.routineXP      = 0; // lifetime, for You-tab display
state.routineXPToday = 0; // resets daily, enforces the 40-XP cap
```

### Hydration / migration

In the existing migration block in `useGameState.js`:

```js
if (!parsed.routines)            parsed.routines = [];
if (parsed.routineXP      === undefined) parsed.routineXP      = 0;
if (parsed.routineXPToday === undefined) parsed.routineXPToday = 0;

// Safety net: drop subscriptions whose preset no longer exists
const validIds = new Set(ROUTINE_PRESETS.map(p => p.id));
parsed.routines = parsed.routines.filter(r => validIds.has(r.presetId));
```

## Mutations

### `completeRoutine(presetId)`

1. Locate the routine. If missing or `completedToday`, no-op.
2. Compute awarded XP: `min(preset.xp, max(0, ROUTINE_XP_DAILY_CAP - routineXPToday))`.
3. Advance streak:
   - `yesterday = today - 1 day`
   - `streak = (lastCompletedDay === yesterday) ? streak + 1 : 1`
   - `longestStreak = max(longestStreak, streak)`
   - `lastCompletedDay = today`
   - `completedToday = true`
4. Route XP:
   - `totalXP        += awardedXP` (may trigger level-up)
   - `categoryXP[cat] += awardedXP`
   - `categoryXPToday` **unchanged**
   - `routineXP        += awardedXP`
   - `routineXPToday   += awardedXP`
   - `activityLog[today].xp += awardedXP`, `count += 1`
5. **Do not** create a Post.
6. **Do not** call `computeStreakDelta` (no main streak update).
7. **Do not** call `advanceCircleStreaks`.
8. Toast: standard XP gain toast. If `awardedXP === 0`, toast "Daily routine XP cap reached — routine completed".

### `subscribeRoutine(presetId)`

- Reject if already subscribed or `routines.length >= MAX_ACTIVE_ROUTINES`.
- On reject (full): toast "Routine slots full — unsubscribe one first."
- On accept: push `{ presetId, subscribedAt: now, streak: 0, longestStreak: 0, lastCompletedDay: null, completedToday: false }`.

### `unsubscribeRoutine(presetId)`

- Removes the routine. XP previously awarded is **not** reversed.

## Daily rollover

Extends the existing `lastResetDate !== todayKey()` block in `useGameState.js`
(both the hydration check and the 60-second interval).

```js
state.routineXPToday = 0;

state.routines = state.routines
  .map(r => ({
    ...r,
    streak: (r.lastCompletedDay === yesterday) ? r.streak : 0,
    completedToday: false,
  }))
  .filter(r => {
    const ref = r.lastCompletedDay || dayKey(r.subscribedAt);
    return daysBetween(ref, today) < ROUTINE_AUTO_UNSUB_DAYS;
  });
```

If any routines were filtered out, batch-toast: `"N routine(s) went cold — unsubscribed"`.

## UI

### HomeScreen

New section directly below Today's Quests:

```
── Routines ──                          [Manage]
  ☐ 🧘 Meditate 10 min   · 🔥 12  +8
  ☐ 📖 Read 20 pages     · 🔥  4  +8
  ✓ 💪 20 push-ups       · 🔥 30
  ☐ 💧 Drink 2L water    · 🔥  0  +5
                                   22 / 40 today
```

- Tap row → mark complete instantly, no confirm.
- Completed rows: dimmed, checkmark, no XP chip.
- Empty state: single tappable card "Add daily Routines →" → opens RoutinesScreen.
- [Manage] link at section header → RoutinesScreen.

### RoutinesScreen (new)

Two tabs:

**My Routines**
- List of subscriptions with: icon, title, streak, longest streak, XP value.
- Trailing menu / long-press → Unsubscribe.

**Library**
- Grouped by category (Fitness / Mind / School / Work / Life).
- Each preset card: icon, title, XP. Tap toggles subscription.
- If slots full, attempting to subscribe shows the slots-full toast.

Reachable only via the Home [Manage] link or the empty-state card.
No bottom-nav slot — Routines remain a sub-feature of Home.

### YouScreen

One new stat row:

> Routine XP: 1,240 · longest streak: 30 (Meditate)

## Out of scope (v2 ideas)

- Custom user-created routines
- Per-routine reminder times
- Routine "combo bonus" for completing all in one day
- Weekly summary post on the Feed
- Routine completion history graph
