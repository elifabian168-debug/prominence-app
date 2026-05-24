import { Bell, Flame, Users, Calendar, Plus, Sparkles, Shield } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { ARCHETYPES } from "../constants/categories";
import { todayKey } from "../utils/date";
import { getLevelFromXP } from "../utils/xp";
import { getArchetype } from "../utils/archetype";
import TaskCard from "../components/tasks/TaskCard";
import WeeklyQuestCard from "../components/tasks/WeeklyQuestCard";

const WEEKLY_ACCENT = "#7CA9F2";
const STREAK_MILESTONES = new Set([3, 7, 14, 21, 30, 60, 100]);

export default function HomeScreen({ state, name, levelingUp, xpGains, completeTask, completeMainQuest, completeWeeklyQuest, onOpenActions, onOpenFriends, onOpenLifeStats, onOpenNotifs, onAddWeekly, onCreateQuest, groups = [], groupInvites = [], onOpenGroups, onOpenCircle }) {
  const unreadNotifs = (state.cheersReceived || []).filter(n => !n.read).length;
  const { totalXP, tasks, mainQuest, streak } = state;
  // Weekly quests stay on Home for their full 7-day window — completed ones
  // remain visible (as a "Complete" card) until their deadline passes. Failed
  // quests drop off immediately so the user can recreate in that category.
  const activeWeekly = (state.weeklyQuests || []).filter(q => {
    if (q.status === "pending") return true;
    if (q.status === "complete" && (!q.deadline || Date.now() < q.deadline)) return true;
    return false;
  });
  const pendingWeekly = activeWeekly.filter(q => q.status === "pending");
  const { level, progress, xpIntoLevel, xpForNextLevel } = getLevelFromXP(totalXP);
  const archetype = ARCHETYPES[getArchetype(state.statXP)];
  const ArchIcon = archetype.icon;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const pendingTasks = tasks.filter(t => t.status === "pending");

  // Compact level ring for inline hero header
  const ringSize = 132;
  const ringStroke = 3;
  const ringRadius = ringSize / 2 - ringStroke - 3;
  const ringCircum = 2 * Math.PI * ringRadius;

  return (
    <div style={{ padding: "20px 20px 0", position: "relative" }}>

      {/* Top status row: date + bell + streak */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.22em", textTransform: "uppercase" }}>{today}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={onOpenNotifs}
            aria-label={`Notifications${unreadNotifs > 0 ? `, ${unreadNotifs} unread` : ""}`}
            style={{
              position: "relative", width: 34, height: 34, borderRadius: 10,
              background: CARD, border: `1px solid ${unreadNotifs > 0 ? alpha(ACCENT, "60") : BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "border-color 0.2s",
            }}>
            <Bell size={14}
              color={unreadNotifs > 0 ? ACCENT : TEXT_MID}
              style={{
                transformOrigin: "top center",
                animation: unreadNotifs > 0 ? "bellRing 2.4s ease-in-out infinite" : "none",
              }}
            />
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
            boxShadow: streak >= 7 ? `0 0 14px ${alpha(ACCENT, "20")}` : "none",
          }}>
            <Flame size={12} color={streak > 0 ? ACCENT : TEXT_DIM} />
            <span style={{ fontSize: 12, fontWeight: 600, color: streak > 0 ? ACCENT : TEXT_MID, fontVariantNumeric: "tabular-nums" }}>{streak}</span>
          </div>
        </div>
      </div>

      {/* Hero: greeting + compact level ring side by side */}
      <div style={{ position: "relative", marginBottom: 24 }}>
        {/* Ambient bloom behind the ring */}
        <div className="bloom" style={{
          width: 260, height: 260,
          right: -40, top: -50,
          background: `radial-gradient(circle, ${alpha(ACCENT, "35")} 0%, transparent 70%)`,
          animation: "bloomDrift 12s ease-in-out infinite",
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 1 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: SERIF, fontSize: 30, color: TEXT, lineHeight: 1.05, marginBottom: 6, letterSpacing: "-0.01em" }}>
              Hello,<br/>
              <span style={{ color: ACCENT, fontWeight: 500 }}>{name}</span>
            </div>
            <div style={{ fontSize: 12, color: TEXT_MID, lineHeight: 1.5, maxWidth: 200 }}>
              {pendingTasks.length === 0 && pendingWeekly.length === 0
                ? "A fresh page. What will you make of it?"
                : `${pendingTasks.length + pendingWeekly.length} quest${(pendingTasks.length + pendingWeekly.length) === 1 ? "" : "s"} await.`}
            </div>
          </div>

          {/* Compact level ring */}
          <div style={{ position: "relative", width: ringSize, height: ringSize, flexShrink: 0, animation: levelingUp ? "scaleIn 0.6s ease" : "none" }}>
            <svg width={ringSize} height={ringSize} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
              <circle cx={ringSize / 2} cy={ringSize / 2} r={ringRadius} fill="none" stroke={BORDER} strokeWidth={ringStroke} />
              <circle cx={ringSize / 2} cy={ringSize / 2} r={ringRadius} fill="none" stroke={ACCENT} strokeWidth={ringStroke}
                strokeLinecap="round" strokeDasharray={ringCircum} strokeDashoffset={ringCircum * (1 - progress)}
                style={{
                  transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                  filter: `drop-shadow(0 0 6px ${alpha(ACCENT, "80")})`,
                  animation: progress >= 0.8 ? "ringPulse 2.4s ease-in-out infinite" : "none",
                }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <div style={{ fontSize: 9, color: TEXT_DIM, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 2 }}>Level</div>
              <div style={{ fontFamily: SERIF, fontSize: 48, fontWeight: 500, lineHeight: 1, letterSpacing: "-0.03em", color: TEXT }}>{level}</div>
              <div style={{ fontSize: 9, color: TEXT_MID, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{xpIntoLevel}/{xpForNextLevel}</div>
            </div>
            {xpGains.map(g => (
              <div key={g.id} style={{
                position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)",
                fontFamily: SERIF, fontSize: 20, color: g.capped ? TEXT_MID : ACCENT,
                pointerEvents: "none", animation: "xpFloat 1.4s ease-out forwards",
                textShadow: `0 0 12px ${alpha(ACCENT, "60")}`,
              }}>+{g.amount}{g.capped ? " (cap)" : ""}</div>
            ))}
          </div>
        </div>

        {/* Archetype + friends quick chips */}
        <div style={{ display: "flex", gap: 8, marginTop: 18, position: "relative", zIndex: 1 }}>
          <button onClick={onOpenLifeStats} style={{
            flex: 1, background: `linear-gradient(135deg, ${alpha(archetype.color, "12")}, ${CARD})`,
            border: `1px solid ${alpha(archetype.color, "30")}`, borderRadius: 12, padding: "10px 12px",
            cursor: "pointer", textAlign: "left", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: `radial-gradient(circle, ${alpha(archetype.color, "40")} 0%, ${alpha(archetype.color, "10")} 70%)`,
              border: `1px solid ${alpha(archetype.color, "50")}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 14px ${alpha(archetype.color, "25")}`,
            }}>
              <ArchIcon size={13} color={archetype.color} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 9, color: alpha(archetype.color, "90"), letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>Archetype</div>
              <div style={{ fontSize: 13, color: TEXT, fontWeight: 500, marginTop: 1 }}>{archetype.label}</div>
            </div>
          </button>
          <button onClick={onOpenFriends} style={{
            flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "10px 12px", cursor: "pointer",
            textAlign: "left", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: CARD_BLEND(TEXT_MID), border: `1px solid ${BORDER_BR}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Users size={13} color={TEXT_MID} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 9, color: TEXT_DIM, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>Friends</div>
              <div style={{ fontSize: 13, color: TEXT, fontWeight: 500, marginTop: 1 }}>{state.friends?.length || 0} active</div>
            </div>
          </button>
          <button onClick={onOpenGroups} style={{
            flex: 1, position: "relative",
            background: groupInvites.length > 0
              ? `linear-gradient(135deg, ${alpha(ACCENT, "12")}, ${CARD})`
              : CARD,
            border: `1px solid ${groupInvites.length > 0 ? alpha(ACCENT, "40") : BORDER}`,
            borderRadius: 12, padding: "10px 12px", cursor: "pointer",
            textAlign: "left", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 10,
            boxShadow: groupInvites.length > 0 ? `0 0 14px ${alpha(ACCENT, "18")}` : "none",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: groupInvites.length > 0 ? alpha(ACCENT, "15") : CARD_BLEND(TEXT_MID),
              border: `1px solid ${groupInvites.length > 0 ? alpha(ACCENT, "45") : BORDER_BR}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Shield size={13} color={groupInvites.length > 0 ? ACCENT : TEXT_MID} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 9, color: TEXT_DIM, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>Circles</div>
              <div style={{ fontSize: 13, color: TEXT, fontWeight: 500, marginTop: 1 }}>
                {groups.length === 0 ? "None yet" : `${groups.length}`}
              </div>
            </div>
            {groupInvites.length > 0 && (
              <div style={{
                position: "absolute", top: -4, right: -4,
                minWidth: 16, height: 16, borderRadius: 99,
                background: ACCENT, color: BG, fontSize: 9, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 4px", border: `2px solid ${BG}`,
                animation: "notifBadge 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}>{groupInvites.length > 9 ? "9+" : groupInvites.length}</div>
            )}
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
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 10, color: alpha(ACCENT, "90"), letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
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
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      background: `linear-gradient(135deg, ${alpha(arch.color, "60")}, ${alpha(arch.color, "15")})`,
                      border: `1px solid ${alpha(arch.color, "60")}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontFamily: SERIF, fontSize: 11, color: "#FFF", fontWeight: 600, textShadow: `0 1px 2px ${alpha("#000", "40")}` }}>{friend.initial}</span>
                    </div>
                    <Flame size={11} color={atRisk ? "#F87171" : ACCENT} />
                    <span style={{ fontFamily: SERIF, fontSize: 17, color: atRisk ? "#F87171" : ACCENT, fontWeight: 600, lineHeight: 1 }}>{streak.count}</span>
                    <span style={{ fontSize: 10, color: TEXT_MID, fontWeight: 500 }}>{friend.name}</span>
                    {atRisk && <span style={{ fontSize: 9, color: "#F87171", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>at risk</span>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Weekly Quests — top priority */}
      <div style={{ marginBottom: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: alpha(WEEKLY_ACCENT, "95"), letterSpacing: "0.22em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
            <Calendar size={11} color={WEEKLY_ACCENT} /> Weekly Quests
          </div>
          {activeWeekly.length > 0 ? (
            <button onClick={onAddWeekly} aria-label="Add weekly quest" style={{
              display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 99,
              background: `${WEEKLY_ACCENT}15`, border: `1px solid ${WEEKLY_ACCENT}40`,
              color: WEEKLY_ACCENT, fontSize: 10, fontWeight: 600, cursor: "pointer",
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              <Plus size={11} strokeWidth={2.5} /> Add
            </button>
          ) : (
            <span style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.08em", textTransform: "uppercase" }}>0 active</span>
          )}
        </div>
        {activeWeekly.length === 0 ? (
          <button onClick={onAddWeekly} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            padding: "14px 16px", borderRadius: 14,
            background: `linear-gradient(135deg, ${WEEKLY_ACCENT}15, ${CARD})`,
            border: `1px dashed ${WEEKLY_ACCENT}50`,
            cursor: "pointer", textAlign: "left", fontFamily: "inherit",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: `radial-gradient(circle, ${WEEKLY_ACCENT}40, ${WEEKLY_ACCENT}15)`,
              border: `1px solid ${WEEKLY_ACCENT}50`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 18px ${WEEKLY_ACCENT}30`,
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
          <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activeWeekly.map((q, i) => (
              <div key={q.id} style={{ "--i": i }}>
                <WeeklyQuestCard quest={q}
                  onComplete={() => completeWeeklyQuest(q.id)}
                  onActions={() => onOpenActions(q, "weekly")} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Quest */}
      {mainQuest && mainQuest.status === "pending" && (
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 10, color: alpha(ACCENT, "95"), letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
            <Sparkles size={11} color={ACCENT} /> Main Quest
          </div>
          <TaskCard task={mainQuest} isMain onComplete={completeMainQuest} onActions={() => onOpenActions(mainQuest, "main")} />
        </div>
      )}

      {/* Today's Quests */}
      <div style={{ marginBottom: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: TEXT_MID, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600 }}>Today's Quests</div>
          <span style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.08em", textTransform: "uppercase" }}>{pendingTasks.length} active</span>
        </div>
        {pendingTasks.length === 0 ? (
          <div style={{
            background: `linear-gradient(135deg, ${alpha(ACCENT, "06")}, ${CARD})`,
            border: `1px dashed ${alpha(ACCENT, "30")}`,
            borderRadius: 14, padding: "28px 18px 24px",
            textAlign: "center", position: "relative", overflow: "hidden",
          }}>
            {/* Decorative giant 0 in serif */}
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: SERIF, fontSize: 140, color: alpha(ACCENT, "10"),
              fontWeight: 400, lineHeight: 1, pointerEvents: "none",
              letterSpacing: "-0.04em",
            }}>0</div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontFamily: SERIF, fontSize: 18, color: TEXT, marginBottom: 6, letterSpacing: "-0.01em" }}>
                The day is unspent.
              </div>
              <div style={{ fontSize: 12, color: TEXT_MID, marginBottom: 14, fontStyle: "italic" }}>Name your first move.</div>
              <button onClick={onCreateQuest} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "10px 20px", borderRadius: 99,
                background: ACCENT, border: "none",
                color: BG, fontSize: 12, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                letterSpacing: "0.08em", textTransform: "uppercase",
                boxShadow: `0 6px 18px ${alpha(ACCENT, "40")}`,
              }}>
                <Plus size={14} strokeWidth={2.5} />
                Create quest
              </button>
            </div>
          </div>
        ) : (
          <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pendingTasks.map((t, i) => (
              <div key={t.id} style={{ "--i": i }}>
                <TaskCard task={t} isMain={false}
                  onComplete={() => completeTask(t.id)} onActions={() => onOpenActions(t, "task")} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper: subtle tinted background for muted chip variants
function CARD_BLEND(color) {
  return `linear-gradient(135deg, ${alpha(color, "18")}, ${alpha(color, "06")})`;
}
