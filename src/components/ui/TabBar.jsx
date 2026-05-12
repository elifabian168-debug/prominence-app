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
      background: "rgba(10,10,11,0.85)", backdropFilter: "blur(20px)",
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
              <button key={t.id} onClick={onAdd} style={{
                width: 48, height: 48, borderRadius: "50%",
                background: ACCENT, border: "none", color: BG,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", boxShadow: `0 4px 16px ${alpha(ACCENT, "40")}`, marginTop: -8,
              }}>
                <I size={22} strokeWidth={2.5} />
              </button>
            );
          }
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => onTabChange(t.id)} style={{
              background: "transparent", border: "none",
              color: active ? ACCENT : TEXT_DIM, cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              padding: "4px 8px",
            }}>
              <I size={20} />
              <span style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
