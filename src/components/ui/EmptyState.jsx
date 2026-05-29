import { ACCENT, CARD, TEXT, TEXT_MID, SERIF, alpha } from "../../constants/theme";
import { SPACE, RADIUS } from "../../constants/tokens";

// Shared empty-state card: a dashed gold-tinted panel with an optional icon,
// a serif headline, supporting copy, and an optional CTA. Generalized from the
// repeated empty states on Home / Feed so they all read the same.
export default function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${alpha(ACCENT, "06")}, ${CARD})`,
      border: `1px dashed ${alpha(ACCENT, "30")}`,
      borderRadius: RADIUS.card,
      padding: `${SPACE.xxxl}px ${SPACE.xl}px`,
      textAlign: "center",
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: SPACE.sm,
    }}>
      {Icon && (
        <div style={{
          width: 44, height: 44, borderRadius: RADIUS.pill,
          background: alpha(ACCENT, "12"),
          border: `1px solid ${alpha(ACCENT, "30")}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: ACCENT, marginBottom: SPACE.xs,
        }}>
          <Icon size={20} />
        </div>
      )}
      <div style={{
        fontFamily: SERIF, fontSize: 18, color: TEXT, letterSpacing: "-0.01em",
      }}>
        {title}
      </div>
      {body && (
        <div style={{ fontSize: 13, color: TEXT_MID, lineHeight: 1.5, maxWidth: 280 }}>
          {body}
        </div>
      )}
      {action && <div style={{ marginTop: SPACE.sm }}>{action}</div>}
    </div>
  );
}
