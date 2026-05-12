import { Bell, Flame, Users, Calendar, Plus } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { ARCHETYPES } from "../constants/categories";
import { todayKey } from "../utils/date";
import { getLevelFromXP } from "../utils/xp";
import { getArchetype } from "../utils/archetype";
import TaskCard from "../components/tasks/TaskCard";
import WeeklyQuestCard from "../components/tasks/WeeklyQuestCard";

const WEEKLY_ACCENT = "#7CA9F2";
const STREAK_MILESTONES = new Set([3, 7, 14, 21, 30, 60, 100]);

export default function HomeScreen({ state, name, levelingUp, xpGains, completeTask, completeMainQuest, completeWeeklyQuest, onOpenActions, onOpenFriends, onOpenLifeStats, onOpenNotifs, onAddWeekly }) {
  const unreadNotifs = (state.cheersReceived || []).filter(n => !n.read).length;
  const { totalXP, tasks, mainQuest, streak } = state;
  const pendingWeekly = (state.weeklyQuests || []).filter(q => q.status === "pending");
  const { level, progress, xpIntoLevel, xpForNextLevel } = getLevelFromXP(totalXP);
  const archetype = ARCHETYPES[getArchetype(state.statXP)];
  const ArchIcon = archetype.icon;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const pendingTasks = tasks.filter(t => t.status === "pending");

  const ringSize = 220;
  const ringStroke = 3;
  const ringRadius = ringSize / 2 - ringStroke - 4;
  const ringCircum = 2 * Math.PI * ringRadius;

  return (
    <div style={{ padding: "24px 20px 0" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 3 }}>{today}</div>
          <div style={{ fontFamily: SERIF, fontSize: 22, color: TEXT }}>Hello, {name}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={onOpenNotifs}
            aria-label={`Notifications${unreadNotifs > 0 ? `, ${unreadNotifs} unread` : ""}`}
            style={{
              position: "relative", width: 36, height: 36, borderRadius: 10,
              background: CARD, border: `1px solid ${unreadNotifs > 0 ? alpha(ACCENT, "60") : BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "border-color 0.2s",
            }}>
            <Bell size={14} color={unreadNotifs > 0 ? ACCENT : TEXT_MID} />
            {unreadNotifs > 0 && (
              <div style={{
                position: "absolute", top: -2, right: -2,
                minWidth: 16, height: 16, borderRadius: 99,
                background: ACCENT, color: BG, fontSize: 9, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 4px", border: `2px solid ${BG}`,
                animation: "notifBadge 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}>{unreadNotifs > 9 ? "9+" : unreadNotifs}</div>
            )}
          </button>
          <div style={{
            display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: 99,
            background: streak > 0 ? alpha(ACCENT, "10") : CARD,
            border: `1px solid ${streak > 0 ? alpha(ACCENT, "40") : BORDER}`,
            animation: STREAK_MILESTONES.has(streak) ? "streakBeat 0.7s ease-in-out" : "none",
          }}>
            <Flame size={12} color={streak > 0 ? ACCENT : TEXT_DIM} />
            <span style={{ fontSize: 12, fontWeight: 500, color: streak > 0 ? ACCENT : TEXT_MID }}>{streak}</span>
          </div>
        </div>
      </div>

      {/* Level Ring */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 36, position: "relative" }}>
        <div style={{ position: "relative", width: ringSize, height: ringSize, animation: levelingUp ? "scaleIn 0.6s ease" : "none" }}>
          <svg width={ringSize} height={ringSize} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
            <circle cx={ringSize / 2} cy={ringSize / 2} r={ringRadius} fill="none" stroke={BORDER} strokeWidth={ringStroke} />
            <circle cx={ringSize / 2} cy={ringSize / 2} r={ringRadius} fill="none" stroke={ACCENT} strokeWidth={ringStroke}
              strokeLinecap="round" strokeDasharray={ringCircum} strokeDashoffset={ringCircum * (1 - progress)}
              style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)", filter: `drop-shadow(0 0 8px ${alpha(ACCENT, "80")})`, animation: progress >= 0.8 ? "ringPulse 2.4s ease-in-out infinite" : "none" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>Level</div>
            <div style={{ fontFamily: SERIF, fontSize: 76, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.03em", color: TEXT }}>{level}</div>
            <div style={{ fontSize: 11, color: TEXT_MID, marginTop: 8 }}>{xpIntoLevel} / {xpForNextLevel} XP</div>
          </div>
          {xpGains.map(g => (
            <div key={g.id} style={{
              position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)",
              fontFamily: SERIF, fontSize: 24, color: g.capped ? TEXT_MID : ACCENT,
              pointerEvents: "none", animation: "xpFloat 1.4s ease-out forwards",
              textShadow: `0 0 12px ${alpha(ACCENT, "60")}`,
            }}>+{g.amount}{g.capped ? " (cap)" : ""}</div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16, width: "100%" }}>
          <button onClick={onOpenLifeStats} style={{
            flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer",
            textAlign: "left", fontFamily: "inherit",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <ArchIcon size={13} color={archetype.color} />
              <span style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.12em", textTransform: "uppercase" }}>Archetype</span>
            </div>
            <div style={{ fontSize: 14, color: TEXT, fontWeight: 500 }}>{archetype.label}</div>
          </button>
          <button onClick={onOpenFriends} style={{
            flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer",
            textAlign: "left", fontFamily: "inherit",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Users size={13} color={TEXT_MID} />
              <span style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.12em", textTransform: "uppercase" }}>Friends</span>
            </div>
            <div style={{ fontSize: 14, color: TEXT, fontWeight: 500 }}>{state.friends?.length || 0} active</div>
          </button>
        </div>
      </div>

      {/* Friend Streaks */}
      {(() => {
        const today = todayKey();
        const friendStreaks = state.friendStreaks || {};
        const friends = state.friends || [];
        const active = Object.entries(friendStreaks)
          .map(([fid, s]) => ({ friend: friends.find(f => f.id === fid), streak: s }))
          .filter(x => x.friend);
        if (active.length === 0) return null;
        const userActive = (state.activityLog[today]?.count || 0) > 0;
        return (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <Flame size={11} color={ACCENT} /> Friend Streaks
            </div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
              {active.map(({ friend, streak }) => {
                const arch = ARCHETYPES[friend.archetype] || ARCHETYPES.balanced;
                const atRisk = !userActive || streak.lastBoth !== today;
                return (
                  <div key={friend.id} style={{
                    flexShrink: 0, display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 12px", borderRadius: 99,
                    background: atRisk ? alpha("#F87171", 0.08) : alpha(ACCENT, "10"),
                    border: `1px solid ${atRisk ? "#F8717140" : alpha(ACCENT, "40")}`,
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                      background: `${arch.color}20`, border: `1px solid ${arch.color}50`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontFamily: SERIF, fontSize: 10, color: arch.color }}>{friend.initial}</span>
                    </div>
                    <Flame size={11} color={atRisk ? "#F87171" : ACCENT} />
                    <span style={{ fontFamily: SERIF, fontSize: 16, color: atRisk ? "#F87171" : ACCENT, fontWeight: 500, lineHeight: 1 }}>{streak.count}</span>
                    <span style={{ fontSize: 10, color: TEXT_DIM }}>{friend.name}</span>
                    {atRisk && <span style={{ fontSize: 9, color: "#F87171", letterSpacing: "0.08em", textTransform: "uppercase" }}>at risk</span>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Weekly Quests — top priority, above the main quest */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.2em", textTransform: "uppercase" }}>Weekly Quests</div>
          {pendingWeekly.length > 0 ? (
            <button onClick={onAddWeekly} aria-label="Add weekly quest" style={{
              display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 99,
              background: `${WEEKLY_ACCENT}15`, border: `1px solid ${WEEKLY_ACCENT}40`,
              color: WEEKLY_ACCENT, fontSize: 10, fontWeight: 600, cursor: "pointer",
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              <Plus size={11} strokeWidth={2.5} /> Add
            </button>
          ) : (
            <span style={{ fontSize: 11, color: TEXT_DIM }}>0 active</span>
          )}
        </div>
        {pendingWeekly.length === 0 ? (
          <button onClick={onAddWeekly} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            padding: "14px 16px", borderRadius: 14,
            background: `linear-gradient(135deg, ${WEEKLY_ACCENT}15, ${CARD})`,
            border: `1px dashed ${WEEKLY_ACCENT}50`,
            cursor: "pointer", textAlign: "left", fontFamily: "inherit",
          }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: `${WEEKLY_ACCENT}20`, border: `1px solid ${WEEKLY_ACCENT}50`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Calendar size={16} color={WEEKLY_ACCENT} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: TEXT, fontWeight: 500, marginBottom: 2 }}>Choose what this week is for.</div>
              <div style={{ fontSize: 11, color: TEXT_DIM }}>7 days · big goal · big XP reward</div>
            </div>
            <Plus size={18} color={WEEKLY_ACCENT} strokeWidth={2.5} />
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

      {/* Main Quest — only render while still pending */}
      {mainQuest && mainQuest.status === "pending" && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>Main Quest</div>
          <TaskCard task={mainQuest} isMain onComplete={completeMainQuest} onActions={() => onOpenActions(mainQuest, "main")} />
        </div>
      )}

      {/* Today's Quests */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.2em", textTransform: "uppercase" }}>Today's Quests</div>
          <span style={{ fontSize: 11, color: TEXT_DIM }}>{pendingTasks.length} active</span>
        </div>
        {pendingTasks.length === 0 ? (
          <div style={{ background: CARD, border: `1px dashed ${BORDER}`, borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: TEXT_MID }}>The day is unspent. Name your first move.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pendingTasks.map(t => (
              <TaskCard key={t.id} task={t} isMain={false}
                onComplete={() => completeTask(t.id)} onActions={() => onOpenActions(t, "task")} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
