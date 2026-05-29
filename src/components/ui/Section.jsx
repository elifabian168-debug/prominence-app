import { TYPE, SPACE } from "../../constants/tokens";

export default function Section({ label, children }) {
  return (
    <div style={{ padding: `0 ${SPACE.xl}px ${SPACE.lg}px` }}>
      <div style={{ ...TYPE.sectionLabel, marginBottom: SPACE.md }}>
        {label}
      </div>
      {children}
    </div>
  );
}
