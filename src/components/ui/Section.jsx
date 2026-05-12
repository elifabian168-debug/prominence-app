import { TEXT_DIM } from "../../constants/theme";

export default function Section({ label, children }) {
  return (
    <div style={{ padding: "0 20px 18px" }}>
      <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>
        {label}
      </div>
      {children}
    </div>
  );
}
