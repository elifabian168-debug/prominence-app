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
