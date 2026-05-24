import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { ACCENT, BG, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { GROUP_THEMES, GROUP_THEME_KEYS } from "../constants/groupsData";
import GroupCrest from "../components/groups/GroupCrest";

// ── CreateGroupScreen ──
// Single-step founder flow with live crest preview as the user types.
export default function CreateGroupScreen({ onBack, onConfirm, userArchetype = "balanced" }) {
  const [name, setName] = useState("");
  const [themeKey, setThemeKey] = useState("solar");
  const [audienceMode, setAudienceMode] = useState("private");
  const nameRef = useRef(null);

  useEffect(() => { setTimeout(() => nameRef.current?.focus(), 280); }, []);

  const theme = GROUP_THEMES[themeKey];
  const previewSeed = `${name.trim().toLowerCase().replace(/\s+/g, "-") || "preview"}-seed`;

  const canSubmit = name.trim().length >= 3;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, paddingBottom: 40 }}>
      {/* Theme bloom backdrop */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `radial-gradient(70% 50% at 50% -10%, ${alpha(theme.color, "22")}, transparent 70%)`,
        transition: "background 0.5s ease",
      }} />

      <div style={{ position: "relative", zIndex: 1, padding: "0 20px" }}>
        {/* Top bar */}
        <div style={{ paddingTop: 24, paddingBottom: 12 }}>
          <button onClick={onBack} style={{
            background: "transparent", border: "none", color: TEXT_DIM,
            display: "flex", alignItems: "center", gap: 4,
            cursor: "pointer", padding: 0, fontSize: 13, fontWeight: 500,
          }}>
            <ChevronLeft size={18} /> Circles
          </button>
        </div>

        {/* Title */}
        <div style={{
          marginBottom: 24, marginTop: 8,
          animation: "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}>
          <div style={{
            fontSize: 10, color: TEXT_DIM,
            letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 700,
            marginBottom: 8,
          }}>
            New Circle
          </div>
          <div style={{
            fontFamily: SERIF, fontSize: 36, fontWeight: 500,
            color: TEXT, letterSpacing: "0.02em", lineHeight: 1.1,
          }}>
            Bring people together.
          </div>
        </div>

        {/* Live crest preview */}
        <div style={{
          display: "flex", justifyContent: "center", padding: "12px 0 24px",
          animation: "fadeIn 0.5s ease 0.15s both",
        }}>
          <GroupCrest
            seed={previewSeed}
            themeColor={themeKey}
            memberArchetypes={[userArchetype]}
            size={120}
          />
        </div>

        {/* Preview headline */}
        <div style={{
          textAlign: "center", marginBottom: 32,
          animation: "fadeIn 0.5s ease 0.25s both",
        }}>
          <div style={{
            fontFamily: SERIF, fontSize: 26, fontWeight: 500, color: TEXT,
            letterSpacing: "0.02em", lineHeight: 1, marginBottom: 6,
            minHeight: 26,
            textShadow: `0 0 18px ${alpha(theme.color, "30")}`,
            transition: "color 0.3s ease",
          }}>
            {name.trim() || <span style={{ color: TEXT_DIM, fontStyle: "italic" }}>Your Circle's name</span>}
          </div>
        </div>

        {/* Name input */}
        <Field label="Name">
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 32))}
            placeholder="Gym · School · Roommates"
            style={inputStyle(name.trim().length >= 3)}
          />
        </Field>

        {/* Visibility toggle — locked at creation */}
        <div style={{ marginBottom: 22 }}>
          <div style={{
            fontSize: 9, color: TEXT_DIM,
            letterSpacing: "0.3em", textTransform: "uppercase",
            fontWeight: 700, marginBottom: 8,
          }}>
            Show name to members?
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { id: "private", label: "Private name", hint: "Members see avatars only" },
              { id: "shared",  label: "Shared name",  hint: "Everyone sees the Circle name" },
            ].map((opt) => {
              const active = audienceMode === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setAudienceMode(opt.id)}
                  className="tappable"
                  style={{
                    flex: 1, padding: "10px 12px",
                    background: active ? alpha(theme.color, "16") : "transparent",
                    border: `1px solid ${active ? theme.color : BORDER}`,
                    borderRadius: 10,
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{
                    fontSize: 11, color: active ? theme.color : TEXT, fontWeight: 600,
                    letterSpacing: "0.04em", marginBottom: 3,
                  }}>
                    {opt.label}
                  </div>
                  <div style={{
                    fontSize: 10, color: active ? alpha(theme.color, "B0") : TEXT_DIM,
                    fontStyle: "italic",
                  }}>
                    {opt.hint}
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{
            fontSize: 10, color: TEXT_DIM, fontStyle: "italic",
            marginTop: 6, lineHeight: 1.4,
          }}>
            Can't change this later — switching would leak the label.
          </div>
        </div>

        {/* Theme picker */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 9, color: TEXT_DIM,
            letterSpacing: "0.3em", textTransform: "uppercase",
            fontWeight: 700, marginBottom: 10,
          }}>
            Theme
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {GROUP_THEME_KEYS.map((k) => {
              const t = GROUP_THEMES[k];
              const active = themeKey === k;
              return (
                <button
                  key={k}
                  onClick={() => setThemeKey(k)}
                  style={{
                    flex: 1, padding: "10px 4px",
                    background: active ? alpha(t.color, "20") : "transparent",
                    border: `1px solid ${active ? t.color : BORDER}`,
                    borderRadius: 10,
                    cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    transition: "all 0.2s ease",
                    boxShadow: active ? `0 0 12px ${alpha(t.color, "30")}` : "none",
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: `radial-gradient(circle at 30% 30%, ${t.accent}, ${t.color})`,
                    boxShadow: `0 0 8px ${alpha(t.color, "55")}`,
                  }} />
                  <div style={{
                    fontSize: 9, color: active ? t.color : TEXT_DIM,
                    letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: active ? 700 : 500,
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    {t.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={() => canSubmit && onConfirm?.({ name: name.trim(), themeColor: themeKey, audienceMode })}
          disabled={!canSubmit}
          style={{
            width: "100%", padding: "16px",
            background: canSubmit ? theme.color : "transparent",
            color: canSubmit ? BG : TEXT_DIM,
            border: `1px solid ${canSubmit ? theme.color : BORDER}`,
            borderRadius: 12,
            fontFamily: "'Outfit', sans-serif",
            fontSize: 12, fontWeight: 700,
            letterSpacing: "0.22em", textTransform: "uppercase",
            cursor: canSubmit ? "pointer" : "not-allowed",
            opacity: canSubmit ? 1 : 0.5,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: canSubmit ? `0 0 24px ${alpha(theme.color, "40")}` : "none",
            transition: "all 0.25s ease",
          }}
        >
          Create Circle
          {canSubmit && <ArrowRight size={14} />}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontSize: 9, color: TEXT_DIM,
        letterSpacing: "0.3em", textTransform: "uppercase",
        fontWeight: 700, marginBottom: 8,
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function inputStyle(filled) {
  return {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: `1px solid ${filled ? alpha(ACCENT, "70") : BORDER_BR}`,
    color: TEXT,
    fontFamily: SERIF,
    fontSize: 22,
    fontWeight: 500,
    padding: "8px 0",
    outline: "none",
    letterSpacing: "0.02em",
    transition: "border-color 0.3s ease",
    boxSizing: "border-box",
  };
}
