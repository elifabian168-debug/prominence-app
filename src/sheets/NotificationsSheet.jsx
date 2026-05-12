import { X } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, TEXT, TEXT_DIM, TEXT_MID } from "../constants/theme";
import BottomSheet from "../components/ui/BottomSheet";

const NOTIF_ITEMS = [
  { key: "dailyReminder",   label: "Daily reminder",  desc: "A nudge each morning to plan your day" },
  { key: "streakAtRisk",    label: "Streak at risk",  desc: "Warning at 11pm if you haven't completed a quest" },
  { key: "friendActivity",  label: "Friend activity", desc: "Cheers, nudges, and shared streak alerts" },
  { key: "levelUp",         label: "Level up",        desc: "Celebrate when you reach a new level" },
  { key: "monthlyComplete", label: "Monthly quest",   desc: "Notify when a monthly line is finished" },
];

export default function NotificationsSheet({ open, prefs, onClose, onToggle }) {
  if (!open) return null;

  return (
    <BottomSheet onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 14px" }}>
        <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.22em", textTransform: "uppercase" }}>Notifications</div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: CARD, border: `1px solid ${BORDER}`, color: TEXT_MID, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
        {NOTIF_ITEMS.map(item => {
          const on = !!prefs[item.key];
          return (
            <button key={item.key} onClick={() => onToggle(item.key)} style={{
              background: CARD, border: `1px solid ${on ? ACCENT + "40" : BORDER}`,
              borderRadius: 12, padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 12,
              cursor: "pointer", textAlign: "left", transition: "border-color 0.2s",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: TEXT, marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: TEXT_DIM, lineHeight: 1.4 }}>{item.desc}</div>
              </div>
              <div style={{ width: 36, height: 20, borderRadius: 10, background: on ? ACCENT : BORDER, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: 8, background: "#fff", transition: "left 0.2s" }} />
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ padding: "0 20px 24px" }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 14px", fontSize: 11, color: TEXT_DIM, lineHeight: 1.5 }}>
          Push notifications require permission. They'll be enabled automatically once Prominence ships on iOS / Android.
        </div>
      </div>
    </BottomSheet>
  );
}
