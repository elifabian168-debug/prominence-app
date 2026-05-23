# Circles Redesign — Design Doc

**Date:** 2026-05-23
**Status:** Approved, ready for implementation

## Why we're doing this

User testing revealed four overlapping problems with the current app:

1. **Too many concepts** — XP, archetypes, daily tasks, weekly quests, main quest, streaks, Orders, sealed scrolls, crests. New users couldn't tell what mattered first.
2. **Unfamiliar vocabulary** — heraldic terms were charming but slowed comprehension.
3. **Unclear core loop** — testers didn't know what to *do* day-to-day after onboarding.
4. **No social pull** — the app felt like solo journaling; nothing brought users back.

This redesign treats the four problems as one: **make the social loop the spine of the app, and strip everything that doesn't serve it.**

## Core mental model (the whole app in one sentence)

> "I have goals. When I finish one, my friends see it. My friends are grouped into Circles so I can choose who sees what."

Everything else is opt-in depth, hidden behind the You tab.

## Information architecture

Four bottom tabs. Settings live in a top-right gear on the You tab.

1. **Home** — your day. Today's goals, level bar, social ribbon, quick-add.
2. **Feed** — the witness feed. Friends + Circles activity, reverse chronological.
3. **Circles** — list of your circles, members, default audience.
4. **You** — profile, archetype, stats, level history.

## Vocabulary changes

| Old | New | Notes |
|---|---|---|
| Orders | **Circles** | |
| Sealed Scroll | **Invite** | Drop the ceremony |
| Quests / Tasks / Weekly Quests / Main Quest | **Today / This Week / Big Goal** | Plain English on Home; data model can keep current names |
| Crest | (kept, You tab only) | Personal identity aesthetic, not social UI |
| Archetype | (kept) | Distinctive; not required to start using app |

Heraldic flavor survives **only** on the You tab as personal identity. All social and goal-management surfaces use plain English.

## Removed entirely

- Shared quests inside groups (Circles are audience scope, not co-goal containers)
- 3-Circle cap (no cap; gentle suggestion past ~12)
- Heraldic crests on Circles rows (Circles use a simple emoji + color)
- Sealed scroll ceremony
- Per-group themes UI
- The QuestsScreen (folded into Home)
- LifeStatsScreen (folded into You)

## The daily loop

```
Add a goal → complete it → it auto-posts to its Circle → friends see it in their feed → they cheer/comment
```

- **Auto-post on completion** is the default. Completing IS sharing.
- A one-tap **audience override** lets you re-pick which Circle(s) before it sends, or mark **Private** (skips posting, no streak credit that day).
- **Streaks** are a social signal: they increment only on days you have ≥1 posted completion. Private-only days don't break or build the streak.

## Circles model (the key innovation)

**One concept, one toggle.** At creation, the creator picks how the audience is shown to its members:

| Setting | What members see | Use case |
|---|---|---|
| **Private label** (default) | "Shared with you, Jay, Sam" (avatars) | Personal audience lists — "Close friends", "People I want to impress" |
| **Shared name** | "Shared in 🏃 Morning Run Crew" | Named crews — Run Club, Roommates, Book Club |

**Behavior in both modes:**
- Only the creator posts to a Circle in v1 (multi-poster Circles is a natural v2)
- No leaderboards, no shared quests, no challenges — cheers + short comments only
- The creator owns the Circle; only they can rename, recolor, or delete

**Behavior unique to shared-name Circles:**
- Members see the Circle on their own Circles tab, marked "joined" (vs. "yours")
- Members can see the full member list
- Members can leave (creator gets notified)

**Behavior unique to private-label Circles:**
- The creator's chosen name/emoji/color are never exposed to members
- Members see only co-recipient avatars on individual posts
- Members do not see private-label Circles on their Circles tab

**Critical constraint:** the visibility toggle is set at creation and **not changeable later** (changing it would leak the label).

**Privacy guarantee:** in both modes, every recipient always knows who else is in the audience for *that specific post* — via either the shared name (and member list) or the co-recipient avatars. Audience is always honest at the post level; only the *semantic label* the creator gave the Circle is private.

**No cap on number of Circles.** Soft hint past ~12.

## Screen-by-screen

### Home

Single scroll, top to bottom:

1. **Greeting + compact level ring/bar.** Tap ring → You tab. No XP numbers shown.
2. **Social ribbon** — horizontal scroll of 4–6 avatar bubbles of friends who posted in last 24h, each with a one-line activity. Tap to open in a sheet (cheer / comment). "See all →" jumps to Feed. Empty state: "No activity yet — invite a friend."
3. **Today** — daily goals as checkable rows. Each row shows title + assigned-Circle chip. Long-press: audience override / mark private / edit.
4. **This Week** — collapsible. One row per weekly goal with progress bar.
5. **Big Goal** — one card, title + progress, tap to expand.
6. **Floating "+ Add goal"** bottom-right.

