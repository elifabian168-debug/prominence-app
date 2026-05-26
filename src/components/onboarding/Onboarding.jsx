import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ArrowRight, Share2, Check, Eye, EyeOff } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, checkUsernameAvailable, saveUserProfile } from "../../utils/firebase";
import { ACCENT, BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../../constants/theme";
import { CATEGORIES } from "../../constants/categories";
import { calculateTaskXP } from "../../utils/xp";
import Logo from "../ui/Logo";

const AUTH_ERRORS = {
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/invalid-email": "That doesn't look like a valid email.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/network-request-failed": "Network error — check your connection.",
};

// ── Onboarding ──
// Five screens, ~2 minutes total.
//
//   0. Name
//   1. Email + password  (creates Firebase account)
//   2. @username         (unique handle, checked live)
//   3. First goal
//   4. Invite friends
//
// onComplete(user, firstQuest) — firstQuest may be null when skipped.
export default function Onboarding({ onComplete }) {
  const [step, setStep]             = useState(0);
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [username, setUsername]     = useState("");
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [goalTitle, setGoalTitle]   = useState("");
  const [cadence, setCadence]       = useState("daily");
  const [category, setCategory]     = useState("life");
  const [finishing, setFinishing]   = useState(false);

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

  const finish = async (firstQuest) => {
    if (!firebaseUser || finishing) return;
    setFinishing(true);
    try {
      await saveUserProfile({
        uid: firebaseUser.uid,
        name: name.trim(),
        username: username.toLowerCase(),
        email: firebaseUser.email,
      });
      onComplete({
        name: name.trim(),
        username: username.toLowerCase(),
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        createdAt: Date.now(),
      }, firstQuest);
    } catch {
      setFinishing(false);
    }
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
        {/* Progress bar — 5 segments */}
        <div style={{
          paddingTop: 56, paddingBottom: 0,
          display: "flex", gap: 6,
        }}>
          {[1, 2, 3, 4, 5].map((i) => (
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
            <NameStep name={name} onChange={setName} onNext={() => setStep(1)} />
          )}
          {step === 1 && (
            <EmailStep
              name={name}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              onNext={(fbUser) => { setFirebaseUser(fbUser); setStep(2); }}
            />
          )}
          {step === 2 && (
            <UsernameStep
              name={name}
              username={username}
              setUsername={setUsername}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <GoalStep
              name={name}
              goalTitle={goalTitle}
              setGoalTitle={setGoalTitle}
              cadence={cadence}
              setCadence={setCadence}
              category={category}
              setCategory={setCategory}
              xp={xp}
              onContinue={() => setStep(4)}
              onSkip={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <InviteStep onFinish={() => finish(buildQuest())} finishing={finishing} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step 0 — Name ─────────────────────────────────────────────────────────
function NameStep({ name, onChange, onNext }) {
  const ref = useRef(null);
  useEffect(() => { setTimeout(() => ref.current?.focus(), 220); }, []);
  const canSubmit = name.trim().length >= 1;

  return (
    <div style={{ animation: "fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <Logo size={96} />
      </div>
      <div style={{
        fontSize: 10, color: TEXT_DIM,
        letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 700,
        marginBottom: 10,
      }}>
        Welcome to Prominence
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
          width: "100%", background: "transparent", border: "none",
          borderBottom: `1px solid ${canSubmit ? alpha(ACCENT, "70") : BORDER_BR}`,
          color: TEXT, fontFamily: SERIF,
          fontSize: 28, fontWeight: 500,
          padding: "8px 0", outline: "none",
          letterSpacing: "0.02em",
          transition: "border-color 0.3s ease", marginBottom: 40,
        }}
      />
      <NextButton disabled={!canSubmit} onClick={onNext}>Continue</NextButton>
    </div>
  );
}

// ── Step 1 — Email + password ─────────────────────────────────────────────
function EmailStep({ name, email, setEmail, password, setPassword, onNext }) {
  const emailRef = useRef(null);
  useEffect(() => { setTimeout(() => emailRef.current?.focus(), 220); }, []);

  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const canSubmit = email.trim().length > 0 && password.length >= 6 && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      const { user: fbUser } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      onNext(fbUser);
    } catch (err) {
      setError(AUTH_ERRORS[err.code] || "Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: "fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
      <div style={{
        fontSize: 10, color: TEXT_DIM,
        letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 700,
        marginBottom: 10,
      }}>
        Your account
      </div>
      <h1 style={{
        fontFamily: SERIF, fontSize: 32, fontWeight: 500,
        color: TEXT, letterSpacing: "0.02em", lineHeight: 1.1,
        margin: "0 0 10px",
      }}>
        {name ? `${name}, create your login.` : "Create your login."}
      </h1>
      <div style={{
        fontFamily: SERIF, fontSize: 13, color: TEXT_DIM, fontStyle: "italic",
        marginBottom: 28,
      }}>
        You'll use this to sign in on any device.
      </div>

      {/* Email field */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontSize: 9, color: TEXT_DIM,
          letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700,
          marginBottom: 8,
        }}>
          Email
        </div>
        <input
          ref={emailRef}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          placeholder="you@example.com"
          autoComplete="email"
          style={{
            width: "100%", background: CARD,
            border: `1px solid ${BORDER}`, borderRadius: 10,
            color: TEXT, fontFamily: "inherit",
            fontSize: 15, padding: "12px 14px",
            outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Password field */}
      <div style={{ marginBottom: error ? 16 : 32 }}>
        <div style={{
          fontSize: 9, color: TEXT_DIM,
          letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700,
          marginBottom: 8,
        }}>
          Password
        </div>
        <div style={{ position: "relative" }}>
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            placeholder="6+ characters"
            autoComplete="new-password"
            style={{
              width: "100%", background: CARD,
              border: `1px solid ${BORDER}`, borderRadius: 10,
              color: TEXT, fontFamily: "inherit",
              fontSize: 15, padding: "12px 44px 12px 14px",
              outline: "none", boxSizing: "border-box",
            }}
          />
          <button
            onClick={() => setShowPw(v => !v)}
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", color: TEXT_DIM, cursor: "pointer",
              padding: 4, display: "flex",
            }}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: alpha(ACCENT, "08"),
          border: `1px solid ${alpha(ACCENT, "30")}`,
          borderRadius: 10, padding: "10px 14px",
          fontSize: 13, color: TEXT_MID, marginBottom: 20,
        }}>
          {error}
        </div>
      )}

      <NextButton disabled={!canSubmit} onClick={handleSubmit}>
        {loading ? "Creating account…" : "Continue"}
      </NextButton>
    </div>
  );
}

// ── Step 2 — @username ────────────────────────────────────────────────────
const USERNAME_RE = /^[a-z0-9_]+$/;

function UsernameStep({ name, username, setUsername, onNext }) {
  const ref = useRef(null);
  useEffect(() => { setTimeout(() => ref.current?.focus(), 220); }, []);

  const [status, setStatus] = useState("idle"); // idle | checking | available | taken | invalid

  const validate = (v) => v.length >= 3 && v.length <= 20 && USERNAME_RE.test(v);

  const check = useCallback(async (val) => {
    if (!validate(val)) { setStatus(val.length === 0 ? "idle" : "invalid"); return; }
    setStatus("checking");
    try {
      const ok = await checkUsernameAvailable(val);
      setStatus(ok ? "available" : "taken");
    } catch {
      setStatus("idle");
    }
  }, []);

  useEffect(() => {
    if (!username) { setStatus("idle"); return; }
    const t = setTimeout(() => check(username), 600);
    return () => clearTimeout(t);
  }, [username, check]);

  const handleChange = (e) => {
    const raw = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
    setUsername(raw);
    setStatus("idle");
  };

  const canSubmit = status === "available";

  const statusColor = { available: "#4ade80", taken: "#f87171", invalid: "#f87171", checking: TEXT_DIM, idle: TEXT_DIM };
  const statusLabel = { available: "✓ Available", taken: "✗ Already taken", invalid: "3–20 chars, letters / numbers / _", checking: "Checking…", idle: "" };

  return (
    <div style={{ animation: "fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
      <div style={{
        fontSize: 10, color: TEXT_DIM,
        letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 700,
        marginBottom: 10,
      }}>
        Your handle
      </div>
      <h1 style={{
        fontFamily: SERIF, fontSize: 32, fontWeight: 500,
        color: TEXT, letterSpacing: "0.02em", lineHeight: 1.1,
        margin: "0 0 10px",
      }}>
        Pick a @username.
      </h1>
      <div style={{
        fontFamily: SERIF, fontSize: 13, color: TEXT_DIM, fontStyle: "italic",
        marginBottom: 28,
      }}>
        Friends use this to find you. You can change it later.
      </div>

      <div style={{ position: "relative", marginBottom: 8 }}>
        <span style={{
          position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
          color: TEXT_MID, fontSize: 18, fontFamily: SERIF, pointerEvents: "none",
        }}>
          @
        </span>
        <input
          ref={ref}
          value={username}
          onChange={handleChange}
          onKeyDown={(e) => { if (e.key === "Enter" && canSubmit) onNext(); }}
          placeholder="yourname"
          autoComplete="username"
          style={{
            width: "100%", background: "transparent", border: "none",
            borderBottom: `1px solid ${canSubmit ? alpha(ACCENT, "70") : BORDER_BR}`,
            color: TEXT, fontFamily: SERIF,
            fontSize: 26, fontWeight: 500,
            padding: "8px 0 8px 28px",
            outline: "none", letterSpacing: "0.02em",
            transition: "border-color 0.3s ease",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{
        fontSize: 12, color: statusColor[status] || TEXT_DIM,
        minHeight: 20, marginBottom: 32,
        transition: "color 0.2s ease",
      }}>
        {statusLabel[status]}
      </div>

      <NextButton disabled={!canSubmit} onClick={onNext}>Continue</NextButton>
    </div>
  );
}

// ── Step 3 — First goal ────────────────────────────────────────────────────
function GoalStep({ name, goalTitle, setGoalTitle, cadence, setCadence, category, setCategory, xp, onContinue, onSkip }) {
  const titleRef = useRef(null);
  useEffect(() => { setTimeout(() => titleRef.current?.focus(), 220); }, []);

  const canSubmit = goalTitle.trim().length >= 2;

  const cadences = [
    { id: "daily",  label: "Today",     hint: "A small thing for today" },
    { id: "weekly", label: "This Week", hint: "A bigger goal · 7 days" },
    { id: "main",   label: "Big Goal",  hint: "One thing that matters most" },
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
          width: "100%", background: "transparent", border: "none",
          borderBottom: `1px solid ${canSubmit ? alpha(ACCENT, "70") : BORDER_BR}`,
          color: TEXT, fontFamily: SERIF,
          fontSize: 22, fontWeight: 500,
          padding: "8px 0", outline: "none", marginBottom: 24,
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
                  borderRadius: 12, cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  transition: "all 0.2s ease",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, color: TEXT, fontWeight: 500, marginBottom: 2 }}>{c.label}</div>
                  <div style={{ fontSize: 11, color: TEXT_DIM }}>{c.hint}</div>
                </div>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: active ? ACCENT : "transparent",
                  border: `1.5px solid ${active ? ACCENT : BORDER_BR}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {active && <Check size={10} color={BG} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category */}
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

// ── Step 4 — Invite friends ────────────────────────────────────────────────
function InviteStep({ onFinish, finishing }) {
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
          borderRadius: 12, color: ACCENT,
          display: "flex", alignItems: "center", gap: 12,
          fontFamily: "inherit", fontSize: 14, fontWeight: 600,
          cursor: "pointer", marginBottom: 10,
        }}
      >
        <Share2 size={16} />
        Share a link
      </button>

      <button
        onClick={onFinish}
        disabled={finishing}
        className="tappable"
        style={{
          width: "100%", padding: "14px 16px",
          background: "transparent",
          border: `1px solid ${BORDER}`,
          borderRadius: 12, color: TEXT_MID,
          fontFamily: "inherit", fontSize: 13, fontWeight: 500,
          cursor: finishing ? "not-allowed" : "pointer",
          marginBottom: 28, opacity: finishing ? 0.5 : 1,
        }}
      >
        Skip for now
      </button>

      <NextButton onClick={onFinish} disabled={finishing}>
        {finishing ? "Setting up…" : "Get started"}
      </NextButton>
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
        background: "transparent", color: TEXT_MID,
        border: `1px solid ${BORDER}`, borderRadius: 12,
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
