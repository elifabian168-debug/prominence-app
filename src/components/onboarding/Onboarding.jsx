import { useState, useMemo } from "react";
import { Dumbbell, BookOpen, Briefcase, Brain } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../../constants/theme";
import { EFFORT_LEVELS, DURATION_LEVELS } from "../../constants/questData";
import { calculateTaskXP } from "../../utils/xp";

const GOALS = [
  { id: "fitness", label: "Get fit",     icon: Dumbbell  },
  { id: "school",  label: "Learn",       icon: BookOpen  },
  { id: "work",    label: "Build",       icon: Briefcase },
  { id: "mind",    label: "Grow within", icon: Brain     },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep]                   = useState(0);
  const [name, setName]                   = useState("");
  const [goal, setGoal]                   = useState(null);
  const [questTitle, setQuestTitle]       = useState("");
  const [questCategory, setQuestCategory] = useState("fitness");
  const [questEffort, setQuestEffort]     = useState("medium");
  const [questDuration, setQuestDuration] = useState("short");

  const xp = useMemo(
    () => calculateTaskXP({ category: questCategory, effort: questEffort, duration: questDuration }),
    [questCategory, questEffort, questDuration]
  );

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TEXT, fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "60px 24px 40px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Step indicator */}
        <div style={{ display: "flex", gap: 6, marginBottom: 48 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              flex: 1, height: 2, borderRadius: 1,
              background: i <= step ? ACCENT : BORDER, transition: "background 0.3s",
            }} />
          ))}
        </div>

        {step === 0 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", animation: "fadeUp 0.4s ease" }}>
            <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 16 }}>Welcome to</div>
            <div style={{ fontFamily: SERIF, fontSize: 64, lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 24 }}>Prominence</div>
            <div style={{ fontSize: 16, color: TEXT_MID, lineHeight: 1.5, marginBottom: 48 }}>Level up your real life. The protagonist of your own story.</div>
            <button onClick={() => setStep(1)} style={{
              background: ACCENT, color: BG, border: "none", padding: "16px", borderRadius: 12,
              fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", cursor: "pointer",
            }}>BEGIN</button>
          </div>
        )}

        {step === 1 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", animation: "fadeUp 0.4s ease" }}>
            <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 16 }}>Your character</div>
            <div style={{ fontFamily: SERIF, fontSize: 36, lineHeight: 1.1, marginBottom: 36 }}>What's your name?</div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter name"
              style={{
                background: "transparent", border: "none", borderBottom: `1px solid ${BORDER_BR}`,
                color: TEXT, fontFamily: SERIF, fontSize: 28, padding: "12px 0", outline: "none", marginBottom: 48,
              }} />
            <button onClick={() => name.trim() && setStep(2)} disabled={!name.trim()} style={{
              background: name.trim() ? ACCENT : CARD, color: name.trim() ? BG : TEXT_DIM,
              border: "none", padding: "16px", borderRadius: 12,
              fontSize: 14, fontWeight: 600, letterSpacing: "0.06em",
              cursor: name.trim() ? "pointer" : "not-allowed", opacity: name.trim() ? 1 : 0.5,
            }}>CONTINUE</button>
          </div>
        )}

        {step === 2 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", animation: "fadeUp 0.4s ease" }}>
            <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 16 }}>Primary focus</div>
            <div style={{ fontFamily: SERIF, fontSize: 36, lineHeight: 1.1, marginBottom: 32 }}>What matters most?</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
              {GOALS.map(g => {
                const I = g.icon;
                const active = goal === g.id;
                return (
                  <button key={g.id} onClick={() => setGoal(g.id)} style={{
                    background: active ? alpha(ACCENT, "10") : CARD,
                    border: `1px solid ${active ? ACCENT : BORDER}`,
                    borderRadius: 16, padding: "24px 16px",
                    display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12,
                    cursor: "pointer", color: active ? TEXT : TEXT_MID,
                  }}>
                    <I size={20} color={active ? ACCENT : TEXT_MID} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{g.label}</span>
                  </button>
                );
              })}
            </div>
            <button onClick={() => goal && (setQuestCategory(goal), setStep(3))} disabled={!goal} style={{
              background: goal ? ACCENT : CARD, color: goal ? BG : TEXT_DIM,
              border: "none", padding: "16px", borderRadius: 12,
              fontSize: 14, fontWeight: 600, letterSpacing: "0.06em",
              cursor: goal ? "pointer" : "not-allowed", opacity: goal ? 1 : 0.5,
            }}>CONTINUE</button>
          </div>
        )}

        {step === 3 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", animation: "fadeUp 0.4s ease" }}>
            <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 16 }}>First quest</div>
            <div style={{ fontFamily: SERIF, fontSize: 28, lineHeight: 1.2, marginBottom: 24 }}>Set your first quest</div>
            <input value={questTitle} onChange={e => setQuestTitle(e.target.value)} placeholder="What will you accomplish?"
              style={{
                background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
                color: TEXT, fontSize: 16, padding: "14px 16px", outline: "none", marginBottom: 16,
              }} />
            <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>Effort</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 16 }}>
              {Object.entries(EFFORT_LEVELS).map(([key, lvl]) => (
                <button key={key} onClick={() => setQuestEffort(key)} style={{
                  background: questEffort === key ? `${ACCENT}10` : CARD,
                  border: `1px solid ${questEffort === key ? ACCENT : BORDER}`,
                  color: questEffort === key ? TEXT : TEXT_MID,
                  padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: "pointer",
                }}>{lvl.label}</button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>Duration</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 24 }}>
              {Object.entries(DURATION_LEVELS).map(([key, lvl]) => (
                <button key={key} onClick={() => setQuestDuration(key)} style={{
                  background: questDuration === key ? `${ACCENT}10` : CARD,
                  border: `1px solid ${questDuration === key ? ACCENT : BORDER}`,
                  color: questDuration === key ? TEXT : TEXT_MID,
                  padding: "10px 6px", borderRadius: 10, fontSize: 11, fontWeight: 500, cursor: "pointer",
                }}>{lvl.label}</button>
              ))}
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "baseline",
              marginBottom: 24, padding: "12px 16px", background: CARD, borderRadius: 12,
            }}>
              <span style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.2em", textTransform: "uppercase" }}>XP Reward</span>
              <span style={{ fontFamily: SERIF, fontSize: 28, color: ACCENT }}>+{xp}</span>
            </div>
            <button
              onClick={() => questTitle.trim() && onComplete(
                { name: name.trim(), goal },
                { title: questTitle.trim(), category: questCategory, effort: questEffort, duration: questDuration, xp }
              )}
              disabled={!questTitle.trim()}
              style={{
                background: questTitle.trim() ? ACCENT : CARD, color: questTitle.trim() ? BG : TEXT_DIM,
                border: "none", padding: "16px", borderRadius: 12,
                fontSize: 14, fontWeight: 600, letterSpacing: "0.06em",
                cursor: questTitle.trim() ? "pointer" : "not-allowed", opacity: questTitle.trim() ? 1 : 0.5,
              }}>
              ENTER PROMINENCE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
