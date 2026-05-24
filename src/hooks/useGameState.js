import { useState, useEffect } from 'react';
import { STORAGE_USER, STORAGE_STATE } from '../constants/storage';
import { CATEGORIES } from '../constants/categories';
import { todayKey } from '../utils/date';
import { getLevelFromXP, applyDailyCap } from '../utils/xp';
import { advanceFriendStreaks } from '../utils/social';
import { getInitialState } from '../utils/state';
import { SEED_FRIENDS, SEED_POSTS } from '../constants/socialData';
import { SEED_GROUPS, SEED_GROUP_INVITES } from '../constants/groupsData';
import { TEXT_MID } from '../constants/theme';
import { fireLocalNotification } from '../utils/notifications';

// Drop activityLog entries older than 90 days. The log only grows by one
// key per day, so doing this once at hydration time is enough.
const ACTIVITY_LOG_RETENTION_DAYS = 90;
const pruneActivityLog = (log) => {
  if (!log) return {};
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - ACTIVITY_LOG_RETENTION_DAYS);
  const cutoffKey = cutoff.toISOString().slice(0, 10);
  const next = {};
  for (const k of Object.keys(log)) {
    if (k >= cutoffKey) next[k] = log[k];
  }
  return next;
};

export function useGameState({ showToast, onLevelUp, onXpGain }) {
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
        if (!parsed.groups) parsed.groups = SEED_GROUPS;
        if (!parsed.groupInvites) parsed.groupInvites = SEED_GROUP_INVITES;
        if (!parsed.posts) parsed.posts = SEED_POSTS;
        if (parsed.lastStreakDay === undefined) parsed.lastStreakDay = null;
        // Backfill Circle fields for older saved groups, and strip the
        // deleted ones (groupXP, lastActivityDate, activityFeed).
        // audienceMode defaults to 'private' for Circles created before the
        // toggle existed.
        parsed.groups = (parsed.groups || []).map((g) => {
          const { groupXP: _gxp, lastActivityDate: _lad, activityFeed: _af, ...rest } = g;
          return {
            ...rest,
            audienceMode: rest.audienceMode ?? "private",
            streakDays: rest.streakDays ?? 0,
            lastStreakDay: rest.lastStreakDay ?? null,
          };
        });
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

        parsed.activityLog = pruneActivityLog(parsed.activityLog);

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

  // Friend simulators (random activity ticks + inbound cheers/nudges) live in
  // useFriends now — that hook owns the social state and its mock generators.

  // Build a Post for a just-completed goal, honoring the task's audience.
  // Returns null when the task was marked private (no post created).
  // The post's audienceMode mirrors the source Circle's mode (or "private"
  // for an unscoped "all friends" post).
  const buildPost = (kind, task, circles) => {
    if (task?.audienceMode === "private") return null;
    const circleIds = task?.audienceCircleIds || [];
    const firstCircle = circleIds.length
      ? (circles || []).find((c) => c.id === circleIds[0])
      : null;
    return {
      id: `p_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      authorId: "me",
      goalRef: {
        kind,
        id: task.id,
        title: task.title,
        category: task.category,
        xp: task.xp,
      },
      body: "",
      audienceCircleIds: circleIds,
      audienceMode: firstCircle?.audienceMode || "private",
      createdAt: Date.now(),
      cheers: [],
      comments: [],
    };
  };

  // Helper: prepend a post if buildPost returned one.
  const appendPost = (posts, post) => (post ? [post, ...(posts || [])] : (posts || []));

  // Streak is a *social* signal: it only moves when the user actually posts
  // a completion (i.e. the completion wasn't marked private). Returns the
  // streak deltas to merge into the next state, or null if nothing changes.
  //
  // Rules:
  //   - Already posted today  → no change
  //   - Last posted yesterday → streak + 1
  //   - Otherwise (or never)  → streak resets to 1
  //   - Private completion    → caller passes posted=false → no change
  const computeStreakDelta = (prev, posted) => {
    if (!posted) return null;
    const today = todayKey();
    const last = prev.lastStreakDay;
    if (last === today) return null;
    const yesterday = (() => {
      const d = new Date(`${today}T00:00:00`);
      d.setDate(d.getDate() - 1);
      return d.toISOString().slice(0, 10);
    })();
    const continuing = last === yesterday;
    const nextStreak = continuing ? (prev.streak || 0) + 1 : 1;
    return {
      streak: nextStreak,
      longestStreak: Math.max(prev.longestStreak || 0, nextStreak),
      lastStreakDay: today,
    };
  };

  // Advance a Circle's streak if the just-created post tips today's distinct
  // poster count to >= 2. Returns the updated groups array (same reference if
  // nothing changed). The new post must already be on `nextPosts` so the
  // count includes it.
  //
  // Rule:
  //   - distinct authors today >= 2 AND lastStreakDay !== today → advance
  //   - lastStreakDay === yesterday → streakDays + 1
  //   - otherwise → streakDays = 1
  //   - first qualifying post of the day sets lastStreakDay = today;
  //     subsequent posts on the same day are no-ops.
  const advanceCircleStreaks = (groups, nextPosts, newPost) => {
    if (!newPost || !newPost.audienceCircleIds?.length) return groups;
    const today = todayKey();
    const yesterday = (() => {
      const d = new Date(`${today}T00:00:00`);
      d.setDate(d.getDate() - 1);
      return d.toISOString().slice(0, 10);
    })();
    const affectedIds = new Set(newPost.audienceCircleIds);

    return (groups || []).map((g) => {
      if (!affectedIds.has(g.id)) return g;
      if (g.lastStreakDay === today) return g;
      // Count distinct authors who posted to THIS Circle today.
      const authorsToday = new Set();
      for (const p of nextPosts) {
        if (!(p.audienceCircleIds || []).includes(g.id)) continue;
        const d = new Date(p.createdAt).toISOString().slice(0, 10);
        if (d === today) authorsToday.add(p.authorId);
      }
      if (authorsToday.size < 2) return g;
      const continuing = g.lastStreakDay === yesterday;
      const nextStreak = continuing ? (g.streakDays || 0) + 1 : 1;
      return { ...g, streakDays: nextStreak, lastStreakDay: today };
    });
  };

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

    // Record any new levels reached (handles multi-level jumps).
    const prevHistory = prev.levelHistory || [];
    const newLevelEntries = [];
    if (newLevel > prevLevel) {
      const now = Date.now();
      for (let lv = prevLevel + 1; lv <= newLevel; lv++) {
        newLevelEntries.push({ level: lv, achievedAt: now });
      }
    }

    return {
      ...prev,
      totalXP: newTotal,
      statXP: { ...prev.statXP, [statKey]: (prev.statXP[statKey] || 0) + actualXP },
      categoryXP: { ...prev.categoryXP, [category]: (prev.categoryXP[category] || 0) + actualXP },
      categoryXPToday: bypassCap
        ? prev.categoryXPToday
        : { ...prev.categoryXPToday, [category]: (prev.categoryXPToday[category] || 0) + actualXP },
      completedHistory: { ...prev.completedHistory, completed: prev.completedHistory.completed + 1 },
      // Streak is no longer tied to XP awards — it now lives on the post
      // creation path (see computeStreakDelta). XP-only completions
      // (private goals) don't move the streak.
      levelHistory: newLevelEntries.length ? [...prevHistory, ...newLevelEntries] : prevHistory,
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
      else if (e.kind === "levelUp") {
        onLevelUp(e.payload);
        if (state.notifications?.levelUp !== false) {
          fireLocalNotification(
            `Level ${e.payload} reached`,
            "Your prominence rises. Keep climbing.",
            { tag: `level-up-${e.payload}` },
          );
        }
      }
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
  // A category is "taken" if there's an active weekly for it this week.
  // Active = pending OR completed-but-still-within-its-7-day window. A failed
  // weekly frees the category back up so the user can retry.
  const hasPendingWeeklyInCategory = (category) =>
    (state.weeklyQuests || []).some(q => {
      if (q.category !== category) return false;
      if (q.status === "pending") return true;
      if (q.status === "complete" && (!q.deadline || Date.now() < q.deadline)) return true;
      return false;
    });

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
      audienceMode: data.audienceMode === "private" ? "private" : "post",
      audienceCircleIds: data.audienceCircleIds || [],
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
      const post = buildPost("weekly", quest, prev.groups);
      const streakDelta = computeStreakDelta(prev, !!post);
      const nextPosts = appendPost(prev.posts, post);
      const afterMark = {
        ...prev,
        ...(streakDelta || {}),
        weeklyQuests: prev.weeklyQuests.map(q => q.id === questId ? { ...q, status: "complete", completedAt } : q),
        posts: nextPosts,
        groups: advanceCircleStreaks(prev.groups, nextPosts, post),
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
      audienceMode: data.audienceMode === "private" ? "private" : "post",
      audienceCircleIds: data.audienceCircleIds || [],
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
      const post = buildPost("task", task, prev.groups);
      const streakDelta = computeStreakDelta(prev, !!post);
      const nextPosts = appendPost(prev.posts, post);
      const afterMark = {
        ...prev,
        ...(streakDelta || {}),
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: "complete", completedAt } : t),
        posts: nextPosts,
        groups: advanceCircleStreaks(prev.groups, nextPosts, post),
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
      const post = buildPost("main", mq, prev.groups);
      const streakDelta = computeStreakDelta(prev, !!post);
      const nextPosts = appendPost(prev.posts, post);
      const afterMark = {
        ...prev,
        ...(streakDelta || {}),
        mainQuest: { ...mq, status: "complete", completedAt },
        posts: nextPosts,
        groups: advanceCircleStreaks(prev.groups, nextPosts, post),
      };
      return awardXPReducer(afterMark, mq.xp, mq.category, mq.title, false, mq.id, effects);
    });
    flushEffects(effects);
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

  return {
    user, setUser, state, setState,
    handleCreateTask, completeTask, completeMainQuest,
    saveEdit, markFailed, deleteTask,
    completeWeeklyQuest, saveWeeklyEdit, failWeeklyQuest, deleteWeeklyQuest,
    hasPendingWeeklyInCategory,
    resetAll,
    updateProfile, toggleNotification,
  };
}
