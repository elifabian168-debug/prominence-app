import { todayKey } from "./date";
import { SEED_FRIENDS } from "../constants/socialData";

export const getInitialState = (firstQuest) => {
  const tasks = [];
  if (firstQuest) {
    tasks.unshift({
      id: 100,
      title: firstQuest.title,
      category: firstQuest.category,
      effort: firstQuest.effort || "medium",
      duration: firstQuest.duration || "short",
      xp: firstQuest.xp,
      status: "pending",
    });
  }
  return {
    totalXP: 0,
    tasks,
    mainQuest: null,
    weeklyQuests: [],
    lastWeeklyReminderDate: null,
    streak: 0,
    longestStreak: 0,
    completedHistory: { completed: 0, failed: 0 },
    statXP: { strength: 0, intellect: 0, discipline: 0, vitality: 0, craft: 0 },
    categoryXP: { fitness: 0, school: 0, life: 0, work: 0, mind: 0 },
    categoryXPToday: { fitness: 0, school: 0, life: 0, work: 0, mind: 0 },
    lastResetDate: todayKey(),
    activityLog: {},
    monthlyCompletions: {},
    friends: SEED_FRIENDS,
    friendStreaks: {},
    cheersGiven: {},
    nudgesGiven: {},
    cheersReceived: [],
    friendActiveDays: {},
    completedTasks: [],
    notifications: {
      dailyReminder:        true,
      streakAtRisk:         true,
      friendActivity:       true,
      levelUp:              true,
      monthlyComplete:      true,
      weeklyQuestReminder:  true,
    },
    isPro: false,
  };
};
