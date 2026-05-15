import { useState, useEffect } from "react";
import { ACCENT, BG, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../../constants/theme";
import { getTier, toRoman } from "../../utils/xp";

export default function LevelUpMoment({ level, onDismiss }) {
  const tier = getTier(level);
  return tier.isThreshold
    ? <Cinematic level={level} tier={tier} onDismiss={onDismiss} />
    : <MiniCard level={level} onDismiss={onDismiss} />;
}

// ── Subtle mode ─────────────────────────────────────────────────────────────

function MiniCard({ level, onDismiss }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const entered = setTimeout(() => setShow(true), 20);
    const exit = setTimeout(onDismiss, 1800);
    return () => { clearTimeout(entered); clearTimeout(exit); };
  }, [onDismiss]);

  return (
    <div onClick={onDismiss} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: alpha(BG, "85"),
      backdropFilter: "blur(4px)",
      WebkitBackdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer",
      animation: "fadeIn 0.25s ease",
    }}>
      {/* Ambient bloom behind card */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 420, height: 420, borderRadius: "50%",
        background: `radial-gradient(circle, ${alpha(ACCENT, "30")} 0%, ${alpha(ACCENT, "06")} 45%, transparent 70%)`,
        filter: "blur(30px)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative",
        width: 280, padding: "28px 24px",
        background: `linear-gradient(165deg, ${alpha(ACCENT, "14")} 0%, ${alpha(ACCENT, "04")} 50%, ${BG} 100%)`,
        border: `1px solid ${alpha(ACCENT, "40")}`,
        borderRadius: 18,
        boxShadow: `0 12px 40px ${alpha(ACCENT, "20")}, inset 0 1px 0 ${alpha(ACCENT, "15")}`,
        textAlign: "center",
        opacity: show ? 1 : 0,
        transform: show ? "scale(1)" : "scale(0.92)",
        transition: "opacity 0.3s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        {/* Hairline ornament top */}
        <div style={{
          height: 1, width: 40, margin: "0 auto 18px",
          background: `linear-gradient(90deg, transparent, ${alpha(ACCENT, "70")}, transparent)`,
        }} />

        <div style={{
          fontSize: 9, color: TEXT_DIM,
          letterSpacing: "0.3em", textTransform: "uppercase",
          fontWeight: 700, marginBottom: 6,
        }}>
          LV.
        </div>

        <div style={{
          fontFamily: SERIF, fontSize: 60, lineHeight: 1, fontWeight: 500,
          color: ACCENT, letterSpacing: "0.04em",
          textShadow: `0 0 28px ${alpha(ACCENT, "65")}`,
          marginBottom: 14,
        }}>
          {toRoman(level)}
        </div>

        <div style={{
          display: "inline-block",
          padding: "4px 10px", borderRadius: 99,
          background: alpha(ACCENT, "18"),
          border: `1px solid ${alpha(ACCENT, "40")}`,
          fontSize: 9, color: ACCENT,
          letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700,
          marginBottom: 14,
        }}>
          +1 Level
        </div>

        <div style={{
          fontFamily: SERIF, fontSize: 13, color: TEXT_MID,
          fontStyle: "italic", lineHeight: 1.5,
        }}>
          your prominence rises
        </div>

        {/* Hairline ornament bottom */}
        <div style={{
          height: 1, width: 40, margin: "18px auto 0",
          background: `linear-gradient(90deg, transparent, ${alpha(ACCENT, "70")}, transparent)`,
        }} />
      </div>
    </div>
  );
}

// ── Cinematic mode (tier crossing) ──────────────────────────────────────────

