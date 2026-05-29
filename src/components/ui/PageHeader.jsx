import { ChevronLeft } from "lucide-react";
import { TEXT, TEXT_MID } from "../../constants/theme";
import { TYPE, SPACE } from "../../constants/tokens";

// Standard header for secondary screens: optional back button, a small-caps
// eyebrow, the page title (one size everywhere), and an optional right-aligned
// action slot. Replaces the per-screen title treatments that ranged 26–44px.
export default function PageHeader({ eyebrow, title, onBack, action }) {
  return (
    <div style={{ marginBottom: SPACE.xl }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: "transparent", border: "none", color: TEXT_MID,
            padding: `0 0 ${SPACE.lg}px`, fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", gap: SPACE.xs,
            fontFamily: "inherit",
          }}
        >
          <ChevronLeft size={16} /> Back
        </button>
      )}
      <div style={{
        display: "flex", alignItems: "flex-end",
        justifyContent: "space-between", gap: SPACE.md,
      }}>
        <div>
          {eyebrow && (
            <div style={{ ...TYPE.sectionLabel, marginBottom: SPACE.xs }}>
              {eyebrow}
            </div>
          )}
          <div style={{ ...TYPE.pageTitle, color: TEXT }}>{title}</div>
        </div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </div>
    </div>
  );
}
