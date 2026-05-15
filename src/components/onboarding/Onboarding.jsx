import { useState, useMemo, useEffect, useRef } from "react";
import { Dumbbell, BookOpen, Briefcase, Brain, ArrowRight } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../../constants/theme";
import { EFFORT_LEVELS, DURATION_LEVELS } from "../../constants/questData";
import { CATEGORIES } from "../../constants/categories";
import { calculateTaskXP } from "../../utils/xp";

const PATHS = [
  {
    id: "fitness",
    label: "Warrior",
    subtitle: "Forged by the body",
    desc: "Strength is your currency. The body is the first battlefield.",
    icon: Dumbbell,
    color: "#E8B14A",
  },
  {
    id: "school",
    label: "Scholar",
    subtitle: "Driven by learning",
    desc: "The mind sharpened is the greatest weapon you'll ever carry.",
    icon: BookOpen,
    color: "#7CA9F2",
  },
  {
    id: "work",
    label: "Artisan",
    subtitle: "Builder of craft",
    desc: "What you make outlasts you. Creation is your legacy.",
    icon: Briefcase,
    color: "#A78BFA",
  },
  {
    id: "mind",
    label: "Monk",
    subtitle: "Master of mind",
    desc: "Stillness is power. Discipline compounds into destiny.",
    icon: Brain,
    color: "#6EE7B7",
  },
];

// ── Sigil SVG ─────────────────────────────────────────────────────────────────
function Sigil({ size = 120, animated = false }) {
  const r = size / 2;
  const inner = r * 0.62;
  const mid = r * 0.82;
  const hex = (radius, phase = 0) =>
    Array.from({ length: 6 }).map((_, i) => {
      const a = (Math.PI / 3) * i + phase;
      return `${r + radius * Math.cos(a)},${r + radius * Math.sin(a)}`;
    }).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="sigilGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <filter id="sigilBloom">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Outer bloom */}
      <circle cx={r} cy={r} r={r * 1.1} fill="url(#sigilGlow)" />
      {/* Outer hex */}
      <polygon
        points={hex(r * 0.92)}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="0.8"
        strokeOpacity="0.5"
        filter="url(#sigilBloom)"
        style={animated ? { animation: "sigilRotate 20s linear infinite" } : {}}
      />
      {/* Mid hex dashed */}
      <polygon
        points={hex(mid)}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="0.5"
        strokeOpacity="0.3"
        strokeDasharray="4 4"
        style={animated ? { animation: "sigilRotate 28s linear infinite reverse", transformOrigin: `${r}px ${r}px` } : {}}
      />
      {/* Inner hex */}
      <polygon
        points={hex(inner, Math.PI / 6)}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="0.8"
        strokeOpacity="0.6"
      />
      {/* Corner dots */}
      {hex(r * 0.92).split(" ").map((pt, i) => {
        const [x, y] = pt.split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r={1.8} fill="var(--accent)" opacity="0.9" />;
      })}
      {/* Center cross */}
      <line x1={r} y1={r - 10} x2={r} y2={r + 10} stroke="var(--accent)" strokeWidth="0.6" strokeOpacity="0.5" />
      <line x1={r - 10} y1={r} x2={r + 10} y2={r} stroke="var(--accent)" strokeWidth="0.6" strokeOpacity="0.5" />
      <circle cx={r} cy={r} r={2.5} fill="var(--accent)" opacity="0.85" />
    </svg>
  );
}

// ── Shared layout ─────────────────────────────────────────────────────────────
function Screen({ children, key: _k }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      animation: "onboardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
    }}>
      {children}
    </div>
  );
}

function CTA({ label, onClick, disabled, icon = true }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "16px 24px",
        background: disabled ? "transparent" : ACCENT,
        color: disabled ? TEXT_DIM : BG,
        border: `1px solid ${disabled ? BORDER : ACCENT}`,
        borderRadius: 12,
        fontFamily: "'Outfit', sans-serif",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        transition: "all 0.2s ease",
        boxShadow: disabled ? "none" : `0 0 24px ${alpha(ACCENT, "30")}`,
      }}
    >
      {label}
      {icon && !disabled && <ArrowRight size={14} />}
    </button>
  );
}

