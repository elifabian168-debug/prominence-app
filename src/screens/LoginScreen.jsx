import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, getUserProfile } from "../utils/firebase";
import { ACCENT, BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import Logo from "../components/ui/Logo";

const AUTH_ERRORS = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/user-not-found": "No account with that email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/too-many-requests": "Too many attempts — try again later.",
  "auth/network-request-failed": "Network error — check your connection.",
};

export default function LoginScreen({ onBack, onSuccess }) {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [resetSent, setResetSent] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length >= 6 && !loading;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      const { user: fbUser } = await signInWithEmailAndPassword(auth, email.trim(), password);
      const profile = await getUserProfile(fbUser.uid);
      onSuccess(fbUser, profile);
    } catch (err) {
      setError(AUTH_ERRORS[err.code] || "Something went wrong. Try again.");
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) { setError("Enter your email first."); return; }
    setError("");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch {
      setError("Couldn't send reset email. Check the address.");
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
        background: `radial-gradient(60% 40% at 50% -5%, ${alpha(ACCENT, "10")}, transparent 70%)`,
      }} />

      <div style={{
        maxWidth: 420, margin: "0 auto", padding: "0 24px",
        minHeight: "100vh", display: "flex", flexDirection: "column",
        position: "relative", zIndex: 1,
      }}>
        {/* Back */}
        <div style={{ paddingTop: 52, paddingBottom: 0 }}>
          <button
            onClick={onBack}
            style={{
              background: "none", border: "none", color: TEXT_MID,
              cursor: "pointer", padding: "4px 0",
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 13, fontFamily: "inherit",
            }}
          >
            <ArrowLeft size={15} />
            Back
          </button>
        </div>

        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          paddingTop: 40, paddingBottom: 40,
          animation: "fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <Logo size={52} />
          </div>

          <div style={{
            fontSize: 10, color: TEXT_DIM,
            letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 700,
            marginBottom: 10,
          }}>
            Welcome back
          </div>
          <h1 style={{
            fontFamily: SERIF, fontSize: 34, fontWeight: 500,
            color: TEXT, letterSpacing: "0.02em", lineHeight: 1.1,
            margin: "0 0 32px",
          }}>
            Log in to Prominence.
          </h1>

          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 9, color: TEXT_DIM,
              letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700,
              marginBottom: 8,
            }}>
              Email
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
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

          {/* Password */}
          <div style={{ marginBottom: 8 }}>
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
                onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
                placeholder="••••••••"
                autoComplete="current-password"
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

          {/* Forgot */}
          <button
            onClick={handleForgotPassword}
            style={{
              background: "none", border: "none", padding: "0 0 28px",
              color: TEXT_MID, fontSize: 12, cursor: "pointer",
              fontFamily: "inherit", textAlign: "left",
              textDecoration: "underline", textDecorationColor: BORDER_BR,
            }}
          >
            Forgot password?
          </button>

          {/* Error / reset sent */}
          {error && (
            <div style={{
              background: alpha(ACCENT, "08"),
              border: `1px solid ${alpha(ACCENT, "30")}`,
              borderRadius: 10, padding: "10px 14px",
              fontSize: 13, color: TEXT_MID,
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}
          {resetSent && (
            <div style={{
              background: alpha(ACCENT, "08"),
              border: `1px solid ${alpha(ACCENT, "30")}`,
              borderRadius: 10, padding: "10px 14px",
              fontSize: 13, color: TEXT_MID,
              marginBottom: 16,
            }}>
              Reset link sent — check your inbox.
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={!canSubmit}
            className="tappable"
            style={{
              width: "100%", padding: "14px",
              background: canSubmit ? ACCENT : "transparent",
              color: canSubmit ? BG : TEXT_DIM,
              border: `1px solid ${canSubmit ? ACCENT : BORDER}`,
              borderRadius: 12,
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12, fontWeight: 700,
              letterSpacing: "0.22em", textTransform: "uppercase",
              cursor: canSubmit ? "pointer" : "not-allowed",
              opacity: canSubmit ? 1 : 0.5,
              boxShadow: canSubmit ? `0 0 20px ${alpha(ACCENT, "35")}` : "none",
              transition: "all 0.25s ease",
            }}
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
