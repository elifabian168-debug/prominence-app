import { Bell, Flame, Calendar, Plus, Sparkles, UserPlus, ChevronRight } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { ARCHETYPES, CATEGORIES } from "../constants/categories";
import { getLevelFromXP } from "../utils/xp";
import TaskCard from "../components/tasks/TaskCard";
import WeeklyQuestCard from "../components/tasks/WeeklyQuestCard";

const RIBBON_WINDOW_MS = 24 * 60 * 60 * 1000;
const RIBBON_MAX = 6;
const goalVerb = (kind) => {
  if (kind === "weekly") return "weekly goal";
  if (kind === "main") return "big goal";
  return null;
};

const WEEKLY_ACCENT = "#7CA9F2";
const STREAK_MILESTONES = new Set([3, 7, 14, 21, 30, 60, 100]);

export default function HomeScreen({
  state, name, levelingUp, xpGains,
  completeTask, completeMainQuest, completeWeeklyQuest,
  onOpenActions, onOpenLifeStats, onOpenNotifs,
  onAddWeekly, onCreateQuest,
  posts = [],
  onOpenFeed, onOpenAddFriends,
}) {
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

      </div>

      {/* Social ribbon — friends' posts from the last 24h. Empty-state is an
          inline CTA to add a friend (instead of hiding). */}
      <SocialRibbon
        posts={posts}
        friends={state.friends || []}
        onOpenFeed={onOpenFeed}
        onOpenAddFriends={onOpenAddFriends}
      />

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

// ── SocialRibbon ──
// Horizontal scroll of post mini-cards from the last 24h (excluding self).
// When empty (no recent friend activity), shows a single full-width
// "Add a friend" CTA instead of hiding — see design doc.
function SocialRibbon({ posts, friends, onOpenFeed, onOpenAddFriends }) {
  const cutoff = Date.now() - RIBBON_WINDOW_MS;
  const recent = (posts || [])
    .filter((p) => p.authorId !== "me" && p.createdAt >= cutoff)
    .slice(0, RIBBON_MAX);

  if (recent.length === 0) {
    return (
      <button
        onClick={onOpenAddFriends}
        className="tappable"
        style={{
          width: "100%", marginBottom: 22,
          padding: "14px 16px",
          background: `linear-gradient(135deg, ${alpha(ACCENT, "12")}, ${CARD})`,
          border: `1px dashed ${alpha(ACCENT, "45")}`,
          borderRadius: 14,
          color: ACCENT,
          fontFamily: "inherit", fontSize: 13, fontWeight: 600,
          cursor: "pointer", textAlign: "left",
          display: "flex", alignItems: "center", gap: 12,
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: alpha(ACCENT, "16"),
          border: `1px solid ${alpha(ACCENT, "45")}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <UserPlus size={14} color={ACCENT} />
        </div>
        <span style={{ flex: 1, color: TEXT }}>Add a friend to see what they're up to</span>
        <ChevronRight size={16} color={ACCENT} />
      </button>
    );
  }

  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 8,
      }}>
        <div style={{
          fontSize: 10, color: alpha(ACCENT, "90"),
          letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600,
        }}>
          Friends today
        </div>
        <button
          onClick={onOpenFeed}
          style={{
            background: "transparent", border: "none",
            color: TEXT_DIM, fontSize: 11, fontWeight: 600,
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 2,
          }}
        >
          See all <ChevronRight size={12} />
        </button>
      </div>
      <div style={{
        display: "flex", gap: 8, overflowX: "auto",
        paddingBottom: 2, scrollbarWidth: "none",
      }}>
        {recent.map((p) => {
          const author = friends.find((f) => f.id === p.authorId);
          const arch = ARCHETYPES[author?.archetype] || ARCHETYPES.balanced;
          const cat = CATEGORIES[p.goalRef?.category] || null;
          const kind = goalVerb(p.goalRef?.kind);
          const title = p.goalRef?.title || "did a thing";
          return (
            <button
              key={p.id}
              onClick={onOpenFeed}
              className="tappable"
              style={{
                flexShrink: 0,
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px 8px 8px",
                minWidth: 200, maxWidth: 240,
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 99,
                cursor: "pointer", textAlign: "left",
                fontFamily: "inherit",
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: `linear-gradient(135deg, ${alpha(arch.color, "70")}, ${alpha(arch.color, "20")})`,
                border: `1.5px solid ${alpha(arch.color, "60")}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: SERIF, fontSize: 11, color: "#FFF", fontWeight: 600 }}>
                  {author?.initial || "?"}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 11, color: TEXT, fontWeight: 600, lineHeight: 1.15,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {author?.name || "Someone"}
                </div>
                <div style={{
                  fontSize: 10, color: cat?.color || TEXT_DIM, lineHeight: 1.2,
                  marginTop: 1,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {kind ? `${kind} · ` : ""}{title}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
