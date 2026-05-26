import { useState, useMemo } from "react";
import { Settings, Edit3, Bell, Sun, Moon, RotateCcw, TrendingUp, ChevronRight, Flame, UserPlus, X } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { ARCHETYPES } from "../constants/categories";
import { getLevelFromXP, formatXP } from "../utils/xp";
import { getArchetype } from "../utils/archetype";
import { todayKey } from "../utils/date";
import { getRoutinePreset } from "../constants/routinesData";
import { useViewport } from "../hooks/useViewport";
import SettingsRow from "../components/ui/SettingsRow";
import BottomSheet from "../components/ui/BottomSheet";

const STAT_ORDER = [
  { key: "strength",   label: "Strength",   color: "#E8B14A" },
  { key: "intellect",  label: "Intellect",  color: "#7CA9F2" },
  { key: "vitality",   label: "Vitality",   color: "#E89B8A" },
  { key: "craft",      label: "Craft",      color: "#A78BFA" },
  { key: "discipline", label: "Discipline", color: "#6EE7B7" },
];

// Build a Set of YYYY-MM-DD strings the user posted on (non-private posts).
function postedDaySet(posts) {
  const days = new Set();
  for (const p of posts || []) {
    if (p.authorId !== "me") continue;
    const d = new Date(p.createdAt).toISOString().slice(0, 10);
    days.add(d);
  }
  return days;
}

