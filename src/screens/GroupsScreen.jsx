import { useState, useEffect } from "react";
import { ChevronLeft, Plus } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { GROUP_THEMES } from "../constants/groupsData";
import { useViewport } from "../hooks/useViewport";

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

// Simple letter-tile preview for a Circle row.
function CircleTile({ name, themeColor, size = 48 }) {
  const theme = GROUP_THEMES[themeColor] || GROUP_THEMES.solar;
  const letter = (name || "C").trim()[0]?.toUpperCase() || "C";
  return (
    <div style={{
      width: size, height: size, borderRadius: 12, flexShrink: 0,
      background: `linear-gradient(135deg, ${alpha(theme.color, "70")}, ${alpha(theme.color, "20")})`,
      border: `1px solid ${alpha(theme.color, "55")}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 0 16px ${alpha(theme.color, "20")}`,
    }}>
      <span style={{
        fontFamily: SERIF, fontSize: Math.round(size * 0.42), fontWeight: 600,
        color: "#FFF", textShadow: `0 1px 2px ${alpha("#000", "50")}`,
      }}>
        {letter}
      </span>
    </div>
  );
}

export default function GroupsScreen({
  groups = [],
  groupInvites = [],
  onOpenGroup,
  onOpenCreate,
  onOpenInvite,
  onBack,
}) {
  const [enter, setEnter] = useState(false);
  const { isDesktop } = useViewport();
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
        {/* Header — back button only when rendered as an overlay */}
        {onBack && (
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
        )}
        {!onBack && <div style={{ paddingTop: 20 }} />}

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
            Your people
          </div>
          <div style={{
            fontFamily: SERIF, fontSize: 44, fontWeight: 500,
            color: TEXT, letterSpacing: "0.02em", lineHeight: 1,
            marginBottom: 6,
          }}>
            Circles
          </div>
          <div style={{
            fontFamily: SERIF, fontSize: 14, color: TEXT_DIM, fontStyle: "italic",
          }}>
            {groups.length === 0 ? "No Circles yet" : `${groups.length} ${groups.length === 1 ? "Circle" : "Circles"}`}
          </div>
        </div>

        {/* Pending invites section */}
        {groupInvites.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <SectionHeader label="Invites" count={groupInvites.length} />
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
                    }}
                  >
                    <CircleTile name={invite.groupName} themeColor={invite.themeColor} size={44} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 9, color: theme.color,
                        letterSpacing: "0.22em", textTransform: "uppercase",
                        fontWeight: 700, marginBottom: 4,
                      }}>
                        Invite
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

        {/* Your Circles */}
        <div style={{ marginBottom: 32 }}>
          <SectionHeader label="Your Circles" count={groups.length} />
          {groups.length === 0 ? (
            <div style={{
              padding: "40px 20px", textAlign: "center",
              border: `1px dashed ${BORDER}`, borderRadius: 16,
              color: TEXT_DIM, fontFamily: SERIF, fontStyle: "italic",
              fontSize: 15,
            }}>
              No Circles yet. Create one to begin.
            </div>
          ) : (
            <div style={isDesktop ? {
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
            } : { display: "flex", flexDirection: "column", gap: 12 }}>
              {groups.map((g, i) => {
                const theme = GROUP_THEMES[g.themeColor] || GROUP_THEMES.solar;
                const streakDays = g.streakDays || 0;
                return (
                  <button
                    key={g.id}
                    onClick={() => onOpenGroup?.(g)}
                    className="tappable"
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 16px",
                      background: CARD,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 14,
                      cursor: "pointer", textAlign: "left",
                      animation: `fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 80 + 100}ms both`,
                      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    }}
                  >
                    <CircleTile name={g.name} themeColor={g.themeColor} size={44} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: SERIF, fontSize: 18, fontWeight: 500,
                        color: TEXT, lineHeight: 1.15, letterSpacing: "0.01em",
                        marginBottom: 2,
                      }}>
                        {g.name}
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        fontSize: 10, color: TEXT_MID,
                        letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600,
                      }}>
                        {streakDays > 0 && (
                          <>
                            <span style={{ color: theme.color }}>🔥 {streakDays}d</span>
                            <span style={{ opacity: 0.4 }}>·</span>
                          </>
                        )}
                        <span>{g.memberIds.length} {g.memberIds.length === 1 ? "member" : "members"}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Create new */}
        <button
          onClick={() => onOpenCreate?.()}
          className="tappable"
          style={{
            width: "100%", padding: "16px",
            background: alpha(ACCENT, "10"),
            border: `1px solid ${alpha(ACCENT, "50")}`,
            borderRadius: 14,
            color: ACCENT,
            fontFamily: "'Outfit', sans-serif",
            fontSize: 11, fontWeight: 700,
            letterSpacing: "0.22em", textTransform: "uppercase",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            animation: "fadeUp 0.5s ease 400ms both",
          }}
        >
          <Plus size={14} />
          New Circle
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
