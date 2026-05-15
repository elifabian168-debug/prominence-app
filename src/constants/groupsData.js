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

// End-of-today timestamp (used for shared quest deadlines).
const endOfToday = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
};

// ── Seed groups ──
// 1 group the user already founded — visible immediately on GroupsScreen.
export const SEED_GROUPS = [
  {
    id: "g_iron_sun",
    name: "The Iron Sun",
    motto: "Bound by fire.",
    themeColor: "solar",
    crestSeed: "iron-sun-2026",
    founderId: "me",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12, // 12 days ago
    memberIds: ["me", "f2", "f1"],
    pendingInvites: [],
    // Group XP state — seeded so the order doesn't start at Level I.
    // 350 XP places The Iron Sun at Level IV with progress toward V.
    groupXP: 350,
    streakDays: 5,                                      // 5-day collective streak
    lastActivityDate: (() => {                          // yesterday
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString().slice(0, 10);
    })(),
    sharedQuests: [
      {
        id: "sq_iron_1",
        title: "All move 30 min today",
        category: "fitness",
        xpReward: 150,
        participantIds: ["me", "f2", "f1"],
        contributedIds: ["f2"],
        deadline: endOfToday(),
        status: "active",
      },
    ],
  },
];

// ── Seed invites ──
// 1 pending invite TO the user — the Sealed Scroll triggers when GroupsScreen
// opens. Lets the user experience the invitation ceremony immediately.
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

export const MAX_GROUPS_PER_USER = 3;

// ── Group XP system ──
// Only these events award group XP. Personal quest completions DO NOT
// award group XP — they only signal "the order was active today" for the
// streak counter, which awards XP at milestones.
export const GROUP_XP_AWARDS = {
  SHARED_CONTRIBUTION: 25,   // one member marks contributed
  SHARED_COMPLETION:   200,  // all members contributed (bonus on top of quest.xpReward)
  MEMBER_JOIN:         100,  // a new member accepts a summons
  STREAK_MILESTONE:    50,   // every Nth consecutive active day (see interval below)
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
//
// Called from useGameState whenever the user awards XP (any personal quest
// completion). Idempotent within a single calendar day.
export function applyGroupActivityTick(groups, todayKey) {
  if (!groups || groups.length === 0) return groups;
  // Yesterday as YYYY-MM-DD (assumes todayKey() format from utils/date.js)
  const yesterday = (() => {
    const d = new Date(`${todayKey}T00:00:00`);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();
  return groups.map((g) => {
    if (!g.memberIds?.includes("me")) return g;
    if (g.lastActivityDate === todayKey) return g; // already counted today
    const continuing = g.lastActivityDate === yesterday;
    const nextStreak = continuing ? (g.streakDays || 0) + 1 : 1;
    const milestoneXP = nextStreak > 0 && nextStreak % STREAK_MILESTONE_INTERVAL === 0
      ? GROUP_XP_AWARDS.STREAK_MILESTONE
      : 0;
    return {
      ...g,
      lastActivityDate: todayKey,
      streakDays: nextStreak,
      groupXP: (g.groupXP || 0) + milestoneXP,
    };
  });
}
