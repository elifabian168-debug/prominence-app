import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../../constants/theme";
import { CATEGORIES } from "../../constants/categories";
import { EFFORT_LEVELS, DURATION_LEVELS, WEEKLY_DURATION_LEVELS } from "../../constants/questData";
import { calculateTaskXP } from "../../utils/xp";
import BottomSheet from "../ui/BottomSheet";
import Section from "../ui/Section";

export default function TaskEditModal({ task, isMain, isWeekly = false, streak = 0, onClose, onSave }) {
  const durationTable = isWeekly ? WEEKLY_DURATION_LEVELS : DURATION_LEVELS;
  const durationFallback = isWeekly ? "major" : "short";
  const initialDuration = durationTable[task.duration] ? task.duration : durationFallback;

  const [title, setTitle]       = useState(task.title);
  const [category, setCategory] = useState(task.category);
  const [effort, setEffort]     = useState(task.effort || (isWeekly ? "high" : "medium"));
  const [duration, setDuration] = useState(initialDuration);

  const xp = useMemo(
    () => calculateTaskXP({ category, effort, duration, isMainQuest: isMain, isWeeklyQuest: isWeekly, streak }),
    [category, effort, duration, isMain, isWeekly, streak]
  );

  const save = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), category, effort, duration, xp });
  };

  return (
    <BottomSheet onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 14px" }}>
        <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.22em", textTransform: "uppercase" }}>Edit Quest</div>
        <button onClick={onClose} style={{
          width: 32, height: 32, borderRadius: "50%", background: CARD, border: `1px solid ${BORDER}`,
          color: TEXT_MID, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ padding: "0 20px 24px" }}>
        <input value={title} onChange={e => setTitle(e.target.value)} autoFocus
          style={{
            width: "100%", fontFamily: SERIF, fontSize: 28,
            background: "transparent", border: "none", outline: "none", color: TEXT,
          }} />
      </div>

      <Section label="Category">
        <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
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
      </Section>

      <Section label="Effort">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {Object.entries(EFFORT_LEVELS).map(([key, lvl]) => (
            <button key={key} onClick={() => setEffort(key)} style={{
              background: effort === key ? alpha(ACCENT, "10") : CARD,
              border: `1px solid ${effort === key ? ACCENT : BORDER}`,
              color: effort === key ? TEXT : TEXT_MID,
              padding: "12px", borderRadius: 12, textAlign: "left", cursor: "pointer",
            }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{lvl.label}</div>
              <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 2 }}>{lvl.hint}</div>
            </button>
          ))}
        </div>
      </Section>

      <Section label={isWeekly ? "Weekly time" : "Duration"}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {Object.entries(durationTable).map(([key, lvl]) => (
            <button key={key} onClick={() => setDuration(key)} style={{
              background: duration === key ? alpha(ACCENT, "10") : CARD,
              border: `1px solid ${duration === key ? ACCENT : BORDER}`,
              color: duration === key ? TEXT : TEXT_MID,
              padding: "12px 8px", borderRadius: 12, textAlign: "center", cursor: "pointer",
            }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{lvl.label}</div>
              <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 2 }}>{lvl.hint}</div>
            </button>
          ))}
        </div>
      </Section>

      <div style={{ padding: "16px 20px 24px", borderTop: `1px solid ${BORDER}`, background: BG, position: "sticky", bottom: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.2em", textTransform: "uppercase" }}>XP Reward</span>
          <span style={{ fontFamily: SERIF, fontSize: 28, color: ACCENT }}>+{xp}</span>
        </div>
        <button onClick={save} disabled={!title.trim()} style={{
          width: "100%", padding: "14px", borderRadius: 12,
          background: title.trim() ? ACCENT : CARD, color: title.trim() ? BG : TEXT_DIM,
          border: "none", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em",
          cursor: title.trim() ? "pointer" : "not-allowed",
        }}>
          SAVE CHANGES
        </button>
      </div>
    </BottomSheet>
  );
}
