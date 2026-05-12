export const CATEGORY_BASE_XP = {
  fitness: { base: 25, ceiling: 200 },
  school:  { base: 25, ceiling: 200 },
  life:    { base: 15, ceiling: 100 },
  work:    { base: 30, ceiling: 250 },
  mind:    { base: 20, ceiling: 150 },
};

export const EFFORT_LEVELS = {
  low:    { label: "Low",    multiplier: 1.0, hint: "Easy, routine" },
  medium: { label: "Medium", multiplier: 1.5, hint: "Some focus" },
  high:   { label: "High",   multiplier: 2.2, hint: "Demanding" },
};

export const DURATION_LEVELS = {
  quick: { label: "Quick", minutes: 15,  multiplier: 1.0, hint: "<15 min" },
  short: { label: "Short", minutes: 30,  multiplier: 1.4, hint: "30 min" },
  long:  { label: "Long",  minutes: 60,  multiplier: 1.9, hint: "1 hour" },
  deep:  { label: "Deep",  minutes: 120, multiplier: 2.6, hint: "2+ hrs" },
};

// Cumulative time across the whole week, not a single session.
export const WEEKLY_DURATION_LEVELS = {
  light:  { label: "Light",  hours: 1,  multiplier: 1.0, hint: "~1 hr / week"    },
  steady: { label: "Steady", hours: 3,  multiplier: 1.4, hint: "~3 hrs / week"   },
  major:  { label: "Major",  hours: 6,  multiplier: 1.9, hint: "~6 hrs / week"   },
  epic:   { label: "Epic",   hours: 12, multiplier: 2.6, hint: "~12+ hrs / week" },
};

export const DAILY_CATEGORY_CAP = {
  fitness: 500, school: 500, life: 300, work: 600, mind: 400,
};

export const WEEKLY_QUEST_MULTIPLIER = 5;
export const WEEKLY_QUEST_BONUS      = 100;

export const MONTHLY_QUESTS = {
  january:   { name: "Discipline",  color: "#7CA9F2", tagline: "Foundations",      questCount: 7 },
  february:  { name: "Mind",        color: "#A78BFA", tagline: "Inner work",        questCount: 7 },
  march:     { name: "Craft",       color: "#E8B14A", tagline: "Build something",   questCount: 7 },
  april:     { name: "Vitality",    color: "#6EE7B7", tagline: "Renew",             questCount: 7 },
  may:       { name: "Connection",  color: "#E89B8A", tagline: "People matter",     questCount: 7 },
  june:      { name: "Strength",    color: "#F87171", tagline: "Push limits",       questCount: 7 },
  july:      { name: "Adventure",   color: "#FBBF24", tagline: "Step outside",      questCount: 7 },
  august:    { name: "Mastery",     color: "#34D399", tagline: "Go deep",           questCount: 7 },
  september: { name: "Reset",       color: "#60A5FA", tagline: "New chapter",       questCount: 7 },
  october:   { name: "Focus",       color: "#C084FC", tagline: "Quiet the noise",   questCount: 7 },
  november:  { name: "Gratitude",   color: "#FB923C", tagline: "Look back",         questCount: 7 },
  december:  { name: "Reflection",  color: "#9CA3AF", tagline: "Closing the year",  questCount: 7 },
};

export const MONTH_KEYS = Object.keys(MONTHLY_QUESTS);

export function getQuestTitle(monthKey, idx) {
  const lines = {
    january:   ["Wake before 7am", "Make your bed", "Drink water first", "Plan your day", "No phone first hour", "Journal for 5 min", "Reflect at sunset"],
    february:  ["Meditate 10 min", "Read a chapter", "Practice gratitude", "Listen deeply", "Disconnect for 1hr", "Try silence", "Write what scares you"],
    march:     ["Build something small", "Ship one thing", "Learn a new skill 30m", "Refactor a habit", "Make notes public", "Help someone build", "Reflect on progress"],
    april:     ["Walk outside", "Stretch 10 min", "Eat one whole meal", "Sleep before 11pm", "Hydrate fully", "Take a real lunch", "Rest a full day"],
    may:       ["Call someone", "Write a thank-you", "Reach out first", "Give without asking", "Listen to a story", "Share a meal", "Be present"],
    june:      ["Run further", "Lift heavier", "Climb something", "Skip the elevator", "Sweat for 30 min", "Push past comfort", "Recover deliberately"],
    july:      ["Try a new place", "Take a different route", "Talk to a stranger", "Camp under stars", "Eat something new", "Travel light", "Document the day"],
    august:    ["Practice 1 hour", "Master a basic", "Teach what you know", "Repeat the fundamental", "Study a master", "Improve one thing", "Test yourself"],
    september: ["Clear your inbox", "Reorganize a space", "Drop a habit", "Pick a new one", "Set a season goal", "Reduce one input", "Protect your morning"],
    october:   ["Single-task 1hr", "No notifications 3hrs", "Deep work session", "Phone in another room", "Read uninterrupted", "Walk without input", "Quiet evening"],
    november:  ["Write what you're grateful for", "Thank a parent", "Thank a teacher", "Thank a friend", "Thank yourself", "Write a memory", "Reflect on the year"],
    december:  ["List the wins", "List the lessons", "Forgive a misstep", "Plan the next year", "Close one chapter", "Honor the year", "Rest before the new"],
  };
  return (lines[monthKey] || lines.january)[idx];
}
