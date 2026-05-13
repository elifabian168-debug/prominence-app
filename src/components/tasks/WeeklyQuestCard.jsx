import { useState } from "react";
import { Edit3, Calendar, Check } from "lucide-react";
import { ACCENT, BG, CARD, CARD_ELEV, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../../constants/theme";
import { CATEGORIES } from "../../constants/categories";

const WEEKLY_ACCENT = "#7CA9F2";
const URGENT_COLOR  = "#F87171";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const daysLeft = (deadline) => {
  const ms = deadline - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
};

export default function WeeklyQuestCard({ quest, onComplete, onActions }) {
  const cat = CATEGORIES[quest.category] || CATEGORIES.life;
  const Icon = cat.icon;
  const [pressed, setPressed] = useState(false);
  const left = daysLeft(quest.deadline);
  const urgent = left <= 1 && quest.status === "pending";
  const accent = quest.status === "complete" ? ACCENT : urgent ? URGENT_COLOR : WEEKLY_ACCENT;

  // Time elapsed as fraction of a week (for the arc indicator)
  const msRemaining = Math.max(0, quest.deadline - Date.now());
  const elapsedFrac = Math.min(1, Math.max(0, 1 - msRemaining / WEEK_MS));

  const handleComplete = () => {
    if (quest.status !== "pending") return;
    setPressed(true);
    setTimeout(() => { onComplete(); setPressed(false); }, 320);
  };

  const checked = pressed || quest.status === "complete";

  let deadlineText;
  if (quest.status === "complete") deadlineText = "Complete";
  else if (left === 0)             deadlineText = "Expires today";
  else if (left === 1)             deadlineText = "1 day left";
  else                              deadlineText = `${left} days left`;

  // Arc ring geometry
  const ringSize = 36;
  const ringStroke = 2;
  const ringR = (ringSize - ringStroke) / 2 - 1;
  const ringCircum = 2 * Math.PI * ringR;

  return (
    <div style={{
      background: `linear-gradient(135deg, ${accent}10, ${CARD})`,
      border: `1px solid ${accent}40`,
      borderRadius: 14, padding: "12px 14px",
      display: "flex", alignItems: "center", gap: 12,
      transition: "transform 0.15s, opacity 0.2s",
      transform: pressed ? "scale(0.97)" : "scale(1)",
      opacity: pressed ? 0.5 : 1,
    }}>
      {/* Complete button wrapped in a day-arc progress ring */}
      <div style={{ position: "relative", width: ringSize, height: ringSize, flexShrink: 0 }}>
        {quest.status === "pending" && (
          <svg width={ringSize} height={ringSize} style={{
            position: "absolute", inset: 0,
            transform: "rotate(-90deg)",
            pointerEvents: "none",
          }}>
            <circle cx={ringSize / 2} cy={ringSize / 2} r={ringR}
              fill="none" stroke={alpha(accent, "20")} strokeWidth={ringStroke} />
            <circle cx={ringSize / 2} cy={ringSize / 2} r={ringR}
              fill="none" stroke={accent} strokeWidth={ringStroke}
              strokeLinecap="round"
              strokeDasharray={ringCircum}
              strokeDashoffset={ringCircum * (1 - elapsedFrac)}
              style={{
                transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                filter: urgent ? `drop-shadow(0 0 4px ${alpha(URGENT_COLOR, "70")})` : "none",
              }}
            />
          </svg>
        )}
        <button onClick={handleComplete} aria-label="Complete weekly quest" style={{
          position: "absolute", inset: 4,
          borderRadius: "50%",
          background: checked ? ACCENT : "transparent",
          border: `1.5px solid ${checked ? ACCENT : accent}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: quest.status === "pending" ? "pointer" : "default", padding: 0,
          transition: "background 0.15s ease, border-color 0.15s ease, transform 0.15s ease",
          transform: pressed ? "scale(1.08)" : "scale(1)",
          boxShadow: pressed ? `0 0 12px ${alpha(ACCENT, "80")}` : "none",
        }}>
          {checked && <Check size={13} color={BG} strokeWidth={3} />}
        </button>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: TEXT, fontWeight: 500, marginBottom: 4, textDecoration: quest.status === "complete" ? "line-through" : "none" }}>
          {quest.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Icon size={10} color={cat.color} />
            <span style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.12em", textTransform: "uppercase" }}>{cat.label}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Calendar size={10} color={accent} />
            <span style={{ fontSize: 10, color: accent, letterSpacing: "0.08em", fontWeight: 600 }}>{deadlineText}</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
        <span style={{ fontFamily: SERIF, fontSize: 16, color: ACCENT, fontWeight: 600, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>+{quest.xp}</span>
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
