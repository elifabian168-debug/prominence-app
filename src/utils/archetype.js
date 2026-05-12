import { ARCHETYPES } from "../constants/categories";

export const getArchetype = (statXP) => {
  const entries = Object.entries(statXP).sort((a, b) => b[1] - a[1]);
  if (entries[0][1] === 0) return "balanced";
  const [top, second] = entries;
  if (top[1] - second[1] < 50) return "balanced";
  const map = { strength: "warrior", intellect: "scholar", discipline: "monk", craft: "artisan", vitality: "vitalist" };
  return map[top[0]] || "balanced";
};

export { ARCHETYPES };
