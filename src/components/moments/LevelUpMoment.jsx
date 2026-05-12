import { useState, useEffect } from "react";
import { ACCENT, BG, TEXT, TEXT_DIM, alpha } from "../../constants/theme";

export default function LevelUpMoment({ level, onDismiss }) {
  const [phase, setPhase] = useState("intro");
  const [displayLevel, setDisplayLevel] = useState(Math.max(1, level - 1));

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 200);
    const t2 = setTimeout(() => { setPhase("details"); setDisplayLevel(level); }, 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [level]);

  return (
    <div onClick={onDismiss} style={{
      position: "fixed", inset: 0, zIndex: 100, background: BG,
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", animation: "fadeIn 0.3s ease",
    }}>
      {/* Screen flash */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at center, ${alpha(ACCENT, 0.55)} 0%, transparent 65%)`,
        animation: "lvlFlash 0.9s ease-out forwards",
        pointerEvents: "none",
      }} />

      {/* Expanding burst rings */}
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: "absolute", top: "50%", left: "50%",
          width: 280, height: 280, borderRadius: "50%",
          border: `1px solid ${alpha(ACCENT, 0.28 - i * 0.07)}`,
          animation: "ringBurst 1.4s ease-out forwards",
          animationDelay: `${i * 220}ms`,
          pointerEvents: "none",
        }} />
      ))}

      {/* Radial ambient glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)", width: 600, height: 600,
        background: `radial-gradient(circle, ${alpha(ACCENT, "25")} 0%, transparent 70%)`,
        opacity: phase === "intro" ? 0 : 1, transition: "opacity 1.2s ease",
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 24px", position: "relative" }}>
        <div style={{
          fontSize: 11, color: TEXT_DIM, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 24,
          opacity: phase !== "intro" ? 1 : 0, transition: "opacity 0.6s ease 0.2s",
        }}>Level Up</div>

        <div style={{
          fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
          fontSize: 140, fontWeight: 400, color: TEXT, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 16,
          opacity: phase !== "intro" ? 1 : 0,
          transform: phase !== "intro" ? "scale(1)" : "scale(0.7)",
          transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s",
          textShadow: `0 0 60px ${alpha(ACCENT, "60")}`,
          animation: phase === "details" ? "lvlCount 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards" : "none",
        }}>{displayLevel}</div>

        <div style={{
          fontSize: 13, color: ACCENT, letterSpacing: "0.22em", textTransform: "uppercase",
          opacity: phase === "details" ? 1 : 0, transition: "opacity 0.6s ease",
        }}>You leveled up</div>

        <div style={{
          fontSize: 10, color: TEXT_DIM, letterSpacing: "0.22em", textTransform: "uppercase",
          marginTop: 60, opacity: phase === "details" ? 0.5 : 0, transition: "opacity 0.6s ease 0.6s",
        }}>Tap to continue</div>
      </div>
    </div>
  );
}