// Last 30 days as YYYY-MM-DD strings, oldest first.
function last30Days() {
  const out = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export default function YouScreen({
  name, bio, state,
  onReset, onOpenLifeStats, onEditProfile, onOpenNotifications,
  theme, onToggleTheme,
  onOpenFriends, onOpenAddFriends, onOpenFriend,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isDesktop } = useViewport();

  const { totalXP, statXP = {}, streak = 0, longestStreak = 0, posts = [], friends = [], notifications = {}, routines = [], routineXP = 0 } = state;
  const { level, xpIntoLevel, xpForNextLevel, progress } = getLevelFromXP(totalXP);
  const archetypeKey = getArchetype(statXP);
  const archetype = ARCHETYPES[archetypeKey] || ARCHETYPES.balanced;
  const ArchIcon = archetype.icon;

  const totalStat = useMemo(
    () => STAT_ORDER.reduce((s, k) => s + (statXP[k.key] || 0), 0),
    [statXP]
  );

  const postedDays = useMemo(() => postedDaySet(posts), [posts]);
  const days30 = useMemo(() => last30Days(), []);
  const today = todayKey();

  const visibleFriends = friends.slice(0, 5);
  const remainingFriends = Math.max(0, friends.length - visibleFriends.length);

  const activeNotifs = Object.values(notifications).filter(Boolean).length;
  const totalNotifs = Object.keys(notifications).length;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, paddingBottom: 40, position: "relative" }}>
      {/* Atmospheric bloom */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `radial-gradient(60% 40% at 50% -5%, ${alpha(archetype.color, "16")}, transparent 70%)`,
      }} />

      <div style={{ position: "relative", zIndex: 1, padding: "0 20px" }}>
        {/* Top bar — settings gear */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          paddingTop: 20, paddingBottom: 8,
        }}>
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: CARD, border: `1px solid ${BORDER_BR}`,
              color: TEXT_MID,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Settings size={16} />
          </button>
        </div>

        {/* Hero — avatar, name, archetype */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", padding: "8px 0 28px",
          animation: "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}>
          <div style={{
            width: 88, height: 88, borderRadius: "50%",
            background: `linear-gradient(135deg, ${alpha(archetype.color, "80")}, ${alpha(archetype.color, "25")})`,
            border: `2px solid ${alpha(archetype.color, "65")}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 32px ${alpha(archetype.color, "30")}`,
            marginBottom: 14,
          }}>
            <span style={{
              fontFamily: SERIF, fontSize: 38, fontWeight: 500, color: "#FFF",
              textShadow: `0 1px 4px ${alpha("#000", "50")}`,
            }}>
              {name?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
          <div style={{
            fontFamily: SERIF, fontSize: 28, fontWeight: 500,
            color: TEXT, letterSpacing: "0.01em", lineHeight: 1,
            marginBottom: 8,
          }}>
            {name}
          </div>
          <button
            onClick={onOpenLifeStats}
            className="tappable"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 12px", borderRadius: 99,
              background: alpha(archetype.color, "12"),
              border: `1px solid ${alpha(archetype.color, "40")}`,
              color: archetype.color,
              fontSize: 11, fontWeight: 600,
              letterSpacing: "0.16em", textTransform: "uppercase",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <ArchIcon size={11} />
            {archetype.label}
          </button>
          {bio && (
            <div style={{
              fontFamily: SERIF, fontSize: 13, color: TEXT_DIM,
              fontStyle: "italic", marginTop: 12, maxWidth: 280, lineHeight: 1.4,
            }}>
              {bio}
            </div>
          )}
        </div>

        {/* Below the hero: left column = identity/numbers, right column =
            activity-over-time. On mobile this becomes a single stacked column. */}
        <div style={isDesktop ? {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: 24,
        } : {}}>
        <div>
        {/* Level */}
        <SectionHeader label="Level" />
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
          padding: "16px 18px", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: alpha(ACCENT, "15"),
            border: `2px solid ${alpha(ACCENT, "55")}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: `0 0 18px ${alpha(ACCENT, "25")}`,
          }}>
            <span style={{
              fontFamily: SERIF, fontSize: 24, fontWeight: 500, color: TEXT,
              lineHeight: 1, letterSpacing: "-0.02em",
            }}>
              {level}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 10, color: TEXT_DIM,
              letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600,
              marginBottom: 6,
            }}>
              {xpIntoLevel} / {xpForNextLevel} XP
            </div>
            <div style={{
              height: 4, borderRadius: 2,
              background: alpha(ACCENT, "12"),
              overflow: "hidden",
            }}>
              <div style={{
                width: `${Math.min(100, progress * 100)}%`, height: "100%",
                background: ACCENT,
                boxShadow: `0 0 10px ${alpha(ACCENT, "60")}`,
                transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              }} />
            </div>
            <div style={{
              fontSize: 10, color: TEXT_MID, marginTop: 6,
              letterSpacing: "0.08em",
            }}>
              {formatXP(totalXP)} total
            </div>
          </div>
        </div>

        {/* Stats */}
        <SectionHeader label="Stats" />
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
          padding: "14px 16px", marginBottom: 24,
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          {STAT_ORDER.map((s) => {
            const value = statXP[s.key] || 0;
            const fraction = totalStat > 0 ? value / Math.max(totalStat, 1) : 0;
            const width = Math.min(100, fraction * 100 * 2.5); // visual scale, capped
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 78, fontSize: 11, color: TEXT_MID, fontWeight: 600,
                  letterSpacing: "0.06em",
                }}>
                  {s.label}
                </div>
                <div style={{
                  flex: 1, height: 6, borderRadius: 3,
                  background: alpha(s.color, "12"),
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${width}%`, height: "100%",
                    background: s.color,
                    boxShadow: `0 0 6px ${alpha(s.color, "55")}`,
                    transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                  }} />
                </div>
                <div style={{
                  width: 44, textAlign: "right",
                  fontFamily: SERIF, fontSize: 13, color: TEXT,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Friends */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 12,
        }}>
          <div style={{
            fontSize: 10, color: TEXT_DIM,
            letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 700,
          }}>
            Friends · {friends.length}
          </div>
          <button
            onClick={onOpenFriends}
            style={{
              background: "transparent", border: "none",
              color: TEXT_DIM, fontSize: 11, fontWeight: 600,
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 2,
            }}
          >
            See all <ChevronRight size={12} />
          </button>
        </div>
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
          padding: "14px 16px", marginBottom: 24,
        }}>
          {friends.length === 0 ? (
            <button
              onClick={onOpenAddFriends}
              className="tappable"
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "10px 4px",
                background: "transparent", border: "none",
                cursor: "pointer", textAlign: "left", fontFamily: "inherit",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: alpha(ACCENT, "12"),
                border: `1px dashed ${alpha(ACCENT, "45")}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <UserPlus size={14} color={ACCENT} />
              </div>
              <span style={{ fontSize: 13, color: TEXT, fontWeight: 500 }}>
                Add your first friend
              </span>
              <ChevronRight size={14} color={TEXT_DIM} style={{ marginLeft: "auto" }} />
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {visibleFriends.map((f) => {
                const arch = ARCHETYPES[f.archetype] || ARCHETYPES.balanced;
                return (
                  <button
                    key={f.id}
                    onClick={() => onOpenFriend?.(f)}
                    aria-label={f.name}
                    style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: `linear-gradient(135deg, ${alpha(arch.color, "75")}, ${alpha(arch.color, "25")})`,
                      border: `1.5px solid ${alpha(arch.color, "60")}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{
                      fontFamily: SERIF, fontSize: 14, color: "#FFF", fontWeight: 600,
                      textShadow: `0 1px 2px ${alpha("#000", "50")}`,
                    }}>
                      {f.initial}
                    </span>
                  </button>
                );
              })}
              <button
                onClick={onOpenAddFriends}
                aria-label="Add a friend"
                style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "transparent",
                  border: `1.5px dashed ${alpha(ACCENT, "55")}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  color: ACCENT,
                }}
              >
                <UserPlus size={15} />
              </button>
              {remainingFriends > 0 && (
                <div style={{
                  marginLeft: 4, fontSize: 12, color: TEXT_DIM, fontWeight: 600,
                }}>
                  +{remainingFriends}
                </div>
              )}
            </div>
          )}
        </div>
        </div>
        <div>

        {/* Streak */}
        <SectionHeader label="Streak" />
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
          padding: "16px 18px", marginBottom: 24,
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 16,
          }}>
            <div>
              <div style={{
                display: "flex", alignItems: "baseline", gap: 8,
              }}>
                <Flame size={20} color={streak > 0 ? ACCENT : TEXT_DIM} />
                <span style={{
                  fontFamily: SERIF, fontSize: 36, fontWeight: 500,
                  color: streak > 0 ? ACCENT : TEXT_DIM,
                  lineHeight: 1, letterSpacing: "-0.02em",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {streak}
                </span>
                <span style={{
                  fontSize: 10, color: TEXT_DIM,
                  letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600,
                }}>
                  day streak
                </span>
              </div>
            </div>
            <div style={{
              fontSize: 10, color: TEXT_DIM,
              letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600,
              textAlign: "right",
            }}>
              <div style={{ marginBottom: 2 }}>Longest</div>
              <div style={{
                fontFamily: SERIF, fontSize: 18, color: TEXT,
                letterSpacing: "0.02em", textTransform: "none",
              }}>
                {longestStreak}
              </div>
            </div>
          </div>

          {/* 30-day month grid */}
          <MonthGrid days={days30} postedDays={postedDays} today={today} activityLog={state.activityLog || {}} />
          <div style={{
            marginTop: 10,
            fontSize: 10, color: TEXT_DIM,
            letterSpacing: "0.08em",
          }}>
            Last 30 days · XP gained per day
          </div>
        </div>

        {/* Routines */}
        {(routines.length > 0 || routineXP > 0) && (
          <>
            <SectionHeader label="Routines" />
            <RoutinesSummary routines={routines} routineXP={routineXP} />
          </>
        )}
        </div>
        </div>
      </div>

      {/* Settings sheet */}
      {settingsOpen && (
        <SettingsSheet
          onClose={() => setSettingsOpen(false)}
          theme={theme}
          activeNotifs={activeNotifs}
          totalNotifs={totalNotifs}
          onEditProfile={() => { setSettingsOpen(false); onEditProfile?.(); }}
          onOpenNotifications={() => { setSettingsOpen(false); onOpenNotifications?.(); }}
          onOpenLifeStats={() => { setSettingsOpen(false); onOpenLifeStats?.(); }}
          onToggleTheme={onToggleTheme}
          onReset={() => { setSettingsOpen(false); onReset?.(); }}
        />
      )}
    </div>
  );
}

function RoutinesSummary({ routines, routineXP }) {
  let best = null;
  for (const r of routines) {
    if (!best || (r.longestStreak || 0) > (best.longestStreak || 0)) best = r;
  }
  const bestPreset = best ? getRoutinePreset(best.presetId) : null;

  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
      padding: "14px 18px", marginBottom: 24,
      display: "flex", alignItems: "center", gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: alpha(ACCENT, "12"),
        border: `1px solid ${alpha(ACCENT, "40")}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: 22,
      }}>
        {bestPreset?.icon || "✨"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 10, color: TEXT_DIM,
          letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600,
          marginBottom: 4,
        }}>
          Lifetime
        </div>
        <div style={{
          fontFamily: SERIF, fontSize: 22, color: TEXT,
          fontVariantNumeric: "tabular-nums", lineHeight: 1,
        }}>
          {routineXP} XP
        </div>
        {bestPreset && (
          <div style={{
            fontSize: 11, color: TEXT_MID, marginTop: 6,
          }}>
            Longest streak: {best.longestStreak} ({bestPreset.title})
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ label }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
    }}>
      <div style={{
        fontSize: 10, color: TEXT_DIM,
        letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 700,
      }}>
        {label}
      </div>
      <div style={{
        flex: 1, height: 1,
        background: `linear-gradient(90deg, ${alpha(TEXT_DIM, "40")}, transparent)`,
      }} />
    </div>
  );
}

