import { CARD, BORDER, TEXT, TEXT_DIM, SERIF } from "../../constants/theme";

export default function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 26, color: TEXT, fontWeight: 500, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