// ── Step 0: Welcome ────────────────────────────────────────────────────────────
function WelcomeStep({ onNext }) {
  return (
    <Screen>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 32px" }}>

        {/* Sigil */}
        <div style={{ marginBottom: 36, animation: "sigilFadeIn 1.2s ease both" }}>
          <Sigil size={96} animated />
        </div>

        {/* Title */}
        <div style={{
          fontFamily: SERIF,
          fontSize: "clamp(52px, 14vw, 76px)",
          fontWeight: 500,
          letterSpacing: "0.18em",
          lineHeight: 1,
          color: TEXT,
          marginBottom: 20,
          animation: "titleRise 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both",
        }}>
          PROMINENCE
        </div>

        {/* Rule */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
          animation: "fadeIn 0.6s ease 0.8s both",
        }}>
          <div style={{ width: 32, height: 1, background: `linear-gradient(90deg, transparent, ${alpha(ACCENT, "70")})` }} />
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
          <div style={{ width: 32, height: 1, background: `linear-gradient(90deg, ${alpha(ACCENT, "70")}, transparent)` }} />
        </div>

        {/* Tagline */}
        <div style={{
          fontFamily: SERIF,
          fontSize: 17,
          fontStyle: "italic",
          color: TEXT_MID,
          lineHeight: 1.6,
          marginBottom: 64,
          animation: "fadeIn 0.6s ease 1s both",
        }}>
          Your real life. Elevated.
        </div>

        <div style={{ width: "100%", animation: "fadeIn 0.6s ease 1.4s both" }}>
          <CTA label="Answer the Call" onClick={onNext} disabled={false} />
        </div>
      </div>
    </Screen>
  );
}

// ── Step 1: Name ───────────────────────────────────────────────────────────────
function NameStep({ name, onChange, onNext }) {
  const inputRef = useRef(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 300); }, []);

  return (
    <Screen>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 8px", position: "relative", overflow: "hidden" }}>

        {/* Ghost watermark */}
        {name && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
            overflow: "hidden",
          }}>
            <div style={{
              fontFamily: SERIF,
              fontSize: "clamp(64px, 22vw, 110px)",
              fontWeight: 500,
              color: ACCENT,
              opacity: 0.055,
              letterSpacing: "0.08em",
              whiteSpace: "nowrap",
              transform: "translateY(-10px)",
              transition: "opacity 0.4s ease",
              userSelect: "none",
            }}>
              {name}
            </div>
          </div>
        )}

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            fontSize: 10, color: TEXT_DIM,
            letterSpacing: "0.36em", textTransform: "uppercase",
            fontWeight: 700, marginBottom: 16,
          }}>
            I. Your Legend
          </div>

          <div style={{
            fontFamily: SERIF,
            fontSize: 42,
            fontWeight: 500,
            lineHeight: 1.1,
            marginBottom: 6,
            color: TEXT,
          }}>
            Who are you?
          </div>

          <div style={{
            fontFamily: SERIF,
            fontSize: 14,
            fontStyle: "italic",
            color: TEXT_DIM,
            marginBottom: 48,
            lineHeight: 1.5,
          }}>
            The chronicles begin with a name.
          </div>

          {/* Input */}
          <div style={{ position: "relative", marginBottom: 56 }}>
            <input
              ref={inputRef}
              value={name}
              onChange={e => onChange(e.target.value)}
              onKeyDown={e => e.key === "Enter" && name.trim() && onNext()}
              placeholder="Your name…"
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                borderBottom: `1px solid ${name.trim() ? alpha(ACCENT, "80") : BORDER_BR}`,
                color: TEXT,
                fontFamily: SERIF,
                fontSize: 34,
                fontWeight: 500,
                padding: "10px 0",
                outline: "none",
                letterSpacing: "0.04em",
                transition: "border-color 0.3s ease",
                boxSizing: "border-box",
              }}
            />
            {name.trim() && (
              <div style={{
                position: "absolute", bottom: -1, left: 0,
                height: 1,
                background: ACCENT,
                boxShadow: `0 0 12px ${alpha(ACCENT, "60")}`,
                width: `${Math.min(100, (name.length / 16) * 100)}%`,
                transition: "width 0.2s ease",
              }} />
            )}
          </div>

          <CTA label="Inscribe Your Name" onClick={onNext} disabled={!name.trim()} />
        </div>
      </div>
    </Screen>
  );
}

