import { Bell, Users } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_MID, SERIF, alpha } from "../../constants/theme";

// Sticky top bar that lives inside the main content column on desktop.
// Three slots: title (left, optional), Friends button (right), Notifications
// bell (right). Mirrors the header chrome of mobile screens so they can hide
// their per-screen versions via the embedded prop.
export default function DesktopTopBar({
  title,
  unreadNotifs = 0,
  onOpenNotifs,
  onOpenFriends,
}) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 30,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 24px",
      background: alpha(BG, "BF"),
      backdropFilter: "blur(20px) saturate(140%)",
      WebkitBackdropFilter: "blur(20px) saturate(140%)",
      borderBottom: `1px solid ${alpha(BORDER, "70")}`,
    }}>
      <div style={{
        fontFamily: SERIF, fontSize: 22, fontWeight: 500,
        color: TEXT, letterSpacing: "0.01em",
      }}>
        {title || ""}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={onOpenFriends}
          aria-label="Friends"
          style={{
            position: "relative",
            width: 34, height: 34, borderRadius: 10,
            background: CARD, border: `1px solid ${BORDER_BR}`,
            color: TEXT_MID, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Users size={15} />
        </button>

        <button
          onClick={onOpenNotifs}
          aria-label={`Notifications${unreadNotifs > 0 ? `, ${unreadNotifs} unread` : ""}`}
          style={{
            position: "relative",
            width: 34, height: 34, borderRadius: 10,
            background: CARD,
            border: `1px solid ${unreadNotifs > 0 ? alpha(ACCENT, "60") : BORDER_BR}`,
            color: unreadNotifs > 0 ? ACCENT : TEXT_MID,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Bell size={15}
            style={{
              transformOrigin: "top center",
              animation: unreadNotifs > 0 ? "bellRing 2.4s ease-in-out infinite" : "none",
            }}
          />
          {unreadNotifs > 0 && (
            <div style={{
              position: "absolute", top: -3, right: -3,
              minWidth: 16, height: 16, borderRadius: 99,
              background: ACCENT, color: BG, fontSize: 9, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 4px", border: `2px solid ${BG}`,
            }}>{unreadNotifs > 9 ? "9+" : unreadNotifs}</div>
          )}
        </button>
      </div>
    </div>
  );
}

