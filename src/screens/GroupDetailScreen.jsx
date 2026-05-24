import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, UserPlus, LogOut, Crown, Hourglass, Flame } from "lucide-react";
import { BG, CARD, BORDER, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { ARCHETYPES } from "../constants/categories";
import { GROUP_THEMES } from "../constants/groupsData";
import { todayKey } from "../utils/date";

// Resolve the visual state of a Circle's streak:
//   fresh   — qualified today (lastStreakDay === today)
//   at_risk — qualified yesterday, hasn't qualified yet today
//   lost    — gap is > 1 day, streak is dead but the number lingers
//   zero    — never started a streak, or solo Circle (can't accrue)
function getStreakStatus(circle) {
  const memberCount = (circle.memberIds || []).length;
  if (memberCount < 2) return "zero_solo";
  const days = circle.streakDays || 0;
  if (!circle.lastStreakDay || days === 0) return "zero";
  const today = todayKey();
  if (circle.lastStreakDay === today) return "fresh";
  const yesterday = (() => {
    const d = new Date(`${today}T00:00:00`);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();
  if (circle.lastStreakDay === yesterday) return "at_risk";
  return "lost";
}

export default function GroupDetailScreen({
  group,
  friends = [],
  userName = "You",
  userArchetype = "balanced",
  userWeeklyXP = 0,
  onBack,
  onInvite,
  onCancelInvite,
  onLeaveGroup,
}) {
  const [enter, setEnter] = useState(false);
  useEffect(() => { const t = setTimeout(() => setEnter(true), 30); return () => clearTimeout(t); }, []);

  if (!group) return null;
  const theme = GROUP_THEMES[group.themeColor] || GROUP_THEMES.solar;

  // Resolve members to a normalized shape
  const members = useMemo(
    () =>
      group.memberIds.map((id) =>
        id === "me"
          ? { id: "me", name: userName, initial: userName[0]?.toUpperCase() || "Y", archetype: userArchetype, weeklyXP: userWeeklyXP, isMe: true }
          : (() => {
              const f = friends.find((x) => x.id === id);
              return f || { id, name: "Unknown", initial: "?", archetype: "balanced", weeklyXP: 0 };
            })()
      ),
    [group.memberIds, friends, userName, userArchetype, userWeeklyXP]
  );

  const streakStatus = getStreakStatus(group);
  const streakDays = group.streakDays || 0;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, paddingBottom: 40 }}>
      {/* Atmospheric theme bloom */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `radial-gradient(70% 50% at 50% -10%, ${alpha(theme.color, "20")}, transparent 70%)`,
      }} />

      <div style={{ position: "relative", zIndex: 1, padding: "0 20px" }}>
        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 24, paddingBottom: 12,
          opacity: enter ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}>
          <button onClick={onBack} style={{
            background: "transparent", border: "none", color: TEXT_DIM,
            display: "flex", alignItems: "center", gap: 4,
            cursor: "pointer", padding: 0, fontSize: 13, fontWeight: 500,
          }}>
            <ChevronLeft size={18} /> Circles
          </button>
          <button
            onClick={() => onLeaveGroup?.(group.id)}
            style={{
              background: "transparent", border: `1px solid ${BORDER}`,
              padding: "6px 10px", borderRadius: 8,
              color: TEXT_DIM, fontSize: 10, fontWeight: 600,
              letterSpacing: "0.18em", textTransform: "uppercase",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
            }}
          >
            <LogOut size={11} /> Leave
          </button>
        </div>

        {/* Hero — Circle name, tagline, then streak as the dominant number. */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", padding: "20px 0 36px",
          opacity: enter ? 1 : 0,
          transform: enter ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.6s ease 0.1s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
        }}>
          <div style={{
            fontFamily: SERIF, fontSize: 32, fontWeight: 500,
            color: TEXT, letterSpacing: "0.02em", lineHeight: 1,
            marginBottom: 6,
            textShadow: `0 0 24px ${alpha(theme.color, "30")}`,
          }}>
            {group.name}
          </div>
          {group.motto && (
            <div style={{
              fontFamily: SERIF, fontSize: 14, color: TEXT_MID,
              fontStyle: "italic", marginBottom: 28,
            }}>
              {group.motto}
            </div>
          )}

          <StreakHero status={streakStatus} streakDays={streakDays} themeColor={theme.color} />
        </div>

        {/* Members */}
        <SectionHeader label="Members" count={members.length} color={theme.color} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
          {members.map((m, i) => {
            const arch = ARCHETYPES[m.archetype] || ARCHETYPES.balanced;
            const isFounder = m.id === group.founderId;
            return (
              <div
                key={m.id}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px",
                  background: m.isMe ? alpha(theme.color, "08") : CARD,
                  border: `1px solid ${m.isMe ? alpha(theme.color, "40") : BORDER}`,
                  borderRadius: 12,
                  animation: `fadeUp 0.45s ease ${i * 60}ms both`,
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${alpha(arch.color, "80")}, ${alpha(arch.color, "30")})`,
                  border: `1.5px solid ${alpha(arch.color, "70")}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{
                    fontFamily: SERIF, fontSize: 14, color: "#FFF", fontWeight: 600,
                    textShadow: `0 1px 2px ${alpha("#000", "50")}`,
                  }}>
                    {m.initial}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, color: TEXT, fontWeight: 600 }}>
                      {m.name}
                    </span>
                    {isFounder && (
                      <Crown size={11} color={theme.color} style={{ flexShrink: 0 }} />
                    )}
                    {m.isMe && (
                      <span style={{
                        fontSize: 8, color: theme.color,
                        letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700,
                      }}>You</span>
                    )}
                  </div>
                  <div style={{
                    fontSize: 9, color: arch.color,
                    letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600,
                    marginTop: 2,
                  }}>
                    {arch.label}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pending invites */}
          {(group.pendingInvites || []).map((inv) => {
            const f = friends.find((x) => x.id === inv.friendId);
            if (!f) return null;
            const arch = ARCHETYPES[f.archetype] || ARCHETYPES.balanced;
            return (
              <div
                key={inv.friendId}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px",
                  background: "transparent",
                  border: `1px dashed ${alpha(theme.color, "40")}`,
                  borderRadius: 12,
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: alpha(arch.color, "20"),
                  border: `1.5px dashed ${alpha(arch.color, "50")}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Hourglass size={14} color={arch.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: TEXT_MID, fontWeight: 600 }}>
                    {f.name}
                  </div>
                  <div style={{
                    fontSize: 9, color: theme.color,
                    letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600,
                    marginTop: 2,
                  }}>
                    Invite pending
                  </div>
                </div>
                <button
                  onClick={() => onCancelInvite?.(group.id, inv.friendId)}
                  style={{
                    background: "transparent", border: `1px solid ${BORDER}`,
                    padding: "5px 9px", borderRadius: 6,
                    color: TEXT_DIM, fontSize: 9, fontWeight: 700,
                    letterSpacing: "0.18em", textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            );
          })}
        </div>

        {/* Invite CTA */}
        <button
          onClick={onInvite}
          className="tappable"
          style={{
            width: "100%", padding: "14px",
            background: alpha(theme.color, "10"),
            border: `1px solid ${alpha(theme.color, "50")}`,
            borderRadius: 12,
            color: theme.color,
            fontFamily: "'Outfit', sans-serif",
            fontSize: 11, fontWeight: 700,
            letterSpacing: "0.22em", textTransform: "uppercase",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            marginBottom: 32,
          }}
        >
          <UserPlus size={14} />
          Invite a Friend
        </button>
      </div>
    </div>
  );
}

function StreakHero({ status, streakDays, themeColor }) {
  // Color modes:
  //   fresh   → flame bright, number in theme color
  //   at_risk → flame dim, number muted (today hasn't qualified yet)
  //   lost    → flame dark, number very muted, "STREAK LOST" caption
  //   zero    → flame dim, "0", hint about how to start
  //   zero_solo → "0", "Invite someone to start a streak"
  const palette = (() => {
    if (status === "fresh")   return { flame: themeColor,            num: themeColor,            label: TEXT_DIM };
    if (status === "at_risk") return { flame: alpha(themeColor, "70"), num: alpha(themeColor, "B0"), label: TEXT_DIM };
    if (status === "lost")    return { flame: alpha(TEXT_DIM, "70"), num: alpha(TEXT_DIM, "90"), label: TEXT_DIM };
    return { flame: TEXT_DIM, num: TEXT_DIM, label: TEXT_DIM };
  })();

  const showNumber = status !== "zero_solo";
  const display = status === "zero" || status === "zero_solo" ? 0 : streakDays;

  let caption = "day streak";
  if (status === "at_risk")     caption = "needs 2 today";
  if (status === "lost")        caption = "STREAK LOST";
  if (status === "zero")        caption = "needs 2 today to start";
  if (status === "zero_solo")   caption = "invite someone to start a streak";

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 4,
    }}>
      <Flame
        size={36}
        color={palette.flame}
        strokeWidth={1.5}
        style={{
          filter: status === "fresh" ? `drop-shadow(0 0 16px ${alpha(themeColor, "60")})` : "none",
          marginBottom: 4,
          transition: "color 0.4s ease, filter 0.4s ease",
        }}
      />
      {showNumber && (
        <div style={{
          fontFamily: SERIF, fontSize: 92, fontWeight: 500,
          color: palette.num,
          lineHeight: 1, letterSpacing: "0.01em",
          textShadow: status === "fresh"
            ? `0 0 40px ${alpha(themeColor, "40")}`
            : "none",
          fontVariantNumeric: "tabular-nums",
          transition: "color 0.4s ease",
        }}>
          {display}
        </div>
      )}
      <div style={{
        marginTop: 4,
        fontSize: status === "lost" ? 11 : 10,
        color: status === "lost" ? alpha(TEXT, "B0") : palette.label,
        letterSpacing: status === "lost" ? "0.32em" : "0.22em",
        textTransform: "uppercase", fontWeight: status === "lost" ? 800 : 600,
      }}>
        {caption}
      </div>
    </div>
  );
}

function SectionHeader({ label, count, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
    }}>
      <div style={{
        fontSize: 10, color: color || TEXT_DIM,
        letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 700,
      }}>
        {label}
      </div>
      <div style={{
        flex: 1, height: 1,
        background: `linear-gradient(90deg, ${alpha(color || TEXT_DIM, "40")}, transparent)`,
      }} />
      {count != null && (
        <div style={{ fontSize: 10, color: TEXT_DIM, fontFamily: SERIF, fontWeight: 600 }}>
          {count}
        </div>
      )}
    </div>
  );
}
