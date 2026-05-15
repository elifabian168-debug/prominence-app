import { useState, useEffect, useRef } from "react";
import { X, Check } from "lucide-react";
import { ACCENT, BG, CARD, CARD_ELEV, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../../constants/theme";
import { CATEGORIES, ARCHETYPES } from "../../constants/categories";
import { GROUP_THEMES } from "../../constants/groupsData";

// ── SharedQuestCreateSheet ──
// Bottom-sheet form for forging a shared (co-op) quest within a group.
// Returns { title, category, xpReward, participantIds, deadline } via onForge.
export default function SharedQuestCreateSheet({
  open,
  group,
  members = [],
  onForge,
  onClose,
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("fitness");
  const [participantIds, setParticipantIds] = useState([]);
  const [duration, setDuration] = useState("week"); // "today" | "week"
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setCategory("fitness");
      setParticipantIds(members.map((m) => m.id));
      setDuration("week");
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [open, members]);

  if (!open) return null;

  const theme = GROUP_THEMES[group?.themeColor] || GROUP_THEMES.solar;
  const cat = CATEGORIES[category] || CATEGORIES.fitness;
  const canSubmit = title.trim().length >= 3 && participantIds.length >= 1;

  const toggleParticipant = (id) =>
    setParticipantIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const handleForge = () => {
    if (!canSubmit) return;
    const deadline = duration === "today"
      ? endOfToday()
      : Date.now() + 1000 * 60 * 60 * 24 * 7;
    onForge?.({
      title: title.trim(),
      category,
      participantIds,
      xpReward: estimateReward(category, participantIds.length, duration),
      deadline,
    });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 150,
        background: alpha(BG, "C0"),
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        animation: "fadeIn 0.25s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480,
          background: CARD,
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          border: `1px solid ${BORDER}`,
          borderBottom: "none",
          padding: "20px 20px 28px",
          maxHeight: "88vh",
          overflowY: "auto",
          animation: "fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: `0 -20px 60px ${alpha("#000", "40")}`,
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: BORDER, margin: "0 auto 18px" }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{
              fontSize: 10, color: theme.color,
              letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6,
            }}>
              Forge a Shared Quest
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 22, color: TEXT, lineHeight: 1, letterSpacing: "0.02em" }}>
              {group?.name}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "transparent", border: "none", padding: 4, color: TEXT_DIM, cursor: "pointer",
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Title */}
        <Field label="Quest">
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 64))}
            placeholder="All meditate this week"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              borderBottom: `1px solid ${title.trim().length >= 3 ? alpha(theme.color, "80") : BORDER_BR}`,
              color: TEXT,
              fontFamily: SERIF,
              fontSize: 20,
              fontWeight: 500,
              padding: "8px 0",
              outline: "none",
              transition: "border-color 0.3s ease",
              boxSizing: "border-box",
            }}
          />
        </Field>

        {/* Category */}
        <Field label="Category">
          <div style={{ display: "flex", gap: 6 }}>
            {Object.entries(CATEGORIES).map(([key, c]) => {
              const Icon = c.icon;
              const active = category === key;
              return (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  style={{
                    flex: 1, padding: "10px 4px",
                    background: active ? `color-mix(in srgb, ${c.color} 15%, var(--card))` : "transparent",
                    border: `1px solid ${active ? c.color : BORDER}`,
                    borderRadius: 10,
                    color: active ? c.color : TEXT_DIM,
                    cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 10, fontWeight: active ? 600 : 400,
                    letterSpacing: "0.04em",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    transition: "all 0.2s ease",
                  }}
                >
                  <Icon size={13} color={active ? c.color : "var(--text-dim)"} />
                  {c.label}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Participants */}
        <Field label="The Bound">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {members.map((m) => {
              const arch = ARCHETYPES[m.archetype] || ARCHETYPES.balanced;
              const active = participantIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleParticipant(m.id)}
                  style={{
                    padding: "8px 12px 8px 8px",
                    background: active ? alpha(arch.color, "15") : "transparent",
                    border: `1px solid ${active ? arch.color : BORDER}`,
                    borderRadius: 99,
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8,
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: active
                      ? `linear-gradient(135deg, ${alpha(arch.color, "90")}, ${alpha(arch.color, "40")})`
                      : alpha(arch.color, "20"),
                    border: `1px solid ${alpha(arch.color, "50")}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {active ? (
                      <Check size={11} color="#FFF" strokeWidth={3} />
                    ) : (
                      <span style={{ fontFamily: SERIF, fontSize: 10, color: arch.color, fontWeight: 700 }}>
                        {m.initial}
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 12,
                    color: active ? TEXT : TEXT_DIM,
                    fontWeight: 500,
                  }}>
                    {m.isMe ? "You" : m.name}
                  </span>
                </button>
              );
            })}
          </div>
        </Field>

        {/* Duration */}
        <Field label="Window">
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { key: "today", label: "Today" },
              { key: "week", label: "This Week" },
            ].map(({ key, label }) => {
              const active = duration === key;
              return (
                <button
                  key={key}
                  onClick={() => setDuration(key)}
                  style={{
                    flex: 1, padding: "10px",
                    background: active ? alpha(theme.color, "12") : "transparent",
                    border: `1px solid ${active ? theme.color : BORDER}`,
                    borderRadius: 10,
                    color: active ? theme.color : TEXT_DIM,
                    fontSize: 11, fontWeight: active ? 700 : 500,
                    letterSpacing: "0.18em", textTransform: "uppercase",
                    cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </Field>

        {/* XP preview */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 16px",
          background: alpha(cat.color, "08"),
          border: `1px solid ${alpha(cat.color, "25")}`,
          borderRadius: 12,
          marginBottom: 22,
        }}>
          <div style={{
            fontSize: 9, color: TEXT_DIM,
            letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700,
          }}>
            Bonus XP on completion
          </div>
          <div style={{
            fontFamily: SERIF, fontSize: 26, color: cat.color, fontWeight: 500,
            textShadow: `0 0 12px ${alpha(cat.color, "40")}`,
          }}>
            +{estimateReward(category, participantIds.length, duration)}
          </div>
        </div>

        {/* Forge */}
        <button
          onClick={handleForge}
          disabled={!canSubmit}
          style={{
            width: "100%", padding: "14px",
            background: canSubmit ? theme.color : "transparent",
            color: canSubmit ? BG : TEXT_DIM,
            border: `1px solid ${canSubmit ? theme.color : BORDER}`,
            borderRadius: 12,
            fontFamily: "'Outfit', sans-serif",
            fontSize: 11, fontWeight: 700,
            letterSpacing: "0.22em", textTransform: "uppercase",
            cursor: canSubmit ? "pointer" : "not-allowed",
            opacity: canSubmit ? 1 : 0.5,
            boxShadow: canSubmit ? `0 0 24px ${alpha(theme.color, "40")}` : "none",
          }}
        >
          Forge the Quest
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 9, color: TEXT_DIM,
        letterSpacing: "0.3em", textTransform: "uppercase",
        fontWeight: 700, marginBottom: 10,
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function estimateReward(category, participants, duration) {
  const base = { fitness: 40, school: 40, life: 25, work: 45, mind: 30 }[category] || 30;
  const durMult = duration === "today" ? 1.0 : 2.2;
  return Math.round(base * Math.max(1, participants) * durMult);
}
