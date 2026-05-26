# Responsive desktop layout — design

Make the app look like an actual desktop app on screens ≥ 1024px:
sidebar nav instead of bottom tab bar, expanded content with side-by-side
sections where useful, centered modals instead of bottom sheets.
Mobile UX below the breakpoint is untouched.

## Decisions locked in brainstorming

- **Ambition level:** Option B from the brainstorm — proper desktop layout,
  not a multi-column dashboard.
- **Breakpoint:** `min-width: 1024px`. Phones, narrow tablets, and tablets in
  portrait stay mobile.
- **Sidebar:** always-expanded, 240px wide, persistent. Brand at top, 4 nav
  items in the middle, level + streak in the footer.
- **Top bar:** sticky top of the main content column. Friends button + bell
  in the top-right corner.
- **Content layout:** 2-column where it pays off (Home, You, Circles grid).
  Feed and detail screens stay single-column.
- **Sheets:** center as modals at desktop; bottom sheets only on mobile.
- **Full-screen overlays** (Friend/Group/LifeStats/Routines/AddFriends/Friends):
  render inside the main content column so the sidebar stays visible as
  orientation.

## Architecture

### `src/hooks/useViewport.js` (new)

Single hook reads `window.matchMedia("(min-width: 1024px)")` and updates on
resize:

```js
export function useViewport() {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia("(min-width: 1024px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return { isDesktop };
}
```

### Layout invariant

The *screen components* (HomeScreen, FeedScreen, etc.) don't know whether
they're in mobile or desktop. The shell in `Prominence.jsx` decides the
chrome around them. Two-column reflow inside a screen is the screen's own
concern.

`<TabBar>` renders only when `!isDesktop`. `<Sidebar>` renders only when
`isDesktop`. They never coexist.

## Components

### `Sidebar.jsx` (new)

240px column, full viewport height, `border-right: 1px solid BORDER`.
Three vertical zones:

```
┌────────────────┐
│ ✦ Prominence   │   brand (80px)
├────────────────┤
│ 🏠 Home        │
│ 💬 Feed        │   nav items (44px tall each)
│ 🛡 Circles     │
│ 👤 You         │
│                │
├────────────────┤
│ Lv. 12  🔥 14  │   ambient footer
└────────────────┘
```

Active item: `background: alpha(ACCENT, "12")`, `border-left: 3px solid
ACCENT`, accent-colored label. Inactive: TEXT_MID.

Props: `{ activeTab, onTabChange, level, streak }`. Drop-in replacement for
TabBar callbacks.

### `DesktopTopBar.jsx` (new)

52px tall, sticky inside the main content column. Three slots:

- **Left:** page title ("Home" / "Feed" / "Circles" / "You"). Hidden when a
  screen has its own strong header.
- **Right:** Friends button (`UserPlus` 16px in a 34px circle) + existing
  Notifications bell.

Friends click → opens FriendsScreen overlay (same path as mobile You →
Friends).

### `Prominence.jsx` — shell branch

```jsx
const { isDesktop } = useViewport();

return isDesktop ? (
  <DesktopShell>
    <Sidebar activeTab={activeTab} onTabChange={setActiveTab}
             level={level} streak={state.streak} />
    <main>
      <DesktopTopBar
        title={tabTitle(activeTab)}
        onOpenFriends={() => setShowFriends(true)}
        onOpenNotifs={() => setNotifCenterOpen(true)}
        unreadNotifs={unreadNotifs}
      />
      {/* same active-tab render as today, but with embedded={true} */}
    </main>
  </DesktopShell>
) : (
  /* existing mobile render */
);
```

`<DesktopShell>` is a small wrapper: `display: grid; grid-template-columns:
240px 1fr; min-height: 100vh`.

## Two-column screen reflow

Each screen adds a `display: grid; grid-template-columns: 1fr 1fr; gap: 24px`
branch behind `isDesktop`. Mobile is untouched.

**HomeScreen**
- Weekly Quests: full-width
- Main Quest: full-width
- Today's Quests + Routines: side-by-side
- Hero (greeting + level ring) + social ribbon: stay as-is, full-width

**YouScreen**
- Left col: profile, level, archetype, friends
- Right col: stats, streak, 30-day map, routines

**Circles tab** — list becomes `grid-template-columns: repeat(2, 1fr);
gap: 16px`. Cards keep existing design.

**Feed, GroupDetail, FriendDetail, LifeStats, Routines, AddFriends, Friends**
— single column, centered with existing max-width.

## Sheets at desktop

Each sheet's outer container adopts `isDesktop` branching:

| State    | alignItems   | sheet shape                                    | entry animation |
|----------|--------------|------------------------------------------------|-----------------|
| Mobile   | `flex-end`   | rounded-top corners, flat bottom, full-width  | `fadeUp`        |
| Desktop  | `center`     | full `borderRadius: 24`, capped width ~480     | `fadeIn`        |

Sheets touched: BottomSheet, ContactsSheet, InviteSheet, InviteFriendSheet,
EditProfileSheet, NotificationsSheet, NotificationCenterSheet, TaskActionSheet,
CircleSettingsSheet, TransferOwnershipSheet.

ConfirmDialog already centers; no change.

## `embedded` prop

Per-screen header bits (date-row Notifications bell on Home, "Feed" title
on Feed) duplicate the DesktopTopBar at desktop. Each screen accepts
`embedded={isDesktop}` and hides the redundant header when true.

## Implementation order

1. `useViewport` hook
2. `Sidebar.jsx`
3. `DesktopTopBar.jsx`
4. `Prominence.jsx` shell branch + thread `embedded` to screens
5. Two-column reflow in HomeScreen
6. Two-column reflow in YouScreen
7. 2-col grid for Circles list
8. Center sheets at desktop (one branch per sheet)
9. Hide per-screen Notifications/title when `embedded`
10. Browser test at 1440px, 1024px, 768px, 360px

## Out of scope (v2)

- Sidebar collapse/expand toggle
- Right rail with persistent Feed (Option C from brainstorm)
- Tablet-specific tweaks at 768–1023px
- Reduced-motion alternatives for the layout swap
- Persisting "I last clicked Home" across reloads — `activeTab` stays in-memory
