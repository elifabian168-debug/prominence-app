import { useState, useEffect } from "react";
import { Award } from "lucide-react";
import { ACCENT, BG, BORDER, TEXT, TEXT_DIM, SERIF } from "../../constants/theme";
import { MONTHLY_QUESTS } from "../../constants/questData";

export default function MonthlyBadgeMoment({ monthKey, onDismiss }) {
  const [phase, setPhase] = useState("intro");
  const theme = MONTHLY_QUESTS[monthKey] || MONTHLY_QUESTS.january;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"),  300);
    const t2 = setTimeout(() => setPhase("details"), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const particles = Array.from({ length: 18 }).map((_, i) => ({
    id: i, left: Math.random() * 100, top: Math.random() * 100,
    delay: Math.random() * 1.5, size: Math.random() * 2 + 1,
  }));

  return (
    <div onClick={onDismiss} style={{
      position: "fixed", inset: 0, zIndex: 100, background: BG,
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", animation: "fadeIn 0.3s ease",
    }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: 700, height: 700,
        background: `radial-gradient(circle, ${theme.color}25 0%, transparent 70%)`,
        opacity: phase === "intro" ? 0 : 1, transition: "opacity 1.2s ease", pointerEvents: "none",
      }} />
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.left}%`, top: `${p.top}%`,
          width: p.size, height: p.size, borderRadius: "50%", background: theme.color,
          opacity: phase === "intro" ? 0 : 0.7,
          animation: phase !== "intro" ? `float 3s ease-in-out ${p.delay}s infinite` : "none",
          transition: "opacity 1s ease", pointerEvents: "none",
        }} />
      ))}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 24px" }}>
        <div style={{
          fontSize: 11, color: TEXT_DIM, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 24,
          opacity: phase !== "intro" ? 1 : 0, transition: "opacity 0.6s ease 0.2s",
        }}>Monthly Quest Complete</div>
        <div style={{
          position: "relative", width: 160, height: 160, marginBottom: 28,
          opacity: phase !== "intro" ? 1 : 0,
          transform: phase !== "intro" ? "scale(1)" : "scale(0.7)",
          transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s",
        }}>
          <svg width={160} height={160} viewBox="0 0 160 160" style={{ position: "absolute", inset: 0 }}>
            <circle cx={80} cy={80} r={74} fill="none" stroke={theme.color} strokeWidth={1.5} strokeDasharray="4 4" opacity={0.5} />
            <circle cx={80} cy={80} r={66} fill="none" stroke={theme.color} strokeWidth={2} opacity={0.85} />
          </svg>
          <div style={{
            position: "absolute", inset: 18, borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.color}30 0%, ${theme.color}05 70%)`,
            border: `1px solid ${theme.color}60`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 60px ${theme.color}50, inset 0 0 30px ${theme.color}20`,
          }}>
            <Award size={56} color={theme.color} strokeWidth={1.2} />
          </div>
        </div>
        <div style={{
          fontFamily: SERIF, fontSize: 56, fontWeight: 400, color: TEXT,
          letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 6,
          opacity: phase === "details" ? 1 : 0,
          transform: phase === "details" ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>{theme.name}</div>
        <div style={{
          fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase",
          color: theme.color, marginBottom: 28,
          opacity: phase === "details" ? 1 : 0,
          transform: phase === "details" ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
        }}>{theme.tagline}</div>
        <div style={{
          display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderRadius: 99,
          background: `${theme.color}10`, border: `1px solid ${theme.color}40`,
          opacity: phase === "details" ? 1 : 0,
          transform: phase === "details" ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
        }}>
          <span style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.2em", textTransform: "uppercase" }}>Bonus</span>
          <span style={{ fontFamily: SERIF, fontSize: 22, color: ACCENT }}>+250 XP</span>
        </div>
      </div>
    </div>
  );
}
