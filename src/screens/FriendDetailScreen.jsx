import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, AlertCircle, Crown, Calendar, UserMinus } from "lucide-react";
import { ACCENT, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { CATEGORIES, ARCHETYPES } from "../constants/categories";
import { getLevelFromXP, formatXP } from "../utils/xp";
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

// ── Friend Lifestats — dual-radar comparison ─────────────────────────────────

function FriendLifeStatsView({ friend, arch, myStatXP, myCompletedTasks, onBack }) {
  const ArchI = arch.icon;
  const cats = Object.entries(CATEGORIES); // [fitness, school, life, work, mind]
  const [phase, setPhase] = useState("intro");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("grid"),     150);
    const t2 = setTimeout(() => setPhase("vertices"), 500);
    const t3 = setTimeout(() => setPhase("poly"),     900);
    const t4 = setTimeout(() => setPhase("done"),     1300);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  // Map user's statXP into category space for comparison
  const myXP = {
    fitness: myStatXP?.strength   || 0,
    school:  myStatXP?.intellect  || 0,
    life:    myStatXP?.vitality   || 0,
    work:    myStatXP?.craft      || 0,
    mind:    myStatXP?.discipline || 0,
  };
  const friendXP = friend.categoryXP || {};

  // Shared scale: normalise both to the same max so shapes are comparable
  const globalMax = Math.max(1, ...cats.map(([k]) => Math.max(friendXP[k] || 0, myXP[k] || 0)));

  // Radar geometry
  const SIZE = 264;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const R = 86;
  const LABEL_R = 114;
  const n = cats.length;
  const angle = (i) => -Math.PI / 2 + (i * 2 * Math.PI / n);
  const pt = (i, scale) => ({
    x: cx + R * scale * Math.cos(angle(i)),
    y: cy + R * scale * Math.sin(angle(i)),
  });
  const pStr = (pts) => pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

  const friendRatios = cats.map(([k]) => Math.max(0.05, (friendXP[k] || 0) / globalMax));
  const myRatios     = cats.map(([k]) => Math.max(0.05, (myXP[k]     || 0) / globalMax));

  const friendPts = friendRatios.map((r, i) => pt(i, r));
  const myPts     = myRatios.map((r, i) => pt(i, r));

  const apexIdx = friendRatios.reduce((b, r, i, a) => r > a[b] ? i : b, 0);

  // Per-category lead/trail
  const comparison = cats.map(([k]) => {
    const f = friendXP[k] || 0;
    const m = myXP[k] || 0;
    if (f === m || (f === 0 && m === 0)) return "tie";
    return f > m ? "friend" : "me";
  });
  const friendLeads = comparison.filter(c => c === "friend").length;
  const meLeads     = comparison.filter(c => c === "me").length;

  const visible = ["grid","vertices","poly","done"].includes(phase);
  const polyVisible = ["poly","done"].includes(phase);

  return (
    <div style={{ animation: "slideInRight 0.28s cubic-bezier(0.16,1,0.3,1)" }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{
        padding: "24px 20px 20px",
        background: `linear-gradient(160deg, ${alpha(arch.color, "18")} 0%, transparent 70%)`,
        borderBottom: `1px solid ${alpha(arch.color, "20")}`,
        position: "relative", overflow: "hidden",
      }}>
        {/* Faint watermark initial */}
        <div aria-hidden style={{
          position: "absolute", right: -10, top: -30,
          fontFamily: SERIF, fontSize: 160, fontWeight: 600, lineHeight: 1,
          color: arch.color, opacity: 0.05, pointerEvents: "none", userSelect: "none",
        }}>{friend.initial}</div>

        <button onClick={onBack} style={{
          background: "transparent", border: "none",
          color: alpha(arch.color, "90"), cursor: "pointer", padding: 0,
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 13, fontFamily: "inherit", marginBottom: 16,
        }}>
          <ChevronLeft size={16} /> {friend.name}
        </button>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", position: "relative" }}>
          <div>
            <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 5 }}>Lifestats</div>
            <div style={{ fontFamily: SERIF, fontSize: 36, lineHeight: 1, color: TEXT, marginBottom: 8 }}>{friend.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: arch.color }}>
              <ArchI size={11} color={arch.color} />
              <span style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>{arch.label}</span>
              <span style={{ color: TEXT_DIM, fontSize: 10 }}>· {arch.desc}</span>
            </div>
          </div>

          {/* Scorecard chip */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0,
          }}>
            <div style={{
              padding: "4px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700,
              background: alpha(arch.color, "18"), border: `1px solid ${alpha(arch.color, "40")}`,
              color: arch.color, letterSpacing: "0.1em",
              opacity: phase === "done" ? 1 : 0, transition: "opacity 0.5s ease 0.2s",
            }}>
              {friendLeads > 0 ? `Leads ${friendLeads}/5` : "Trails all"}
            </div>
            <div style={{
              padding: "4px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              color: TEXT_MID, letterSpacing: "0.1em",
              opacity: phase === "done" ? 1 : 0, transition: "opacity 0.5s ease 0.3s",
            }}>
              {meLeads > 0 ? `You lead ${meLeads}/5` : ""}
            </div>
          </div>
        </div>
      </div>

      {/* ── Dual Radar ──────────────────────────────────────────── */}
      <div style={{ padding: "28px 20px 4px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
        {/* Archetype ambient bloom */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: 300, height: 300, borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(arch.color, "20")} 0%, transparent 60%)`,
          filter: "blur(40px)", pointerEvents: "none",
          opacity: phase === "intro" ? 0 : 1, transition: "opacity 1.2s ease",
        }} />

        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{
            position: "relative", zIndex: 1,
            animation: phase === "done" ? "radarBreathe 5s ease-in-out infinite" : "none",
          }}>
          <defs>
            <radialGradient id={`friendFill-${friend.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={arch.color} stopOpacity="0.40" />
              <stop offset="100%" stopColor={arch.color} stopOpacity="0.08" />
            </radialGradient>
            <filter id="vglow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1].map((s, i) => (
            <polygon key={i}
              points={pStr(cats.map((_, j) => pt(j, s)))}
              fill={s === 1 ? alpha(arch.color, "05") : "none"}
              stroke={s === 1 ? alpha(arch.color, "22") : "rgba(255,255,255,0.04)"}
              strokeWidth={s === 1 ? 1.2 : 0.7} strokeDasharray={s < 1 ? "2 3" : "none"}
              style={{ opacity: visible ? 1 : 0, transition: `opacity 0.5s ease ${i * 80}ms` }}
            />
          ))}

          {/* Axis spokes */}
          {cats.map((_, i) => {
            const outer = pt(i, 1);
            return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y}
              stroke="rgba(255,255,255,0.05)" strokeWidth={0.8}
              style={{ opacity: visible ? 1 : 0, transition: `opacity 0.4s ease ${200 + i * 50}ms` }} />;
          })}

          {/* MY shape — ghosted dashes */}
          <polygon
            points={pStr(myPts)}
            fill="rgba(255,255,255,0.04)"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth={1.4}
            strokeDasharray="4 3"
            strokeLinejoin="round"
            style={{
              opacity: polyVisible ? 1 : 0,
              transform: polyVisible ? "scale(1)" : "scale(0.3)",
              transformOrigin: `${cx}px ${cy}px`,
              transition: "opacity 0.45s ease 0.15s, transform 0.55s cubic-bezier(0.16,1,0.3,1) 0.15s",
            }}
          />

          {/* FRIEND shape — solid glow */}
          <polygon
            points={pStr(friendPts)}
            fill={`url(#friendFill-${friend.id})`}
            stroke={arch.color}
            strokeWidth={2}
            strokeLinejoin="round"
            style={{
              opacity: polyVisible ? 1 : 0,
              transform: polyVisible ? "scale(1)" : "scale(0.3)",
              transformOrigin: `${cx}px ${cy}px`,
              transition: "opacity 0.5s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)",
              filter: `drop-shadow(0 0 10px ${alpha(arch.color, "45")})`,
            }}
          />

          {/* MY vertex dots */}
          {myPts.map((p, i) => (
            <circle key={`my-${i}`} cx={p.x} cy={p.y} r={3}
              fill="rgba(255,255,255,0.55)"
              stroke="rgba(0,0,0,0.4)"
              strokeWidth={1}
              style={{
                opacity: polyVisible ? 1 : 0,
                transition: `opacity 0.3s ease ${800 + i * 80}ms`,
              }}
            />
          ))}

          {/* FRIEND vertex dots (interactive) */}
          {friendPts.map((p, i) => {
            const [catKey, cat] = cats[i];
            const isSelected = selected === i;
            const isApex = i === apexIdx;
            const isVisible = ["vertices","poly","done"].includes(phase);
            return (
              <g key={`friend-${i}`} onClick={() => setSelected(selected === i ? null : i)} style={{ cursor: "pointer" }}>
                {isApex && phase === "done" && (
                  <circle cx={p.x} cy={p.y} r={5} fill="none" stroke={cat.color} strokeWidth={1.5}
                    style={{ animation: "apexPulse 2.2s ease-out infinite", transformOrigin: `${p.x}px ${p.y}px` }} />
                )}
                <circle cx={p.x} cy={p.y} r={14} fill="transparent" />
                <circle cx={p.x} cy={p.y} r={isSelected ? 6.5 : (isApex ? 5.5 : 4.5)}
                  fill={cat.color} filter="url(#vglow)"
                  stroke={isSelected ? "rgba(0,0,0,0.5)" : "none"} strokeWidth={1}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "scale(1)" : "scale(0)",
                    transformOrigin: `${p.x}px ${p.y}px`,
                    transition: `opacity 0.4s ease ${500 + i * 90}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${500 + i * 90}ms`,
                  }}
                />
                {isSelected && (
                  <circle cx={p.x} cy={p.y} r={11} fill="none" stroke={cat.color} strokeWidth={1.2} opacity={0.5}
                    style={{ animation: "fadeIn 0.2s ease" }} />
                )}
              </g>
            );
          })}

          {/* Labels */}
          {cats.map(([key, cat], i) => {
            const a = angle(i);
            const lx = cx + LABEL_R * Math.cos(a);
            const ly = cy + LABEL_R * Math.sin(a);
            const textAnchor = Math.cos(a) > 0.2 ? "start" : Math.cos(a) < -0.2 ? "end" : "middle";
            const isSelected = selected === i;
            const lead = comparison[i];
            return (
              <g key={`lbl-${i}`} onClick={() => setSelected(selected === i ? null : i)} style={{ cursor: "pointer" }}>
                <text x={lx} y={ly - 1}
                  textAnchor={textAnchor} dominantBaseline="middle"
                  fontSize={9.5} fontWeight={isSelected ? 700 : 500}
                  fill={isSelected ? cat.color : "rgba(255,255,255,0.45)"}
                  letterSpacing={1.2} fontFamily="Outfit, sans-serif"
                  style={{
                    textTransform: "uppercase",
                    opacity: visible ? 1 : 0,
                    transition: `opacity 0.5s ease ${750 + i * 80}ms`,
                  }}>
                  {cat.label}
                </text>
                {lead !== "tie" && phase === "done" && (
                  <text x={lx} y={ly + 10}
                    textAnchor={textAnchor} dominantBaseline="middle"
                    fontSize={8} fontFamily="Outfit, sans-serif" fontWeight={600}
                    fill={lead === "friend" ? cat.color : "rgba(255,255,255,0.55)"}
                    style={{ animation: "fadeIn 0.4s ease" }}>
                    {lead === "friend" ? "▲" : "▼ you"}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div style={{
          display: "flex", alignItems: "center", gap: 18, marginTop: 6, marginBottom: 4,
          fontSize: 10, letterSpacing: "0.12em",
          opacity: phase === "done" ? 1 : 0, transition: "opacity 0.4s ease 0.2s",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width={20} height={8}><line x1={0} y1={4} x2={20} y2={4} stroke={arch.color} strokeWidth={2} /></svg>
            <span style={{ color: arch.color, textTransform: "uppercase" }}>{friend.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width={20} height={8}><line x1={0} y1={4} x2={20} y2={4} stroke="rgba(255,255,255,0.35)" strokeWidth={1.4} strokeDasharray="4 3" /></svg>
            <span style={{ color: TEXT_DIM, textTransform: "uppercase" }}>You</span>
          </div>
        </div>
      </div>

      {/* ── Tap-to-expand stat detail ─────────────────────────── */}
      {selected !== null && (() => {
        const [catKey, cat] = cats[selected];
        const CIcon = cat.icon;
        const fXP = friendXP[catKey] || 0;
        const mXP = myXP[catKey] || 0;
        const delta = fXP - mXP;
        const lead = comparison[selected];
        return (
          <div key={selected} style={{
            margin: "4px 20px 0",
            background: `linear-gradient(135deg, ${alpha(cat.color, "14")}, ${CARD})`,
            border: `1px solid ${alpha(cat.color, "50")}`,
            borderRadius: 16, padding: "16px 18px",
            animation: "fadeUp 0.28s cubic-bezier(0.16,1,0.3,1)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: alpha(cat.color, "18"), border: `1px solid ${alpha(cat.color, "35")}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <CIcon size={13} color={cat.color} />
                </div>
                <span style={{ fontSize: 11, color: cat.color, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700 }}>
                  {cat.label}
                </span>
                {selected === apexIdx && (
                  <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 99, background: alpha(cat.color, "18"), color: cat.color, border: `1px solid ${alpha(cat.color, "35")}`, letterSpacing: "0.1em" }}>
                    APEX
                  </span>
                )}
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", color: TEXT_DIM, cursor: "pointer", padding: 4, display: "flex" }}>
                <ChevronLeft size={14} style={{ transform: "rotate(180deg)" }} />
              </button>
            </div>

            {/* Side-by-side XP comparison */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center", marginBottom: 12 }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 9, color: arch.color, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, marginBottom: 3 }}>
                  {friend.name.split(" ")[0]}
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 28, color: TEXT, lineHeight: 1, fontWeight: 500 }}>
                  {formatXP(fXP)}
                </div>
                <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 2 }}>{fXP.toLocaleString()} XP</div>
              </div>
              <div style={{ textAlign: "center", fontSize: 18, color: TEXT_DIM }}>vs</div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: TEXT_MID, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, marginBottom: 3 }}>
                  You
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 28, color: TEXT, lineHeight: 1, fontWeight: 500 }}>
                  {formatXP(mXP)}
                </div>
                <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 2 }}>{mXP.toLocaleString()} XP</div>
              </div>
            </div>

            {/* Delta bar */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 12px", borderRadius: 10, marginBottom: 14,
              background: lead === "friend"
                ? alpha(cat.color, "10")
                : lead === "me"
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(255,255,255,0.03)",
              border: `1px solid ${lead === "friend" ? alpha(cat.color, "25") : "rgba(255,255,255,0.08)"}`,
            }}>
              <span style={{ fontSize: 14 }}>
                {lead === "friend" ? "📈" : lead === "me" ? "📉" : "≈"}
              </span>
              <span style={{ fontSize: 11, color: lead === "friend" ? cat.color : TEXT_MID, fontWeight: 500 }}>
                {lead === "tie"
                  ? "Equal footing"
                  : lead === "friend"
                    ? `${friend.name.split(" ")[0]} leads by ${Math.abs(delta).toLocaleString()} XP`
                    : `You lead by ${Math.abs(delta).toLocaleString()} XP`
                }
              </span>
            </div>

            {/* ── Recent contributions, side-by-side ─────────────────── */}
            {(() => {
              // Friend contributions: build from their visible quest data
              const friendItems = [];
              if (friend.recentActivity?.category === catKey) {
                friendItems.push({
                  task: friend.recentActivity.task,
                  xp: friend.recentActivity.xp,
                  meta: formatRelativeTime(friend.recentActivity.minutesAgo),
                  badge: "RECENT",
                });
              }
              if (friend.mainQuestToday?.category === catKey) {
                friendItems.push({
                  task: friend.mainQuestToday.task,
                  xp: friend.mainQuestToday.xp,
                  meta: friend.mainQuestToday.status === "complete" ? "complete" : "in progress",
                  badge: "TODAY",
                });
              }
              if (friend.weeklyQuest?.category === catKey) {
                friendItems.push({
                  task: friend.weeklyQuest.task,
                  xp: friend.weeklyQuest.xp,
                  meta: friend.weeklyQuest.daysLeft === 0 ? "expires today" : `${friend.weeklyQuest.daysLeft}d left`,
                  badge: "WEEK",
                });
              }

              // My contributions: filter completedTasks by category
              const myItems = (myCompletedTasks || [])
                .filter(t => t.category === catKey)
                .slice(0, 4)
                .map(t => {
                  const m = Math.floor((Date.now() - t.completedAt) / 60000);
                  const ago = m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m/60)}h ago` : `${Math.floor(m/1440)}d ago`;
                  return { task: t.title, xp: t.xp, meta: ago };
                });

              return (
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
                  paddingTop: 14, borderTop: `1px solid ${alpha(cat.color, "20")}`,
                }}>
                  {/* Friend column */}
                  <div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 5, marginBottom: 8,
                      fontSize: 9, color: cat.color, letterSpacing: "0.16em",
                      textTransform: "uppercase", fontWeight: 700,
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: cat.color, boxShadow: `0 0 6px ${cat.color}` }} />
                      {friend.name.split(" ")[0]}
                    </div>
                    {friendItems.length === 0 ? (
                      <div style={{ fontSize: 11, color: TEXT_DIM, fontStyle: "italic", lineHeight: 1.5, padding: "4px 0" }}>
                        No visible activity here.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {friendItems.map((item, i) => (
                          <div key={i} style={{
                            padding: "7px 8px", borderRadius: 8,
                            background: alpha(cat.color, "08"),
                            border: `1px solid ${alpha(cat.color, "18")}`,
                          }}>
                            <div style={{
                              display: "flex", alignItems: "center", gap: 5, marginBottom: 4,
                              fontSize: 8, color: cat.color, letterSpacing: "0.12em",
                              fontWeight: 700, textTransform: "uppercase",
                            }}>
                              {item.badge}
                              <span style={{ marginLeft: "auto", fontSize: 9, color: ACCENT, fontFamily: SERIF, letterSpacing: 0 }}>
                                +{item.xp}
                              </span>
                            </div>
                            <div style={{
                              fontSize: 11, color: TEXT, lineHeight: 1.35,
                              overflow: "hidden", textOverflow: "ellipsis",
                              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                              marginBottom: 2,
                            }}>
                              {item.task}
                            </div>
                            <div style={{ fontSize: 9, color: TEXT_DIM }}>{item.meta}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* You column */}
                  <div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 5, marginBottom: 8,
                      fontSize: 9, color: TEXT_MID, letterSpacing: "0.16em",
                      textTransform: "uppercase", fontWeight: 700,
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />
                      You
                    </div>
                    {myItems.length === 0 ? (
                      <div style={{ fontSize: 11, color: TEXT_DIM, fontStyle: "italic", lineHeight: 1.5, padding: "4px 0" }}>
                        No {cat.label.toLowerCase()} quests completed yet.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {myItems.map((item, i) => (
                          <div key={i} style={{
                            padding: "7px 8px", borderRadius: 8,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}>
                            <div style={{
                              display: "flex", justifyContent: "flex-end", marginBottom: 4,
                              fontSize: 9, color: ACCENT, fontFamily: SERIF, fontWeight: 500,
                            }}>
                              +{item.xp}
                            </div>
                            <div style={{
                              fontSize: 11, color: TEXT, lineHeight: 1.35,
                              overflow: "hidden", textOverflow: "ellipsis",
                              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                              marginBottom: 2,
                            }}>
                              {item.task}
                            </div>
                            <div style={{ fontSize: 9, color: TEXT_DIM }}>{item.meta}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })()}

      {selected === null && phase === "done" && (
        <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: TEXT_DIM, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.5, animation: "fadeIn 0.5s ease 0.3s both" }}>
          Tap a point for details
        </div>
      )}

      {/* ── Category comparison bars ──────────────────────────── */}
      <div style={{ padding: "20px 20px 32px" }}>
        <div style={{ fontSize: 10, color: TEXT_MID, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>
          By Category
        </div>
        <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cats.map(([key, cat], i) => {
            const fXP = friendXP[key] || 0;
            const mXP = myXP[key] || 0;
            const fPct = (fXP / globalMax) * 100;
            const mPct = (mXP / globalMax) * 100;
            const lead = comparison[i];
            const CIcon = cat.icon;
            const isSelected = selected === i;
            return (
              <div key={key} onClick={() => setSelected(selected === i ? null : i)} style={{
                "--i": i,
                background: isSelected
                  ? `linear-gradient(135deg, ${alpha(cat.color, "12")}, ${CARD})`
                  : CARD,
                border: `1px solid ${isSelected ? alpha(cat.color, "50") : BORDER}`,
                borderRadius: 14, padding: "12px 14px", cursor: "pointer",
                transition: "border-color 0.2s, background 0.2s",
                position: "relative", overflow: "hidden",
              }}>
                {/* Ghost icon watermark */}
                <CIcon size={52} color={cat.color} opacity={0.05}
                  style={{ position: "absolute", right: -6, top: -6, pointerEvents: "none" }}
                  strokeWidth={1} />

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9, position: "relative" }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: alpha(cat.color, "15"), border: `1px solid ${alpha(cat.color, "28")}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <CIcon size={13} color={cat.color} />
                  </div>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: TEXT }}>{cat.label}</span>
                  {lead !== "tie" && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                      color: lead === "friend" ? cat.color : TEXT_MID,
                      padding: "2px 7px", borderRadius: 99,
                      background: lead === "friend" ? alpha(cat.color, "15") : "rgba(255,255,255,0.05)",
                      border: `1px solid ${lead === "friend" ? alpha(cat.color, "30") : "rgba(255,255,255,0.1)"}`,
                    }}>
                      {lead === "friend" ? `${friend.name.split(" ")[0]} ▲` : "You ▲"}
                    </span>
                  )}
                </div>

                {/* Dual bar: friend (colored) + you (white/dim) stacked */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, position: "relative" }}>
                  {/* Friend bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 9, color: cat.color, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, width: 38, flexShrink: 0 }}>
                      {friend.name.split(" ")[0].slice(0, 5)}
                    </span>
                    <div style={{ flex: 1, height: 5, background: alpha(cat.color, "12"), borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${fPct}%`,
                        background: `linear-gradient(90deg, ${cat.color}, ${alpha(cat.color, "75")})`,
                        borderRadius: 3,
                        boxShadow: fPct > 40 ? `0 0 8px ${alpha(cat.color, "50")}` : "none",
                        transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
                      }} />
                    </div>
                    <span style={{ fontFamily: SERIF, fontSize: 12, color: cat.color, minWidth: 32, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      {formatXP(fXP)}
                    </span>
                  </div>
                  {/* You bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 9, color: TEXT_DIM, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, width: 38, flexShrink: 0 }}>
                      You
                    </span>
                    <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${mPct}%`,
                        background: "rgba(255,255,255,0.3)",
                        borderRadius: 3,
                        transition: "width 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s",
                      }} />
                    </div>
                    <span style={{ fontFamily: SERIF, fontSize: 12, color: TEXT_MID, minWidth: 32, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      {formatXP(mXP)}
                    </span>
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

export default function FriendDetailScreen({ friend, state, onBack, onCheer, onRemoveFriend }) {
  const arch = ARCHETYPES[friend.archetype] || ARCHETYPES.balanced;
  const ArchI = arch.icon;
  const lvl = getLevelFromXP(friend.totalXP).level;
  const cat = friend.recentActivity ? CATEGORIES[friend.recentActivity.category] : null;
  const CatIcon = cat?.icon;
  const today = todayKey();
  const cheeredToday = state.cheersGiven?.[friend.id] === today;
  const nudgedToday  = state.nudgesGiven?.[friend.id] === today;
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
    return <FriendLifeStatsView friend={friend} arch={arch} myStatXP={state.statXP} myCompletedTasks={state.completedTasks} onBack={() => setShowLifestats(false)} />;
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