// ── MonthGrid ──
// 30 cells (5 rows × 6 cols) showing the last 30 days. Each cell shows the
// XP gained that day, filled with the accent color when the user gained any
// XP. Posted-but-zero-XP days fall back to a softer fill so the social
// signal isn't lost. Today gets a ring outline.
function MonthGrid({ days, postedDays, today, activityLog }) {
  // Compact XP display: 0 hidden, < 1000 raw, 1000+ as "1.2k".
  const fmt = (xp) => {
    if (!xp) return "";
    if (xp < 1000) return String(xp);
    return `${(xp / 1000).toFixed(xp >= 10000 ? 0 : 1)}k`;
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(6, 1fr)",
      gap: 6,
    }}>
      {days.map((d) => {
        const xp = activityLog[d]?.xp || 0;
        const posted = postedDays.has(d);
        const filled = xp > 0;
        const isToday = d === today;
        return (
          <div
            key={d}
            title={`${d}${xp ? ` · ${xp} XP` : ""}`}
            style={{
              aspectRatio: "1 / 1",
              borderRadius: 4,
              background: filled ? ACCENT : (posted ? alpha(ACCENT, "25") : alpha(TEXT_MID, "10")),
              border: isToday ? `1.5px solid ${ACCENT}` : "1px solid transparent",
              boxShadow: filled ? `0 0 6px ${alpha(ACCENT, "40")}` : "none",
              transition: "background 0.3s ease",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: filled ? BG : TEXT_DIM,
              fontSize: 10, fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.02em",
            }}
          >
            {fmt(xp)}
          </div>
        );
      })}
    </div>
  );
}

