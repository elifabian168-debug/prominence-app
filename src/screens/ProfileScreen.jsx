import { Edit3, TrendingUp, Settings, Star, RotateCcw, Sun, Moon, Flame, Calendar, Sparkles, Trophy } from "lucide-react";
import { CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { ARCHETYPES } from "../constants/categories";
import { getLevelFromXP, formatXP, toRoman } from "../utils/xp";
import { formatShortDate, formatMonthYear } from "../utils/date";
import { getArchetype } from "../utils/archetype";
import SettingsRow from "../components/ui/SettingsRow";

// ── Helpers ─────────────────────────────────────────────────────────────────

// Lifetime milestones — derive everything from state
function deriveMilestones(state, createdAt) {
  // Highest single-day XP from activityLog
  let highestDay = { date: null, xp: 0 };
  for (const [date, log] of Object.entries(state.activityLog || {})) {
    if ((log?.xp || 0) > highestDay.xp) highestDay = { date, xp: log.xp };
  }

  // First quest date — prefer user.createdAt, else oldest completedTask
  let firstQuestAt = createdAt || null;
  if (!firstQuestAt && state.completedTasks?.length) {
    firstQuestAt = state.completedTasks.reduce(
      (oldest, t) => (t.completedAt && (!oldest || t.completedAt < oldest) ? t.completedAt : oldest),
      null,
    );
  }

  return {
    longestStreak: state.longestStreak || 0,
    firstQuestAt,
    highestDayXP: highestDay.xp,
    highestDayDate: highestDay.date,
    monthsCompleted: Object.keys(state.monthlyCompletions || {}).length,
  };
}

// Build the timeline rows — show last N entries + the current level if it's not already there
function buildLevelRows(levelHistory, currentLevel, max = 6) {
  const sorted = [...(levelHistory || [])].sort((a, b) => b.level - a.level);
  // Prepend current level if newer than recorded
  const top = sorted[0]?.level || 0;
  const rows = top >= currentLevel
    ? sorted
    : [{ level: currentLevel, achievedAt: null, current: true }, ...sorted];
  return rows.slice(0, max).map((r, i) => ({ ...r, current: i === 0 }));
}

// ── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ label, ornament }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <div style={{
        fontSize: 10, color: TEXT_DIM,
        letterSpacing: "0.26em", textTransform: "uppercase", fontWeight: 700,
      }}>
        {label}
      </div>
      <div style={{ flex: 1, height: 1, background: BORDER }} />
      {ornament}
    </div>
  );
}