function Cinematic({ level, tier, onDismiss }) {
  const [phase, setPhase] = useState("curtain"); // curtain → inscription → rule → tier → steady
  const romanLevel = toRoman(level);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("inscription"), 300);
    const t2 = setTimeout(() => setPhase("rule"),        1100);
    const t3 = setTimeout(() => setPhase("tier"),        1900);
    const t4 = setTimeout(() => setPhase("steady"),      2700);
    return () => { [t1, t2, t3, t4].forEach(clearTimeout); };
  }, []);

  const after = (p) => ["inscription","rule","tier","steady"].includes(phase) && phase >= p;
  const inscriptionVisible = ["inscription","rule","tier","steady"].includes(phase);
  const ruleVisible        = ["rule","tier","steady"].includes(phase);
  const tierVisible        = ["tier","steady"].includes(phase);
  const steadyVisible      = phase === "steady";

  return (
    <div onClick={onDismiss} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: BG,
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", cursor: "pointer",
      animation: "fadeIn 0.3s ease",
    }}>
      {/* Edge vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at center, transparent 30%, ${BG} 95%)`,
        pointerEvents: "none",
      }} />

      {/* Vertical beams (top + bottom converge mid-screen) */}
      <div style={{
        position: "absolute", top: 0, left: "50%",
        width: 2, height: "50%",
        background: `linear-gradient(to bottom, transparent, ${alpha(ACCENT, "75")})`,
        transformOrigin: "top center",
        animation: "beamDescend 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        filter: `drop-shadow(0 0 8px ${alpha(ACCENT, "55")})`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: "50%",
        width: 2, height: "50%",
        background: `linear-gradient(to top, transparent, ${alpha(ACCENT, "75")})`,
        transformOrigin: "bottom center",
        animation: "beamDescend 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        filter: `drop-shadow(0 0 8px ${alpha(ACCENT, "55")})`,
        pointerEvents: "none",
      }} />

      {/* Initial flash */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at center, ${alpha(ACCENT, "45")} 0%, transparent 60%)`,
        animation: "lvlFlash 1.1s ease-out forwards",
        pointerEvents: "none",
      }} />

      {/* Expanding rings */}
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: "absolute", top: "50%", left: "50%",
          width: 320, height: 320, borderRadius: "50%",
          border: `1px solid ${alpha(ACCENT, String(Math.max(8, 28 - i * 7)))}`,
          animation: "ringBurst 1.6s ease-out forwards",
          animationDelay: `${i * 250}ms`,
          pointerEvents: "none",
        }} />
      ))}

      {/* Ambient bloom */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 700, height: 700, borderRadius: "50%",
        background: `radial-gradient(circle, ${alpha(ACCENT, "22")} 0%, ${alpha(ACCENT, "06")} 40%, transparent 70%)`,
        opacity: inscriptionVisible ? 1 : 0,
        transition: "opacity 1.4s ease",
        pointerEvents: "none",
      }} />

      {/* Drifting ash particles (only after inscription begins) */}
      {inscriptionVisible && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden",
        }}>
          {Array.from({ length: 14 }).map((_, i) => {
            const left = 20 + (i * 60) % 80; // 20-80% horizontally
            const drift = (i % 3 - 1) * 22;
            const size = i % 3 === 0 ? 3 : 2;
            const delay = (i * 180) % 1600;
            return (
              <div key={i} style={{
                position: "absolute",
                left: `${left}%`, bottom: -8,
                width: size, height: size, borderRadius: "50%",
                background: alpha(ACCENT, "85"),
                boxShadow: `0 0 6px ${alpha(ACCENT, "70")}`,
                animation: `ashDrift ${2200 + (i % 5) * 350}ms ease-out infinite`,
                animationDelay: `${delay}ms`,
                "--drift": `${drift}px`,
              }} />
            );
          })}
        </div>
      )}

      {/* Center stack */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", padding: "0 24px",
        position: "relative", zIndex: 2,
      }}>
        {/* LV. small caps */}
        <div style={{
          fontSize: 11, color: TEXT_DIM,
          letterSpacing: "0.36em", textTransform: "uppercase", fontWeight: 700,
          marginBottom: 16,
          opacity: inscriptionVisible ? 1 : 0,
          transform: inscriptionVisible ? "translateY(0)" : "translateY(-6px)",
          transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}>
          The Path of
        </div>

        {/* Roman numeral — staggered letter reveal */}
        <div style={{
          fontFamily: SERIF, fontSize: 120, fontWeight: 500,
          color: TEXT, letterSpacing: "0.06em", lineHeight: 1,
          marginBottom: 18,
          textShadow: `0 0 60px ${alpha(ACCENT, "55")}, 0 0 12px ${alpha(ACCENT, "30")}`,
          display: "flex", gap: 4,
        }}>
          {romanLevel.split("").map((ch, i) => (
            <span key={i} style={{
              display: "inline-block",
              opacity: inscriptionVisible ? 1 : 0,
              transform: inscriptionVisible ? "translateY(0)" : "translateY(8px)",
              transition: `opacity 0.45s ease ${i * 90}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 90}ms`,
            }}>
              {ch}
            </span>
          ))}
        </div>

        {/* Horizontal sigil rule with corner ornaments */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          marginBottom: 24,
          opacity: ruleVisible ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}>
          <div style={{
            width: 4, height: 4, borderRadius: "50%",
            background: ACCENT, boxShadow: `0 0 8px ${ACCENT}`,
            transform: ruleVisible ? "scale(1)" : "scale(0)",
            transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.4s",
          }} />
          <div style={{
            width: 160, height: 1,
            background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
            transform: ruleVisible ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "center",
            transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
          }} />
          <div style={{
            width: 4, height: 4, borderRadius: "50%",
            background: ACCENT, boxShadow: `0 0 8px ${ACCENT}`,
            transform: ruleVisible ? "scale(1)" : "scale(0)",
            transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.4s",
          }} />
        </div>

        {/* Tier reveal */}
        <div style={{
          fontFamily: SERIF, fontSize: 42, fontWeight: 500,
          color: TEXT, lineHeight: 1, letterSpacing: "0.04em",
          marginBottom: 14,
          opacity: tierVisible ? 1 : 0,
          transform: tierVisible ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.6s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1)",
          textShadow: `0 0 40px ${alpha(ACCENT, "35")}`,
        }}>
          {tier.name}
        </div>

        <div style={{
          fontSize: 11, color: ACCENT,
          letterSpacing: "0.26em", textTransform: "uppercase", fontWeight: 700,
          marginBottom: 6,
          opacity: tierVisible ? 1 : 0,
          transition: "opacity 0.5s ease 0.2s",
        }}>
          A new rank begins
        </div>

        <div style={{
          fontFamily: SERIF, fontSize: 14, color: TEXT_MID,
          fontStyle: "italic", lineHeight: 1.5,
          opacity: tierVisible ? 0.85 : 0,
          transition: "opacity 0.6s ease 0.35s",
        }}>
          Level {level} reached
        </div>

        {/* Steady — tap hint */}
        <div style={{
          marginTop: 56,
          fontSize: 10, color: TEXT_DIM,
          letterSpacing: "0.26em", textTransform: "uppercase", fontWeight: 600,
          opacity: steadyVisible ? 0.55 : 0,
          transition: "opacity 0.6s ease",
        }}>
          Tap to continue
        </div>
      </div>
    </div>
  );
}
