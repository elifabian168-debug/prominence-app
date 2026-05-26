import { Home, Newspaper, Users, User, Flame, Plus } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_MID, TEXT_DIM, SERIF, alpha } from "../../constants/theme";
import Logo from "./Logo";

const NAV = [
  { id: "home",    icon: Home,      label: "Home" },
  { id: "feed",    icon: Newspaper, label: "Feed" },
  { id: "circles", icon: Users,     label: "Circles" },
  { id: "you",     icon: User,      label: "You" },
];

// Desktop-only sidebar. Replaces the bottom TabBar above the 1024px
// breakpoint. Brand at top, 4 nav items in the middle, level + streak
// chip in the footer.
export default function Sidebar({ activeTab, onTabChange, level, streak, onAdd }) {
  return (
    <aside style={{
      gridColumn: "1",
      height: "100vh",
      position: "sticky",
      top: 0,
      display: "flex", flexDirection: "column",
      background: alpha(BG, "00"),
      borderRight: `1px solid ${BORDER}`,
      padding: "20px 14px",
      gap: 24,
    }}>
      {/* Brand */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "4px 8px",
      }}>
        <Logo size={32} />
        <span style={{
          fontFamily: SERIF, fontSize: 18, fontWeight: 500,
          color: TEXT, letterSpacing: "0.01em",
        }}>
          Prominence
        </span>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {NAV.map((item) => {
          const I = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="tappable"
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px",
                background: active ? alpha(ACCENT, "12") : "transparent",
                border: "none",
                borderLeft: `3px solid ${active ? ACCENT : "transparent"}`,
                color: active ? ACCENT : TEXT_MID,
                cursor: "pointer", textAlign: "left",
                fontSize: 14, fontWeight: active ? 600 : 500,
                fontFamily: "inherit",
                borderRadius: 8,
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <I size={18} strokeWidth={active ? 2.2 : 1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Add quest CTA — peer-level affordance to the bottom-nav plus button */}
        {onAdd && (
          <button
            onClick={onAdd}
            className="tappable"
            style={{
              marginTop: 12,
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px",
              background: alpha(ACCENT, "10"),
              border: `1px solid ${alpha(ACCENT, "45")}`,
              borderRadius: 10,
              color: ACCENT,
              cursor: "pointer", textAlign: "left",
              fontSize: 12, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase",
              fontFamily: "inherit",
            }}
          >
            <Plus size={14} strokeWidth={2.6} /> New quest
          </button>
        )}
      </nav>

      {/* Ambient footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 12px",
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{
            fontSize: 9, color: TEXT_DIM,
            letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700,
          }}>
            Level
          </span>
          <span style={{
            fontFamily: SERIF, fontSize: 18, fontWeight: 500, color: TEXT,
            lineHeight: 1, fontVariantNumeric: "tabular-nums",
          }}>
            {level ?? 1}
          </span>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: "5px 9px", borderRadius: 99,
          background: streak > 0 ? alpha(ACCENT, "12") : "transparent",
          border: `1px solid ${streak > 0 ? alpha(ACCENT, "40") : BORDER_BR}`,
        }}>
          <Flame size={11} color={streak > 0 ? ACCENT : TEXT_DIM} />
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: streak > 0 ? ACCENT : TEXT_MID,
            fontVariantNumeric: "tabular-nums",
          }}>
            {streak ?? 0}
          </span>
        </div>
      </div>
    </aside>
  );
}
