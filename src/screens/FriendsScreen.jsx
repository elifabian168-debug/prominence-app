import { useMemo, useState } from "react";
import { ChevronLeft, Plus, Sparkles, Calendar, Crown, Medal, Award, Shield, Mail, UserPlus, Check, X } from "lucide-react";
import { ACCENT, BG, CARD, CARD_ELEV, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";

const WEEKLY_ACCENT = "#7CA9F2";
const SILVER = "#C5C9D1";
const BRONZE = "#CD8B5A";

import { CATEGORIES } from "../constants/categories";
import { ARCHETYPES } from "../constants/categories";
import { getLevelFromXP } from "../utils/xp";
import { getArchetype } from "../utils/archetype";
import { todayKey, formatRelativeTime } from "../utils/date";

// Reusable archetype avatar with gradient background + level badge
function ArchAvatar({ friend, size = 40, showLevel = false, level }) {
  const arch = ARCHETYPES[friend.archetype] || ARCHETYPES.balanced;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: "100%", height: "100%", borderRadius: "50%",
        background: `linear-gradient(135deg, ${alpha(arch.color, "80")} 0%, ${alpha(arch.color, "30")} 60%, ${alpha(arch.color, "10")} 100%)`,
        border: `1.5px solid ${alpha(arch.color, "70")}`,
        boxShadow: `0 2px 10px ${alpha(arch.color, "30")}, inset 0 1px 0 ${alpha("#fff", "20")}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontFamily: SERIF, fontSize: size * 0.4,
          color: "#FFF", fontWeight: 600,
          textShadow: `0 1px 3px ${alpha("#000", "50")}`,
          letterSpacing: "-0.02em",
        }}>
          {friend.initial}
        </span>
      </div>
      {showLevel && level != null && (
        <div style={{
          position: "absolute", right: -3, bottom: -3,
          minWidth: 18, height: 18, borderRadius: 9,
          background: BG, border: `1.5px solid ${alpha(arch.color, "70")}`,
          padding: "0 4px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: SERIF, fontSize: 10, color: arch.color, fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          boxShadow: `0 2px 6px ${alpha("#000", "40")}`,
        }}>{level}</div>
      )}
    </div>
  );
}

const RANK_THEMES = {
  1: { color: ACCENT, label: "1st", icon: Crown,  shadow: "60", border: "70" },
  2: { color: SILVER, label: "2nd", icon: Medal,  shadow: "40", border: "55" },
  3: { color: BRONZE, label: "3rd", icon: Award,  shadow: "40", border: "55" },
};

export default function FriendsScreen({ state, userXP, userName, onBack, onOpenFriend, onCheer, onOpenAdd, onOpenGroups, groupCount = 0, pendingInviteCount = 0, friendRequests = [], onAcceptRequest, onDeclineRequest }) {
  const [tab, setTab] = useState("activity");
  const friends = state.friends || [];
  const cheersGiven = state.cheersGiven || {};
  const today = todayKey();

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
    <div style={{ padding: "24px 20px 0", position: "relative" }}>
      {/* Ambient bloom */}
      <div className="bloom" style={{
        width: 240, height: 240, left: -40, top: 40,
        background: `radial-gradient(circle, ${alpha(ACCENT, "18")} 0%, transparent 70%)`,
      }} />

      <button onClick={onBack} style={{ background: "transparent", border: "none", color: TEXT_MID, padding: "0 0 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
        <ChevronLeft size={16} /> Back
      </button>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 20, position: "relative" }}>
        <div>
          <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>Friends</div>
          <div style={{ fontFamily: SERIF, fontSize: 34, letterSpacing: "-0.01em" }}>Your circle</div>
        </div>
        <button onClick={onOpenAdd} aria-label="Add friends" style={{
          display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 99,
          background: `linear-gradient(135deg, ${ACCENT}, ${alpha(ACCENT, "85")})`, color: BG, border: "none",
          fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase",
          flexShrink: 0, boxShadow: `0 6px 18px ${alpha(ACCENT, "40")}`,
        }}>
          <Plus size={14} strokeWidth={2.8} /> Add
        </button>
      </div>

      {/* Circles entry */}
      {onOpenGroups && (
        <button
          onClick={onOpenGroups}
          className="tappable"
          style={{
            width: "100%",
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 16px",
            marginBottom: 22,
            background: pendingInviteCount > 0
              ? `linear-gradient(135deg, ${alpha(ACCENT, "16")} 0%, ${CARD} 70%)`
              : CARD,
            border: `1px solid ${pendingInviteCount > 0 ? alpha(ACCENT, "50") : BORDER}`,
            borderRadius: 14,
            cursor: "pointer",
            textAlign: "left",
            boxShadow: pendingInviteCount > 0 ? `0 0 22px ${alpha(ACCENT, "15")}` : "none",
          }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: alpha(ACCENT, "12"),
            border: `1px solid ${alpha(ACCENT, "40")}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Shield size={16} color={ACCENT} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 9, color: TEXT_DIM,
              letterSpacing: "0.3em", textTransform: "uppercase",
              fontWeight: 700, marginBottom: 4,
            }}>
              Circles
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 18, color: TEXT, lineHeight: 1, letterSpacing: "0.01em" }}>
              {groupCount === 0 ? "Create your first" : `${groupCount} ${groupCount === 1 ? "Circle" : "Circles"}`}
            </div>
          </div>
          {pendingInviteCount > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 9px",
              background: alpha(ACCENT, "18"),
              border: `1px solid ${alpha(ACCENT, "55")}`,
              borderRadius: 99,
              color: ACCENT,
              fontSize: 9, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              animation: "fadeIn 0.4s ease",
            }}>
              <Mail size={9} />
              {pendingInviteCount} new
            </div>
          )}
          <div style={{
            fontSize: 10, color: ACCENT,
            letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700,
          }}>
            Open →
          </div>
        </button>
      )}

      {/* Friend requests */}
      {friendRequests.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 10, color: TEXT_DIM, letterSpacing: "0.24em",
            textTransform: "uppercase", fontWeight: 700, marginBottom: 10,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <UserPlus size={11} color={ACCENT} />
            <span style={{ color: ACCENT }}>Friend requests · {friendRequests.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {friendRequests.map(req => (
              <div key={req.fromUid} style={{
                background: `linear-gradient(90deg, ${alpha(ACCENT, "08")}, ${CARD})`,
                border: `1px solid ${alpha(ACCENT, "35")}`,
                borderRadius: 14, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 12,
                animation: "fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both",
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                  background: alpha(ACCENT, "15"), border: `1px solid ${alpha(ACCENT, "40")}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontFamily: SERIF, fontSize: 17, color: ACCENT }}>{req.fromInitial}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{req.fromName}</div>
                  {req.fromUsername && (
                    <div style={{ fontSize: 11, color: TEXT_DIM }}>@{req.fromUsername}</div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => onDeclineRequest?.(req)}
                    style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: "transparent", border: `1px solid ${BORDER_BR}`,
                      color: TEXT_DIM, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <X size={14} />
                  </button>
                  <button
                    onClick={() => onAcceptRequest?.(req)}
                    style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: ACCENT, border: "none",
                      color: BG, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 0 12px ${alpha(ACCENT, "35")}`,
                    }}
                  >
                    <Check size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, padding: 3, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10 }}>
        {[{ id: "activity", label: "Activity" }, { id: "leaderboard", label: "Leaderboard" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "8px", borderRadius: 8,
            background: tab === t.id ? alpha(ACCENT, "12") : "transparent",
            border: `1px solid ${tab === t.id ? alpha(ACCENT, "35") : "transparent"}`,
            color: tab === t.id ? ACCENT : TEXT_MID,
            fontSize: 11, fontWeight: 700, cursor: "pointer",
            letterSpacing: "0.12em", textTransform: "uppercase",
            transition: "all 0.18s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Activity feed */}
      {tab === "activity" && (
        <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {feed.length === 0 ? (
            <div style={{ background: CARD, border: `1px dashed ${BORDER_BR}`, borderRadius: 12, padding: 24, textAlign: "center" }}>
              <div style={{ fontFamily: SERIF, fontSize: 16, color: TEXT, marginBottom: 4 }}>All quiet.</div>
              <div style={{ fontSize: 12, color: TEXT_MID, fontStyle: "italic" }}>No recent activity from friends.</div>
            </div>
          ) : feed.map((f, i) => {
            const cat = CATEGORIES[f.recentActivity.category] || CATEGORIES.life;
            const CatIcon = cat.icon;
            const cheeredToday = cheersGiven[f.id] === today;
            const lvl = getLevelFromXP(f.totalXP).level;
            return (
              <div key={f.id} style={{
                "--i": i,
                background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "14px",
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <button onClick={() => onOpenFriend(f)} className="friend-tap" style={{
                  background: "transparent", border: "none", padding: 0, cursor: "pointer",
                }}>
                  <ArchAvatar friend={f} size={44} showLevel level={lvl} />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div onClick={() => onOpenFriend(f)} className="friend-tap" style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{f.name}</span>
                      <span style={{ fontSize: 10, color: TEXT_DIM, fontStyle: "italic" }}>completed</span>
                    </div>
                    <div style={{ fontSize: 13, color: TEXT, marginBottom: 6, lineHeight: 1.35 }}>{f.recentActivity.task}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "2px 7px", borderRadius: 99,
                        background: alpha(cat.color, "12"),
                        border: `1px solid ${alpha(cat.color, "25")}`,
                      }}>
                        <CatIcon size={9} color={cat.color} />
                        <span style={{ fontSize: 9, color: cat.color, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>{cat.label}</span>
                      </div>
                      <span style={{ fontSize: 11, color: ACCENT, fontFamily: SERIF, fontWeight: 600 }}>+{f.recentActivity.xp} XP</span>
                      <span style={{ fontSize: 10, color: TEXT_DIM }}>· {formatRelativeTime(f.recentActivity.minutesAgo)}</span>
                    </div>
                    {f.weeklyQuest && f.weeklyQuest.status === "pending" && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${BORDER}`, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <Calendar size={10} color={WEEKLY_ACCENT} />
                        <span style={{ fontSize: 9, color: WEEKLY_ACCENT, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>Weekly</span>
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

      {/* Leaderboard with podium */}
      {tab === "leaderboard" && (
        <div>
          <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>
            This week · Resets Monday
          </div>
          <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ranked.map((f, i) => {
              const rank = i + 1;
              const theme = RANK_THEMES[rank];
              const lvl = getLevelFromXP(f.totalXP).level;
              const arch = ARCHETYPES[f.archetype] || ARCHETYPES.balanced;
              const ArchI = arch.icon;
              const isPodium = !!theme;
              const Icon = theme?.icon;

              const podiumBorder = isPodium ? `1.5px solid ${alpha(theme.color, theme.border)}` : `1px solid ${f.isMe ? alpha(ACCENT, "40") : BORDER}`;
              const podiumBg = isPodium
                ? `linear-gradient(135deg, ${alpha(theme.color, "18")} 0%, ${alpha(theme.color, "04")} 60%, ${CARD} 100%)`
                : (f.isMe ? alpha(ACCENT, "08") : CARD);

              return (
                <div key={f.id} onClick={() => !f.isMe && onOpenFriend(f)}
                  className={f.isMe ? "" : "friend-tap"}
                  style={{
                    "--i": i,
                    position: "relative",
                    background: podiumBg,
                    border: podiumBorder,
                    borderRadius: 14,
                    padding: isPodium ? "14px 14px" : "10px 12px",
                    display: "flex", alignItems: "center", gap: 12,
                    cursor: f.isMe ? "default" : "pointer",
                    overflow: "hidden",
                    boxShadow: isPodium ? `0 4px 18px ${alpha(theme.color, theme.shadow === "60" ? "20" : "12")}` : "none",
                  }}>
                  {/* Shimmer overlay for rank 1 */}
                  {rank === 1 && (
                    <div style={{
                      position: "absolute", inset: 0, pointerEvents: "none",
                      background: `linear-gradient(110deg, transparent 30%, ${alpha(ACCENT, "12")} 45%, transparent 60%)`,
                      backgroundSize: "200% 100%",
                      animation: "podiumShimmer 5s linear infinite",
                    }} />
                  )}

                  {/* Rank indicator */}
                  <div style={{
                    width: isPodium ? 36 : 26,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, position: "relative",
                  }}>
                    {isPodium ? (
                      <>
                        <Icon size={rank === 1 ? 22 : 18} color={theme.color}
                          fill={alpha(theme.color, "25")}
                          style={{ filter: `drop-shadow(0 0 6px ${alpha(theme.color, "50")})` }}
                        />
                        <span style={{
                          fontFamily: SERIF, fontSize: 11, color: theme.color,
                          fontWeight: 700, letterSpacing: "0.04em", marginTop: 2,
                          fontVariantNumeric: "tabular-nums",
                        }}>{theme.label}</span>
                      </>
                    ) : (
                      <span style={{
                        fontFamily: SERIF, fontSize: 18, color: TEXT_DIM,
                        fontWeight: 500, fontVariantNumeric: "tabular-nums",
                      }}>{rank}</span>
                    )}
                  </div>

                  <ArchAvatar friend={f} size={isPodium ? 44 : 38} showLevel={isPodium} level={lvl} />

                  <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                    <div style={{
                      fontSize: isPodium ? 14 : 13,
                      fontWeight: 600,
                      color: f.isMe ? ACCENT : TEXT,
                      letterSpacing: "-0.005em",
                    }}>
                      {f.name}{f.isMe ? " (you)" : ""}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                      <ArchI size={9} color={arch.color} />
                      <span style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.02em" }}>
                        {arch.label} · Lv. {lvl}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", position: "relative" }}>
                    <div style={{
                      fontFamily: SERIF,
                      fontSize: isPodium ? 22 : 17,
                      color: isPodium ? theme.color : ACCENT,
                      fontWeight: 600, lineHeight: 1,
                      fontVariantNumeric: "tabular-nums",
                      textShadow: rank === 1 ? `0 0 12px ${alpha(theme.color, "40")}` : "none",
                    }}>{f.weeklyXP.toLocaleString()}</div>
                    <div style={{ fontSize: 9, color: TEXT_DIM, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 3, fontWeight: 600 }}>weekly XP</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
