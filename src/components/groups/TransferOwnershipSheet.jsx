import { X, Crown } from "lucide-react";
import { BG, CARD, CARD_ELEV, BORDER, TEXT, TEXT_DIM, SERIF, alpha } from "../../constants/theme";
import { ARCHETYPES } from "../../constants/categories";
import { GROUP_THEMES } from "../../constants/groupsData";
import { useViewport } from "../../hooks/useViewport";

// Owner-leave flow: when the founder taps Leave on a Circle that still has
// other members, they pick a new leader before stepping down. Tapping a
// member returns that member to the parent via onPick.
export default function TransferOwnershipSheet({
  open,
  friends = [],
  group,
  onPick,
  onClose,
}) {
  const { isDesktop } = useViewport();
  if (!open || !group) return null;

  const theme = GROUP_THEMES[group.themeColor] || GROUP_THEMES.solar;
  const candidates = (group.memberIds || [])
    .filter((id) => id !== "me")
    .map((id) => friends.find((f) => f.id === id))
    .filter(Boolean);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 150,
        background: alpha(BG, "C0"),
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: isDesktop ? "center" : "flex-end",
        justifyContent: "center",
        padding: isDesktop ? 24 : 0,
        animation: "fadeIn 0.25s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480,
          background: CARD,
          borderRadius: isDesktop ? 20 : 0,
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          border: `1px solid ${BORDER}`,
          borderBottom: isDesktop ? `1px solid ${BORDER}` : "none",
          padding: "20px 20px 32px",
          maxHeight: "78vh",
          overflowY: "auto",
          animation: isDesktop ? "fadeIn 0.25s ease" : "fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: isDesktop ? `0 20px 60px ${alpha("#000", "40")}` : `0 -20px 60px ${alpha("#000", "40")}`,
        }}
      >
        {!isDesktop && (
          <div style={{
            width: 40, height: 4, borderRadius: 2,
            background: BORDER,
            margin: "0 auto 18px",
          }} />
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{
              fontSize: 10, color: TEXT_DIM,
              letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6,
            }}>
              Choose a new leader
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 24, color: TEXT, lineHeight: 1, letterSpacing: "0.02em" }}>
              {group.name}
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

        <div style={{
          fontSize: 12, color: TEXT_DIM, fontStyle: "italic",
          marginBottom: 16, lineHeight: 1.4,
        }}>
          Pick a member to take over. You'll leave the Circle once they're set as the new owner.
        </div>

        {candidates.length === 0 ? (
          <div style={{
            padding: "32px 16px", textAlign: "center",
            color: TEXT_DIM, fontFamily: SERIF, fontStyle: "italic", fontSize: 14,
          }}>
            No other members to hand off to.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {candidates.map((f) => {
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
                  }}
                >
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
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: 9, color: theme.color,
                    letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700,
                  }}>
                    <Crown size={11} />
                    Make leader
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
