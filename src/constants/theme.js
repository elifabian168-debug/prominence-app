// Theme colors resolve to CSS custom properties so they adapt at runtime when
// `data-theme` flips on <html>. See global.css for the dark/light palettes.
export const ACCENT    = "var(--accent)";
export const BG        = "var(--bg)";
export const CARD      = "var(--card)";
export const CARD_ELEV = "var(--card-elev)";
export const BORDER    = "var(--border)";
export const BORDER_BR = "var(--border-br)";
export const TEXT      = "var(--text)";
export const TEXT_MID  = "var(--text-mid)";
export const TEXT_DIM  = "var(--text-dim)";
export const SERIF     = "'Cormorant Garamond', 'Times New Roman', serif";

// Replaces the old `${COLOR}HH` hex-alpha string concat. Accepts either a
// 0–1 opacity or the two-digit hex string (e.g. "40", "DD") used previously
// and returns a color-mix() expression that stays themed because the
// underlying var still updates at runtime.
export const alpha = (cssColor, opacity) => {
  const pct = typeof opacity === "string"
    ? Math.round((parseInt(opacity, 16) / 255) * 100)
    : Math.round(opacity * 100);
  return `color-mix(in srgb, ${cssColor} ${pct}%, transparent)`;
};
