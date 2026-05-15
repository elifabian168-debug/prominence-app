import { useState } from "react";
import { X } from "lucide-react";
import { ACCENT, BG, CARD, CARD_ELEV, BORDER, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../../constants/theme";
import { ARCHETYPES } from "../../constants/categories";
import { GROUP_THEMES } from "../../constants/groupsData";

// ── InviteFriendSheet ──
// Bottom sheet to pick a friend (who isn't already a member or invited) to summon.
// On select, returns the friend object — parent typically opens SealedScroll next.
export default function InviteFriendSheet({
  open,
  friends = [],
  group,
  onPick,
  onClose,
}) {
  if (!open) return null;

  const memberIds = new Set(group?.memberIds || []);
  const pendingIds = new Set((group?.pendingInvites || []).map((i) => i.friendId));
  const eligible = friends.filter((f) => !memberIds.has(f.id) && !pendingIds.has(f.id));

  const theme = GROUP_THEMES[group?.themeColor] || GROUP_THEMES.solar;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 150,
        background: alpha(BG, "C0"),
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        animation: "fadeIn 0.25s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480,
          background: CARD,
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          border: `1px solid ${BORDER}`,
          borderBottom: "none",
          padding: "20px 20px 32px",
          maxHeight: "78vh",
          overflowY: "auto",
          animation: "fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: `0 -20px 60px ${alpha("#000", "40")}`,
        }}
      >
        {/* Handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: BORDER,
          margin: "0 auto 18px",
        }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{
              fontSize: 10, color: TEXT_DIM,
              letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6,
            }}>
              Summon to the Order
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 24, color: TEXT, lineHeight: 1, letterSpacing: "0.02em" }}>
              {group?.name}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "none", padding: 4,
              color: TEXT_DIM, cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Eligible friend list */}
        {eligible.length === 0 ? (
          <div style={{
            padding: "32px 16px", textAlign: "center",
            color: TEXT_DIM, fontFamily: SERIF, fontStyle: "italic", fontSize: 14,
          }}>
            No friends left to summon — all are members or already invited.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {eligible.map((f) => {
              const arch = ARCHETYPES[f.archetype] || ARCHETYPES.balanced;
              return (
                <button
                  key={f.id}
                  onClick={() => onPick?.(f)}
                  className="tappable"
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px",
                    background: CARD_ELEV,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 12,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "border-color 0.2s ease",
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${alpha(arch.color, "80")} 0%, ${alpha(arch.color, "30")} 100%)`,
                    border: `1.5px solid ${alpha(arch.color, "70")}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontFamily: SERIF, fontSize: 15, color: "#FFF", fontWeight: 600,
                      textShadow: `0 1px 2px ${alpha("#000", "50")}`,
                    }}>{f.initial || f.name?.[0]?.toUpperCase()}</span>
                  </div>

                  {/* Name + archetype */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, color: TEXT, fontWeight: 600, lineHeight: 1.2 }}>
                      {f.name}
                    </div>
                    <div style={{
                      fontSize: 10, color: arch.color,
                      letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600,
                      marginTop: 3,
                    }}>
                      {arch.label}
                    </div>
                  </div>

                  {/* Selection hint */}
                  <div style={{
                    fontSize: 9, color: theme.color,
                    letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700,
                  }}>
                    Summon →
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
