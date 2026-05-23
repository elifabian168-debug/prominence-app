// ── Group themes ──
// Founder picks one of these at creation. The theme tints the group's screens.
export const GROUP_THEMES = {
  solar:    { label: "Solar",   color: "#E8B14A", accent: "#F4C468" },
  crimson:  { label: "Crimson", color: "#C5453E", accent: "#E0635D" },
  verdant:  { label: "Verdant", color: "#5FAE7F", accent: "#86CB9F" },
  onyx:     { label: "Onyx",    color: "#7E7E88", accent: "#A8A8B3" },
  royal:    { label: "Royal",   color: "#7B6EF6", accent: "#9A8FFA" },
};

export const GROUP_THEME_KEYS = Object.keys(GROUP_THEMES);

// ── Crest symbols ──
// 12 deterministic glyphs the crest generator picks from based on crestSeed.
// Each is a small SVG path drawn at ~20px centered around (0,0).
export const CREST_SYMBOLS = [
  // Sun
  { key: "sun",      path: "M0,-9 L0,9 M-9,0 L9,0 M-6.4,-6.4 L6.4,6.4 M-6.4,6.4 L6.4,-6.4", circle: 3.2 },
  // Moon (crescent)
  { key: "moon",     path: "M3,-7 a8,8 0 1,0 0,14 a6,6 0 1,1 0,-14 Z" },
  // Sword (vertical)
  { key: "sword",    path: "M0,-10 L1.6,-7 L1.6,5 L3,5 L3,7 L1.2,7 L1.2,10 L-1.2,10 L-1.2,7 L-3,7 L-3,5 L-1.6,5 L-1.6,-7 Z" },
  // Leaf
  { key: "leaf",     path: "M0,-9 C5,-5 6,5 0,9 C-6,5 -5,-5 0,-9 Z M0,-7 L0,7" },
  // Hammer
  { key: "hammer",   path: "M-6,-7 L6,-7 L6,-2 L-6,-2 Z M-0.8,-2 L-0.8,9 L0.8,9 L0.8,-2 Z" },
  // Star (5-pt)
  { key: "star",     path: "M0,-9 L2.6,-2.8 L9,-2.8 L3.8,1.2 L5.6,8 L0,4 L-5.6,8 L-3.8,1.2 L-9,-2.8 L-2.6,-2.8 Z" },
  // Eye
  { key: "eye",      path: "M-9,0 Q0,-6 9,0 Q0,6 -9,0 Z", circle: 2.4 },
  // Mountain
  { key: "mountain", path: "M-9,7 L-3,-2 L0,2 L3,-5 L9,7 Z" },
  // Wave (3 humps)
  { key: "wave",     path: "M-9,0 Q-6,-4 -3,0 Q0,-4 3,0 Q6,-4 9,0" },
  // Flame
  { key: "flame",    path: "M0,-9 C4,-4 5,0 3,4 C5,4 5,7 0,9 C-5,7 -5,4 -3,4 C-5,0 -4,-4 0,-9 Z" },
  // Key
  { key: "key",      path: "M0,-9 a3,3 0 1,0 0.01,0 Z M0,-6 L0,9 M-2,5 L2,5 M-2,8 L2,8" },
  // Crown
  { key: "crown",    path: "M-9,3 L-6,-5 L-3,1 L0,-7 L3,1 L6,-5 L9,3 L9,7 L-9,7 Z" },
];

// Hash a string → unsigned int (FNV-1a 32-bit). Stable across runs.
export function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

export function getCrestSymbol(seed) {
  return CREST_SYMBOLS[hashSeed(String(seed || "default")) % CREST_SYMBOLS.length];
}

// ── Activity feed event types ──
// Each Circle keeps a chronological log of meaningful events. Feed is capped
// at MAX_FEED_LENGTH (oldest pruned on write).
export const FEED_EVENT_TYPES = {
  MEMBER_JOIN:       "member_join",         // a member accepted an invite
  FOUNDED:           "founded",             // a member founded the Circle
  STREAK_MILESTONE:  "streak_milestone",    // Circle's collective streak hit a milestone
  LEVEL_UP:          "level_up",            // Circle reached a new level
};

export const MAX_FEED_LENGTH = 30;

// Pure helper: prepend an event to a group's activityFeed and trim.
export function pushFeedEvent(group, event) {
  const feed = group.activityFeed || [];
  return {
    ...group,
    activityFeed: [event, ...feed].slice(0, MAX_FEED_LENGTH),
  };
}

// ── Seed groups ──
// 1 group the user already founded — visible immediately on GroupsScreen.
// Seed activity feed timestamps are computed at module load relative to
// `now`, so on first state-init the feed reads "12h ago / 1d ago / ..." etc.
const _seedNow = Date.now();
const _daysAgo = (d) => _seedNow - d * 24 * 60 * 60 * 1000;

