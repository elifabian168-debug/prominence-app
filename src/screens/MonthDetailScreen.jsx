import { useMemo } from "react";
import { Check, Award } from "lucide-react";
import { ACCENT, BG, CARD, CARD_ELEV, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF } from "../constants/theme";
import { MONTHLY_QUESTS, getQuestTitle } from "../constants/questData";
import BackButton from "../components/ui/BackButton";

export default function MonthDetailScreen({ monthKey, state, onBack, onComplete }) {
  const m = MONTHLY_QUESTS[monthKey];
  const completed = state.monthlyCompletions[monthKey] || [];
  const quests = useMemo(() => Array.from({ length: m.questCount }).map((_, i) => ({
    idx: i, title: getQuestTitle(monthKey, i),
  })), [monthKey, m.questCount]);

  return (
    <div style={{ padding: "24px 20px 0" }}>
      <BackButton onBack={onBack} />
      <div style={{
        background: `linear-gradient(135deg, ${m.color}20, ${CARD})`,
        border: `1px solid ${m.color}40`, borderRadius: 16, padding: "24px 20px", marginBottom: 20,
      }}>
        <div style={{ fontSize: 10, color: m.color, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 8 }}>{monthKey} · Monthly Line</div>
        <div style={{ fontFamily: SERIF, fontSize: 44, color: TEXT, lineHeight: 1, marginBottom: 8 }}>{m.name}</div>
        <div style={{ fontSize: 13, color: TEXT_MID, marginBottom: 16 }}>{m.tagline}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, height: 3, background: BORDER, borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${(completed.length / m.questCount) * 100}%`, background: m.color, borderRadius: 2, transition: "width 0.4s" }} />
          </div>
          <span style={{ fontSize: 11, color: TEXT_MID, fontFamily: SERIF, minWidth: 36, textAlign: "right" }}>{completed.length}/{m.questCount}</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {quests.map(q => {
          const isDone = completed.includes(q.idx);
          return (
            <button key={q.idx} onClick={() => !isDone && onComplete(monthKey, q.idx)} disabled={isDone} style={{
              background: isDone ? CARD_ELEV : CARD,
              border: `1px solid ${isDone ? m.color + "30" : BORDER}`,
              borderRadius: 12, padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 12,
              cursor: isDone ? "default" : "pointer",
              opacity: isDone ? 0.55 : 1, textAlign: "left",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: isDone ? m.color : "transparent",
                border: `1.5px solid ${isDone ? m.color : BORDER_BR}`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {isDone && <Check size={12} color={BG} strokeWidth={3} />}
              </div>
              <span style={{ flex: 1, fontSize: 13, color: TEXT, textDecoration: isDone ? "line-through" : "none" }}>{q.title}</span>
              <span style={{ fontSize: 11, color: ACCENT, fontFamily: SERIF }}>+30</span>
            </button>
          );
        })}
      </div>

      {completed.length === m.questCount && (
        <div style={{
          marginTop: 16, padding: "16px 18px",
          background: `linear-gradient(135deg, ${m.color}20, ${m.color}05)`,
          border: `1px solid ${m.color}50`, borderRadius: 12, textAlign: "center",
        }}>
          <Award size={28} color={m.color} style={{ marginBottom: 8 }} />
          <div style={{ fontFamily: SERIF, fontSize: 18, color: TEXT, marginBottom: 4 }}>Quest line complete</div>
          <div style={{ fontSize: 12, color: TEXT_MID }}>+250 XP bonus awarded</div>
        </div>
      )}
    </div>
  );
}
