import { BG, BORDER } from "../../constants/theme";
import { useViewport } from "../../hooks/useViewport";

// On mobile: classic bottom sheet, sliding up from the bottom edge.
// On desktop: same content, but centered as a modal card with full
// borderRadius. The drag-handle grip is hidden because there's no
// "drag-to-dismiss" affordance at desktop.
export default function BottomSheet({ onClose, maxHeight = "90vh", children }) {
  const { isDesktop } = useViewport();
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: isDesktop ? "center" : "flex-end",
      justifyContent: "center",
      padding: isDesktop ? 24 : 0,
      animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: BG, border: `1px solid ${BORDER}`,
        borderRadius: isDesktop ? 20 : 0,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        width: "100%", maxWidth: 480, maxHeight, overflowY: "auto",
        animation: isDesktop ? "fadeIn 0.25s ease" : "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {!isDesktop && (
          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: BORDER }} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
