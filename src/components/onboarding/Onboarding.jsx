import { useState, useMemo, useEffect, useRef } from "react";
import { ArrowRight, Share2, Check } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../../constants/theme";
import { CATEGORIES } from "../../constants/categories";
import { calculateTaskXP } from "../../utils/xp";

// ── Onboarding ──
// Three screens, ~1 minute total. No archetype picker, no XP explainer,
// no notification permission prompt — those land contextually later.
//
//   1. Name
//   2. First goal (title + cadence + category)
//   3. Invite friends (or skip)
//
// onComplete(user, firstQuest) — firstQuest may be null when skipped.
export default function Onboarding({ onComplete }) {
  const [step, setStep]         = useState(0);
  const [name, setName]         = useState("");
  const [goalTitle, setGoalTitle] = useState("");
  const [cadence, setCadence]   = useState("daily"); // daily | weekly | main
  const [category, setCategory] = useState("life");

  const xp = useMemo(
    () => calculateTaskXP({
      category,
      effort: cadence === "weekly" ? "high" : "medium",
      duration: cadence === "weekly" ? "major" : "short",
      isMainQuest: cadence === "main",
      isWeeklyQuest: cadence === "weekly",
    }),
    [category, cadence]
  );

  const finish = (firstQuest) => {
    onComplete({ name: name.trim(), createdAt: Date.now() }, firstQuest);
  };

  const buildQuest = () => {
    if (!goalTitle.trim()) return null;
    return {
      title: goalTitle.trim(),
      category,
      effort: cadence === "weekly" ? "high" : "medium",
      duration: cadence === "weekly" ? "major" : "short",
      xp,
      isMainQuest: cadence === "main",
      isWeeklyQuest: cadence === "weekly",
    };
  };

  return (
    <div style={{
      background: BG, minHeight: "100vh", color: TEXT,
      fontFamily: "'Outfit', -apple-system, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `radial-gradient(60% 40% at 50% -5%, ${alpha(ACCENT, "12")}, transparent 70%)`,
      }} />

      <div style={{
        maxWidth: 420, margin: "0 auto", padding: "0 24px",
        minHeight: "100vh", display: "flex", flexDirection: "column",
        position: "relative", zIndex: 1,
      }}>
        {/* Progress bar */}
        <div style={{
          paddingTop: 56, paddingBottom: 0,
          display: "flex", gap: 6,
        }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              flex: 1, height: 1.5, borderRadius: 1,
              background: i <= step + 1 ? ACCENT : BORDER,
              boxShadow: i <= step + 1 ? `0 0 6px ${alpha(ACCENT, "50")}` : "none",
              transition: "background 0.4s ease, box-shadow 0.4s ease",
            }} />
          ))}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: 32, paddingBottom: 40 }}>
          {step === 0 && (
            <NameStep
              name={name}
              onChange={setName}
              onNext={() => setStep(1)}
            />
          )}
          {step === 1 && (
            <GoalStep
              name={name}
              goalTitle={goalTitle}
              setGoalTitle={setGoalTitle}
              cadence={cadence}
              setCadence={setCadence}
              category={category}
              setCategory={setCategory}
              xp={xp}
              onContinue={() => setStep(2)}
              onSkip={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <InviteStep
              onFinish={() => finish(buildQuest())}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step 1 — Name ─────────────────────────────────────────────────────
function NameStep({ name, onChange, onNext }) {
  const ref = useRef(null);
  useEffect(() => { setTimeout(() => ref.current?.focus(), 220); }, []);
  const canSubmit = name.trim().length >= 1;

  return (
    <div style={{ animation: "fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
      <div style={{
        fontSize: 10, color: TEXT_DIM,
        letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 700,
        marginBottom: 10,
      }}>
        Welcome
      </div>
      <h1 style={{
        fontFamily: SERIF, fontSize: 38, fontWeight: 500,
        color: TEXT, letterSpacing: "0.02em", lineHeight: 1.1,
        margin: "0 0 12px",
      }}>
        What should we call you?
      </h1>
      <div style={{
        fontFamily: SERIF, fontSize: 14, color: TEXT_DIM, fontStyle: "italic",
        marginBottom: 32,
      }}>
        First name is enough.
      </div>

      <input
        ref={ref}
        value={name}
        onChange={(e) => onChange(e.target.value.slice(0, 24))}
        onKeyDown={(e) => { if (e.key === "Enter" && canSubmit) onNext(); }}
        placeholder="Your name"
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderBottom: `1px solid ${canSubmit ? alpha(ACCENT, "70") : BORDER_BR}`,
          color: TEXT,
          fontFamily: SERIF,
          fontSize: 28, fontWeight: 500,
          padding: "8px 0",
          outline: "none",
          letterSpacing: "0.02em",
          transition: "border-color 0.3s ease",
          marginBottom: 40,
        }}
      />

      <NextButton disabled={!canSubmit} onClick={onNext}>Continue</NextButton>
    </div>
  );
}

// ── Step 2 — First goal ───────────────────────────────────────────────
function GoalStep({ name, goalTitle, setGoalTitle, cadence, setCadence, category, setCategory, xp, onContinue, onSkip }) {
  const titleRef = useRef(null);
  useEffect(() => { setTimeout(() => titleRef.current?.focus(), 220); }, []);

  const canSubmit = goalTitle.trim().length >= 2;

  const cadences = [
    { id: "daily",  label: "Today",      hint: "A small thing for today" },
    { id: "weekly", label: "This Week",  hint: "A bigger goal · 7 days" },
    { id: "main",   label: "Big Goal",   hint: "One thing that matters most" },
  ];

  return (
    <div style={{ animation: "fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
      <div style={{
        fontSize: 10, color: TEXT_DIM,
        letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 700,
        marginBottom: 10,
      }}>
        Your first goal
      </div>
      <h1 style={{
        fontFamily: SERIF, fontSize: 30, fontWeight: 500,
        color: TEXT, letterSpacing: "0.02em", lineHeight: 1.1,
        margin: "0 0 10px",
      }}>
        {name ? `${name}, what's one thing you want to do?` : "What's one thing you want to do?"}
      </h1>
      <div style={{
        fontFamily: SERIF, fontSize: 13, color: TEXT_DIM, fontStyle: "italic",
        marginBottom: 24,
      }}>
        You can edit or skip — nothing's locked in.
      </div>

      <input
        ref={titleRef}
        value={goalTitle}
        onChange={(e) => setGoalTitle(e.target.value.slice(0, 80))}
        placeholder="e.g. Read 30 pages"
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderBottom: `1px solid ${canSubmit ? alpha(ACCENT, "70") : BORDER_BR}`,
          color: TEXT,
          fontFamily: SERIF,
          fontSize: 22, fontWeight: 500,
          padding: "8px 0",
          outline: "none",
          marginBottom: 24,
        }}
      />

      {/* Cadence */}
      <div style={{ marginBottom: 22 }}>
        <div style={{
          fontSize: 9, color: TEXT_DIM,
          letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700,
          marginBottom: 10,
        }}>
          When
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {cadences.map((c) => {
            const active = cadence === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCadence(c.id)}
                className="tappable"
                style={{
                  width: "100%", padding: "12px 14px",
                  background: active ? alpha(ACCENT, "12") : CARD,
                  border: `1px solid ${active ? ACCENT : BORDER}`,
                  borderRadius: 12,
                  cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  transition: "all 0.2s ease",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, color: TEXT, fontWeight: 500, marginBottom: 2 }}>
                    {c.label}
                  </div>
                  <div style={{ fontSize: 11, color: TEXT_DIM }}>{c.hint}</div>
                </div>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: active ? ACCENT : "transparent",
                  border: `1.5px solid ${active ? ACCENT : BORDER_BR}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {active && <Check size={10} color={BG} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category — compact one-row picker */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontSize: 9, color: TEXT_DIM,
          letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700,
          marginBottom: 10,
        }}>
          Type
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const I = cat.icon;
            const active = category === key;
            return (
              <button
                key={key}
                onClick={() => setCategory(key)}
                style={{
                  flexShrink: 0,
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 99, whiteSpace: "nowrap",
                  background: active ? alpha(cat.color, "15") : "transparent",
                  border: `1px solid ${active ? cat.color : BORDER}`,
                  color: active ? cat.color : TEXT_MID,
                  fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <I size={12} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <SecondaryButton onClick={onSkip}>Skip</SecondaryButton>
        <NextButton disabled={!canSubmit} onClick={onContinue} style={{ flex: 1 }}>
          Continue · +{xp} XP
        </NextButton>
      </div>
    </div>
  );
}

// ── Step 3 — Invite friends ───────────────────────────────────────────
function InviteStep({ onFinish }) {
  const tryShareLink = () => {
    const url = window.location.origin;
    if (navigator.share) {
      navigator.share({ title: "Join me on Prominence", url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <div style={{ animation: "fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
      <div style={{
        fontSize: 10, color: TEXT_DIM,
        letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 700,
        marginBottom: 10,
      }}>
        Better with friends
      </div>
      <h1 style={{
        fontFamily: SERIF, fontSize: 32, fontWeight: 500,
        color: TEXT, letterSpacing: "0.02em", lineHeight: 1.1,
        margin: "0 0 12px",
      }}>
        Bring someone along.
      </h1>
      <div style={{
        fontFamily: SERIF, fontSize: 14, color: TEXT_DIM, fontStyle: "italic",
        marginBottom: 32, lineHeight: 1.5,
      }}>
        Prominence is built around what your people are doing. Add a friend now or anytime.
      </div>

      <button
        onClick={tryShareLink}
        className="tappable"
        style={{
          width: "100%", padding: "14px 16px",
          background: alpha(ACCENT, "12"),
          border: `1px solid ${alpha(ACCENT, "45")}`,
          borderRadius: 12,
          color: ACCENT,
          display: "flex", alignItems: "center", gap: 12,
          fontFamily: "inherit", fontSize: 14, fontWeight: 600,
          cursor: "pointer",
          marginBottom: 10,
        }}
      >
        <Share2 size={16} />
        Share a link
      </button>

      <button
        onClick={onFinish}
        className="tappable"
        style={{
          width: "100%", padding: "14px 16px",
          background: "transparent",
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          color: TEXT_MID,
          fontFamily: "inherit", fontSize: 13, fontWeight: 500,
          cursor: "pointer",
          marginBottom: 28,
        }}
      >
        Skip for now
      </button>

      <NextButton onClick={onFinish}>Get started</NextButton>
    </div>
  );
}

function NextButton({ disabled, onClick, children, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="tappable"
      style={{
        width: "100%", padding: "14px",
        background: disabled ? "transparent" : ACCENT,
        color: disabled ? TEXT_DIM : BG,
        border: `1px solid ${disabled ? BORDER : ACCENT}`,
        borderRadius: 12,
        fontFamily: "'Outfit', sans-serif",
        fontSize: 12, fontWeight: 700,
        letterSpacing: "0.22em", textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        boxShadow: disabled ? "none" : `0 0 20px ${alpha(ACCENT, "35")}`,
        transition: "all 0.25s ease",
        ...style,
      }}
    >
      {children}
      {!disabled && <ArrowRight size={14} />}
    </button>
  );
}

function SecondaryButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="tappable"
      style={{
        padding: "14px 20px",
        background: "transparent",
        color: TEXT_MID,
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        fontFamily: "'Outfit', sans-serif",
        fontSize: 12, fontWeight: 600,
        letterSpacing: "0.18em", textTransform: "uppercase",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
