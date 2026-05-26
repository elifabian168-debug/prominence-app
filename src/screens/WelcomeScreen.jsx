import { ArrowRight } from "lucide-react";
import { ACCENT, BG, BORDER, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import Logo from "../components/ui/Logo";

export default function WelcomeScreen({ onSignUp, onLogin }) {
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
        justifyContent: "center", position: "relative", zIndex: 1,
      }}>
        <div style={{ animation: "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <Logo size={88} />
          </div>

          <div style={{
            fontSize: 10, color: TEXT_DIM,
            letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 700,
            marginBottom: 12, textAlign: "center",
          }}>
            Prominence
          </div>

          <h1 style={{
            fontFamily: SERIF, fontSize: 38, fontWeight: 500,
            color: TEXT, letterSpacing: "0.02em", lineHeight: 1.1,
            margin: "0 0 12px", textAlign: "center",
          }}>
            Build what matters.
          </h1>

          <p style={{
            fontFamily: SERIF, fontSize: 15, color: TEXT_DIM,
            fontStyle: "italic", textAlign: "center",
            lineHeight: 1.6, margin: "0 0 56px",
          }}>
            Goals, friends, and the momentum to keep going.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={onSignUp}
              className="tappable"
              style={{
                width: "100%", padding: "15px",
                background: ACCENT, color: BG,
                border: `1px solid ${ACCENT}`, borderRadius: 12,
                fontFamily: "'Outfit', sans-serif",
                fontSize: 12, fontWeight: 700,
                letterSpacing: "0.22em", textTransform: "uppercase",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: `0 0 24px ${alpha(ACCENT, "35")}`,
              }}
            >
              Create account
              <ArrowRight size={14} />
            </button>

            <button
              onClick={onLogin}
              className="tappable"
              style={{
                width: "100%", padding: "15px",
                background: "transparent", color: TEXT_MID,
                border: `1px solid ${BORDER}`, borderRadius: 12,
                fontFamily: "'Outfit', sans-serif",
                fontSize: 12, fontWeight: 600,
                letterSpacing: "0.18em", textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