function MilestoneTile({ icon: Icon, label, value, sub, accentColor }) {
  return (
    <div style={{
      position: "relative",
      background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
      padding: "14px 14px 12px",
      overflow: "hidden",
    }}>
      {/* Faded icon watermark */}
      <Icon size={60} color={accentColor} strokeWidth={1}
        style={{ position: "absolute", right: -10, top: -10, opacity: 0.06, pointerEvents: "none" }} />

      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginBottom: 10,
        position: "relative",
      }}>
        <Icon size={11} color={accentColor} strokeWidth={1.8} />
        <span style={{
          fontSize: 9, color: TEXT_DIM, letterSpacing: "0.2em",
          textTransform: "uppercase", fontWeight: 700,
        }}>
          {label}
        </span>
      </div>

      <div style={{
        fontFamily: SERIF, fontSize: 26, color: TEXT, fontWeight: 500,
        lineHeight: 1, letterSpacing: "-0.01em",
        fontVariantNumeric: "tabular-nums",
        position: "relative",
      }}>
        {value}
      </div>

      {sub && (
        <div style={{
          fontSize: 10, color: TEXT_DIM, marginTop: 4,
          letterSpacing: "0.04em",
          position: "relative",
        }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function LevelTimelineRow({ entry, archColor, isLast }) {
  const { level, achievedAt, current } = entry;
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "stretch", position: "relative" }}>
      {/* Marker column */}
      <div style={{
        width: 38, flexShrink: 0,
        display: "flex", flexDirection: "column", alignItems: "center",
        position: "relative",
      }}>
        {/* Vertical rule */}
        {!isLast && (
          <div style={{
            position: "absolute", top: 38, bottom: -10, left: "50%", width: 1,
            background: `linear-gradient(to bottom, ${alpha(archColor, "35")}, ${alpha(archColor, "08")})`,
            transform: "translateX(-50%)",
          }} />
        )}
        {/* Roman numeral disk */}
        <div style={{
          width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
          background: current
            ? `radial-gradient(circle, ${alpha(archColor, "55")} 0%, ${alpha(archColor, "15")} 70%)`
            : alpha(archColor, "08"),
          border: `1px solid ${current ? alpha(archColor, "80") : alpha(archColor, "32")}`,
          boxShadow: current ? `0 0 18px ${alpha(archColor, "50")}, inset 0 0 10px ${alpha(archColor, "25")}` : "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", zIndex: 1,
        }}>
          <span style={{
            fontFamily: SERIF, fontSize: 13, fontWeight: 600,
            color: current ? archColor : alpha(archColor, "85"),
            letterSpacing: "0.04em",
            textShadow: current ? `0 0 8px ${alpha(archColor, "60")}` : "none",
          }}>
            {toRoman(level)}
          </span>
        </div>
      </div>

      {/* Entry text */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 18, paddingTop: 6 }}>
        <div style={{
          display: "flex", alignItems: "baseline", gap: 8,
          marginBottom: 3,
        }}>
          <span style={{
            fontSize: 10, color: current ? archColor : TEXT_MID,
            letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700,
          }}>
            Level
          </span>
          <span style={{
            fontFamily: SERIF, fontSize: 20, fontWeight: 500,
            color: current ? TEXT : TEXT_MID, lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}>
            {level}
          </span>
          {current && (
            <span style={{
              fontSize: 9, padding: "2px 7px", borderRadius: 99,
              background: alpha(archColor, "18"), border: `1px solid ${alpha(archColor, "40")}`,
              color: archColor, letterSpacing: "0.14em", fontWeight: 700,
              marginLeft: "auto",
            }}>
              CURRENT
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.04em" }}>
          {achievedAt ? formatShortDate(achievedAt) : "—"}
        </div>
      </div>
    </div>
  );
}

// ── Main screen ─────────────────────────────────────────────────────────────

export default function ProfileScreen({ name, bio, createdAt, state, onReset, onOpenLifeStats, onEditProfile, onOpenNotifications, onOpenPro, theme, onToggleTheme }) {
  const archetype = ARCHETYPES[getArchetype(state.statXP)];
  const ArchI = archetype.icon;
  const archColor = archetype.color;
  const { level } = getLevelFromXP(state.totalXP);
  const romanLevel = toRoman(level);
  const activeNotifs = Object.values(state.notifications || {}).filter(Boolean).length;
  const totalNotifs  = Object.keys(state.notifications || {}).length;
  const isPro = !!state.isPro;
  const initial = (name || "?").charAt(0).toUpperCase();

  const milestones = deriveMilestones(state, createdAt);
  const timelineRows = buildLevelRows(state.levelHistory, level, 6);

  return (
    <div style={{ padding: "24px 20px 0", position: "relative" }} className="stagger">

      {/* ── MASTHEAD ─────────────────────────────────────────────── */}
      <div style={{ "--i": 0, marginBottom: 26 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.28em", textTransform: "uppercase", fontWeight: 700 }}>
            Profile
          </div>
          <button onClick={onEditProfile} aria-label="Edit profile" style={{
            width: 32, height: 32, borderRadius: 9,
            background: CARD, border: `1px solid ${BORDER_BR}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: TEXT_MID, cursor: "pointer", fontFamily: "inherit",
          }}>
            <Edit3 size={12} />
          </button>
        </div>

        {/* Double-rule masthead */}
        <div style={{ height: 1, background: BORDER, marginBottom: 3 }} />
        <div style={{ height: 1, background: BORDER, marginBottom: 16 }} />

        <div style={{
          fontFamily: SERIF, fontSize: 40, lineHeight: 1,
          letterSpacing: "-0.02em", color: TEXT,
        }}>
          {name}
        </div>
        {bio && (
          <div style={{
            fontSize: 13, color: TEXT_MID, lineHeight: 1.55,
            fontStyle: "italic", marginTop: 10,
          }}>
            <span style={{ color: archColor, marginRight: 4, fontFamily: SERIF, fontSize: 16 }}>"</span>
            {bio}
            <span style={{ color: archColor, marginLeft: 4, fontFamily: SERIF, fontSize: 16 }}>"</span>
          </div>
        )}
      </div>

      {/* ── HERALDIC SIGIL ─────────────────────────────────────── */}
      <div onClick={onOpenLifeStats} style={{
        "--i": 1,
        position: "relative", marginBottom: 28,
        padding: "8px 0 22px",
        textAlign: "center", cursor: "pointer",
      }}>
        {/* Ambient bloom */}
        <div style={{
          position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
          width: 340, height: 340, borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(archColor, "26")} 0%, ${alpha(archColor, "05")} 45%, transparent 70%)`,
          filter: "blur(45px)",
          animation: "archetypeAura 6s ease-in-out infinite",
          pointerEvents: "none", zIndex: 0,
        }} />

        {/* Anno preamble */}
        <div style={{
          position: "relative",
          fontSize: 9, color: TEXT_DIM,
          letterSpacing: "0.36em", textTransform: "uppercase",
          fontWeight: 600, marginBottom: 14,
        }}>
          <span style={{ color: archColor, marginRight: 8 }}>✦</span>
          The Path of
          <span style={{ color: archColor, marginLeft: 8 }}>✦</span>
        </div>

        {/* Sigil frame */}
        <div style={{
          position: "relative", width: 200, height: 220, margin: "0 auto 18px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {/* Watermark monogram */}
          <div aria-hidden style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: SERIF, fontSize: 200, fontWeight: 600,
            color: archColor, opacity: 0.05,
            lineHeight: 1, pointerEvents: "none", userSelect: "none",
          }}>
            {initial}
          </div>

          {/* Hexagonal frame */}
          <svg viewBox="0 0 200 220" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <defs>
              <linearGradient id="sigilFrame" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor={alpha(archColor, "75")} />
                <stop offset="50%"  stopColor={alpha(archColor, "40")} />
                <stop offset="100%" stopColor={alpha(archColor, "75")} />
              </linearGradient>
            </defs>
            <polygon points="100,12 178,55 178,165 100,208 22,165 22,55"
              fill="none" stroke="url(#sigilFrame)" strokeWidth="1.4" />
            <polygon points="100,22 168,60 168,160 100,198 32,160 32,60"
              fill="none" stroke={alpha(archColor, "22")} strokeWidth="0.6" strokeDasharray="2 4" />
            {[[100,12],[178,55],[178,165],[100,208],[22,165],[22,55]].map(([x,y], i) => (
              <circle key={i} cx={x} cy={y} r="2.4" fill={archColor}
                style={{ filter: `drop-shadow(0 0 4px ${archColor})` }} />
            ))}
          </svg>

          {/* Decorative orbital ring (slow rotation) */}
          <svg viewBox="0 0 200 220" style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            opacity: 0.35, animation: "archetypeOrbit 60s linear infinite",
          }}>
            <circle cx="100" cy="110" r="98" fill="none"
              stroke={archColor} strokeWidth="0.5" strokeDasharray="1 8" />
          </svg>

          {/* Inner content */}
          <div style={{
            position: "relative", zIndex: 1,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
          }}>
            <ArchI size={46} color={archColor} strokeWidth={1.5}
              style={{ filter: `drop-shadow(0 0 18px ${alpha(archColor, "65")})`, marginBottom: 10 }} />
            <div style={{
              fontSize: 9, color: TEXT_DIM,
              letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700,
              marginBottom: 2,
            }}>
              LV.
            </div>
            <div style={{
              fontFamily: SERIF, fontSize: 38, lineHeight: 1, fontWeight: 500,
              color: archColor, letterSpacing: "0.04em",
              textShadow: `0 0 24px ${alpha(archColor, "55")}`,
            }}>
              {romanLevel}
            </div>
          </div>
        </div>

        {/* Archetype name + descriptor */}
        <div style={{ position: "relative" }}>
          <div style={{
            fontFamily: SERIF, fontSize: 26, color: TEXT, lineHeight: 1,
            letterSpacing: "0.02em", marginBottom: 6,
          }}>
            {archetype.label}
          </div>
          <div style={{
            fontSize: 10, color: alpha(archColor, "90"),
            letterSpacing: "0.26em", textTransform: "uppercase", fontWeight: 600,
          }}>
            {archetype.desc}
          </div>
        </div>
      </div>

      {/* ── VITALS row ────────────────────────────────────────── */}
      <div style={{
        "--i": 2,
        display: "flex", alignItems: "center", gap: 14,
        padding: "16px 0", marginBottom: 26,
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        {[
          { value: formatXP(state.totalXP), suffix: " XP", label: "Earned" },
          { value: state.streak,             suffix: "d",   label: "Streak" },
          { value: state.completedHistory.completed, suffix: "", label: "Quests" },
        ].map(({ value, suffix, label }, i) => (
          <div key={label} style={{
            flex: 1, textAlign: "center", position: "relative",
            borderLeft: i > 0 ? `1px solid ${BORDER}` : "none",
            padding: i > 0 ? "0 0 0 14px" : 0,
          }}>
            <div style={{
              fontFamily: SERIF, fontSize: 28, color: TEXT, lineHeight: 1,
              fontWeight: 500, fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.01em",
            }}>
              {value}
              {suffix && <span style={{ fontSize: 13, color: TEXT_MID, fontFamily: "inherit", marginLeft: 1 }}>{suffix}</span>}
            </div>
            <div style={{
              fontSize: 9, color: TEXT_DIM,
              letterSpacing: "0.22em", textTransform: "uppercase",
              fontWeight: 600, marginTop: 7,
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── LIFETIME MILESTONES ──────────────────────────────── */}
      <div style={{ "--i": 3, marginBottom: 26 }}>
        <SectionHeader label="Lifetime" ornament={<Trophy size={11} color={alpha(archColor, "70")} />} />

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
        }}>
          <MilestoneTile
            icon={Flame}
            label="Longest Streak"
            value={milestones.longestStreak > 0 ? `${milestones.longestStreak}d` : "—"}
            sub={milestones.longestStreak >= state.streak && state.streak > 0 && state.streak === milestones.longestStreak ? "Current run" : null}
            accentColor={archColor}
          />
          <MilestoneTile
            icon={Calendar}
            label="First Quest"
            value={milestones.firstQuestAt ? formatMonthYear(milestones.firstQuestAt) : "—"}
            sub={milestones.firstQuestAt ? formatShortDate(milestones.firstQuestAt) : null}
            accentColor={archColor}
          />
          <MilestoneTile
            icon={Sparkles}
            label="Highest Day"
            value={milestones.highestDayXP > 0 ? `${milestones.highestDayXP} XP` : "—"}
            sub={milestones.highestDayDate}
            accentColor={archColor}
          />
          <MilestoneTile
            icon={Trophy}
            label="Months Done"
            value={milestones.monthsCompleted}
            sub={milestones.monthsCompleted > 0 ? "Monthly quests" : "None yet"}
            accentColor={archColor}
          />
        </div>
      </div>

      {/* ── LEVEL HISTORY TIMELINE ───────────────────────────── */}
      <div style={{ "--i": 4, marginBottom: 26 }}>
        <SectionHeader
          label="The Climb"
          ornament={
            <span style={{
              fontSize: 9, color: alpha(archColor, "75"),
              letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700,
            }}>
              Lv {toRoman(level)}
            </span>
          }
        />

        <div style={{
          background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
          padding: "20px 18px 8px",
          position: "relative", overflow: "hidden",
        }}>
          {/* Faint corner bloom */}
          <div style={{
            position: "absolute", top: -40, right: -40,
            width: 160, height: 160, borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(archColor, "18")} 0%, transparent 65%)`,
            filter: "blur(30px)", pointerEvents: "none",
          }} />

          {timelineRows.length === 0 || (timelineRows.length === 1 && level === 1) ? (
            <div style={{
              fontSize: 13, color: TEXT_MID,
              fontStyle: "italic", lineHeight: 1.55, textAlign: "center",
              padding: "16px 8px",
              fontFamily: SERIF,
            }}>
              Your climb begins.
              <div style={{
                fontSize: 10, color: TEXT_DIM, marginTop: 8,
                letterSpacing: "0.18em", textTransform: "uppercase",
                fontFamily: "inherit", fontWeight: 600, fontStyle: "normal",
              }}>
                Each level reached will be recorded here
              </div>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              {timelineRows.map((entry, i) => (
                <LevelTimelineRow
                  key={`${entry.level}-${entry.achievedAt || "current"}`}
                  entry={entry}
                  archColor={archColor}
                  isLast={i === timelineRows.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── SETTINGS ─────────────────────────────────────────── */}
      <div style={{ "--i": 5, marginBottom: 18 }}>
        <SectionHeader label="Settings" />

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <SettingsRow icon={TrendingUp} label="View Life Stats" onClick={onOpenLifeStats} />
          <SettingsRow icon={Edit3}      label="Edit Profile"    onClick={onEditProfile} />
          <SettingsRow icon={Settings}   label="Notifications"   note={`${activeNotifs} of ${totalNotifs}`} onClick={onOpenNotifications} />
          <SettingsRow icon={theme === "light" ? Moon : Sun} label={theme === "light" ? "Dark mode" : "Light mode"} onClick={onToggleTheme} />
          <SettingsRow icon={Star}       label="Prominence Pro"  note={isPro ? "Active" : "Unlock everything"} pro={!isPro} onClick={onOpenPro} />
        </div>
      </div>

      {/* ── RESET ───────────────────────────────────────────── */}
      <button onClick={onReset} style={{
        "--i": 6,
        width: "100%", padding: "12px", borderRadius: 12, marginBottom: 8,
        background: "transparent", border: `1px solid ${BORDER_BR}`,
        color: "#F87171", fontSize: 13, fontWeight: 500, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        fontFamily: "inherit",
      }}>
        <RotateCcw size={14} /> Reset all progress
      </button>
    </div>
  );
}
