import { useState, useEffect } from "react";
import { ChevronLeft, Plus, Mail } from "lucide-react";
import { ACCENT, BG, CARD, CARD_ELEV, BORDER, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { GROUP_THEMES, MAX_GROUPS_PER_USER, getGroupLevelFromXP } from "../constants/groupsData";
import GroupCrest from "../components/groups/GroupCrest";

const formatRelativeShort = (ts) => {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
};

// Resolve the member archetypes for crest dots.
const memberArchetypesOf = (group, friends, userArchetype) =>
  group.memberIds.map((id) => {
    if (id === "me") return userArchetype || "balanced";
    return friends.find((x) => x.id === id)?.archetype || "balanced";
  });

export default function GroupsScreen({
  groups = [],
  groupInvites = [],
  friends = [],
  canCreateMore = true,
  userArchetype = "balanced",
  userWeeklyXP = 0,
  onOpenGroup,
  onOpenCreate,
  onOpenInvite,
  onBack,
}) {
  const [enter, setEnter] = useState(false);
  useEffect(() => { const t = setTimeout(() => setEnter(true), 30); return () => clearTimeout(t); }, []);

  return (
    <div style={{
      minHeight: "100vh", background: BG, color: TEXT,
      paddingBottom: 40,
    }}>
      {/* Atmospheric backdrop */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `radial-gradient(60% 40% at 50% -5%, ${alpha(ACCENT, "10")}, transparent 70%)`,
      }} />

      <div style={{ position: "relative", zIndex: 1, padding: "0 20px" }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 24, paddingBottom: 20,
          opacity: enter ? 1 : 0,
          transform: enter ? "translateY(0)" : "translateY(-6px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}>
          <button onClick={onBack} style={{
            background: "transparent", border: "none", color: TEXT_DIM,
            display: "flex", alignItems: "center", gap: 4,
            cursor: "pointer", padding: 0,
            fontSize: 13, fontWeight: 500,
          }}>
            <ChevronLeft size={18} />
            Friends
          </button>
        </div>

        {/* Title */}
        <div style={{
          marginBottom: 28,
          opacity: enter ? 1 : 0,
          transform: enter ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.5s ease 0.05s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.05s",
        }}>
          <div style={{
            fontSize: 10, color: TEXT_DIM,
            letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 700,
            marginBottom: 8,
          }}>
            Sworn together
          </div>
          <div style={{
            fontFamily: SERIF, fontSize: 44, fontWeight: 500,
            color: TEXT, letterSpacing: "0.02em", lineHeight: 1,
            marginBottom: 6,
          }}>
            The Orders
          </div>
          <div style={{
            fontFamily: SERIF, fontSize: 14, color: TEXT_DIM, fontStyle: "italic",
          }}>
            {groups.length} of {MAX_GROUPS_PER_USER} bonds
          </div>
        </div>

        {/* Pending invites section */}
        {groupInvites.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <SectionHeader label="Summons received" count={groupInvites.length} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {groupInvites.map((invite, i) => {
                const theme = GROUP_THEMES[invite.themeColor] || GROUP_THEMES.solar;
                return (
                  <button
                    key={invite.groupId}
                    onClick={() => onOpenInvite?.(invite)}
                    className="tappable"
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 16px",
                      background: `linear-gradient(135deg, ${alpha(theme.color, "10")} 0%, ${CARD} 60%)`,
                      border: `1px solid ${alpha(theme.color, "40")}`,
                      borderRadius: 14,
                      cursor: "pointer", textAlign: "left",
                      animation: `fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms both`,
                      boxShadow: `0 0 24px ${alpha(theme.color, "12")}`,
                    }}
                  >
                    <GroupCrest seed={invite.crestSeed || invite.groupId} themeColor={invite.themeColor} size={48} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 9, color: theme.color,
                        letterSpacing: "0.26em", textTransform: "uppercase",
                        fontWeight: 700, marginBottom: 4,
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <Mail size={9} /> Sealed scroll
                      </div>
                      <div style={{
                        fontFamily: SERIF, fontSize: 19, fontWeight: 500,
                        color: TEXT, lineHeight: 1.1,
                      }}>
                        {invite.groupName}
                      </div>
                      <div style={{
                        fontSize: 11, color: TEXT_DIM, marginTop: 4,
                      }}>
                        From <span style={{ color: theme.color }}>{invite.fromName}</span> · {formatRelativeShort(invite.invitedAt)}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 10, color: theme.color,
                      letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700,
                    }}>
                      Open →
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Your orders */}
        <div style={{ marginBottom: 32 }}>
          <SectionHeader label="Your orders" count={groups.length} />
          {groups.length === 0 ? (
            <div style={{
              padding: "40px 20px", textAlign: "center",
              border: `1px dashed ${BORDER}`, borderRadius: 16,
              color: TEXT_DIM, fontFamily: SERIF, fontStyle: "italic",
              fontSize: 15,
            }}>
              No orders yet. Found one to begin.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {groups.map((g, i) => {
                const theme = GROUP_THEMES[g.themeColor] || GROUP_THEMES.solar;
                const { level } = getGroupLevelFromXP(g.groupXP || 0);
                const archs = memberArchetypesOf(g, friends, userArchetype);
                const activeShared = (g.sharedQuests || []).filter((q) => q.status === "active").length;
                return (
                  <button
                    key={g.id}
                    onClick={() => onOpenGroup?.(g)}
                    className="tappable"
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "16px 18px",
                      background: CARD,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 16,
                      cursor: "pointer", textAlign: "left",
                      animation: `fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 80 + 100}ms both`,
                      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    }}
                  >
                    <GroupCrest
                      seed={g.crestSeed}
                      themeColor={g.themeColor}
                      memberArchetypes={archs}
                      size={56}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: SERIF, fontSize: 20, fontWeight: 500,
                        color: TEXT, lineHeight: 1.1, letterSpacing: "0.01em",
                        marginBottom: 2,
                      }}>
                        {g.name}
                      </div>
                      {g.motto && (
                        <div style={{
                          fontFamily: SERIF, fontSize: 12, color: TEXT_DIM,
                          fontStyle: "italic", marginBottom: 6,
                        }}>
                          {g.motto}
                        </div>
                      )}
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        fontSize: 10, color: TEXT_MID,
                        letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600,
                      }}>
                        <span style={{ color: theme.color }}>Lv. {level}</span>
                        <span style={{ opacity: 0.4 }}>·</span>
                        <span>{g.memberIds.length} bound</span>
                        {activeShared > 0 && (
                          <>
                            <span style={{ opacity: 0.4 }}>·</span>
                            <span style={{ color: theme.color }}>{activeShared} active</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Found new */}
        <button
          onClick={() => canCreateMore && onOpenCreate?.()}
          disabled={!canCreateMore}
          className="tappable"
          style={{
            width: "100%", padding: "16px",
            background: canCreateMore ? alpha(ACCENT, "10") : "transparent",
            border: `1px ${canCreateMore ? "solid" : "dashed"} ${canCreateMore ? alpha(ACCENT, "50") : BORDER}`,
            borderRadius: 14,
            color: canCreateMore ? ACCENT : TEXT_DIM,
            fontFamily: "'Outfit', sans-serif",
            fontSize: 11, fontWeight: 700,
            letterSpacing: "0.22em", textTransform: "uppercase",
            cursor: canCreateMore ? "pointer" : "not-allowed",
            opacity: canCreateMore ? 1 : 0.55,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            animation: "fadeUp 0.5s ease 400ms both",
          }}
        >
          <Plus size={14} />
          {canCreateMore ? "Found an Order" : `Maximum ${MAX_GROUPS_PER_USER} orders`}
        </button>
      </div>
    </div>
  );
}

function SectionHeader({ label, count }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
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
      {count != null && (
        <div style={{
          fontSize: 10, color: TEXT_DIM, fontFamily: SERIF, fontWeight: 600,
        }}>
          {count}
        </div>
      )}
    </div>
  );
}
