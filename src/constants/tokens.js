// Design tokens — the shared scales that keep the UI consistent.
//
// The app styles entirely with inline style objects, so these are plain JS
// values meant to be spread or referenced directly:
//
//   <div style={{ ...TYPE.pageTitle }}>            // typography presets
//   <div style={{ padding: SPACE.xl, gap: SPACE.md }}>
//   <div style={{ borderRadius: RADIUS.card }}>
//
// Colors still come from theme.js (CSS-var backed) so light/dark keep working.
import { SERIF, TEXT_DIM, TEXT_MID, ACCENT, alpha } from "./theme";

// ── Typography ──
// Spreadable text-style presets. Override per-use (e.g. color, marginBottom)
// by adding fields after the spread.
export const TYPE = {
  // Big hero type — Welcome / Login / splash moments.
  display: {
    fontFamily: SERIF, fontSize: 38, fontWeight: 500,
    letterSpacing: "-0.01em", lineHeight: 1.05,
  },
  // The single size for every secondary-screen title.
  pageTitle: {
    fontFamily: SERIF, fontSize: 30, fontWeight: 500,
    letterSpacing: "-0.01em", lineHeight: 1.1,
  },
  // Serif numerals — XP, level, stat values.
  metric: {
    fontFamily: SERIF, fontSize: 28, fontWeight: 500,
    lineHeight: 1, fontVariantNumeric: "tabular-nums",
  },
  // Small-caps eyebrow / section label.
  sectionLabel: {
    fontSize: 11, fontWeight: 600,
    letterSpacing: "0.2em", textTransform: "uppercase",
    color: TEXT_DIM,
  },
  // Card / list-row title.
  cardTitle: { fontSize: 14, fontWeight: 500 },
  // Default running text.
  body: { fontSize: 13, fontWeight: 400, lineHeight: 1.5 },
  // Secondary / metadata text.
  meta: { fontSize: 12, fontWeight: 500, color: TEXT_MID },
  // Tiny uppercase annotation (badges, chip labels).
  micro: {
    fontSize: 10, fontWeight: 600,
    letterSpacing: "0.16em", textTransform: "uppercase",
  },
};

// ── Spacing ── 8px-based rhythm. Use these instead of ad-hoc px values.
export const SPACE = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 40,
};

// ── Border radius ──
export const RADIUS = {
  control: 12, // inputs, small buttons, list rows
  card: 14,    // primary cards
  sheet: 20,   // modals / bottom sheets
  pill: 99,    // chips, fully-rounded buttons
};

// ── Shadows ──
export const SHADOW = {
  card: "0 1px 2px rgba(0,0,0,0.25)",
  lift: "0 8px 24px rgba(0,0,0,0.35)",
  // Gold ambient lift for primary CTAs (matches the existing de-facto pattern).
  glow: `0 6px 18px ${alpha(ACCENT, "40")}`,
};

// ── Layout widths ──
export const LAYOUT = {
  reading: 640, // comfortable centered column for reading-style screens
  wide: 960,    // full desktop content frame
  gridGap: 20,  // gap for desktop 2-column grids
};