Notifications bell top-right. **No** archetype card, stat-XP breakdown, streak count, or group invites on Home.

### Feed

Reverse-chronological, single column.

- Header: "Feed" + filter chip row: `All · [Circle A] · [Circle B] · …`
- Post card: avatar, name, time, "completed **[Goal Title]**", optional user one-liner, footer with Cheer + Comment + audience chip
- **Text-only** posts. No photos in v1.
- **Cheer**: one-tap, no reaction picker
- **Comments**: short text, one level deep, no nested replies
- Pull to refresh; "↑ 3 new" pill for new activity
- Self-posts appear in your own feed (editable/deletable for 5 min)
- Empty state: "Your feed is quiet. Invite a friend or join a Circle."

**No leaderboards, no streak-of-others, no XP-of-others.** The feed shows what people are *doing*, not how they're *ranked*.

### Circles

- Search/filter + "+ New Circle"
- Row: emoji + color dot, name, member count, latest-activity preview, unread dot
- Tap → detail: members grid, scoped Activity feed, Settings (top-right), Invite button
- Create flow: name → emoji + color → **visibility toggle** ("Show name to members?") → add members
- Visibility toggle copy: *"Want everyone to see the name? Good for named crews like 'Run Club.' Off by default."*

### You

- Header: avatar, name, archetype + small crest (only place heraldic visuals appear)
- **Level & XP** section: level ring, XP into next level, total XP, tap → history
- **Stats** section: per-archetype stat bars, tap → contributing goals
- **Streaks** section: current streak, longest, 90-day calendar grid
- Top-right gear → Settings (account, notifications, theme, sign out, delete data)
- **No goal management here** — goals are edited on Home

**XP numbers never appear outside the You tab.** Curious players find them; new users never have to learn them.

## Onboarding (three screens, ~1 minute total)

1. **Name + photo** — first name (optional last), photo or avatar pick
2. **First goal** — single text input + daily/weekly/big radio (default daily). Skippable.
3. **Invite or skip** — contacts / share link / skip

Then drop the user into Home.

**Deliberately removed from onboarding:**
- Archetype picker (archetype emerges from activity; first reveal is a celebratory moment after ~5 completions)
- XP and level explanation (never explained, just shown)
- Circle creation (own tap-target when ready)
- Notification permission (asked contextually the first time something will notify)

**Empty-state coaching, not modals.** If a feature needs a tutorial, the feature is too complex.

## Data model changes

**New entity — `Post`:**
```
{
  id,
  authorId,
  goalRef,           // ref to the completed goal
  body?,             // optional user one-liner
  audienceCircleIds: string[],
  audienceMode: 'private' | 'shared',  // snapshot of Circle's mode at post time
  createdAt,
  cheers: { userId, at }[],
  comments: { id, userId, text, at }[],
}
```

**Changes to `Circle` (formerly Group):**
- Add `audienceMode: 'private' | 'shared'` (set at creation, immutable)
- Remove `crest`, `theme`, `sealedScroll*`, `sharedQuests`

**Streak logic:** increment on days with ≥1 non-private posted completion.

## Cutover order

Each ~½ day of work, mergeable independently.

1. Vocab + delete heraldic UI (rename to Circles, drop scrolls/crests)
2. Tab bar to 4 tabs, scaffold You + Feed
3. Post model + auto-post on completion (default Circle, audience picker)
4. Feed screen with cheers
5. Comments
6. Circle visibility toggle + named-Circle member behavior
7. Onboarding shrink to 3 screens
8. Streak → posted-only

## Files to delete

- `src/components/groups/SealedScroll.jsx`
- `src/components/groups/SharedQuestCreateSheet.jsx`
- `src/screens/QuestsScreen.jsx` (fold into Home)
- `src/screens/LifeStatsScreen.jsx` (fold into You)
- Group themes / crests in `src/constants/groupsData.js`
- 3-Circle cap in `src/hooks/useGroups.js`

## Files to rename

- `useGroups` → `useCircles`
- `GroupsScreen` → `CirclesScreen`
- `GroupDetailScreen` → `CircleDetailScreen`
- `CreateGroupScreen` → `CreateCircleScreen`

## Files to build

- `FeedScreen.jsx`
- `YouScreen.jsx` (merges Profile + Stats + LifeStats)
- `useFeed` hook
- Audience-picker chip component
- Co-recipient avatar row component
- Circle visibility toggle UI in CreateCircle flow

## Non-goals (explicit)

- No photos on posts in v1
- No reactions beyond a single cheer
- No nested comment threads
- No leaderboards, anywhere
- No multi-poster Circles (only creator posts)
- No public/discoverable Circles
- No "people you may know" or algorithmic feed
- No editing a Circle's visibility mode after creation
