import { ChevronRight } from "lucide-react";
import { ACCENT, CARD, BORDER, TEXT, TEXT_MID, TEXT_DIM, alpha } from "../../constants/theme";

export default function SettingsRow({ icon: Icon, label, note, pro, onClick }) {
  return (
    <div onClick={onClick} className="tappable" style={{
      position: "relative",
      background: pro
        ? `linear-gradient(135deg, ${alpha(ACCENT, "16")} 0%, ${alpha(ACCENT, "04")} 60%, ${CARD} 100%)`
        : CARD,
      border: `1px solid ${pro ? alpha(ACCENT, "40") : BORDER}`,
      borderRadius: 12, padding: "12px 14px",
      display: "flex", alignItems: "center", gap: 12,
      cursor: onClick ? "pointer" : "default",
      overflow: "hidden",
      boxShadow: pro ? `0 4px 16px ${alpha(ACCENT, "12")}` : "none",
    }}>
      {pro && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `linear-gradient(110deg, transparent 30%, ${alpha(ACCENT, "10")} 45%, transparent 60%)`,
          backgroundSize: "200% 100%",
          animation: "podiumShimmer 5s linear infinite",
        }} />
      )}
      <div style={{
        position: "relative", zIndex: 1,
        width: 30, height: 30, borderRadius: 8,
        background: pro ? `radial-gradient(circle, ${alpha(ACCENT, "35")} 0%, ${alpha(ACCENT, "10")} 70%)` : alpha(TEXT_MID, "08"),
        border: pro ? `1px solid ${alpha(ACCENT, "40")}` : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: pro ? `0 0 14px ${alpha(ACCENT, "30")}` : "none",
      }}>
        <Icon size={14} color={pro ? ACCENT : TEXT_MID} />
      </div>
      <span style={{ flex: 1, fontSize: 13, color: TEXT, fontWeight: 500, position: "relative", zIndex: 1 }}>{label}</span>
      {note && (
        <span style={{
          fontSize: 11, color: pro ? ACCENT : TEXT_DIM,
          fontWeight: pro ? 600 : 400,
          letterSpacing: pro ? "0.04em" : "normal",
          position: "relative", zIndex: 1,
        }}>{note}</span>
      )}
      <ChevronRight size={14} color={pro ? alpha(ACCENT, "70") : TEXT_DIM} style={{ position: "relative", zIndex: 1 }} />
    </div>
  );
}
