import { useState, useMemo, useEffect } from "react";
import { X, Crown, Calendar, Lock, Users } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../../constants/theme";
import { CATEGORIES } from "../../constants/categories";
import { EFFORT_LEVELS, DURATION_LEVELS, WEEKLY_DURATION_LEVELS } from "../../constants/questData";
import { calculateTaskXP } from "../../utils/xp";
import BottomSheet from "../ui/BottomSheet";
import Section from "../ui/Section";

const WEEKLY_ACCENT = "#7CA9F2";

// Audience picker state shape:
//   { mode: "all" }        — visible to all friends (no Circle scope)
//   { mode: "private" }    — completion is private; no post is created
//   { mode: "circle", circleId } — scoped to one Circle
export default function TaskCreateModal({ open, onClose, onCreate, streak = 0, weeklyCategoriesTaken = [], defaultMode = "normal", circles = [] }) {
  const [title, setTitle]       = useState("");
  const [category, setCategory] = useState("fitness");
  const [effort, setEffort]     = useState("medium");
  const [duration, setDuration] = useState("short");
  const [isMQ, setMQ]           = useState(false);
  const [isWQ, setWQ]           = useState(false);
  const [audience, setAudience] = useState({ mode: "all" });

  // Reset state and apply mode-specific defaults each time the modal opens
  useEffect(() => {
    if (!open) return;
    setTitle("");
    setMQ(false);
    setAudience({ mode: "all" });
    if (defaultMode === "weekly") {
      setWQ(true);
      setEffort("high");
      setDuration("major");
      const free = Object.keys(CATEGORIES).find(c => !weeklyCategoriesTaken.includes(c));
      if (free) setCategory(free);
    } else {
      setWQ(false);
      setEffort("medium");
      setDuration("short");
    }
  }, [open, defaultMode]);

  const xp = useMemo(
    () => calculateTaskXP({ category, effort, duration, isMainQuest: isMQ, isWeeklyQuest: isWQ, streak }),
    [category, effort, duration, isMQ, isWQ, streak]
  );

  if (!open) return null;

  const categoryConflict = isWQ && weeklyCategoriesTaken.includes(category);
  const canSubmit = title.trim() && !categoryConflict;

  const submit = () => {
    if (!canSubmit) return;
    const audiencePayload = {
      audienceMode: audience.mode === "private" ? "private" : "post",
      audienceCircleIds: audience.mode === "circle" ? [audience.circleId] : [],
    };
    onCreate({ title: title.trim(), category, effort, duration, xp, isMainQuest: isMQ, isWeeklyQuest: isWQ, ...audiencePayload });
    setTitle(""); setEffort("medium"); setDuration("short"); setMQ(false); setWQ(false);
    setAudience({ mode: "all" });
    onClose();
  };

  const toggleMain = () => {
    setMQ(v => !v);
    if (!isMQ) {
      setWQ(false);
      setDuration("short");
      setEffort("medium");
    }
  };
  const toggleWeekly = () => {
    setWQ(v => !v);
    if (!isWQ) {
      setMQ(false);
      setEffort("high");
      setDuration("major");
    } else {
      setEffort("medium");
      setDuration("short");
    }
  };

  const durationTable = isWQ ? WEEKLY_DURATION_LEVELS : DURATION_LEVELS;
  const durationLabel = isWQ ? "Weekly time" : "Duration";

  return (
    <BottomSheet onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 14px" }}>
        <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.22em", textTransform: "uppercase" }}>New Quest</div>
        <button onClick={onClose} style={{
          width: 32, height: 32, borderRadius: "50%", background: CARD, border: `1px solid ${BORDER}`,
          color: TEXT_MID, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ padding: "0 20px 24px" }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What's the quest?" autoFocus
          style={{
            width: "100%", fontFamily: SERIF, fontSize: 28, fontWeight: 400,
            background: "transparent", border: "none", outline: "none", color: TEXT,
          }} />
      </div>

      <Section label="Category">
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const I = cat.icon;
            const active = category === key;
            return (
              <button key={key} onClick={() => setCategory(key)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 99, whiteSpace: "nowrap",
                background: active ? alpha(ACCENT, "15") : CARD,
                border: `1px solid ${active ? ACCENT : BORDER}`,
                color: active ? ACCENT : TEXT_MID, fontSize: 13, cursor: "pointer",
              }}>
                <I size={14} />{cat.label}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 8 }}>
          Levels up <span style={{ color: ACCENT }}>{CATEGORIES[category].attribute}</span>
        </div>
      </Section>

      <Section label="Effort">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {Object.entries(EFFORT_LEVELS).map(([key, lvl]) => {
            const active = effort === key;
            return (
              <button key={key} onClick={() => setEffort(key)} style={{
                background: active ? alpha(ACCENT, "10") : CARD,
                border: `1px solid ${active ? ACCENT : BORDER}`,
                color: active ? TEXT : TEXT_MID,
                padding: "12px", borderRadius: 12, textAlign: "left", cursor: "pointer",
              }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{lvl.label}</div>
                <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 2 }}>{lvl.hint}</div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section label={durationLabel}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {Object.entries(durationTable).map(([key, lvl]) => {
            const active = duration === key;
            const accent = isWQ ? WEEKLY_ACCENT : ACCENT;
            return (
              <button key={key} onClick={() => setDuration(key)} style={{
                background: active ? `${accent}10` : CARD,
                border: `1px solid ${active ? accent : BORDER}`,
                color: active ? TEXT : TEXT_MID,
                padding: "12px 8px", borderRadius: 12, textAlign: "center", cursor: "pointer",
              }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{lvl.label}</div>
                <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 2 }}>{lvl.hint}</div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section label="Visible to">
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
          {[
            { key: "all", label: "All friends", icon: Users },
            ...circles.map((c) => ({ key: `c:${c.id}`, label: c.name, circle: c })),
            { key: "private", label: "Private", icon: Lock },
          ].map((opt) => {
            const active =
              (opt.key === "all" && audience.mode === "all") ||
              (opt.key === "private" && audience.mode === "private") ||
              (opt.circle && audience.mode === "circle" && audience.circleId === opt.circle.id);
            const onPick = () => {
              if (opt.key === "all") setAudience({ mode: "all" });
              else if (opt.key === "private") setAudience({ mode: "private" });
              else setAudience({ mode: "circle", circleId: opt.circle.id });
            };
            const I = opt.icon;
            return (
              <button key={opt.key} onClick={onPick} className="tappable" style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 99, whiteSpace: "nowrap",
                background: active ? alpha(ACCENT, "15") : CARD,
                border: `1px solid ${active ? ACCENT : BORDER}`,
                color: active ? ACCENT : TEXT_MID, fontSize: 13, cursor: "pointer",
              }}>
                {I && <I size={13} />}
                {opt.label}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 8, lineHeight: 1.4 }}>
          {audience.mode === "private"
            ? "Stays off your feed. No streak credit."
            : audience.mode === "circle"
              ? "Only this Circle will see the post."
              : "Goes to your full feed when you finish it."}
        </div>
      </Section>

      <div style={{ padding: "0 20px 8px", display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={toggleMain} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", borderRadius: 12, cursor: "pointer",
          background: isMQ ? `linear-gradient(90deg, ${alpha(ACCENT, "20")}, ${alpha(ACCENT, "05")})` : CARD,
          border: `1px solid ${isMQ ? ACCENT : BORDER}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Crown size={16} color={isMQ ? ACCENT : TEXT_MID} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>Main Quest</div>
              <div style={{ fontSize: 11, color: TEXT_DIM }}>One per day · +25 XP bonus</div>
            </div>
          </div>
          <div style={{ width: 36, height: 20, borderRadius: 10, background: isMQ ? ACCENT : BORDER, position: "relative", transition: "background 0.2s" }}>
            <div style={{ position: "absolute", top: 2, left: isMQ ? 18 : 2, width: 16, height: 16, borderRadius: 8, background: "#fff", transition: "left 0.2s" }} />
          </div>
        </button>

        <button onClick={toggleWeekly} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", borderRadius: 12, cursor: "pointer",
          background: isWQ ? `linear-gradient(90deg, ${WEEKLY_ACCENT}20, ${WEEKLY_ACCENT}05)` : CARD,
          border: `1px solid ${isWQ ? WEEKLY_ACCENT : BORDER}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Calendar size={16} color={isWQ ? WEEKLY_ACCENT : TEXT_MID} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>Weekly Quest</div>
              <div style={{ fontSize: 11, color: TEXT_DIM }}>7 days · 5× XP reward · bypasses daily cap</div>
            </div>
          </div>
          <div style={{ width: 36, height: 20, borderRadius: 10, background: isWQ ? WEEKLY_ACCENT : BORDER, position: "relative", transition: "background 0.2s" }}>
            <div style={{ position: "absolute", top: 2, left: isWQ ? 18 : 2, width: 16, height: 16, borderRadius: 8, background: "#fff", transition: "left 0.2s" }} />
          </div>
        </button>

        {categoryConflict && (
          <div style={{ fontSize: 11, color: "#F87171", padding: "0 4px" }}>
            You already have a pending weekly quest in {CATEGORIES[category].label}. Complete or delete it first.
          </div>
        )}
      </div>

      <div style={{ padding: "16px 20px 24px", borderTop: `1px solid ${BORDER}`, background: BG, position: "sticky", bottom: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.2em", textTransform: "uppercase" }}>XP Reward</span>
          <span style={{ fontFamily: SERIF, fontSize: 28, color: ACCENT, textShadow: `0 0 20px ${alpha(ACCENT, "40")}` }}>+{xp}</span>
        </div>
        <button onClick={submit} disabled={!canSubmit} style={{
          width: "100%", padding: "14px", borderRadius: 12,
          background: canSubmit ? ACCENT : CARD, color: canSubmit ? BG : TEXT_DIM,
          border: "none", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em",
          cursor: canSubmit ? "pointer" : "not-allowed", opacity: canSubmit ? 1 : 0.5,
        }}>
          {isWQ ? "ADD WEEKLY QUEST" : "ADD QUEST"}
        </button>
      </div>
    </BottomSheet>
  );
}