const SEED_IRON_SUN_FEED = [
  { id: _daysAgo(1) + 0.2, type: "level_up", timestamp: _daysAgo(1),
    payload: { newLevel: 4 } },
  { id: _daysAgo(2) + 0.3, type: "streak_milestone", timestamp: _daysAgo(2), xpDelta: 50,
    payload: { streakDays: 3 } },
  { id: _daysAgo(8) + 0.6, type: "member_join", actorId: "f1", timestamp: _daysAgo(8), xpDelta: 100,
    payload: { memberId: "f1", memberName: "Jordan" } },
  { id: _daysAgo(10) + 0.7, type: "member_join", actorId: "f2", timestamp: _daysAgo(10), xpDelta: 100,
    payload: { memberId: "f2", memberName: "Sasha" } },
  { id: _daysAgo(12) + 0.8, type: "founded", actorId: "me", timestamp: _daysAgo(12),
    payload: { memberId: "me", memberName: "You", groupName: "The Iron Sun" } },
];

export const SEED_GROUPS = [
  {
    id: "g_iron_sun",
    name: "The Iron Sun",
    motto: "Move every day.",
    themeColor: "solar",
    crestSeed: "iron-sun-2026",
    founderId: "me",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12, // 12 days ago
    memberIds: ["me", "f2", "f1"],
    pendingInvites: [],
    groupXP: 350,
    streakDays: 5,
    lastActivityDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString().slice(0, 10);
    })(),
    activityFeed: SEED_IRON_SUN_FEED,
  },
];

// ── Seed invites ──
// 1 pending invite TO the user.
export const SEED_GROUP_INVITES = [
  {
    groupId: "g_quiet_hand",
    groupName: "The Quiet Hand",
    motto: "Stillness, sharpened.",
    themeColor: "onyx",
    crestSeed: "quiet-hand-2026",
    fromName: "Marcus",
    fromId: "f3",
    invitedAt: Date.now() - 1000 * 60 * 60 * 6,
  },
];

// ── Group XP system ──
// Personal quest completions DO NOT award group XP — they only signal "the
// Circle was active today" for the streak counter, which awards XP at milestones.
export const GROUP_XP_AWARDS = {
  MEMBER_JOIN:         100,  // a new member accepts an invite
  STREAK_MILESTONE:    50,   // every Nth consecutive active day
};

// Award streak milestone XP every N consecutive active days.
export const STREAK_MILESTONE_INTERVAL = 3;

// Mirrors the player XP curve from utils/xp.js so leveling feels familiar.
export const xpForGroupLevel = (level) => Math.floor(100 * Math.pow(1.15, level - 1));

export const getGroupLevelFromXP = (totalXP) => {
  let level = 1, used = 0;
  while (used + xpForGroupLevel(level) <= totalXP) {
    used += xpForGroupLevel(level);
    level++;
    if (level > 200) break;
  }
  const xpForNextLevel = xpForGroupLevel(level);
  return {
    level,
    xpIntoLevel: totalXP - used,
    xpForNextLevel,
    progress: xpForNextLevel === 0 ? 0 : (totalXP - used) / xpForNextLevel,
  };
};

// Pure helper: given a list of groups, advance the "active today" streak
// for any group the user is in. Awards STREAK_MILESTONE XP every Nth day.
// Pushes streak_milestone + level_up events into each affected group's feed.
//
// Called from useGameState whenever the user awards XP (any personal quest
// completion). Idempotent within a single calendar day.
export function applyGroupActivityTick(groups, todayKey) {
  if (!groups || groups.length === 0) return groups;
  const yesterday = (() => {
    const d = new Date(`${todayKey}T00:00:00`);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();
  return groups.map((g) => {
    if (!g.memberIds?.includes("me")) return g;
    if (g.lastActivityDate === todayKey) return g;
    const continuing = g.lastActivityDate === yesterday;
    const nextStreak = continuing ? (g.streakDays || 0) + 1 : 1;
    const milestoneXP = nextStreak > 0 && nextStreak % STREAK_MILESTONE_INTERVAL === 0
      ? GROUP_XP_AWARDS.STREAK_MILESTONE
      : 0;
    const oldXP = g.groupXP || 0;
    const newXP = oldXP + milestoneXP;
    const oldLevel = getGroupLevelFromXP(oldXP).level;
    const newLevel = getGroupLevelFromXP(newXP).level;
    const now = Date.now();

    let updated = {
      ...g,
      lastActivityDate: todayKey,
      streakDays: nextStreak,
      groupXP: newXP,
    };

    if (milestoneXP > 0) {
      updated = pushFeedEvent(updated, {
        id: now + Math.random(),
        type: FEED_EVENT_TYPES.STREAK_MILESTONE,
        timestamp: now,
        xpDelta: milestoneXP,
        payload: { streakDays: nextStreak },
      });
    }
    for (let lv = oldLevel + 1; lv <= newLevel; lv++) {
      updated = pushFeedEvent(updated, {
        id: now + 100 + lv + Math.random(),
        type: FEED_EVENT_TYPES.LEVEL_UP,
        timestamp: now + 1,
        payload: { newLevel: lv },
      });
    }
    return updated;
  });
}
