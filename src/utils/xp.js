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
