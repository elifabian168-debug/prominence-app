import { Check, X, Calendar, Plus } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { CATEGORIES } from "../constants/categories";
import { MONTHLY_QUESTS, MONTH_KEYS } from "../constants/questData";
import TaskCard from "../components/tasks/TaskCard";
import WeeklyQuestCard from "../components/tasks/WeeklyQuestCard";

const WEEKLY_ACCENT = "#7CA9F2";

function CompletedRow({ task, failed, expired, isWeekly, isMain, onDelete }) {
  const cat = CATEGORIES[task.category];
  const I = cat.icon;
  const indicatorBorder = failed || expired ? "#F87171" : ACCENT;
  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10,
      padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, opacity: 0.6,
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%",
        background: failed || expired ? "transparent" : ACCENT,
        border: failed || expired ? `1.5px solid ${indicatorBorder}` : "none",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {failed || expired ? <X size={10} color="#F87171" /> : <Check size={10} color="#0A0A0B" strokeWidth={3} />}
      </div>
      <span style={{ flex: 1, fontSize: 13, color: TEXT_MID, textDecoration: failed ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {task.title}
      </span>
      {isMain && (
        <span style={{ fontSize: 9, color: ACCENT, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, flexShrink: 0 }}>
          Main
        </span>
      )}
      {isWeekly && (
        <span style={{ fontSize: 9, color: WEEKLY_ACCENT, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, flexShrink: 0 }}>
          {expired ? "Expired" : "Weekly"}
        </span>
      )}
      <I size={11} color={cat.color} />
      <span style={{ fontSize: 11, color: TEXT_DIM, fontFamily: SERIF, flexShrink: 0 }}>+{task.xp}</span>
      <button onClick={onDelete} aria-label="Delete quest from history" style={{
        width: 26, height: 26, padding: 0, marginLeft: 2, flexShrink: 0,
        background: "transparent", border: "none", color: TEXT_DIM,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 6, transition: "color 0.15s, background 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.color = "#F87171"; e.currentTarget.style.background = `${BORDER_BR}80`; }}
      onMouseLeave={e => { e.currentTarget.style.color = TEXT_DIM; e.currentTarget.style.background = "transparent"; }}>
        <X size={14} />
      </button>
    </div>
  );
}

export default function QuestsScreen({ state, completeTask, completeMainQuest, completeWeeklyQuest, onAdd, onAddWeekly, onOpenActions, onDelete, onOpenMonth }) {
  const { tasks, mainQuest, monthlyCompletions } = state;
  const pending  = tasks.filter(t => t.status === "pending");
  const dailyComplete = tasks.filter(t => t.status === "complete");
  const dailyFailed   = tasks.filter(t => t.status === "failed");
  const allWeekly     = state.weeklyQuests || [];
  const pendingWeekly = allWeekly.filter(q => q.status === "pending");
  const completeWeekly = allWeekly.filter(q => q.status === "complete");
  const failedWeekly   = allWeekly.filter(q => q.status === "failed");
  const expiredWeekly  = allWeekly.filter(q => q.status === "expired");
  const currentMonth = MONTH_KEYS[new Date().getMonth()];

  const completedMain = mainQuest && mainQuest.status === "complete" ? [mainQuest] : [];
  const failedMain    = mainQuest && mainQuest.status === "failed"   ? [mainQuest] : [];

  const completed = [
    ...completedMain.map(t => ({ task: t, kind: "main", isMain: true })),
    ...dailyComplete.map(t => ({ task: t, kind: "task" })),
    ...completeWeekly.map(q => ({ task: q, kind: "weekly", isWeekly: true })),
  ];
  const failedAll = [
    ...failedMain.map(t => ({ task: t, kind: "main", isMain: true })),
    ...dailyFailed.map(t => ({ task: t, kind: "task" })),
    ...failedWeekly.map(q => ({ task: q, kind: "weekly", isWeekly: true })),
    ...expiredWeekly.map(q => ({ task: q, kind: "weekly", isWeekly: true, expired: true })),
  ];

  return (
    <div style={{ padding: "24px 20px 0", position: "relative" }}>
      {/* Atmospheric bloom */}
      <div className="bloom" style={{
        width: 260, height: 260, right: -60, top: -20,
        background: `radial-gradient(circle, ${alpha(ACCENT, "18")} 0%, transparent 70%)`,
      }} />

      <div style={{ marginBottom: 24, position: "relative" }}>
        <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>Quests</div>
        <div style={{ fontFamily: SERIF, fontSize: 34, letterSpacing: "-0.01em" }}>Your journey</div>
      </div>

      {/* Monthly Quest Lines */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, color: TEXT_MID, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>Monthly Quest Lines</div>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
          {MONTH_KEYS.map(mk => {
            const m = MONTHLY_QUESTS[mk];
            const done = (monthlyCompletions[mk] || []).length;
            const isCurrent = mk === currentMonth;
            const pct = (done / m.questCount) * 100;
            return (
              <button key={mk} onClick={() => onOpenMonth(mk)} className="tappable" style={{
                flexShrink: 0, width: 152, position: "relative", overflow: "hidden",
                background: isCurrent
                  ? `linear-gradient(135deg, ${alpha(m.color, "15")} 0%, ${alpha(m.color, "04")} 60%, ${CARD} 100%)`
                  : CARD,
                border: `1px solid ${isCurrent ? alpha(m.color, "55") : BORDER}`,
                borderRadius: 14, padding: "14px 14px", textAlign: "left", cursor: "pointer",
                boxShadow: isCurrent ? `0 4px 14px ${alpha(m.color, "20")}` : "none",
                fontFamily: "inherit",
              }}>
                {isCurrent && (
                  <div style={{
                    position: "absolute", top: 8, right: 8,
                    fontSize: 8, color: m.color, fontWeight: 700,
                    letterSpacing: "0.16em", textTransform: "uppercase",
                    padding: "2px 6px", borderRadius: 99,
                    background: alpha(m.color, "15"),
                    border: `1px solid ${alpha(m.color, "40")}`,
                  }}>Now</div>
                )}
                <div style={{ fontSize: 9, color: m.color, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>{mk}</div>
                <div style={{ fontFamily: SERIF, fontSize: 22, color: TEXT, marginBottom: 4, letterSpacing: "-0.01em", lineHeight: 1 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: TEXT_MID, marginBottom: 10, fontStyle: "italic" }}>{m.tagline}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 4, background: alpha(m.color, "12"), borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${pct}%`,
                      background: `linear-gradient(90deg, ${m.color}, ${alpha(m.color, "70")})`,
                      borderRadius: 2,
                      boxShadow: pct > 0 ? `0 0 8px ${alpha(m.color, "60")}` : "none",
                    }} />
                  </div>
                  <span style={{ fontSize: 10, color: m.color, fontFamily: SERIF, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{done}/{m.questCount}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: alpha(WEEKLY_ACCENT, "95"), letterSpacing: "0.22em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
            <Calendar size={11} color={WEEKLY_ACCENT} /> Weekly ({pendingWeekly.length})
          </div>
          <button onClick={onAddWeekly} aria-label="Add weekly quest" style={{
            display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 99,
            background: `${WEEKLY_ACCENT}15`, border: `1px solid ${WEEKLY_ACCENT}40`,
            color: WEEKLY_ACCENT, fontSize: 10, fontWeight: 600, cursor: "pointer",
            letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            <Plus size={11} strokeWidth={2.5} /> Add
          </button>
        </div>
        {pendingWeekly.length === 0 ? (
          <button onClick={onAddWeekly} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            padding: "14px 16px", borderRadius: 14,
            background: `linear-gradient(135deg, ${WEEKLY_ACCENT}10, ${CARD})`,
            border: `1px dashed ${WEEKLY_ACCENT}40`,
            cursor: "pointer", textAlign: "left", fontFamily: "inherit",
          }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: `${WEEKLY_ACCENT}20`, border: `1px solid ${WEEKLY_ACCENT}50`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Calendar size={16} color={WEEKLY_ACCENT} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: TEXT, fontWeight: 500, marginBottom: 2 }}>Choose what this week is for.</div>
              <div style={{ fontSize: 11, color: TEXT_DIM }}>7 days · big goal · big XP reward</div>
            </div>
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pendingWeekly.map(q => (
              <WeeklyQuestCard key={q.id} quest={q}
                onComplete={() => completeWeeklyQuest(q.id)}
                onActions={() => onOpenActions(q, "weekly")} />
            ))}
          </div>
        )}
      </div>

      {mainQuest && mainQuest.status === "pending" && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 10, color: alpha(ACCENT, "95"), letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>Main Quest</div>
          <TaskCard task={mainQuest} isMain onComplete={completeMainQuest} onActions={() => onOpenActions(mainQuest, "main")} />
        </div>
      )}

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 10, color: TEXT_MID, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>Active ({pending.length})</div>
        {pending.length === 0 ? (
          <div style={{ background: CARD, border: `1px dashed ${BORDER_BR}`, borderRadius: 12, padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: TEXT_MID, marginBottom: 12 }}>A clean slate. What deserves your hours today?</div>
            <button onClick={onAdd} style={{
              background: ACCENT, color: BG, border: "none", padding: "8px 16px",
              borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em",
            }}>+ ADD QUEST</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pending.map(t => (
              <TaskCard key={t.id} task={t} isMain={false}
                onComplete={() => completeTask(t.id)} onActions={() => onOpenActions(t, "task")} />
            ))}
          </div>
        )}
      </div>

      {completed.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 10, color: TEXT_MID, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>Completed ({completed.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {completed.map(({ task, kind, isWeekly, isMain }) => (
              <CompletedRow key={`${kind}-${task.id}`} task={task} isWeekly={isWeekly} isMain={isMain}
                onDelete={() => onDelete(task, kind)} />
            ))}
          </div>
        </div>
      )}

      {failedAll.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 10, color: "#F87171", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600, opacity: 0.85 }}>Missed ({failedAll.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {failedAll.map(({ task, kind, isWeekly, isMain, expired }) => (
              <CompletedRow key={`${kind}-${task.id}`} task={task} failed={!expired} expired={expired} isWeekly={isWeekly} isMain={isMain}
                onDelete={() => onDelete(task, kind)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
