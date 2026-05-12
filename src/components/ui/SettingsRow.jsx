import { ChevronRight } from "lucide-react";
import { ACCENT, CARD, BORDER, TEXT, TEXT_MID, TEXT_DIM, alpha } from "../../constants/theme";

export default function SettingsRow({ icon: Icon, label, note, pro, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: pro ? `linear-gradient(90deg, ${alpha(ACCENT, "10")}, ${CARD})` : CARD,
      border: `1px solid ${pro ? alpha(ACCENT, "30") : BORDER}`,
      borderRadius: 12, padding: "12px 14px",
      display: "flex", alignItems: "center", gap: 12,
      cursor: onClick ? "pointer" : "default",
    }}>
      <Icon size={16} color={pro ? ACCENT : TEXT_MID} />
      <span style={{ flex: 1, fontSize: 13, color: TEXT, fontWeight: 500 }}>{label}</span>
      {note && <span style={{ fontSize: 11, color: pro ? ACCENT : TEXT_DIM }}>{note}</span>}
      <ChevronRight size={14} color={TEXT_DIM} />
    </div>
  );
}
