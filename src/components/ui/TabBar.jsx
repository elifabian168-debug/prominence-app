import { Home, BarChart3, Plus, Swords, User } from "lucide-react";
import { ACCENT, BG, BORDER, TEXT_DIM, alpha } from "../../constants/theme";

const TABS = [
  { id: "home",    icon: Home,      label: "Home" },
  { id: "stats",   icon: BarChart3, label: "Stats" },
  { id: "add",     icon: Plus,      isAdd: true },
  { id: "quests",  icon: Swords,    label: "Quests" },
  { id: "profile", icon: User,      label: "Profile" },
];

export default function TabBar({ activeTab, onTabChange, onAdd }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40,
      background: "rgba(10,10,11,0.78)", backdropFilter: "blur(24px) saturate(140%)",
      WebkitBackdropFilter: "blur(24px) saturate(140%)",
      borderTop: `1px solid ${BORDER}`,
    }}>
      <div style={{
        maxWidth: 480, margin: "0 auto",
        display: "flex", justifyContent: "space-around", alignItems: "center",
        padding: "10px 12px 16px",
      }}>
        {TABS.map(t => {
          const I = t.icon;
          if (t.isAdd) {
            return (
              <button key={t.id} onClick={onAdd} aria-label="Create quest"
                className="tappable"
                style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${ACCENT} 0%, ${alpha(ACCENT, "85")} 100%)`,
                  border: "none", color: BG,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: `0 6px 22px ${alpha(ACCENT, "55")}, inset 0 1px 0 ${alpha("#fff", "30")}`,
                  marginTop: -12,
                }}>
                <I size={24} strokeWidth={2.8} />
              </button>
            );
          }
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => onTabChange(t.id)}
              className="tappable"
              style={{
                background: "transparent", border: "none",
                color: active ? ACCENT : TEXT_DIM, cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                padding: "4px 8px",
                position: "relative",
                transition: "color 0.2s",
              }}>
              <I size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span style={{
                fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
                fontWeight: active ? 700 : 500,
              }}>
                {t.label}
              </span>
              {active && (
                <div style={{
                  position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
                  width: 4, height: 4, borderRadius: "50%",
                  background: ACCENT,
                  boxShadow: `0 0 8px ${ACCENT}`,
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
