# Circles + Home + You — Round 2 Design

**Date:** 2026-05-24
**Status:** Approved, ready for implementation
**Builds on:** [2026-05-23-circles-redesign-design.md](./2026-05-23-circles-redesign-design.md)

## Why this exists

The first redesign pass got the social loop working end-to-end but left three loose threads:

1. **Circles still feel like RPG groups.** Each Circle still has its own XP, level, activity feed, and "Order's Ledger" inside the detail screen. That's a vestige of the heraldic era and contradicts the audience-scope model we landed on. Users see a "Lv. III" badge on a Circle and assume Circle-level matters — it doesn't.
2. **Home and You tabs were scaffolded but never built.** Step 2 wired the tabs; the layouts the design doc called for never landed. Home still has the Archetype / Friends / Circles entry trio + an orphaned "In Your Circles" activity stub. You is a one-line pass-through to ProfileScreen.
3. **Friends access lives behind one chokepoint** (the avatar trio on Home, which we're now removing). And the invite ConfirmDialog crashes on accept because of a missing prop from step 1.

## Core mental model — refined

Same single sentence as Round 1, with one substitution:

> *"I have goals. When I finish one, my friends see it. My friends are grouped into **topic-coherent crews** so I can choose who sees what."*

"Topic-coherent crew" replaces the abstract "audience scope" framing. Functionally identical — Circles are still audience scopes — but the framing nudges users toward making meaningful Circles (Run friends, Study group) rather than abstract lists.

## What gets deleted from Circles

Pure subtraction. The Circle becomes *a labeled group of people, a streak, a member list, and an invite button*.

**Code deleted:**
- `FEED_EVENT_TYPES`, `MAX_FEED_LENGTH`, `pushFeedEvent` (no more activity events)
- `GROUP_XP_AWARDS`, `xpForGroupLevel`, `getGroupLevelFromXP`, `STREAK_MILESTONE_INTERVAL`
- `applyGroupActivityTick` (replaced by the new ≥2-posters streak)
- The Ledger section + Lv./Bound/Day vitals + activity feed render on GroupDetailScreen
- The "In Your Circles" mini-feed on Home (showed events we're deleting)
- The `Lv. N` chip on Circle rows in GroupsScreen
- ProfileScreen entirely (absorbed into YouScreen)

**Data fields removed from Circle:** `groupXP`, `lastActivityDate`, `activityFeed`.

**Data fields kept:** `id`, `name`, `motto`, `themeColor`, `audienceMode`, `crestSeed`, `founderId`, `createdAt`, `memberIds`, `pendingInvites`, `streakDays`, plus one new field — `lastStreakDay`.

## The new Circle streak rule

A Circle's streak counts **days where at least 2 distinct members posted to it**.

- Solo Circles (memberIds = ["me"]) can't accrue a streak. UI shows "0" + "Invite someone to start a streak."
- 2-person Circles effectively require both members to post that day. Strict but consistent.
- 3+ person Circles are forgiving — any 2 posters keep it alive.

**Advancement.** When a non-private post lands with one or more `audienceCircleIds`, for each attached Circle: recompute distinct posters today. If the count crosses 2 and `lastStreakDay !== today`:

- `lastStreakDay === yesterday` → `streakDays + 1`, `lastStreakDay = today`
- otherwise → `streakDays = 1`, `lastStreakDay = today`

**Lost state — Snapchat flavor.** When the gap between today and `lastStreakDay` exceeds 1 day, the streak is dead. UI shows the **old number, muted color, "STREAK LOST" in small caps** beneath it. The `streakDays` value persists in storage until a new qualifying day overwrites it, so the visual state survives across sessions until the user revives it.

**Reset on revive.** The next qualifying day cleanly replaces the lost display with a fresh `1` and a bright flame.

## New Circle detail layout

Single scroll:

```
← Circles                                  ⚙

         The Iron Sun
         "Move every day."

              🔥
              12
           day streak

  Members · 3
  ┌──────────────────────┐
  │ 👤  You      Warrior │
  │ 👤  Sasha   Warrior 👑│
  │ 👤  Jordan  Scholar  │
  └──────────────────────┘

  + Invite a friend
```

Order: header → Circle name → tagline → streak hero → members → invite CTA. No level. No activity. No XP. Settings gear top-right opens a sheet (rename, leave, audienceMode info).

## New Home layout

Single scroll, top to bottom:

1. **Greeting + compact streak + bell.** Level ring on the right (tap → You tab, no XP numbers shown).
2. **Social ribbon — "Friends today".** Horizontal scroll of up to 6 post mini-cards from the last 24h, excluding self. Each: avatar + one-line activity. Tap → post sheet (cheer/comment inline). "See all →" routes to Feed tab. Fixed height ~80px.
3. **Today** — daily task list.
4. **This Week** — weekly quest cards (kept all week per the prior fix).
5. **Big Goal** — main quest card.
6. **Floating + button** — opens TaskCreateModal.

**Empty-ribbon CTA.** When zero friends posted in 24h, the ribbon stays visible as a single full-width card:

```
👋  Add a friend to see what they're up to →
```

Tap → AddFriendsScreen. This is the deliberate alternative to a permanent corner "+friend" icon — same discoverability win, zero cost when not needed.

**Deletions from current Home:**
- Archetype / Friends / Circles entry trio
- Friend Streaks pill row (moves to FriendDetail only)
- "In Your Circles" activity stub

## New You tab layout

Single scroll, top to bottom. Settings gear top-right opens a sheet.

```
                              ⚙
        ┌─────────┐
        │   E     │
        └─────────┘
          Eli Fabian
          ⚜ Warrior

—— Level —————————————————————————
   ⚪ Lv 7 · 1,840 / 2,300 XP

—— Stats —————————————————————————
   Strength    ████████░░  640
   Intellect   ████░░░░░░  280
   ...

—— Friends ———————————————————————
   () () () () () (+)  +12   see all →

—— Streak ———————————————————————
   🔥 5    longest 14
   [30-day month heatmap]
```

**Section order:** Hero → Level → Stats → **Friends → Streak**. Friends sits above Streak because the access gap is what's most pressing.

**Friends section.** 5 avatar bubbles + remaining count + a "+" bubble at the end (third entry point for adding friends, alongside Home empty-ribbon and Feed empty state). "See all →" opens FriendsScreen with a back-label of "You".

**Streak section.** Personal streak (current + longest) plus a **30-day month grid** heatmap of posted days. Tighter than 90 days, easier to render (~5×6 grid), matches the natural "how was my month" scan.

**Settings gear sheet contents:** Edit Profile, Notifications, Theme toggle, Reset progress, Sign out / delete data.

## Invite flow fixes

Three bugs to address in a single commit.

**Bug 1 — ConfirmDialog crash.** The dialog at the invite-accept site passes no `icon` prop. `ConfirmDialog` unconditionally renders `<Icon size={20} ...>`, which evaluates to `<undefined>` and breaks the dialog header (and possibly cascades).

Fix: pass `Users` icon at the invite call site. Also guard ConfirmDialog itself against missing icons so future call sites don't crash.

**Bug 2 — Post-accept lands on a blank Circle.** Suspected: the `joined` object returned by `acceptInvite` is missing fields the new GroupDetailScreen needs (e.g. it might not have `audienceMode` if the seed invite doesn't include one).

Fix: verify field shape during implementation; ensure the returned object matches what gets pushed into `state.groups`.

**Bug 3 — Mock invites don't reciprocate.** When you invite Jordan, Jordan never appears as a member.

Fix: in `inviteFriend`, schedule a `setTimeout` (5–8 seconds) that promotes the pending invite to membership and toasts "Jordan joined the Circle." Cleaned up on unmount.

## Cutover order

Five commits. Each shippable independently.

**Step 9 — Strip Circle XP, level, activity feed.** Pure subtraction. Touches many files but each touch is small.

**Step 10 — Circle streak (≥2 posters), with at-risk + lost states.** New advancement logic in useGameState. New Circle detail hero. `lastStreakDay` field added with migration.

**Step 11 — Invite flow fixes.** Three small bugs bundled.

**Step 12 — Home redesign.** Social ribbon at top with empty-state CTA. Strip trio + friend-streaks row.

**Step 13 — You tab build + Friends access.** Real YouScreen with Hero / Level / Stats / Friends / Streak (30-day grid). Settings gear sheet. Delete ProfileScreen.

## Non-goals (explicit)

- No photos on posts (still v2)
- No persistent corner Add-Friend button on Home (contextual entries instead)
- No 90-day streak grid (30-day month instead)
- No multi-poster Circles (still creator-only — v2)
- No editing a Circle's `audienceMode` after creation
- No "friend suggestions" / discovery network
- No drilldown from per-archetype Stat rows into contributing goals (deferred)
