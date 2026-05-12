import { useState, useEffect } from 'react';
import { STORAGE_USER, STORAGE_STATE } from '../constants/storage';
import { CATEGORIES } from '../constants/categories';
import { MONTHLY_QUESTS } from '../constants/questData';
import { todayKey } from '../utils/date';
import { getLevelFromXP, applyDailyCap } from '../utils/xp';
import { advanceFriendStreaks } from '../utils/social';
import { getInitialState } from '../utils/state';
import { SEED_FRIENDS } from '../constants/socialData';
import { TEXT_MID } from '../constants/theme';

export function useGameState({ showToast, onLevelUp, onXpGain, onMonthlyBadge }) {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_USER);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const [state, setState] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_STATE);
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed.lastResetDate !== todayKey()) {
          // Fail all pending daily tasks and main quest from the previous day
          const pendingTaskCount = (parsed.tasks || []).filter(t => t.status === "pending").length;
          const mainPending = parsed.mainQuest?.status === "pending" ? 1 : 0;
          parsed.tasks = (parsed.tasks || []).map(t =>
            t.status === "pending" ? { ...t, status: "failed" } : t
          );
          if (parsed.mainQuest?.status === "pending") {
            parsed.mainQuest = { ...parsed.mainQuest, status: "failed" };
          }
          if (parsed.completedHistory) {
            parsed.completedHistory = {
              ...parsed.completedHistory,
              failed: (parsed.completedHistory.failed || 0) + pendingTaskCount + mainPending,
            };
          }
          parsed.lastResetDate = todayKey();
          parsed.categoryXPToday = { fitness: 0, school: 0, life: 0, work: 0, mind: 0 };
        }
        if (!parsed.friends) parsed.friends = SEED_FRIENDS;
        // Migrate older saved state for new fields
        if (!parsed.weeklyQuests) parsed.weeklyQuests = [];
        if (parsed.lastWeeklyReminderDate === undefined) parsed.lastWeeklyReminderDate = null;
        if (!parsed.notifications) parsed.notifications = {};
        if (parsed.notifications.weeklyQuestReminder === undefined) parsed.notifications.weeklyQuestReminder = true;

        // Self-heal: prior versions could leave categoryXP/statXP totals exceeding totalXP
        // after deleting daily-capped or rapidly-completed quests. Clamp each bucket so the
        // sum across categories never exceeds totalXP.
        const clampBuckets = (buckets, total) => {
          const sum = Object.values(buckets || {}).reduce((s, v) => s + (v || 0), 0);
          if (sum <= total || sum === 0) return buckets;
          const scale = total / sum;
          const out = {};
          for (const k of Object.keys(buckets)) out[k] = Math.max(0, Math.floor((buckets[k] || 0) * scale));
          return out;
        };
        if (parsed.categoryXP) parsed.categoryXP = clampBuckets(parsed.categoryXP, parsed.totalXP || 0);
        if (parsed.statXP)     parsed.statXP     = clampBuckets(parsed.statXP,     parsed.totalXP || 0);

        return parsed;
      }
    } catch {}
    return getInitialState();
  });

  useEffect(() => {
    try { if (user) localStorage.setItem(STORAGE_USER, JSON.stringify(user)); } catch {}
  }, [user]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_STATE, JSON.stringify(state)); } catch {}
  }, [state]);

  useEffect(() => {
    const interval = setInterval(() => {
      const today = todayKey();
      setState(prev => {
        if (prev.lastResetDate === today) return prev;
        const pendingTaskCount = prev.tasks.filter(t => t.status === "pending").length;
        const mainPending = prev.mainQuest?.status === "pending" ? 1 : 0;
        return {
          ...prev,
          lastResetDate: today,
          categoryXPToday: { fitness: 0, school: 0, life: 0, work: 0, mind: 0 },
          tasks: prev.tasks.map(t => t.status === "pending" ? { ...t, status: "failed" } : t),
          mainQuest: prev.mainQuest?.status === "pending"
            ? { ...prev.mainQuest, status: "failed" }
            : prev.mainQuest,
          completedHistory: {
            ...prev.completedHistory,
            failed: prev.completedHistory.failed + pendingTaskCount + mainPending,
          },
        };
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tick = () => {
      const today = todayKey();
      setState(prev => {
        const fids = Object.keys(prev.friendStreaks || {});
        if (fids.length === 0) return prev;
        const next = { ...(prev.friendActiveDays || {}) };
        let changed = false;
        for (const fid of fids) {
          if (next[fid] !== today && Math.random() < 0.8) {
            next[fid] = today;
            changed = true;
          }
        }
        if (!changed) return prev;
        const userActive = (prev.activityLog[today]?.count || 0) > 0;
        const newStreaks = userActive
          ? advanceFriendStreaks(prev.friendStreaks, today, next)
          : prev.friendStreaks;
        return { ...prev, friendActiveDays: next, friendStreaks: newStreaks };
      });
    };
    tick();
    const id = setInterval(tick, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const scheduleNext = () => {
      const delay = (10 + Math.random() * 20) * 60 * 1000;
      return setTimeout(() => {
        setState(prev => {
          const friends = prev.friends || [];
          if (friends.length === 0) return prev;
          const friend = friends[Math.floor(Math.random() * friends.length)];
          const isNudge = Math.random() < 0.25;
          const messages = isNudge
            ? [`${friend.name} sent you a nudge`, `${friend.name} thinks you're slacking`]
            : [`${friend.name} cheered your progress`, `${friend.name} is rooting for you`, `${friend.name} sent you a sparkle`];
          return {
            ...prev,
            cheersReceived: [
              { id: Date.now() + Math.random(), fromId: friend.id, fromName: friend.name,
                kind: isNudge ? "nudge_in" : "cheer_in",
                message: messages[Math.floor(Math.random() * messages.length)],
                createdAt: Date.now(), read: false },
              ...(prev.cheersReceived || []),
            ].slice(0, 30),
          };
        });
        timer = scheduleNext();
      }, delay);
    };
    let timer = scheduleNext();
    return () => clearTimeout(timer);
  }, []);

  // Pure reducer: applies an XP award to the given prev state and returns the next state.
  // Reads cap/total from prev (not closure) so it's safe under rapid completions.
  // Side effects (toast, level-up, gain animation) are queued via the `effects` accumulator
  // and dispatched after setState commits to avoid double-firing in strict mode.
  const awardXPReducer = (prev, proposedXP, category, taskTitle, bypassCap, taskId, effects) => {
    const actualXP = bypassCap ? proposedXP : applyDailyCap(proposedXP, category, prev.categoryXPToday);
    const prevLevel = getLevelFromXP(prev.totalXP).level;
    const newTotal = prev.totalXP + actualXP;
    const newLevel = getLevelFromXP(newTotal).level;

    if (actualXP > 0) {
      effects.push({ kind: "gain", payload: { id: Date.now() + Math.random(), amount: actualXP, capped: !bypassCap && actualXP < proposedXP } });
    } else {
      effects.push({ kind: "capToast" });
    }
    if (newLevel > prevLevel) effects.push({ kind: "levelUp", payload: newLevel });

    const statKey = CATEGORIES[category].stat;
    const today = todayKey();
    const todayLog = prev.activityLog[today] || { xp: 0, count: 0 };

    return {
      ...prev,
      totalXP: newTotal,
      statXP: { ...prev.statXP, [statKey]: (prev.statXP[statKey] || 0) + actualXP },
      categoryXP: { ...prev.categoryXP, [category]: (prev.categoryXP[category] || 0) + actualXP },
      categoryXPToday: bypassCap
        ? prev.categoryXPToday
        : { ...prev.categoryXPToday, [category]: (prev.categoryXPToday[category] || 0) + actualXP },
      completedHistory: { ...prev.completedHistory, completed: prev.completedHistory.completed + 1 },
      streak: prev.streak === 0 ? 1 : prev.streak,
      longestStreak: Math.max(prev.longestStreak, prev.streak === 0 ? 1 : prev.streak),
      activityLog: {
        ...prev.activityLog,
        [today]: { xp: todayLog.xp + actualXP, count: todayLog.count + 1 },
      },
      completedTasks: [
        { id: Date.now() + Math.random(), taskId, title: taskTitle, category, xp: actualXP, completedAt: Date.now() },
        ...(prev.completedTasks || []),
      ].slice(0, 50),
      friendStreaks: advanceFriendStreaks(prev.friendStreaks, today, prev.friendActiveDays || {}),
    };
  };

  const flushEffects = (effects) => {
    for (const e of effects) {
      if (e.kind === "gain") onXpGain(e.payload);
      else if (e.kind === "capToast") showToast("Daily cap reached — task completed", TEXT_MID);
      else if (e.kind === "levelUp") onLevelUp(e.payload);
    }
  };

  // ── Weekly quests: auto-expire on mount ─────────────────────────────────
  useEffect(() => {
    const now = Date.now();
    setState(prev => {
      const wq = prev.weeklyQuests || [];
      let changed = false;
      const updated = wq.map(q => {
        if (q.status === "pending" && now > q.deadline) {
          changed = true;
          return { ...q, status: "expired" };
        }
        return q;
      });
      return changed ? { ...prev, weeklyQuests: updated } : prev;
    });
  }, []);

  // ── Daily reminder for pending weekly quests (once per day on mount) ────
  useEffect(() => {
    const today = todayKey();
    if (state.lastWeeklyReminderDate === today) return;
    if (state.notifications?.weeklyQuestReminder === false) return;
    const pending = (state.weeklyQuests || []).filter(q => q.status === "pending");
    if (pending.length > 0) {
      const t = setTimeout(() => {
        showToast(`${pending.length} weekly quest${pending.length > 1 ? "s" : ""} pending this week`);
      }, 1500);
      setState(prev => ({ ...prev, lastWeeklyReminderDate: today }));
      return () => clearTimeout(t);
    }
    setState(prev => ({ ...prev, lastWeeklyReminderDate: today }));
  }, []);

  // ── Weekly quest mutations ──────────────────────────────────────────────
  const hasPendingWeeklyInCategory = (category) =>
    (state.weeklyQuests || []).some(q => q.category === category && q.status === "pending");

  const createWeeklyQuest = (data) => {
    if (hasPendingWeeklyInCategory(data.category)) {
      showToast(`Weekly quest already active for ${CATEGORIES[data.category]?.label}`, TEXT_MID);
      return false;
    }
    const createdAt = Date.now();
    const d = new Date(createdAt);
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 59, 999);
    const newQuest = {
      id: createdAt,
      title: data.title,
      category: data.category,
      effort: data.effort,
      duration: data.duration,
      xp: data.xp,
      status: "pending",
      createdAt,
      deadline: d.getTime(),
    };
    setState(prev => ({ ...prev, weeklyQuests: [...(prev.weeklyQuests || []), newQuest] }));
    showToast(`Weekly quest added · +${data.xp} XP on completion`);
    return true;
  };

  const completeWeeklyQuest = (questId) => {
    const completedAt = Date.now();
    const effects = [];
    setState(prev => {
      const quest = (prev.weeklyQuests || []).find(q => q.id === questId);
      if (!quest || quest.status !== "pending") return prev;
      const afterMark = {
        ...prev,
        weeklyQuests: prev.weeklyQuests.map(q => q.id === questId ? { ...q, status: "complete", completedAt } : q),
      };
      return awardXPReducer(afterMark, quest.xp, quest.category, quest.title, true, questId, effects);
    });
    flushEffects(effects);
  };

  const saveWeeklyEdit = (quest, updates) => {
    setState(prev => ({
      ...prev,
      weeklyQuests: prev.weeklyQuests.map(q => q.id === quest.id ? { ...q, ...updates } : q),
    }));
    showToast("Quest updated");
  };

  const failWeeklyQuest = (quest) => {
    setState(prev => ({
      ...prev,
      weeklyQuests: prev.weeklyQuests.map(q => q.id === quest.id ? { ...q, status: "failed" } : q),
      completedHistory: { ...prev.completedHistory, failed: prev.completedHistory.failed + 1 },
    }));
  };

  const deleteWeeklyQuest = (quest) => deleteAnyQuest(quest, "weekly");

  const handleCreateTask = (data) => {
    if (data.isWeeklyQuest) {
      createWeeklyQuest(data);
      return { kind: "weekly" };
    }
    const newTask = {
      id: Date.now(),
      title: data.title,
      category: data.category,
      effort: data.effort,
      duration: data.duration,
      xp: data.xp,
      status: "pending",
    };
    if (data.isMainQuest) {
      setState(prev => ({ ...prev, mainQuest: newTask }));
    } else {
      setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    }
    showToast(`Quest added · +${data.xp} XP on completion`);
    return data.isMainQuest ? { kind: "main" } : { kind: "task" };
  };

  const completeTask = (taskId) => {
    const completedAt = Date.now();
    const effects = [];
    setState(prev => {
      const task = prev.tasks.find(t => t.id === taskId);
      if (!task || task.status !== "pending") return prev;
      const afterMark = {
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: "complete", completedAt } : t),
      };
      return awardXPReducer(afterMark, task.xp, task.category, task.title, false, taskId, effects);
    });
    flushEffects(effects);
  };

  const completeMainQuest = () => {
    const completedAt = Date.now();
    const effects = [];
    setState(prev => {
      const mq = prev.mainQuest;
      if (!mq || mq.status !== "pending") return prev;
      const afterMark = { ...prev, mainQuest: { ...mq, status: "complete", completedAt } };
      return awardXPReducer(afterMark, mq.xp, mq.category, mq.title, false, mq.id, effects);
    });
    flushEffects(effects);
  };

  // Fix: compute allDone from current state before calling setState to avoid stale closure
  const completeMonthlyQuest = (monthKey, questIdx) => {
    const completed = state.monthlyCompletions[monthKey] || [];
    if (completed.includes(questIdx)) return;
    const nextCompleted = [...completed, questIdx];
    const allDone = nextCompleted.length === MONTHLY_QUESTS[monthKey].questCount;

    setState(prev => {
      const prevCompleted = prev.monthlyCompletions[monthKey] || [];
      if (prevCompleted.includes(questIdx)) return prev;
      const updated = [...prevCompleted, questIdx];
      return {
        ...prev,
        monthlyCompletions: { ...prev.monthlyCompletions, [monthKey]: updated },
        totalXP: prev.totalXP + 30 + (allDone ? 250 : 0),
      };
    });

    if (allDone) {
      setTimeout(() => onMonthlyBadge({ monthKey, bonusXP: 250 }), 400);
    } else {
      showToast("+30 XP · Quest complete");
    }
  };

  const saveEdit = (task, isMain, updates) => {
    if (isMain) {
      setState(prev => ({ ...prev, mainQuest: { ...prev.mainQuest, ...updates } }));
    } else {
      setState(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === task.id ? { ...t, ...updates } : t) }));
    }
    showToast("Quest updated");
  };

  const markFailed = (task, isMain) => {
    if (isMain) {
      setState(prev => ({
        ...prev,
        mainQuest: { ...prev.mainQuest, status: "failed" },
        completedHistory: { ...prev.completedHistory, failed: prev.completedHistory.failed + 1 },
      }));
    } else {
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === task.id ? { ...t, status: "failed" } : t),
        completedHistory: { ...prev.completedHistory, failed: prev.completedHistory.failed + 1 },
      }));
    }
  };

  // Unified deletion: removes the task from its list, and if it was completed/failed,
  // fully reverses the XP, category, stat, history, activityLog, and completedTasks log entries
  // so a deleted task leaves no trace in any aggregate.
  const deleteAnyQuest = (task, kind) => {
    setState(prev => {
      const next = { ...prev };
      const cat = CATEGORIES[task.category];

      if (task.status === "complete") {
        // Sum the actual awarded XP from every completedTasks log entry tied to this task.
        // Using the log (vs task.xp) handles daily-cap reductions and historical double-grants
        // so deletion fully reverses what was actually awarded.
        const logEntries = (prev.completedTasks || []).filter(e => e.taskId === task.id);
        const reverseXP = logEntries.length > 0
          ? logEntries.reduce((s, e) => s + (e.xp || 0), 0)
          : (task.xp || 0);
        const reverseCount = Math.max(1, logEntries.length);

        next.totalXP = Math.max(0, prev.totalXP - reverseXP);
        if (cat?.stat) {
          next.statXP = { ...prev.statXP, [cat.stat]: Math.max(0, (prev.statXP[cat.stat] || 0) - reverseXP) };
        }
        next.categoryXP = { ...prev.categoryXP, [task.category]: Math.max(0, (prev.categoryXP[task.category] || 0) - reverseXP) };
        next.completedHistory = { ...prev.completedHistory, completed: Math.max(0, prev.completedHistory.completed - reverseCount) };

        // Reverse the activityLog entry for the day this task was completed
        if (task.completedAt) {
          const d = new Date(task.completedAt);
          const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          const log = prev.activityLog[dateKey];
          if (log) {
            const newXp = Math.max(0, log.xp - reverseXP);
            const newCount = Math.max(0, log.count - reverseCount);
            const newLog = { ...prev.activityLog };
            if (newCount === 0 && newXp === 0) delete newLog[dateKey];
            else newLog[dateKey] = { xp: newXp, count: newCount };
            next.activityLog = newLog;
          }
        }

        next.completedTasks = (prev.completedTasks || []).filter(e => e.taskId !== task.id);
      } else if (task.status === "failed") {
        next.completedHistory = { ...prev.completedHistory, failed: Math.max(0, prev.completedHistory.failed - 1) };
      }

      if (kind === "weekly") {
        next.weeklyQuests = (prev.weeklyQuests || []).filter(q => q.id !== task.id);
      } else if (kind === "main") {
        next.mainQuest = null;
      } else {
        next.tasks = prev.tasks.filter(t => t.id !== task.id);
      }

      return next;
    });
  };

  const deleteTask = (task, isMain) => deleteAnyQuest(task, isMain ? "main" : "task");

  const resetAll = () => {
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem(STORAGE_STATE);
    setUser(null);
    setState(getInitialState());
  };

  const sendCheer = (friend, type = "cheer") => {
    const today = todayKey();
    const lastMap = type === "nudge" ? state.nudgesGiven : state.cheersGiven;
    const lastSent = lastMap[friend.id];
    if (lastSent === today) {
      showToast(type === "nudge" ? "Already nudged today" : "Already cheered today", TEXT_MID);
      return false;
    }
    setState(prev => {
      const key = type === "nudge" ? "nudgesGiven" : "cheersGiven";
      return { ...prev, [key]: { ...prev[key], [friend.id]: today } };
    });
    showToast(type === "nudge" ? `Nudged ${friend.name}` : `Cheered ${friend.name}`);

    if (Math.random() < 0.6) {
      const delay = 20000 + Math.random() * 40000;
      setTimeout(() => {
        const messages = type === "nudge"
          ? [`${friend.name} acknowledged your nudge`, `${friend.name} is on it`]
          : [`${friend.name} cheered you back!`, `${friend.name} liked your hustle`, `${friend.name} appreciated the boost`];
        setState(prev => ({
          ...prev,
          cheersReceived: [
            { id: Date.now() + Math.random(), fromId: friend.id, fromName: friend.name,
              kind: type === "nudge" ? "nudge_back" : "cheer_back",
              message: messages[Math.floor(Math.random() * messages.length)],
              createdAt: Date.now(), read: false },
            ...(prev.cheersReceived || []),
          ].slice(0, 30),
        }));
      }, delay);
    }
    return true;
  };

  const toggleFriendStreak = (friend) => {
    const existing = state.friendStreaks[friend.id];
    if (existing) {
      setState(prev => {
        const next = { ...prev.friendStreaks };
        delete next[friend.id];
        return { ...prev, friendStreaks: next };
      });
      showToast(`Friend Streak with ${friend.name} ended`, TEXT_MID);
    } else {
      setState(prev => ({
        ...prev,
        friendStreaks: {
          ...prev.friendStreaks,
          [friend.id]: { count: 1, lastBoth: todayKey(), aliveToday: true },
        },
      }));
      showToast(`Friend Streak with ${friend.name} started!`);
    }
  };

  const removeFriend = (friend) => {
    setState(prev => {
      const next = { ...prev };
      next.friends = prev.friends.filter(f => f.id !== friend.id);
      if (next.friendStreaks) {
        const s = { ...next.friendStreaks }; delete s[friend.id]; next.friendStreaks = s;
      }
      if (next.friendActiveDays) {
        const d = { ...next.friendActiveDays }; delete d[friend.id]; next.friendActiveDays = d;
      }
      if (next.cheersGiven) {
        const c = { ...next.cheersGiven }; delete c[friend.id]; next.cheersGiven = c;
      }
      if (next.nudgesGiven) {
        const n = { ...next.nudgesGiven }; delete n[friend.id]; next.nudgesGiven = n;
      }
      return next;
    });
    showToast(`${friend.name} removed`, TEXT_MID);
  };

  const addFriend = (newFriend) => {
    if (state.friends.some(f => f.id === newFriend.id)) {
      showToast("Already in your circle", TEXT_MID);
      return;
    }
    setState(prev => ({ ...prev, friends: [...prev.friends, newFriend] }));
    showToast(`Added ${newFriend.name}`);
  };

  const updateProfile = ({ name, bio }) => {
    setUser(prev => ({ ...prev, name: name?.trim() || prev.name, bio: bio?.trim() ?? prev.bio }));
    showToast("Profile updated");
  };

  const toggleNotification = (key) => {
    setState(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }));
  };

  const upgradeToPro = () => {
    setState(prev => ({ ...prev, isPro: true }));
    showToast("Welcome to Prominence Pro");
  };

  const markAllNotificationsRead = () => {
    setState(prev => ({
      ...prev,
      cheersReceived: (prev.cheersReceived || []).map(n => ({ ...n, read: true })),
    }));
  };

  const dismissNotification = (id) => {
    setState(prev => ({
      ...prev,
      cheersReceived: (prev.cheersReceived || []).filter(n => n.id !== id),
    }));
  };

  return {
    user, setUser, state, setState,
    handleCreateTask, completeTask, completeMainQuest,
    completeMonthlyQuest, saveEdit, markFailed, deleteTask,
    completeWeeklyQuest, saveWeeklyEdit, failWeeklyQuest, deleteWeeklyQuest,
    hasPendingWeeklyInCategory,
    resetAll, sendCheer, toggleFriendStreak, addFriend, removeFriend,
    updateProfile, toggleNotification, upgradeToPro,
    markAllNotificationsRead, dismissNotification,
  };
}
