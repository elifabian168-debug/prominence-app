import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, UserPlus, LogOut, Crown, Hourglass } from "lucide-react";
import { BG, CARD, BORDER, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { ARCHETYPES } from "../constants/categories";
import { GROUP_THEMES } from "../constants/groupsData";
import GroupCrest from "../components/groups/GroupCrest";

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

        {/* Hero — name + tagline. Step 10 replaces the crest with the streak hero. */}
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
            size={120}
            animated
          />
          <div style={{
            fontFamily: SERIF, fontSize: 36, fontWeight: 500,
            color: TEXT, letterSpacing: "0.02em", lineHeight: 1,
            marginTop: 16, marginBottom: 6,
            textShadow: `0 0 28px ${alpha(theme.color, "40")}`,
          }}>
            {group.name}
          </div>
          {group.motto && (
            <div style={{
              fontFamily: SERIF, fontSize: 15, color: TEXT_MID,
              fontStyle: "italic",
            }}>
              {group.motto}
            </div>
          )}
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
