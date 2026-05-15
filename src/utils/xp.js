import { CATEGORY_BASE_XP, EFFORT_LEVELS, DURATION_LEVELS, WEEKLY_DURATION_LEVELS, DAILY_CATEGORY_CAP, WEEKLY_QUEST_MULTIPLIER, WEEKLY_QUEST_BONUS } from "../constants/questData";

export const getStreakMultiplier = (streak) => {
  if (streak < 3)  return 1.0;
  if (streak < 7)  return 1.1;
  if (streak < 14) return 1.2;
  if (streak < 30) return 1.35;
  return 1.5;
};

export const calculateTaskXP = ({ category, effort, duration, isMainQuest = false, isWeeklyQuest = false, streak = 0 }) => {
  const cat = CATEGORY_BASE_XP[category] || CATEGORY_BASE_XP.life;
  const eff = EFFORT_LEVELS[effort]      || EFFORT_LEVELS.medium;
  const durTable = isWeeklyQuest ? WEEKLY_DURATION_LEVELS : DURATION_LEVELS;
  const durFallback = isWeeklyQuest ? WEEKLY_DURATION_LEVELS.major : DURATION_LEVELS.short;
  const dur = durTable[duration] || durFallback;
  let xp = cat.base * eff.multiplier * dur.multiplier;
  if (isMainQuest) xp += 25;
  xp *= getStreakMultiplier(streak);
  if (isWeeklyQuest) {
    // Weekly quests bypass the per-category ceiling and get a 5× + flat-bonus reward
    return Math.round(xp * WEEKLY_QUEST_MULTIPLIER + WEEKLY_QUEST_BONUS);
  }
  return Math.min(Math.round(xp), cat.ceiling);
};

export const applyDailyCap = (proposedXP, category, categoryXPToday) => {
  const cap = DAILY_CATEGORY_CAP[category] || 400;
  const earnedToday = categoryXPToday?.[category] || 0;
  const remaining = Math.max(0, cap - earnedToday);
  if (remaining <= 0) return 0;
  if (earnedToday + proposedXP > cap) return Math.round(remaining);
  return proposedXP;
};

export const xpForLevel = (level) => Math.floor(100 * Math.pow(1.15, level - 1));

export const formatXP = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));

export const toRoman = (num) => {
  if (!Number.isFinite(num) || num <= 0) return "I";
  const map = [["M",1000],["CM",900],["D",500],["CD",400],["C",100],["XC",90],["L",50],["XL",40],["X",10],["IX",9],["V",5],["IV",4],["I",1]];
  let out = "", n = Math.floor(num);
  for (const [r, v] of map) { while (n >= v) { out += r; n -= v; } }
  return out;
};

// Tier system — named ranks with threshold levels. The threshold level
// triggers the cinematic level-up moment; other levels get the mini card.
const TIERS = [
  { name: "Ascendant", threshold: 50 },
  { name: "Luminary",  threshold: 35 },
  { name: "Sovereign", threshold: 20 },
  { name: "Adept",     threshold: 10 },
  { name: "Acolyte",   threshold: 5  },
  { name: "Initiate",  threshold: 1  },
];

export const getTier = (level) => {
  const tier = TIERS.find(t => level >= t.threshold) || TIERS[TIERS.length - 1];
  return { name: tier.name, threshold: tier.threshold, isThreshold: level === tier.threshold && level > 1 };
};

export const getLevelFromXP = (totalXP) => {
  let level = 1, used = 0;
  while (used + xpForLevel(level) <= totalXP) {
    used += xpForLevel(level);
    level++;
    if (level > 200) break;
  }
  return {
    level,
    xpIntoLevel: totalXP - used,
    xpForNextLevel: xpForLevel(level),
    progress: xpForLevel(level) === 0 ? 0 : (totalXP - used) / xpForLevel(level),
  };
};