// ── Step 2: Path ───────────────────────────────────────────────────────────────
function PathStep({ goal, onSelect, onNext }) {
  return (
    <Screen>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 8px" }}>

        <div style={{
          fontSize: 10, color: TEXT_DIM,
          letterSpacing: "0.36em", textTransform: "uppercase",
          fontWeight: 700, marginBottom: 16,
        }}>
          II. The Path
        </div>

        <div style={{
          fontFamily: SERIF,
          fontSize: 42,
          fontWeight: 500,
          lineHeight: 1.1,
          marginBottom: 6,
          color: TEXT,
        }}>
          Where do you begin?
        </div>

        <div style={{
          fontFamily: SERIF,
          fontSize: 14,
          fontStyle: "italic",
          color: TEXT_DIM,
          marginBottom: 32,
          lineHeight: 1.5,
        }}>
          Your primary archetype. Others will emerge in time.
        </div>

        {/* Path cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
          {PATHS.map((p, i) => {
            const Icon = p.icon;
            const active = goal === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                style={{
                  background: active
                    ? `color-mix(in srgb, ${p.color} 12%, var(--card))`
                    : CARD,
                  border: `1px solid ${active ? p.color : BORDER}`,
                  borderRadius: 16,
                  padding: "20px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 8,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  boxShadow: active ? `0 0 20px color-mix(in srgb, ${p.color} 25%, transparent)` : "none",
                  animation: `fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both`,
                }}
              >
                {/* Icon with glow on active */}
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: active
                    ? `color-mix(in srgb, ${p.color} 22%, transparent)`
                    : `color-mix(in srgb, ${p.color} 10%, transparent)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.25s ease",
                  boxShadow: active ? `0 0 12px color-mix(in srgb, ${p.color} 40%, transparent)` : "none",
                }}>
                  <Icon size={16} color={active ? p.color : `color-mix(in srgb, ${p.color} 70%, var(--text-dim))`} />
                </div>

                <div style={{
                  fontFamily: SERIF,
                  fontSize: 20,
                  fontWeight: 500,
                  color: active ? TEXT : TEXT_MID,
                  lineHeight: 1,
                  transition: "color 0.2s",
                }}>
                  {p.label}
                </div>

                <div style={{
                  fontSize: 10,
                  color: active ? p.color : TEXT_DIM,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  transition: "color 0.2s",
                }}>
                  {p.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected desc */}
        <div style={{
          minHeight: 36,
          marginBottom: 24,
          textAlign: "center",
          fontFamily: SERIF,
          fontSize: 14,
          fontStyle: "italic",
          color: TEXT_DIM,
          lineHeight: 1.6,
          opacity: goal ? 1 : 0,
          transform: goal ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}>
          {goal ? PATHS.find(p => p.id === goal)?.desc : ""}
        </div>

        <CTA label="Walk This Path" onClick={onNext} disabled={!goal} />
      </div>
    </Screen>
  );
}

// ── Step 3: First Quest ────────────────────────────────────────────────────────
function QuestStep({ name, goal, questTitle, setQuestTitle, questCategory, setQuestCategory, questEffort, setQuestEffort, questDuration, setQuestDuration, xp, onComplete }) {
  const inputRef = useRef(null);
  const prevXP = useRef(xp);
  const [xpBump, setXpBump] = useState(false);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 300); }, []);

  useEffect(() => {
    if (xp !== prevXP.current) {
      setXpBump(true);
      prevXP.current = xp;
      const t = setTimeout(() => setXpBump(false), 600);
      return () => clearTimeout(t);
    }
  }, [xp]);

  const pathColor = PATHS.find(p => p.id === goal)?.color || ACCENT;

  return (
    <Screen>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 8px" }}>

        <div style={{
          fontSize: 10, color: TEXT_DIM,
          letterSpacing: "0.36em", textTransform: "uppercase",
          fontWeight: 700, marginBottom: 16,
        }}>
          III. First Act
        </div>

        <div style={{
          fontFamily: SERIF,
          fontSize: 36,
          fontWeight: 500,
          lineHeight: 1.15,
          marginBottom: 6,
          color: TEXT,
        }}>
          Your first act of prominence,{" "}
          <span style={{ color: ACCENT, fontStyle: "italic" }}>{name}</span>.
        </div>

        <div style={{
          fontFamily: SERIF,
          fontSize: 14,
          fontStyle: "italic",
          color: TEXT_DIM,
          marginBottom: 36,
          lineHeight: 1.5,
        }}>
          Set one quest to begin your ascent.
        </div>

        {/* Quest title input */}
        <div style={{ position: "relative", marginBottom: 36 }}>
          <input
            ref={inputRef}
            value={questTitle}
            onChange={e => setQuestTitle(e.target.value)}
            placeholder="What will you accomplish?"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              borderBottom: `1px solid ${questTitle.trim() ? alpha(ACCENT, "80") : BORDER_BR}`,
              color: TEXT,
              fontFamily: SERIF,
              fontSize: 22,
              fontWeight: 500,
              padding: "10px 0",
              outline: "none",
              letterSpacing: "0.02em",
              transition: "border-color 0.3s ease",
              boxSizing: "border-box",
            }}
          />
          {questTitle.trim() && (
            <div style={{
              position: "absolute", bottom: -1, left: 0,
              height: 1,
              background: ACCENT,
              boxShadow: `0 0 12px ${alpha(ACCENT, "50")}`,
              width: "100%",
              animation: "fadeIn 0.3s ease",
            }} />
          )}
        </div>

        {/* Category */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 9, color: TEXT_DIM,
            letterSpacing: "0.3em", textTransform: "uppercase",
            fontWeight: 700, marginBottom: 10,
          }}>
            Category
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {Object.entries(CATEGORIES).map(([key, cat]) => {
              const Icon = cat.icon;
              const active = questCategory === key;
              return (
                <button key={key} onClick={() => setQuestCategory(key)} style={{
                  flex: 1, padding: "10px 4px",
                  background: active ? `color-mix(in srgb, ${cat.color} 15%, var(--card))` : "transparent",
                  border: `1px solid ${active ? cat.color : BORDER}`,
                  borderRadius: 10,
                  color: active ? cat.color : TEXT_DIM,
                  fontSize: 10, fontWeight: active ? 600 : 400,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "'Outfit', sans-serif",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  boxShadow: active ? `0 0 10px color-mix(in srgb, ${cat.color} 25%, transparent)` : "none",
                }}>
                  <Icon size={13} color={active ? cat.color : "var(--text-dim)"} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Effort */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 9, color: TEXT_DIM,
            letterSpacing: "0.3em", textTransform: "uppercase",
            fontWeight: 700, marginBottom: 10,
          }}>
            Effort
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {Object.entries(EFFORT_LEVELS).map(([key, lvl]) => {
              const active = questEffort === key;
              return (
                <button key={key} onClick={() => setQuestEffort(key)} style={{
                  flex: 1, padding: "10px 6px",
                  background: active ? alpha(ACCENT, "12") : "transparent",
                  border: `1px solid ${active ? ACCENT : BORDER}`,
                  borderRadius: 10,
                  color: active ? TEXT : TEXT_DIM,
                  fontSize: 11, fontWeight: active ? 600 : 400,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "'Outfit', sans-serif",
                }}>
                  {lvl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 9, color: TEXT_DIM,
            letterSpacing: "0.3em", textTransform: "uppercase",
            fontWeight: 700, marginBottom: 10,
          }}>
            Duration
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {Object.entries(DURATION_LEVELS).map(([key, lvl]) => {
              const active = questDuration === key;
              return (
                <button key={key} onClick={() => setQuestDuration(key)} style={{
                  flex: 1, padding: "10px 4px",
                  background: active ? alpha(ACCENT, "12") : "transparent",
                  border: `1px solid ${active ? ACCENT : BORDER}`,
                  borderRadius: 10,
                  color: active ? TEXT : TEXT_DIM,
                  fontSize: 10, fontWeight: active ? 600 : 400,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "'Outfit', sans-serif",
                }}>
                  {lvl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* XP reward badge */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px",
          background: alpha(ACCENT, "08"),
          border: `1px solid ${alpha(ACCENT, "25")}`,
          borderRadius: 12,
          marginBottom: 24,
        }}>
          <div style={{
            fontSize: 9, color: TEXT_DIM,
            letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700,
          }}>
            XP Reward
          </div>
          <div style={{
            fontFamily: SERIF,
            fontSize: 32,
            color: ACCENT,
            fontWeight: 500,
            letterSpacing: "0.04em",
            textShadow: xpBump ? `0 0 20px ${alpha(ACCENT, "80")}` : `0 0 8px ${alpha(ACCENT, "30")}`,
            transform: xpBump ? "scale(1.12)" : "scale(1)",
            transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), text-shadow 0.3s ease",
          }}>
            +{xp}
          </div>
        </div>

        <CTA
          label="Begin Your Ascent"
          onClick={onComplete}
          disabled={!questTitle.trim()}
        />
      </div>
    </Screen>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function Onboarding({ onComplete }) {
  const [step, setStep]                     = useState(0);
  const [name, setName]                     = useState("");
  const [goal, setGoal]                     = useState(null);
  const [questTitle, setQuestTitle]         = useState("");
  const [questCategory, setQuestCategory]   = useState(null);
  const [questEffort, setQuestEffort]       = useState("medium");
  const [questDuration, setQuestDuration]   = useState("short");

  const activeCategory = questCategory || goal || "fitness";

  const xp = useMemo(
    () => calculateTaskXP({ category: activeCategory, effort: questEffort, duration: questDuration }),
    [activeCategory, questEffort, questDuration]
  );

  const handleComplete = () => {
    if (!questTitle.trim()) return;
    onComplete(
      { name: name.trim(), goal, createdAt: Date.now() },
      { title: questTitle.trim(), category: activeCategory, effort: questEffort, duration: questDuration, xp }
    );
  };

  return (
    <div style={{
      background: BG,
      minHeight: "100vh",
      color: TEXT,
      fontFamily: "'Outfit', -apple-system, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Atmospheric gradient */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(60% 40% at 50% -5%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 70%),
          radial-gradient(40% 30% at 80% 100%, color-mix(in srgb, var(--accent) 5%, transparent), transparent 60%)
        `,
      }} />

      <div style={{
        maxWidth: 420, margin: "0 auto", padding: "0 24px",
        minHeight: "100vh", display: "flex", flexDirection: "column",
        position: "relative", zIndex: 1,
      }}>
        {/* Step indicators */}
        {step > 0 && (
          <div style={{
            paddingTop: 56, paddingBottom: 0,
            display: "flex", gap: 6,
            animation: "fadeIn 0.4s ease",
          }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                flex: 1, height: 1.5, borderRadius: 1,
                background: i <= step ? ACCENT : BORDER,
                boxShadow: i <= step ? `0 0 6px ${alpha(ACCENT, "50")}` : "none",
                transition: "background 0.4s ease, box-shadow 0.4s ease",
              }} />
            ))}
          </div>
        )}

        <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: step === 0 ? 0 : 32, paddingBottom: 40 }}>
          {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
          {step === 1 && <NameStep name={name} onChange={setName} onNext={() => setStep(2)} />}
          {step === 2 && <PathStep goal={goal} onSelect={setGoal} onNext={() => { goal && setStep(3); }} />}
          {step === 3 && (
            <QuestStep
              name={name}
              goal={goal}
              questTitle={questTitle}
              setQuestTitle={setQuestTitle}
              questCategory={activeCategory}
              setQuestCategory={setQuestCategory}
              questEffort={questEffort}
              setQuestEffort={setQuestEffort}
              questDuration={questDuration}
              setQuestDuration={setQuestDuration}
              xp={xp}
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
