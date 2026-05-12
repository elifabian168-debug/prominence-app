import { useState } from "react";
import { ChevronLeft, Sparkles, AlertCircle, Flame, Crown, Calendar, UserMinus } from "lucide-react";
import { ACCENT, CARD, CARD_ELEV, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { CATEGORIES, ARCHETYPES } from "../constants/categories";
import { getLevelFromXP } from "../utils/xp";
import { todayKey, formatRelativeTime } from "../utils/date";
import StatCard from "../components/ui/StatCard";

const WEEKLY_ACCENT = "#7CA9F2";

function FriendQuestRow({ icon: Icon, label, accent, quest }) {
  const cat = CATEGORIES[quest.category] || CATEGORIES.life;
  const CatIcon = cat.icon;
  const done = quest.status === "complete";
  return (
    <div style={{
      background: `linear-gradient(135deg, ${accent}10, ${CARD})`,
      border: `1px solid ${accent}30`,
      borderRadius: 14, padding: "12px 14px", marginBottom: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <Icon size={11} color={accent} />
        <span style={{ fontSize: 10, color: accent, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600 }}>{label}</span>
        {done && (
          <span style={{ marginLeft: "auto", fontSize: 9, color: ACCENT, letterSpacing: "0.12em", textTransform: "uppercase" }}>Complete</span>
        )}
      </div>
      <div style={{ fontSize: 14, color: TEXT, fontWeight: 500, marginBottom: 6, opacity: done ? 0.6 : 1, textDecoration: done ? "line-through" : "none" }}>
        {quest.task}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <CatIcon size={10} color={cat.color} />
        <span style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.12em", textTransform: "uppercase" }}>{cat.label}</span>
        <span style={{ fontSize: 10, color: TEXT_DIM }}>·</span>
        <span style={{ fontSize: 11, color: ACCENT, fontFamily: SERIF }}>+{quest.xp} XP</span>
        {typeof quest.daysLeft === "number" && (
          <>
            <span style={{ fontSize: 10, color: TEXT_DIM }}>·</span>
            <span style={{ fontSize: 10, color: WEEKLY_ACCENT, fontWeight: 500 }}>
              {quest.daysLeft === 0 ? "Expires today" : quest.daysLeft === 1 ? "1 day left" : `${quest.daysLeft} days left`}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default function FriendDetailScreen({ friend, state, onBack, onCheer, onToggleFriendStreak, onRemoveFriend }) {
  const arch = ARCHETYPES[friend.archetype] || ARCHETYPES.balanced;
  const ArchI = arch.icon;
  const lvl = getLevelFromXP(friend.totalXP).level;
  const cat = friend.recentActivity ? CATEGORIES[friend.recentActivity.category] : null;
  const CatIcon = cat?.icon;
  const today = todayKey();
  const cheeredToday = state.cheersGiven?.[friend.id] === today;
  const nudgedToday  = state.nudgesGiven?.[friend.id] === today;
  const sharedStreak = state.friendStreaks?.[friend.id];
  const [burst, setBurst] = useState(null);

  const handleCheer = (type) => {
    const ok = onCheer(friend, type);
    if (ok) { setBurst(type); setTimeout(() => setBurst(null), 1100); }
  };

  return (
    <div style={{ padding: "24px 20px 0" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: TEXT_MID, padding: "0 0 24px", fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
        <ChevronLeft size={16} /> Back
      </button>

      {/* Identity */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28, position: "relative" }}>
        {burst === "cheer" && (
          <>
            <div style={{ position: "absolute", top: 8, left: "50%", pointerEvents: "none", zIndex: 5, animation: "sparkleCenter 0.9s ease-out forwards", fontSize: 32 }}>✨</div>
            <div style={{ position: "absolute", top: 8, left: "50%", pointerEvents: "none", zIndex: 5, animation: "sparkleLeft 0.9s ease-out forwards", fontSize: 22 }}>✨</div>
            <div style={{ position: "absolute", top: 8, left: "50%", pointerEvents: "none", zIndex: 5, animation: "sparkleRight 0.9s ease-out forwards", fontSize: 22 }}>✨</div>
          </>
        )}
        {burst === "nudge" && (
          <>
            <div style={{ position: "absolute", top: 0, left: "50%", pointerEvents: "none", zIndex: 5, animation: "nudgeWave 0.9s ease-in-out forwards", fontSize: 38, transformOrigin: "center bottom" }}>👋</div>
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 80, height: 80, borderRadius: "50%", border: "2px solid #F87171", pointerEvents: "none", zIndex: 4, animation: "nudgePulse 0.9s ease-out forwards" }} />
          </>
        )}
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: `radial-gradient(circle, ${arch.color}40 0%, ${arch.color}10 70%)`,
          border: `1px solid ${arch.color}60`,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 16, boxShadow: `0 0 40px ${arch.color}30`,
          animation: "avatarHero 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both",
        }}>
          <span style={{ fontFamily: SERIF, fontSize: 32, color: arch.color }}>{friend.initial}</span>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 36, marginBottom: 6 }}>{friend.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: arch.color, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 500 }}>
          <ArchI size={11} />{arch.label} · Lv. {lvl}
        </div>
      </div>

      {/* Weekly quest */}
      {friend.weeklyQuest && (
        <FriendQuestRow icon={Calendar} label="This week's quest" accent={WEEKLY_ACCENT} quest={friend.weeklyQuest} />
      )}

      {/* Main quest of the day */}
      {friend.mainQuestToday && (
        <FriendQuestRow icon={Crown} label="Today's main quest" accent={ACCENT} quest={friend.mainQuestToday} />
      )}

      {/* Recent activity */}
      {friend.recentActivity && cat && (
        <div style={{ background: `linear-gradient(135deg, ${cat.color}10, ${CARD})`, border: `1px solid ${cat.color}30`, borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>Most recent</div>
          <div style={{ fontSize: 15, color: TEXT, fontWeight: 500, marginBottom: 6 }}>{friend.recentActivity.task}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CatIcon size={10} color={cat.color} />
            <span style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.12em", textTransform: "uppercase" }}>{cat.label}</span>
            <span style={{ fontSize: 10, color: TEXT_DIM }}>·</span>
            <span style={{ fontSize: 11, color: ACCENT, fontFamily: SERIF }}>+{friend.recentActivity.xp} XP</span>
            <span style={{ fontSize: 10, color: TEXT_DIM, marginLeft: "auto" }}>{formatRelativeTime(friend.recentActivity.minutesAgo)}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        <StatCard label="Total XP"  value={friend.totalXP.toLocaleString()} />
        <StatCard label="Streak"    value={friend.streak} sub="days" />
        <StatCard label="This week" value={friend.weeklyXP} sub="XP" />
      </div>

      {/* Friend Streak toggle */}
      <button onClick={() => onToggleFriendStreak(friend)} style={{
        width: "100%", marginBottom: 14, padding: "14px 16px", borderRadius: 14,
        background: sharedStreak ? `linear-gradient(135deg, ${alpha(ACCENT, "20")}, ${CARD})` : CARD,
        border: `1px solid ${sharedStreak ? alpha(ACCENT, "50") : BORDER}`,
        cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, background: sharedStreak ? alpha(ACCENT, "20") : CARD_ELEV, border: `1px solid ${sharedStreak ? ACCENT : BORDER_BR}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Flame size={18} color={sharedStreak ? ACCENT : TEXT_MID} fill={sharedStreak ? ACCENT : "none"} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: TEXT, fontWeight: 500, marginBottom: 2 }}>
            {sharedStreak ? `Friend Streak · ${sharedStreak.count} days` : "Start a Friend Streak"}
          </div>
          <div style={{ fontSize: 11, color: TEXT_DIM, lineHeight: 1.4 }}>
            {sharedStreak ? "Both of you complete a quest each day to keep it going." : "Both complete one quest per day. Light pressure — big effect."}
          </div>
        </div>
        {sharedStreak && <span style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.1em", textTransform: "uppercase" }}>End</span>}
      </button>

      {/* Cheer / Nudge */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => handleCheer("cheer")} disabled={cheeredToday} style={{
          flex: 1, padding: "14px", borderRadius: 12,
          background: cheeredToday ? alpha(ACCENT, "15") : CARD,
          border: `1px solid ${cheeredToday ? ACCENT : BORDER}`,
          color: cheeredToday ? ACCENT : TEXT, fontSize: 13, fontWeight: 500,
          cursor: cheeredToday ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s",
        }}>
          <Sparkles size={14} fill={cheeredToday ? ACCENT : "none"} />
          {cheeredToday ? "Cheered" : "Cheer"}
        </button>
        <button onClick={() => handleCheer("nudge")} disabled={nudgedToday} style={{
          flex: 1, padding: "14px", borderRadius: 12,
          background: nudgedToday ? "#F8717115" : CARD,
          border: `1px solid ${nudgedToday ? "#F87171" : BORDER}`,
          color: nudgedToday ? "#F87171" : TEXT, fontSize: 13, fontWeight: 500,
          cursor: nudgedToday ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s",
        }}>
          <AlertCircle size={14} />
          {nudgedToday ? "Nudged" : "Nudge"}
        </button>
      </div>

      {/* Remove friend */}
      <button onClick={onRemoveFriend} style={{
        width: "100%", marginTop: 8, marginBottom: 24, padding: "12px", borderRadius: 12,
        background: "transparent", border: `1px solid ${BORDER_BR}`,
        color: "#F87171", fontSize: 13, fontWeight: 500, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        <UserMinus size={14} /> Remove friend
      </button>
    </div>
  );
}
