import { Bell, Users } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../../constants/theme";
import { RADIUS } from "../../constants/tokens";

const greetingFor = (d = new Date()) => {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

// Sticky top bar inside the desktop content column (desktop-only — mobile
// screens render their own headers). Balanced layout: a time-aware greeting
// anchors the left, the Friends + Notifications actions sit on the right as
// labeled pills.
export default function DesktopTopBar({
  userName,
  title,
  unreadNotifs = 0,
  onOpenNotifs,
  onOpenFriends,
}) {
  const pillBase = {
    display: "inline-flex", alignItems: "center", gap: 8,
    height: 40, padding: "0 18px", borderRadius: RADIUS.pill,
    background: CARD, border: `1px solid ${BORDER_BR}`,
    color: TEXT_MID, cursor: "pointer", fontFamily: "inherit",
    fontSize: 13, fontWeight: 500, letterSpacing: "0.02em",
  };

  const notifActive = unreadNotifs > 0;
  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 30,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 16, padding: "14px 24px",
      // Near-opaque (F2 ≈ 95%) with a light blur. A heavy backdrop blur
      // re-blurs the scrolling content every frame, which reads as a
      // shimmer ripple across the bar; this keeps the frosted feel without it.
      background: alpha(BG, "F2"),
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      borderBottom: `1px solid ${alpha(BORDER, "70")}`,
    }}>
      {/* Left anchor — greeting + date (falls back to a plain title if given) */}
      {title ? (
        <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, color: TEXT, letterSpacing: "0.01em" }}>
          {title}
        </div>
      ) : (
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: SERIF, fontSize: 21, fontWeight: 500,
            color: TEXT, letterSpacing: "0.01em", lineHeight: 1.15,
          }}>
            {greetingFor()}{userName ? `, ${userName}` : ""}
          </div>
          <div style={{
            fontSize: 10, color: TEXT_DIM, marginTop: 3,
            letterSpacing: "0.22em", textTransform: "uppercase",
          }}>
            {dateLabel}
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button
          onClick={onOpenFriends}
          className="tappable"
          aria-label="Friends"
          style={pillBase}
        >
          <Users size={16} />
          <span>Friends</span>
        </button>

        <button
          onClick={onOpenNotifs}
          className="tappable"
          aria-label={`Notifications${notifActive ? `, ${unreadNotifs} unread` : ""}`}
          style={{
            ...pillBase,
            background: notifActive ? alpha(ACCENT, "12") : CARD,
            border: `1px solid ${notifActive ? alpha(ACCENT, "60") : BORDER_BR}`,
            color: notifActive ? ACCENT : TEXT_MID,
          }}
        >
          <Bell size={16}
            style={{
              transformOrigin: "top center",
              animation: notifActive ? "bellRing 2.4s ease-in-out infinite" : "none",
            }}
          />
          <span>Notifications</span>
          {notifActive && (
            <span style={{
              minWidth: 18, height: 18, borderRadius: 99,
              background: ACCENT, color: BG, fontSize: 10, fontWeight: 700,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              padding: "0 5px", marginLeft: 2,
            }}>{unreadNotifs > 9 ? "9+" : unreadNotifs}</span>
          )}
        </button>
      </div>
    </div>
  );
}
