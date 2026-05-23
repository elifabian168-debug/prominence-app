import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, UserPlus, LogOut, Crown, Hourglass, Flame } from "lucide-react";
import { BG, CARD, BORDER, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { ARCHETYPES } from "../constants/categories";
import { GROUP_THEMES, getGroupLevelFromXP } from "../constants/groupsData";
import { formatXP, toRoman } from "../utils/xp";
import GroupCrest from "../components/groups/GroupCrest";

const DAY_MS = 1000 * 60 * 60 * 24;

const formatFoundedDate = (ts) => {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

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

  const memberArchetypes = members.map((m) => m.archetype);

  // Circle level — derived from its permanent XP pool.
  // XP sources: member joins, and streak milestones (every 3 active days).
  const groupXP = group.groupXP || 0;
  const { level, xpIntoLevel, xpForNextLevel, progress } = getGroupLevelFromXP(groupXP);
  const streakDays = group.streakDays || 0;

  const daysFounded = group.createdAt ? Math.max(1, Math.floor((Date.now() - group.createdAt) / DAY_MS)) : 1;

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

        {/* Hero crest */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", padding: "20px 0 28px",
          opacity: enter ? 1 : 0,
          transform: enter ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.6s ease 0.1s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
        }}>
          <GroupCrest
            seed={group.crestSeed}
            themeColor={group.themeColor}
            memberArchetypes={memberArchetypes}
            size={140}
            animated
          />
          <div style={{
            fontFamily: SERIF, fontSize: 38, fontWeight: 500,
            color: TEXT, letterSpacing: "0.02em", lineHeight: 1,
            marginTop: 18, marginBottom: 6,
            textShadow: `0 0 28px ${alpha(theme.color, "40")}`,
          }}>
            {group.name}
          </div>
          {group.motto && (
            <div style={{
              fontFamily: SERIF, fontSize: 15, color: TEXT_MID,
              fontStyle: "italic", marginBottom: 16,
            }}>
              {group.motto}
            </div>
          )}

          {/* Vitals row */}
          <div style={{
            display: "flex", alignItems: "baseline", gap: 14,
            fontFamily: SERIF, fontWeight: 500,
          }}>
            <Vital label="Level" value={toRoman(level)} color={theme.color} />
            <Divider />
            <Vital label="Members" value={members.length} color={theme.color} />
            <Divider />
            <Vital label="Day" value={daysFounded} color={theme.color} />
          </div>
          <div style={{
            fontSize: 10, color: TEXT_DIM,
            letterSpacing: "0.26em", textTransform: "uppercase",
            fontWeight: 600, marginTop: 12,
          }}>
            Founded {formatFoundedDate(group.createdAt)}
          </div>
        </div>

        {/* Ledger — XP pool, streak, level progress */}
        <SectionHeader label="Activity" color={theme.color} />
        <div style={{
          padding: "16px 18px",
          background: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 14,
          marginBottom: 28,
          animation: "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both",
        }}>
          {/* XP + Streak top row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 14, gap: 12,
          }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{
                fontSize: 9, color: TEXT_DIM,
                letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700,
                marginBottom: 4,
              }}>
                Circle XP
              </div>
              <div style={{
                fontFamily: SERIF, fontSize: 28, fontWeight: 500,
                color: theme.color, lineHeight: 1, letterSpacing: "0.02em",
                textShadow: `0 0 16px ${alpha(theme.color, "35")}`,
              }}>
                {formatXP(groupXP)}
              </div>
            </div>

            {/* Streak chip */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 12px",
              background: streakDays > 0 ? alpha(theme.color, "10") : "transparent",
              border: `1px solid ${streakDays > 0 ? alpha(theme.color, "40") : BORDER}`,
              borderRadius: 99,
            }}>
              <Flame size={13} color={streakDays > 0 ? theme.color : TEXT_DIM} />
              <div style={{
                fontFamily: SERIF, fontSize: 18, fontWeight: 600,
                color: streakDays > 0 ? theme.color : TEXT_DIM,
                lineHeight: 1, letterSpacing: "0.02em",
                fontVariantNumeric: "tabular-nums",
              }}>
                {streakDays}
              </div>
              <div style={{
                fontSize: 9, color: streakDays > 0 ? theme.color : TEXT_DIM,
                letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700,
              }}>
                Day Streak
              </div>
            </div>
          </div>

          {/* Level progress bar */}
          <div style={{ marginBottom: 8 }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "baseline",
              marginBottom: 6,
            }}>
              <div style={{
                fontSize: 9, color: TEXT_DIM,
                letterSpacing: "0.26em", textTransform: "uppercase", fontWeight: 700,
              }}>
                Lv. <span style={{ color: theme.color, fontFamily: SERIF, fontSize: 13, letterSpacing: "0.04em" }}>{toRoman(level)}</span> → <span style={{ color: theme.color, fontFamily: SERIF, fontSize: 13, letterSpacing: "0.04em" }}>{toRoman(level + 1)}</span>
              </div>
              <div style={{
                fontSize: 10, color: TEXT_MID, fontVariantNumeric: "tabular-nums",
                fontWeight: 500,
              }}>
                {xpIntoLevel} / {xpForNextLevel}
              </div>
            </div>
            <div style={{
              height: 4, borderRadius: 2,
              background: alpha(theme.color, "15"),
              overflow: "hidden",
            }}>
              <div style={{
                width: `${Math.min(100, progress * 100)}%`, height: "100%",
                background: `linear-gradient(90deg, ${theme.color}, ${GROUP_THEMES[group.themeColor]?.accent || theme.color})`,
                boxShadow: `0 0 10px ${alpha(theme.color, "60")}`,
                transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              }} />
            </div>
          </div>

          {/* Sources hint */}
          <div style={{
            marginTop: 14, paddingTop: 12,
            borderTop: `1px solid ${alpha(BORDER, "70")}`,
            fontSize: 9, color: TEXT_DIM,
            letterSpacing: "0.16em", textTransform: "uppercase",
            fontWeight: 600, fontStyle: "normal",
            display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap",
          }}>
            <span>Member joins · Streak milestones</span>
          </div>
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

function Vital({ label, value, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{
        fontFamily: SERIF, fontSize: 28, fontWeight: 500,
        color, letterSpacing: "0.02em", lineHeight: 1,
        textShadow: `0 0 14px ${alpha(color, "40")}`,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 8, color: TEXT_DIM,
        letterSpacing: "0.28em", textTransform: "uppercase", fontWeight: 700,
        marginTop: 4,
      }}>
        {label}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 28, background: BORDER }} />;
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
