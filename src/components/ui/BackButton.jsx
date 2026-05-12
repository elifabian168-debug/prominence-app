import { ChevronLeft } from "lucide-react";
import { TEXT_MID } from "../../constants/theme";

export default function BackButton({ onBack, paddingBottom = 16 }) {
  return (
    <button onClick={onBack} style={{
      background: "transparent", border: "none", color: TEXT_MID,
      padding: `0 0 ${paddingBottom}px`, fontSize: 13,
      display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
    }}>
      <ChevronLeft size={16} /> Back
    </button>
  );
}
