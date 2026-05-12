import { BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_MID, SERIF } from "../../constants/theme";

export default function ConfirmDialog({ icon: Icon, title, message, confirmLabel, confirmColor, onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} style={{
      position: "fixed", inset: 0, zIndex: 60,
      background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20,
        padding: 24, width: "100%", maxWidth: 360,
        animation: "scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${confirmColor}15`, border: `1px solid ${confirmColor}40`,
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
        }}>
          <Icon size={20} color={confirmColor} />
        </div>
        <div style={{ fontSize: 18, color: TEXT, fontWeight: 500, marginBottom: 6, fontFamily: SERIF }}>{title}</div>
        <div style={{ fontSize: 13, color: TEXT_MID, lineHeight: 1.5, marginBottom: 20 }}>{message}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "12px", borderRadius: 10,
            background: "transparent", border: `1px solid ${BORDER_BR}`,
            color: TEXT_MID, fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "12px", borderRadius: 10,
            background: confirmColor, border: "none", color: BG,
            fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em",
          }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
