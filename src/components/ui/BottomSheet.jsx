import { BG, BORDER } from "../../constants/theme";

export default function BottomSheet({ onClose, maxHeight = "90vh", children }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: BG, border: `1px solid ${BORDER}`,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        width: "100%", maxWidth: 480, maxHeight, overflowY: "auto",
        animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: BORDER }} />
        </div>
        {children}
      </div>
    </div>
  );
}
