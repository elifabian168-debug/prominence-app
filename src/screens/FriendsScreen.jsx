import { useMemo, useState } from "react";
import { ChevronLeft, Plus, Flame, Sparkles, Calendar } from "lucide-react";
import { ACCENT, BG, CARD, CARD_ELEV, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";

const WEEKLY_ACCENT = "#7CA9F2";
import { CATEGORIES } from "../constants/categories";
import { ARCHETYPES } from "../constants/categories";
import { getLevelFromXP } from "../utils/xp";
import { getArchetype } from "../utils/archetype";
import { todayKey, formatRelativeTime } from "../utils/date";

export default function FriendsScreen({ state, userXP, userName, onBack, onOpenFriend, onCheer, onOpenAdd }) {
  const [tab, setTab] = useState("activity");
  const friends = state.friends || [];
  const friendStreaks = state.friendStreaks || {};
  const cheersGiven = state.cheersGiven || {};
  const today = todayKey();

  const activeStreaks = Object.entries(friendStreaks)
    .map(([fid, s]) => ({ friend: friends.find(f => f.id === fid), streak: s }))
    .filter(x => x.friend);

  const feed = useMemo(() => (
    [...friends].filter(f => f.recentActivity).sort((a, b) => a.recentActivity.minutesAgo - b.recentActivity.minutesAgo)
  ), [friends]);

  const me = {
    id: "me", name: userName, initial: userName[0]?.toUpperCase() || "Y",
    totalXP: userXP, weeklyXP: state.activityLog[today]?.xp || 0,
    streak: state.streak, archetype: getArchetype(state.statXP), isMe: true,
  };
  const ranked = useMemo(() => [...friends, me].sort((a, b) => b.weeklyXP - a.weeklyXP), [friends, userXP, state.statXP, state.streak]);

  return (
    <div style={{ padding: "24px 20px 0" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: TEXT_MID, padding: "0 0 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
        <ChevronLeft size={16} /> Back
      </button>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 6 }}>Friends</div>
          <div style={{ fontFamily: SERIF, fontSize: 32 }}>Your circle</div>
        </div>
        <button onClick={onOpenAdd} aria-label="Add friends" style={{
          display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 99,
          background: ACCENT, color: BG, border: "none",
          fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: "0.06em",
          flexShrink: 0, boxShadow: `0 4px 12px ${alpha(ACCENT, "30")}`,
        }}>
          <Plus size={14} strokeWidth={2.5} /> ADD
        </button>
      </div>

      {/* Friend Streaks */}
      {activeStreaks.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <Flame size={12} color={ACCENT} /> Friend Streaks
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {activeStreaks.map(({ friend, streak }) => {
              const arch = ARCHETYPES[friend.archetype] || ARCHETYPES.balanced;
              const myDone = (state.activityLog[today]?.count || 0) > 0;
              const atRisk = !myDone || streak.lastBoth !== today;
              return (
                <div key={friend.id} onClick={() => onOpenFriend(friend)} style={{
                  flexShrink: 0, width: 124, padding: "12px 14px",
                  background: atRisk ? `linear-gradient(135deg, ${alpha("#F87171", "15")}, ${CARD})` : `linear-gradient(135deg, ${alpha(ACCENT, "15")}, ${CARD})`,
                  border: `1px solid ${atRisk ? "#F8717140" : ACCENT + "40"}`,
                  borderRadius: 12, cursor: "pointer", textAlign: "left",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${arch.color}20`, border: `1px solid ${arch.color}50`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: SERIF, fontSize: 11, color: arch.color }}>{friend.initial}</span>
                    </div>
                    <span style={{ fontSize: 11, color: TEXT_MID, fontWeight: 500 }}>{friend.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                    <Flame size={12} color={atRisk ? "#F87171" : ACCENT} />
                    <span style={{ fontFamily: SERIF, fontSize: 22, color: atRisk ? "#F87171" : ACCENT, fontWeight: 500 }}>{streak.count}</span>
                    <span style={{ fontSize: 9, color: TEXT_DIM, letterSpacing: "0.1em" }}>days</span>
                  </div>
                  {atRisk && <div style={{ fontSize: 9, color: "#F87171", marginTop: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>At risk today</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[{ id: "activity", label: "Activity" }, { id: "leaderboard", label: "Leaderboard" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "8px", borderRadius: 8,
            background: tab === t.id ? CARD_ELEV : "transparent",
            border: `1px solid ${tab === t.id ? BORDER_BR : BORDER}`,
            color: tab === t.id ? TEXT : TEXT_MID,
            fontSize: 12, fontWeight: 500, cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Activity feed */}
      {tab === "activity" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {feed.length === 0 ? (
            <div style={{ background: CARD, border: `1px dashed ${BORDER_BR}`, borderRadius: 12, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: TEXT_MID }}>No recent activity from friends</div>
            </div>
          ) : feed.map(f => {
            const arch = ARCHETYPES[f.archetype] || ARCHETYPES.balanced;
            const cat = CATEGORIES[f.recentActivity.category] || CATEGORIES.life;
            const CatIcon = cat.icon;
            const cheeredToday = cheersGiven[f.id] === today;
            return (
              <div key={f.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <button onClick={() => onOpenFriend(f)} className="friend-tap" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, background: `${arch.color}20`, border: `1px solid ${arch.color}50`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
                  <span style={{ fontFamily: SERIF, fontSize: 16, color: arch.color }}>{f.initial}</span>
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div onClick={() => onOpenFriend(f)} className="friend-tap" style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>{f.name}</span>
                      <span style={{ fontSize: 10, color: TEXT_DIM }}>completed</span>
                    </div>
                    <div style={{ fontSize: 13, color: TEXT, marginBottom: 4 }}>{f.recentActivity.task}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <CatIcon size={9} color={cat.color} />
                      <span style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.1em", textTransform: "uppercase" }}>{cat.label}</span>
                      <span style={{ fontSize: 10, color: TEXT_DIM }}>·</span>
                      <span style={{ fontSize: 10, color: ACCENT, fontFamily: SERIF }}>+{f.recentActivity.xp} XP</span>
                      <span style={{ fontSize: 10, color: TEXT_DIM }}>·</span>
                      <span style={{ fontSize: 10, color: TEXT_DIM }}>{formatRelativeTime(f.recentActivity.minutesAgo)}</span>
                    </div>
                    {f.weeklyQuest && f.weeklyQuest.status === "pending" && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${BORDER}`, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <Calendar size={10} color={WEEKLY_ACCENT} />
                        <span style={{ fontSize: 10, color: WEEKLY_ACCENT, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Weekly</span>
                        <span style={{ fontSize: 11, color: TEXT, fontWeight: 500 }}>{f.weeklyQuest.task}</span>
                        <span style={{ fontSize: 10, color: TEXT_DIM, marginLeft: "auto" }}>
                          {f.weeklyQuest.daysLeft === 0 ? "today" : `${f.weeklyQuest.daysLeft}d left`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => onCheer && onCheer(f, "cheer")} disabled={cheeredToday} style={{
                  width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                  background: cheeredToday ? alpha(ACCENT, "20") : CARD_ELEV,
                  border: `1px solid ${cheeredToday ? ACCENT : BORDER_BR}`,
                  cursor: cheeredToday ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: cheeredToday ? 1 : 0.85, transition: "all 0.2s",
                }}>
                  <Sparkles size={15} color={cheeredToday ? ACCENT : TEXT_MID} fill={cheeredToday ? ACCENT : "none"} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard */}
      {tab === "leaderboard" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4 }}>This week · Resets Monday</div>
          {ranked.map((f, i) => {
            const arch = ARCHETYPES[f.archetype] || ARCHETYPES.balanced;
            const ArchI = arch.icon;
            const lvl = getLevelFromXP(f.totalXP).level;
            return (
              <div key={f.id} onClick={() => !f.isMe && onOpenFriend(f)}
                className={f.isMe ? "" : "friend-tap"}
                style={{
                  background: f.isMe ? alpha(ACCENT, "10") : CARD,
                  border: `1px solid ${f.isMe ? ACCENT + "40" : BORDER}`,
                  borderRadius: 12, padding: "10px 12px",
                  display: "flex", alignItems: "center", gap: 10,
                  cursor: f.isMe ? "default" : "pointer",
                }}>
                <div style={{ width: 24, fontFamily: SERIF, fontSize: 18, color: i < 3 ? ACCENT : TEXT_DIM, textAlign: "center" }}>{i + 1}</div>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${arch.color}20`, border: `1px solid ${arch.color}50`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: SERIF, fontSize: 15, color: arch.color }}>{f.initial}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>{f.name}{f.isMe ? " (you)" : ""}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                    <ArchI size={9} color={arch.color} />
                    <span style={{ fontSize: 10, color: TEXT_DIM }}>{arch.label} · Lv. {lvl}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: SERIF, fontSize: 16, color: ACCENT, fontWeight: 500 }}>{f.weeklyXP.toLocaleString()}</div>
                  <div style={{ fontSize: 9, color: TEXT_DIM, letterSpacing: "0.1em", textTransform: "uppercase" }}>weekly XP</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
