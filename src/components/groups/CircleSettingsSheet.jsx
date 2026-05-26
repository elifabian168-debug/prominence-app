import { X } from "lucide-react";
import { BG, CARD, BORDER, TEXT, TEXT_DIM, SERIF, alpha } from "../../constants/theme";
import { GROUP_THEMES } from "../../constants/groupsData";
import { useViewport } from "../../hooks/useViewport";

// Owner-only Circle settings. For v1: the invite-policy toggle. Other
// settings (rename, theme, dissolve) can live here later.
export default function CircleSettingsSheet({
  open,
  group,
  onClose,
  onChangeInvitePolicy,
}) {
  const { isDesktop } = useViewport();
  if (!open || !group) return null;
  const theme = GROUP_THEMES[group.themeColor] || GROUP_THEMES.solar;
  const policy = group.invitePolicy || "owner";

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

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{
              fontSize: 10, color: TEXT_DIM,
              letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6,
            }}>
              Circle settings
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
          fontSize: 9, color: TEXT_DIM,
          letterSpacing: "0.3em", textTransform: "uppercase",
          fontWeight: 700, marginBottom: 8,
        }}>
          Who can invite?
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {[
            { id: "owner",  label: "Owner only", hint: "Only you decide who joins" },
            { id: "anyone", label: "Any member", hint: "Members can invite friends" },
          ].map((opt) => {
            const active = policy === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onChangeInvitePolicy?.(opt.id)}
                className="tappable"
                style={{
                  flex: 1, padding: "12px 14px",
                  background: active ? alpha(theme.color, "16") : "transparent",
                  border: `1px solid ${active ? theme.color : BORDER}`,
                  borderRadius: 10,
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{
                  fontSize: 12, color: active ? theme.color : TEXT, fontWeight: 600,
                  letterSpacing: "0.04em", marginBottom: 4,
                }}>
                  {opt.label}
                </div>
                <div style={{
                  fontSize: 10, color: active ? alpha(theme.color, "B0") : TEXT_DIM,
                  fontStyle: "italic",
                }}>
                  {opt.hint}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
