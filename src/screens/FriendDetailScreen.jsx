import { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, AlertCircle, Flame, Crown, Calendar, UserMinus } from "lucide-react";
import { ACCENT, CARD, CARD_ELEV, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { CATEGORIES, ARCHETYPES } from "../constants/categories";
import { getLevelFromXP } from "../utils/xp";
import { todayKey, formatRelativeTime } from "../utils/date";

const WEEKLY_ACCENT = "#7CA9F2";

// ── Helpers ─────────────────────────────────────────────────────────────────

function QuestRow({ icon: Icon, label, accent, quest }) {
  const cat = CATEGORIES[quest.category] || CATEGORIES.life;
  const CatIcon = cat.icon;
  const done = quest.status === "complete";
  return (
    <div style={{
      background: `linear-gradient(135deg, ${alpha(accent, "08")}, ${CARD})`,
      border: `1px solid ${alpha(accent, "25")}`,
      borderRadius: 12, padding: "12px 14px", marginBottom: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <Icon size={10} color={accent} />
        <span style={{ fontSize: 9, color: accent, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700 }}>{label}</span>
        {done && <span style={{ marginLeft: "auto", fontSize: 9, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase" }}>Complete</span>}
      </div>
      <div style={{ fontSize: 13, color: TEXT, fontWeight: 500, marginBottom: 5, opacity: done ? 0.6 : 1, textDecoration: done ? "line-through" : "none" }}>
        {quest.task}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
        <CatIcon size={9} color={cat.color} />
        <span style={{ fontSize: 9, color: TEXT_DIM, letterSpacing: "0.1em", textTransform: "uppercase" }}>{cat.label}</span>
        <span style={{ fontSize: 9, color: TEXT_DIM }}>·</span>
        <span style={{ fontFamily: SERIF, fontSize: 11, color: ACCENT }}>+{quest.xp} XP</span>
        {typeof quest.daysLeft === "number" && (
          <span style={{ fontSize: 9, color: WEEKLY_ACCENT, fontWeight: 500, marginLeft: "auto" }}>
            {quest.daysLeft === 0 ? "expires today" : quest.daysLeft === 1 ? "1 day left" : `${quest.daysLeft}d left`}
          </span>
        )}
      </div>
    </div>
  );
}

function formatXP(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

// ── Radar chart (pentagon) ───────────────────────────────────────────────────

function RadarChart({ categoryXP, archColor }) {
  const cats = Object.entries(CATEGORIES); // [fitness, school, life, work, mind]
  const n = cats.length;
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const chartR = 86;
  const labelR = 116;

  const getAngle = (i) => (2 * Math.PI * i / n) - Math.PI / 2;
  const getPt = (i, scale) => ({
    x: cx + chartR * scale * Math.cos(getAngle(i)),
    y: cy + chartR * scale * Math.sin(getAngle(i)),
  });

  const maxXP = Math.max(1, ...cats.map(([k]) => categoryXP[k] || 0));
  const dataPoints = cats.map(([key], i) => {
    const norm = Math.max(0.05, (categoryXP[key] || 0) / maxXP);
    return getPt(i, norm);
  });

  const pStr = (pts) => pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${size} ${size}`} style={{ maxWidth: size, overflow: "visible" }}>
      {/* Grid rings */}
      {[0.33, 0.67, 1].map((scale, ri) => (
        <polygon key={ri}
          points={pStr(cats.map((_, i) => getPt(i, scale)))}
          fill={scale === 1 ? `${archColor}06` : "none"}
          stroke={scale === 1 ? `${archColor}22` : "rgba(255,255,255,0.05)"}
          strokeWidth={1}
        />
      ))}

      {/* Axis spokes */}
      {cats.map((_, i) => {
        const outer = getPt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />;
      })}

      {/* Data fill */}
      <polygon
        points={pStr(dataPoints)}
        fill={`${archColor}28`}
        stroke={archColor}
        strokeWidth={2}
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 10px ${archColor}50)` }}
      />

      {/* Category dots at each vertex */}
      {cats.map(([key, cat], i) => {
        const p = dataPoints[i];
        return (
          <circle key={key} cx={p.x} cy={p.y} r={5}
            fill={cat.color}
            stroke="var(--bg)"
            strokeWidth={1.5}
            style={{ filter: `drop-shadow(0 0 5px ${cat.color}90)` }}
          />
        );
      })}

      {/* Labels — category name + XP value */}
      {cats.map(([key, cat], i) => {
        const a = getAngle(i);
        const lx = cx + labelR * Math.cos(a);
        const ly = cy + labelR * Math.sin(a);
        const cos_a = Math.cos(a);
        const textAnchor = cos_a > 0.25 ? "start" : cos_a < -0.25 ? "end" : "middle";
        const xp = categoryXP[key] || 0;
        return (
          <g key={key}>
            <text x={lx} y={ly}
              textAnchor={textAnchor}
              fontSize="8.5"
              fill={cat.color}
              fontFamily="Outfit, sans-serif"
              fontWeight="700"
              letterSpacing="1"
            >
              {cat.label.toUpperCase()}
            </text>
            <text x={lx} y={ly + 14}
              textAnchor={textAnchor}
              fontSize="12"
              fill="rgba(255,255,255,0.6)"
              fontFamily="'Cormorant Garamond', serif"
            >
              {formatXP(xp)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Lifestats sub-screen ─────────────────────────────────────────────────────

function FriendLifeStatsView({ friend, arch, onBack }) {
  const ArchI = arch.icon;
  const cats = Object.entries(CATEGORIES);
  const maxXP = friend.categoryXP ? Math.max(1, ...Object.values(friend.categoryXP)) : 1;

  return (
    <div style={{ animation: "slideInRight 0.25s cubic-bezier(0.16,1,0.3,1)" }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        padding: "24px 20px 16px",
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <button onClick={onBack} style={{
          background: "transparent", border: "none",
          color: TEXT_MID, cursor: "pointer", padding: 0,
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 13, fontFamily: "inherit",
        }}>
          <ChevronLeft size={16} /> {friend.name}
        </button>
        <div style={{
          marginLeft: "auto", display: "flex", alignItems: "center", gap: 5,
          fontSize: 9, color: arch.color, letterSpacing: "0.18em",
          textTransform: "uppercase", fontWeight: 700,
        }}>
          <ArchI size={10} color={arch.color} />
          Lifestats
        </div>
      </div>

      {/* Radar */}
      <div style={{ padding: "28px 24px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <RadarChart categoryXP={friend.categoryXP || {}} archColor={arch.color} />
        <div style={{ fontSize: 10, color: TEXT_DIM, textAlign: "center", marginTop: 8, marginBottom: 28, letterSpacing: "0.08em" }}>
          Relative to their strongest category
        </div>
      </div>

      {/* Category bars */}
      <div style={{ padding: "0 20px 32px" }}>
        <div style={{ fontSize: 10, color: TEXT_MID, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>
          By Category
        </div>
        <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {cats.map(([key, cat], i) => {
            const xp = friend.categoryXP?.[key] || 0;
            const pct = Math.round((xp / maxXP) * 100);
            const CIcon = cat.icon;
            return (
              <div key={key} style={{
                "--i": i,
                display: "flex", alignItems: "center", gap: 12,
                background: `linear-gradient(135deg, ${alpha(cat.color, "08")}, ${CARD})`,
                border: `1px solid ${alpha(cat.color, "20")}`,
                borderRadius: 12, padding: "12px 14px",
                position: "relative", overflow: "hidden",
              }}>
                <CIcon size={52} color={cat.color} opacity={0.06}
                  style={{ position: "absolute", right: -6, top: -6, pointerEvents: "none" }}
                  strokeWidth={1} />
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: alpha(cat.color, "15"),
                  border: `1px solid ${alpha(cat.color, "30")}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                }}>
                  <CIcon size={14} color={cat.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: TEXT, fontWeight: 600 }}>{cat.label}</span>
                    <span style={{ fontFamily: SERIF, fontSize: 14, color: cat.color, fontVariantNumeric: "tabular-nums" }}>
                      {xp.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ height: 6, background: alpha(cat.color, "12"), borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${pct}%`,
                      background: `linear-gradient(90deg, ${cat.color}, ${alpha(cat.color, "70")})`,
                      borderRadius: 3,
                      boxShadow: pct > 55 ? `0 0 10px ${alpha(cat.color, "55")}` : "none",
                      transition: "width 0.75s cubic-bezier(0.16,1,0.3,1)",
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Mini radar preview (used in entry button) ────────────────────────────────

function MiniRadar({ categoryXP, archColor }) {
  const cats = Object.entries(CATEGORIES);
  const n = cats.length;
  const size = 32;
  const cx = size / 2;
  const cy = size / 2;
  const chartR = 11;

  const getAngle = (i) => (2 * Math.PI * i / n) - Math.PI / 2;
  const maxXP = Math.max(1, ...cats.map(([k]) => categoryXP[k] || 0));
  const dataPoints = cats.map(([key], i) => {
    const norm = Math.max(0.2, (categoryXP[key] || 0) / maxXP);
    return {
      x: cx + chartR * norm * Math.cos(getAngle(i)),
      y: cy + chartR * norm * Math.sin(getAngle(i)),
    };
  });
  const pStr = (pts) => pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <polygon
        points={pStr(dataPoints)}
        fill={`${archColor}35`}
        stroke={archColor}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {cats.map(([key, cat], i) => {
        const p = dataPoints[i];
        return <circle key={key} cx={p.x} cy={p.y} r={2} fill={cat.color} />;
      })}
    </svg>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────

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
  const [showLifestats, setShowLifestats] = useState(false);
  const maxXP = friend.categoryXP ? Math.max(1, ...Object.values(friend.categoryXP)) : 1;

  const handleCheer = (type) => {
    const ok = onCheer(friend, type);
    if (ok) { setBurst(type); setTimeout(() => setBurst(null), 1100); }
  };

  const xpDisplay = friend.totalXP >= 1000
    ? `${(friend.totalXP / 1000).toFixed(1)}k`
    : friend.totalXP.toString();

  if (showLifestats) {
    return <FriendLifeStatsView friend={friend} arch={arch} onBack={() => setShowLifestats(false)} />;
  }

  return (
    <div style={{ animation: "screenIn 0.3s ease" }}>

      {/* ── HERO ZONE ──────────────────────────────────────────────────────── */}
      <div style={{
        position: "relative",
        padding: "0 20px 32px",
        background: `linear-gradient(170deg, ${alpha(arch.color, "22")} 0%, ${alpha(arch.color, "06")} 55%, transparent 100%)`,
        overflow: "hidden",
      }}>
        {/* Ambient aura bloom */}
        <div style={{
          position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
          width: 360, height: 360, borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(arch.color, "30")} 0%, ${alpha(arch.color, "06")} 45%, transparent 70%)`,
          filter: "blur(40px)",
          animation: "archetypeAura 6s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        {/* Huge faded initial watermark */}
        <div aria-hidden="true" style={{
          position: "absolute", top: -20, right: -16,
          fontFamily: SERIF, fontSize: 220, lineHeight: 1, fontWeight: 600,
          color: arch.color, opacity: 0.06, pointerEvents: "none",
          letterSpacing: "-0.05em", userSelect: "none",
        }}>{friend.initial}</div>

        <button onClick={onBack} style={{
          background: "transparent", border: "none",
          color: alpha(arch.color, "95"),
          padding: "24px 0 22px", fontSize: 13,
          display: "flex", alignItems: "center", gap: 6,
          cursor: "pointer", position: "relative", zIndex: 2, fontFamily: "inherit",
        }}>
          <ChevronLeft size={16} /> Back
        </button>

        {/* Burst effects */}
        {burst === "cheer" && (
          <>
            <div style={{ position: "absolute", top: 90, left: "50%", pointerEvents: "none", zIndex: 5, animation: "sparkleCenter 0.9s ease-out forwards", fontSize: 32 }}>✨</div>
            <div style={{ position: "absolute", top: 90, left: "50%", pointerEvents: "none", zIndex: 5, animation: "sparkleLeft 0.9s ease-out forwards", fontSize: 22 }}>✨</div>
            <div style={{ position: "absolute", top: 90, left: "50%", pointerEvents: "none", zIndex: 5, animation: "sparkleRight 0.9s ease-out forwards", fontSize: 22 }}>✨</div>
          </>
        )}
        {burst === "nudge" && (
          <>
            <div style={{ position: "absolute", top: 88, left: "50%", pointerEvents: "none", zIndex: 5, animation: "nudgeWave 0.9s ease-in-out forwards", fontSize: 38, transformOrigin: "center bottom" }}>👋</div>
            <div style={{ position: "absolute", top: 88, left: "50%", transform: "translateX(-50%)", width: 88, height: 88, borderRadius: "50%", border: "2px solid #F87171", pointerEvents: "none", zIndex: 4, animation: "nudgePulse 0.9s ease-out forwards" }} />
          </>
        )}

        {/* Identity */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(arch.color, "45")} 0%, ${alpha(arch.color, "12")} 55%, transparent 100%)`,
            border: `1.5px solid ${alpha(arch.color, "55")}`,
            boxShadow: `0 0 36px ${alpha(arch.color, "30")}, 0 0 80px ${alpha(arch.color, "12")}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20,
            animation: "avatarHero 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both",
          }}>
            <ArchI size={40} color={arch.color} strokeWidth={1.4}
              style={{ filter: `drop-shadow(0 0 14px ${alpha(arch.color, "65")})` }} />
          </div>

          <div style={{
            fontFamily: SERIF, fontSize: 44, lineHeight: 1, letterSpacing: "-0.02em",
            color: TEXT, marginBottom: 12, textAlign: "center",
            textShadow: `0 4px 24px ${alpha(arch.color, "18")}`,
          }}>{friend.name}</div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 12px", borderRadius: 99,
              background: alpha(arch.color, "15"),
              border: `1px solid ${alpha(arch.color, "40")}`,
              boxShadow: `0 2px 12px ${alpha(arch.color, "15")}`,
            }}>
              <ArchI size={10} color={arch.color} />
              <span style={{ fontSize: 10, color: arch.color, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>{arch.label}</span>
            </div>
            <div style={{
              padding: "5px 12px", borderRadius: 99,
              background: alpha(TEXT_DIM, "08"),
              border: `1px solid ${alpha(TEXT_DIM, "18")}`,
              fontSize: 10, color: TEXT_MID, letterSpacing: "0.1em", fontWeight: 600,
            }}>Lv. {lvl}</div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────────────── */}
      <div style={{ padding: "0 20px 28px" }}>

        {/* Stat strip */}
        <div style={{
          display: "flex",
          background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
          overflow: "hidden", marginBottom: 20, marginTop: -6,
          boxShadow: `0 4px 20px ${alpha(arch.color, "08")}`,
        }}>
          {[
            { label: "Total XP",  value: xpDisplay,            accent: true  },
            { label: "Level",     value: `${lvl}`,              accent: false },
            { label: "Streak",    value: `${friend.streak}d`,   accent: false },
            { label: "This week", value: `${friend.weeklyXP}`,  sub: " XP", accent: false },
          ].map((s, i) => (
            <div key={s.label} style={{
              flex: 1, padding: "14px 6px", textAlign: "center",
              borderLeft: i > 0 ? `1px solid ${BORDER}` : "none",
              background: s.accent ? alpha(arch.color, "07") : "transparent",
            }}>
              <div style={{ fontSize: 9, color: TEXT_DIM, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 5, fontWeight: 600 }}>{s.label}</div>
              <div style={{
                fontFamily: SERIF, fontSize: 20, lineHeight: 1,
                color: s.accent ? arch.color : TEXT,
                fontVariantNumeric: "tabular-nums", fontWeight: 500,
              }}>
                {s.value}
                {s.sub && <span style={{ fontSize: 11, color: TEXT_MID, fontFamily: "inherit" }}>{s.sub}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Lifestats entry */}
        {friend.categoryXP && (
          <button onClick={() => setShowLifestats(true)} className="tappable" style={{
            width: "100%", marginBottom: 20,
            background: `linear-gradient(135deg, ${alpha(arch.color, "10")}, ${CARD})`,
            border: `1px solid ${alpha(arch.color, "32")}`,
            borderRadius: 14, padding: "14px 16px",
            cursor: "pointer", textAlign: "left", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 14,
            boxShadow: `0 2px 12px ${alpha(arch.color, "08")}`,
          }}>
            {/* Mini radar preview */}
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: alpha(arch.color, "15"),
              border: `1px solid ${alpha(arch.color, "35")}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <MiniRadar categoryXP={friend.categoryXP} archColor={arch.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: TEXT, fontWeight: 600, marginBottom: 3 }}>Lifestats</div>
              <div style={{ fontSize: 11, color: TEXT_DIM }}>Category XP · radar breakdown</div>
            </div>
            <ChevronRight size={16} color={TEXT_DIM} />
          </button>
        )}

        {/* Working On */}
        {(friend.mainQuestToday || friend.weeklyQuest || (friend.recentActivity && cat)) && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>
              Working On
            </div>
            {friend.mainQuestToday && (
              <QuestRow icon={Crown} label="Today's quest" accent={ACCENT} quest={friend.mainQuestToday} />
            )}
            {friend.weeklyQuest && (
              <QuestRow icon={Calendar} label="This week" accent={WEEKLY_ACCENT} quest={friend.weeklyQuest} />
            )}
            {friend.recentActivity && cat && (
              <div style={{
                background: `linear-gradient(135deg, ${alpha(cat.color, "08")}, ${CARD})`,
                border: `1px solid ${alpha(cat.color, "22")}`,
                borderRadius: 12, padding: "12px 14px",
              }}>
                <div style={{ fontSize: 9, color: TEXT_DIM, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>Most recent</div>
                <div style={{ fontSize: 13, color: TEXT, fontWeight: 500, marginBottom: 5 }}>{friend.recentActivity.task}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <CatIcon size={9} color={cat.color} />
                  <span style={{ fontSize: 9, color: TEXT_DIM, letterSpacing: "0.1em", textTransform: "uppercase" }}>{cat.label}</span>
                  <span style={{ fontSize: 9, color: TEXT_DIM }}>·</span>
                  <span style={{ fontFamily: SERIF, fontSize: 12, color: ACCENT }}>+{friend.recentActivity.xp} XP</span>
                  <span style={{ fontSize: 9, color: TEXT_DIM, marginLeft: "auto" }}>{formatRelativeTime(friend.recentActivity.minutesAgo)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Social Actions */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button onClick={() => handleCheer("cheer")} disabled={cheeredToday} style={{
            flex: 1, padding: "18px 12px", borderRadius: 14,
            background: cheeredToday
              ? `linear-gradient(135deg, ${alpha(ACCENT, "18")}, ${CARD})`
              : CARD,
            border: `1px solid ${cheeredToday ? ACCENT : BORDER}`,
            color: cheeredToday ? ACCENT : TEXT,
            cursor: cheeredToday ? "default" : "pointer", fontFamily: "inherit",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            transition: "all 0.2s",
          }}>
            <Sparkles size={20} color={cheeredToday ? ACCENT : TEXT_MID} fill={cheeredToday ? ACCENT : "none"} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>{cheeredToday ? "Cheered" : "Cheer"}</span>
          </button>
          <button onClick={() => handleCheer("nudge")} disabled={nudgedToday} style={{
            flex: 1, padding: "18px 12px", borderRadius: 14,
            background: nudgedToday ? alpha("#F87171", "08") : CARD,
            border: `1px solid ${nudgedToday ? "#F87171" : BORDER}`,
            color: nudgedToday ? "#F87171" : TEXT,
            cursor: nudgedToday ? "default" : "pointer", fontFamily: "inherit",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            transition: "all 0.2s",
          }}>
            <AlertCircle size={20} color={nudgedToday ? "#F87171" : TEXT_MID} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>{nudgedToday ? "Nudged" : "Nudge"}</span>
          </button>
        </div>

        {/* Friend Streak */}
        <button onClick={() => onToggleFriendStreak(friend)} style={{
          width: "100%", marginBottom: 10, padding: "14px 16px", borderRadius: 14,
          background: sharedStreak ? `linear-gradient(135deg, ${alpha(ACCENT, "18")}, ${CARD})` : CARD,
          border: `1px solid ${sharedStreak ? alpha(ACCENT, "50") : BORDER}`,
          cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12,
          fontFamily: "inherit",
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

        {/* Remove friend */}
        <button onClick={onRemoveFriend} style={{
          width: "100%", marginTop: 8, marginBottom: 24, padding: "12px", borderRadius: 12,
          background: "transparent", border: `1px solid ${BORDER_BR}`,
          color: "#F87171", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <UserMinus size={14} /> Remove friend
        </button>
      </div>
    </div>
  );
}
