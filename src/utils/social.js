import { dayOffset } from "./date";

export const advanceFriendStreaks = (current = {}, today, friendActiveDays = {}) => {
  const next = { ...current };
  let changed = false;
  for (const fid in next) {
    const s = next[fid];
    if (s.lastBoth === today) continue;
    const friendActiveToday = friendActiveDays[fid] === today;
    if (!friendActiveToday) continue;
    const yesterday = dayOffset(-1);
    const newCount = s.lastBoth === yesterday ? s.count + 1 : 1;
    next[fid] = { count: newCount, lastBoth: today, aliveToday: true };
    changed = true;
  }
  return changed ? next : current;
};