// ── SettingsSheet ──
// Behind the gear icon — collapses all the entries that used to live on
// the old ProfileScreen.
function SettingsSheet({
  onClose, theme, activeNotifs, totalNotifs,
  onEditProfile, onOpenNotifications, onOpenLifeStats, onToggleTheme, onReset,
}) {
  return (
    <BottomSheet onClose={onClose}>
      <div style={{ padding: "8px 20px 24px" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 18,
        }}>
          <div style={{
            fontFamily: SERIF, fontSize: 22, fontWeight: 500, color: TEXT,
          }}>
            Settings
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 30, height: 30, borderRadius: "50%",
              background: CARD, border: `1px solid ${BORDER_BR}`,
              color: TEXT_MID,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SettingsRow icon={Edit3} label="Edit Profile" onClick={onEditProfile} />
          <SettingsRow icon={Bell} label="Notifications" note={`${activeNotifs} of ${totalNotifs}`} onClick={onOpenNotifications} />
          <SettingsRow icon={TrendingUp} label="View Life Stats" onClick={onOpenLifeStats} />
          <SettingsRow icon={theme === "light" ? Moon : Sun} label={theme === "light" ? "Dark mode" : "Light mode"} onClick={onToggleTheme} />
        </div>

        <button
          onClick={onReset}
          style={{
            width: "100%", marginTop: 16, padding: "12px",
            background: "transparent", border: `1px solid ${BORDER_BR}`,
            borderRadius: 12,
            color: "#F87171", fontSize: 13, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "inherit",
          }}
        >
          <RotateCcw size={14} /> Reset all progress
        </button>
      </div>
    </BottomSheet>
  );
}
