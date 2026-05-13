import { useMemo } from "react";
import { Check, Award } from "lucide-react";
import { ACCENT, BG, CARD, CARD_ELEV, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { MONTHLY_QUESTS, getQuestTitle } from "../constants/questData";
import BackButton from "../components/ui/BackButton";

export default function MonthDetailScreen({ monthKey, state, onBack, onComplete }) {
  const m = MONTHLY_QUESTS[monthKey];
  const completed = state.monthlyCompletions[monthKey] || [];
  const quests = useMemo(() => Array.from({ length: m.questCount }).map((_, i) => ({
    idx: i, title: getQuestTitle(monthKey, i),
  })), [monthKey, m.questCount]);

  const pct = (completed.length / m.questCount) * 100;
  const isComplete = completed.length === m.questCount;

  return (
    <div style={{ padding: "24px 20px 0", position: "relative" }}>
      {/* Atmospheric bloom in month color */}
      <div className="bloom" style={{
        width: 320, height: 320, right: -80, top: -40,
        background: `radial-gradient(circle, ${alpha(m.color, "20")} 0%, transparent 70%)`,
      }} />

      <BackButton onBack={onBack} />

      {/* Hero card */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: `linear-gradient(135deg, ${alpha(m.color, "22")} 0%, ${alpha(m.color, "06")} 50%, ${CARD} 100%)`,
        border: `1px solid ${alpha(m.color, "40")}`, borderRadius: 18,
        padding: "26px 22px", marginBottom: 22,
        boxShadow: `0 8px 32px ${alpha(m.color, "15")}, inset 0 1px 0 ${alpha(m.color, "20")}`,
      }}>
        {/* Decorative orbital lines */}
        <svg viewBox="0 0 200 200" style={{
          position: "absolute", right: -50, top: -50, width: 220, height: 220,
          pointerEvents: "none", opacity: 0.2,
          animation: "archetypeOrbit 60s linear infinite",
        }}>
          <circle cx="100" cy="100" r="80" fill="none" stroke={m.color} strokeWidth="0.6" strokeDasharray="3 9" />
          <circle cx="100" cy="100" r="92" fill="none" stroke={m.color} strokeWidth="0.4" strokeDasharray="1 5" />
        </svg>

        <div style={{ position: "relative" }}>
          <div style={{
            fontSize: 10, color: m.color,
            letterSpacing: "0.28em", textTransform: "uppercase",
            marginBottom: 10, fontWeight: 700,
          }}>{monthKey} · Monthly Line</div>
          <div style={{ fontFamily: SERIF, fontSize: 52, color: TEXT, lineHeight: 1, marginBottom: 8, letterSpacing: "-0.025em" }}>{m.name}</div>
          <div style={{ fontSize: 14, color: TEXT_MID, marginBottom: 20, fontStyle: "italic" }}>{m.tagline}</div>

          {/* Beefy progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 10, background: alpha(m.color, "12"), borderRadius: 5, overflow: "hidden", position: "relative" }}>
              <div style={{
                height: "100%", width: `${pct}%`,
                background: `linear-gradient(90deg, ${m.color}, ${alpha(m.color, "75")})`,
                borderRadius: 5,
                transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
                boxShadow: pct > 0 ? `0 0 14px ${alpha(m.color, "70")}` : "none",
              }} />
              {/* Shimmer when fully complete */}
              {isComplete && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: `linear-gradient(90deg, transparent, ${alpha("#FFF", "30")}, transparent)`,
                  backgroundSize: "200% 100%",
                  animation: "podiumShimmer 3s linear infinite",
                }} />
              )}
            </div>
            <span style={{
              fontFamily: SERIF, fontSize: 16, color: m.color, fontWeight: 600,
              minWidth: 48, textAlign: "right", fontVariantNumeric: "tabular-nums",
            }}>{completed.length}/{m.questCount}</span>
          </div>
        </div>
      </div>

      {/* Quest list */}
      <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {quests.map((q, i) => {
          const isDone = completed.includes(q.idx);
          return (
            <button key={q.idx} onClick={() => !isDone && onComplete(monthKey, q.idx)} disabled={isDone} style={{
              "--i": i,
              background: isDone
                ? `linear-gradient(135deg, ${alpha(m.color, "12")}, ${alpha(m.color, "04")})`
                : CARD,
              border: `1px solid ${isDone ? alpha(m.color, "40") : BORDER}`,
              borderRadius: 12, padding: "13px 14px",
              display: "flex", alignItems: "center", gap: 12,
              cursor: isDone ? "default" : "pointer", textAlign: "left",
              fontFamily: "inherit",
              transition: "transform 0.15s, background 0.3s",
              boxShadow: isDone ? `0 2px 10px ${alpha(m.color, "12")}` : "none",
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: isDone ? m.color : "transparent",
                border: `1.5px solid ${isDone ? m.color : BORDER_BR}`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                boxShadow: isDone ? `0 0 10px ${alpha(m.color, "60")}` : "none",
                transition: "all 0.2s",
              }}>
                {isDone && <Check size={13} color={BG} strokeWidth={3} />}
              </div>
              <span style={{
                flex: 1, fontSize: 13,
                color: isDone ? TEXT : TEXT,
                fontWeight: isDone ? 500 : 500,
                opacity: isDone ? 0.75 : 1,
                textDecoration: isDone ? "line-through" : "none",
                textDecorationColor: alpha(m.color, "70"),
              }}>{q.title}</span>
              <span style={{
                fontSize: 12, color: isDone ? m.color : ACCENT,
                fontFamily: SERIF, fontWeight: 600, fontVariantNumeric: "tabular-nums",
              }}>+30</span>
            </button>
          );
        })}
      </div>

      {/* Completion celebration */}
      {isComplete && (
        <div style={{
          position: "relative", marginTop: 22, padding: "26px 20px",
          background: `linear-gradient(135deg, ${alpha(m.color, "25")} 0%, ${alpha(m.color, "08")} 60%, ${CARD} 100%)`,
          border: `1.5px solid ${alpha(m.color, "55")}`, borderRadius: 16, textAlign: "center",
          overflow: "hidden",
          animation: "monthBurst 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: `0 8px 32px ${alpha(m.color, "30")}`,
        }}>
          {/* Expanding ring waves */}
          {[0, 0.6, 1.2].map((delay, idx) => (
            <div key={idx} style={{
              position: "absolute", left: "50%", top: "32%",
              width: 80, height: 80, marginLeft: -40, marginTop: -40,
              borderRadius: "50%",
              border: `2px solid ${alpha(m.color, "60")}`,
              animation: `monthRing 2.4s ease-out ${delay}s infinite`,
              pointerEvents: "none",
            }} />
          ))}

          <div style={{ position: "relative" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 56, height: 56, borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha(m.color, "50")} 0%, ${alpha(m.color, "15")} 70%)`,
              border: `1.5px solid ${alpha(m.color, "70")}`,
              boxShadow: `0 0 28px ${alpha(m.color, "60")}`,
              marginBottom: 12,
              animation: "awardFloat 3s ease-in-out infinite",
            }}>
              <Award size={28} color={m.color} strokeWidth={1.8} />
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 24, color: TEXT, marginBottom: 4, letterSpacing: "-0.01em" }}>Quest line complete</div>
            <div style={{ fontSize: 12, color: m.color, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" }}>+250 XP bonus awarded</div>
          </div>
        </div>
      )}
    </div>
  );
}
