import { useState } from "react";
import { Edit3, Check } from "lucide-react";
import { ACCENT, BG, CARD, CARD_ELEV, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../../constants/theme";
import { CATEGORIES } from "../../constants/categories";

const PARTICLE_ANGLES = [0, 60, 120, 180, 240, 300];

export default function TaskCard({ task, isMain, onComplete, onActions }) {
  const cat = CATEGORIES[task.category] || CATEGORIES.life;
  const Icon = cat.icon;
  const [pressed, setPressed] = useState(false);
  const [burst, setBurst] = useState(false);

  const handleComplete = () => {
    setPressed(true);
    setBurst(true);
    setTimeout(() => { onComplete(); setPressed(false); setBurst(false); }, 520);
  };

  return (
    <div style={{
      background: isMain ? `linear-gradient(135deg, ${alpha(ACCENT, "10")}, ${CARD})` : CARD,
      border: `1px solid ${isMain ? alpha(ACCENT, 0.25) : BORDER}`,
      borderRadius: 14, padding: "12px 14px",
      display: "flex", alignItems: "center", gap: 12,
      transition: "transform 0.2s ease, opacity 0.25s ease",
      transform: pressed ? "scale(0.97)" : "scale(1)",
      opacity: pressed ? 0.65 : 1,
    }}>
      <div style={{ position: "relative", flexShrink: 0, width: 28, height: 28 }}>
        <button onClick={handleComplete} aria-label="Complete quest" style={{
          width: 28, height: 28, borderRadius: "50%",
          background: pressed ? ACCENT : "transparent",
          border: `1.5px solid ${pressed ? ACCENT : (isMain ? ACCENT : BORDER_BR)}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", padding: 0,
          transition: "background 0.15s ease, border-color 0.15s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease",
          transform: pressed ? "scale(1.25)" : "scale(1)",
          boxShadow: pressed ? `0 0 18px ${alpha(ACCENT, "80")}` : "none",
        }}>
          {pressed && (
            <Check
              size={15} color="#0A0A0B" strokeWidth={3}
              style={{ animation: "checkStamp 0.22s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
            />
          )}
        </button>
        {burst && PARTICLE_ANGLES.map((angle, i) => (
          <div key={i} style={{
            position: "absolute", top: "50%", left: "50%",
            transform: `translate(-50%, -50%) rotate(${angle}deg)`,
            pointerEvents: "none", zIndex: 10,
          }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: i % 2 === 0 ? ACCENT : alpha(ACCENT, 0.7),
              animation: "particleShoot 0.52s ease-out forwards",
              animationDelay: `${i * 18}ms`,
            }} />
          </div>
        ))}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: TEXT, fontWeight: 500, marginBottom: 2 }}>{task.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon size={10} color={cat.color} />
          <span style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.12em", textTransform: "uppercase" }}>{cat.label}</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
        <span style={{ fontFamily: SERIF, fontSize: 16, color: ACCENT, fontWeight: 500, lineHeight: 1 }}>+{task.xp}</span>
        <button onClick={e => { e.stopPropagation(); onActions(); }}
          aria-label="Edit or delete quest"
          className="task-actions-btn"
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: CARD_ELEV, border: `1px solid ${BORDER_BR}`,
            color: TEXT_MID, cursor: "pointer", padding: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}>
          <Edit3 size={14} />
        </button>
      </div>
    </div>
  );
}
