import { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import { ACCENT, CARD, BORDER, TEXT, TEXT_DIM, TEXT_MID, SERIF } from "../constants/theme";
import { CATEGORIES, ARCHETYPES } from "../constants/categories";
import { getLevelFromXP } from "../utils/xp";
import { getArchetype } from "../utils/archetype";
import BackButton from "../components/ui/BackButton";

const STAT_LABELS  = ["Strength", "Intellect", "Discipline", "Vitality", "Craft"];
const STAT_KEYS    = ["strength", "intellect", "discipline", "vitality", "craft"];
const STAT_COLORS  = ["#E8B14A", "#7CA9F2", "#6EE7B7", "#E89B8A", "#A78BFA"];
const STAT_DESCS   = [
  "Physical capability built through fitness and movement",
  "Mental sharpness honed through study and learning",
  "Self-control forged through habit and consistency",
  "Wellbeing maintained through life and care",
  "Skill mastered through deliberate work and practice",
];

export default function LifeStatsScreen({ state, name, onBack }) {
  const stats     = state.statXP;
  const max       = Math.max(...Object.values(stats), 100);
  const archetype = ARCHETYPES[getArchetype(stats)];
  const ArchIcon  = archetype.icon;
  const { level } = getLevelFromXP(state.totalXP);
  const [phase, setPhase]       = useState("intro");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("grid"),     200);
    const t2 = setTimeout(() => setPhase("vertices"), 600);
    const t3 = setTimeout(() => setPhase("poly"),     1100);
    const t4 = setTimeout(() => setPhase("done"),     1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const SIZE   = 240;
  const VIEW   = 240;
  const center = VIEW / 2;
  const radius = 84;

  const angle   = (i) => -Math.PI / 2 + (i * 2 * Math.PI / 5);
  const point   = (i, r) => ({ x: center + Math.cos(angle(i)) * r, y: center + Math.sin(angle(i)) * r });
  const ratios  = STAT_KEYS.map(k => Math.max(0.05, stats[k] / max));
  const valuePts = ratios.map((r, i) => point(i, radius * r));
  const polyPts  = valuePts.map(p => `${p.x},${p.y}`).join(" ");
  const apexIdx  = ratios.reduce((best, r, i, arr) => r > arr[best] ? i : best, 0);
  const hasData  = Math.max(...ratios) > 0.06;

  return (
    <div style={{ padding: "24px 20px 0", minHeight: "100vh" }}>
      <BackButton onBack={onBack} />

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 6 }}>Character</div>
        <div style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1, marginBottom: 6 }}>{name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: archetype.color, fontSize: 12 }}>
          <ArchIcon size={14} />
          <span style={{ letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>{archetype.label}</span>
          <span style={{ color: TEXT_DIM, marginLeft: 4 }}>· Level {level}</span>
        </div>
      </div>

      {/* Radar */}
      <div style={{ display: "flex", justifyContent: "center", position: "relative", marginBottom: 16 }}>
        <div style={{
          position: "absolute", width: 280, height: 280,
          background: `radial-gradient(circle, ${archetype.color}18 0%, transparent 60%)`,
          opacity: phase === "intro" ? 0 : 1, transition: "opacity 1s ease",
          pointerEvents: "none", zIndex: 0,
        }} />
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${VIEW} ${VIEW}`}
          style={{
            position: "relative", zIndex: 1,
            animation: phase === "done" && hasData ? "radarBreathe 4s ease-in-out infinite" : "none",
          }}>
          <defs>
            <radialGradient id="polyFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={archetype.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={archetype.color} stopOpacity="0.08" />
            </radialGradient>
            <filter id="vertexGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {[0.25, 0.5, 0.75, 1].map((s, i) => (
            <polygon key={`ring-${i}`}
              points={[0,1,2,3,4].map(j => { const p = point(j, radius * s); return `${p.x},${p.y}`; }).join(" ")}
              fill="none" stroke={BORDER}
              strokeWidth={s === 1 ? 1.2 : 0.8} strokeDasharray={s === 1 ? "none" : "2 3"}
              style={{ opacity: phase === "intro" ? 0 : (s === 1 ? 0.6 : 0.3), transition: `opacity 0.5s ease ${i * 80}ms` }} />
          ))}
          {[0,1,2,3,4].map(j => {
            const p = point(j, radius);
            return <line key={`spoke-${j}`} x1={center} y1={center} x2={p.x} y2={p.y} stroke={BORDER} strokeWidth={0.8}
              style={{ opacity: phase === "intro" ? 0 : 0.4, transition: `opacity 0.4s ease ${200 + j * 60}ms` }} />;
          })}
          <polygon points={polyPts} fill="url(#polyFill)" stroke={archetype.color} strokeWidth={1.8} strokeLinejoin="round"
            style={{
              opacity: ["poly","done"].includes(phase) ? 1 : 0,
              transform: ["poly","done"].includes(phase) ? "scale(1)" : "scale(0.3)",
              transformOrigin: `${center}px ${center}px`,
              transition: "opacity 0.5s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
              filter: `drop-shadow(0 0 8px ${archetype.color}40)`,
            }} />
          {valuePts.map((p, i) => {
            const isSelected = selected === i;
            const isApex = i === apexIdx && hasData;
            const isVisible = ["vertices","poly","done"].includes(phase);
            const dotR = isSelected ? 6 : (isApex ? 5 : 4);
            return (
              <g key={`vertex-${i}`} onClick={() => setSelected(selected === i ? null : i)} style={{ cursor: "pointer" }}>
                {isApex && phase === "done" && (
                  <circle cx={p.x} cy={p.y} r={4} fill="none" stroke={STAT_COLORS[i]} strokeWidth={1.5}
                    style={{ animation: "apexPulse 2s ease-out infinite", transformOrigin: `${p.x}px ${p.y}px` }} />
                )}
                <circle cx={p.x} cy={p.y} r={14} fill="transparent" />
                <circle cx={p.x} cy={p.y} r={dotR} fill={STAT_COLORS[i]} filter="url(#vertexGlow)"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "scale(1)" : "scale(0)",
                    transformOrigin: `${p.x}px ${p.y}px`,
                    transition: `opacity 0.4s ease ${600 + i * 100}ms, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${600 + i * 100}ms`,
                  }} />
                {isSelected && <circle cx={p.x} cy={p.y} r={10} fill="none" stroke={STAT_COLORS[i]} strokeWidth={1.5} opacity={0.6} style={{ animation: "fadeIn 0.2s ease" }} />}
              </g>
            );
          })}
          {[0,1,2,3,4].map(j => {
            const p = point(j, radius + 22);
            const isSelected = selected === j;
            return (
              <text key={`label-${j}`} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
                fill={isSelected ? STAT_COLORS[j] : TEXT_DIM} fontSize={9.5} fontWeight={isSelected ? 600 : 500} letterSpacing={1.5}
                style={{ textTransform: "uppercase", opacity: phase === "intro" ? 0 : 1, transition: `opacity 0.5s ease ${800 + j * 80}ms`, cursor: "pointer" }}
                onClick={() => setSelected(selected === j ? null : j)}>{STAT_LABELS[j]}</text>
            );
          })}
        </svg>
      </div>

      {/* Stat detail panel */}
      {selected !== null && (
        <div key={selected} style={{
          background: `linear-gradient(135deg, ${STAT_COLORS[selected]}15, ${CARD})`,
          border: `1px solid ${STAT_COLORS[selected]}50`,
          borderRadius: 16, padding: "18px 20px", marginBottom: 20,
          animation: "fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: STAT_COLORS[selected], boxShadow: `0 0 10px ${STAT_COLORS[selected]}` }} />
              <span style={{ fontSize: 11, color: STAT_COLORS[selected], letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>{STAT_LABELS[selected]}</span>
              {selected === apexIdx && hasData && (
                <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 99, background: `${STAT_COLORS[selected]}20`, color: STAT_COLORS[selected], border: `1px solid ${STAT_COLORS[selected]}40`, letterSpacing: "0.1em" }}>APEX</span>
              )}
            </div>
            <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", color: TEXT_DIM, cursor: "pointer", padding: 4, display: "flex" }}><X size={14} /></button>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
            <span style={{ fontFamily: SERIF, fontSize: 38, color: TEXT, fontWeight: 500, lineHeight: 1 }}>
              {Math.floor(Math.sqrt(stats[STAT_KEYS[selected]] / 50)) + 1}
            </span>
            <span style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              {stats[STAT_KEYS[selected]].toLocaleString()} XP
            </span>
          </div>
          <div style={{ fontSize: 13, color: TEXT_MID, lineHeight: 1.55, marginBottom: 12 }}>{STAT_DESCS[selected]}</div>
          {(() => {
            const xp = stats[STAT_KEYS[selected]];
            const lvl = Math.floor(Math.sqrt(xp / 50)) + 1;
            const xpForCurrent = (lvl - 1) ** 2 * 50;
            const xpForNext = lvl ** 2 * 50;
            const intoLevel = xp - xpForCurrent;
            const needed = xpForNext - xpForCurrent;
            const pct = (intoLevel / needed) * 100;
            return (
              <>
                <div style={{ height: 3, background: BORDER, borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: STAT_COLORS[selected], borderRadius: 2, transition: "width 0.6s ease", boxShadow: `0 0 8px ${STAT_COLORS[selected]}80` }} />
                </div>
                <div style={{ fontSize: 10, color: TEXT_DIM, display: "flex", justifyContent: "space-between" }}>
                  <span>{intoLevel} / {needed} XP to next rank</span>
                  <span>{(needed - intoLevel).toLocaleString()} XP remaining</span>
                </div>
              </>
            );
          })()}
          {(() => {
            const targetStat = STAT_KEYS[selected];
            const contributingCategories = Object.entries(CATEGORIES).filter(([, c]) => c.stat === targetStat).map(([k]) => k);
            const contributions = (state.completedTasks || []).filter(t => contributingCategories.includes(t.category)).slice(0, 5);
            return (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${STAT_COLORS[selected]}25` }}>
                <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>Recent contributions</div>
                {contributions.length === 0 ? (
                  <div style={{ fontSize: 12, color: TEXT_DIM, fontStyle: "italic", lineHeight: 1.5 }}>
                    Complete {STAT_LABELS[selected].toLowerCase()} quests to start building this stat.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {contributions.map(t => {
                      const cat = CATEGORIES[t.category];
                      const CatIcon = cat.icon;
                      const minsAgo = Math.floor((Date.now() - t.completedAt) / 60000);
                      const ago = minsAgo < 60 ? `${minsAgo}m ago` : minsAgo < 1440 ? `${Math.floor(minsAgo / 60)}h ago` : `${Math.floor(minsAgo / 1440)}d ago`;
                      return (
                        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: `${STAT_COLORS[selected]}08` }}>
                          <CatIcon size={11} color={cat.color} style={{ flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 12, color: TEXT, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                          <span style={{ fontSize: 10, color: TEXT_DIM, flexShrink: 0 }}>{ago}</span>
                          <span style={{ fontSize: 11, color: ACCENT, fontFamily: SERIF, flexShrink: 0, minWidth: 32, textAlign: "right" }}>+{t.xp}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {selected === null && phase === "done" && hasData && (
        <div style={{ textAlign: "center", marginBottom: 20, fontSize: 11, color: TEXT_DIM, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.6, animation: "fadeUp 0.5s ease 0.4s both" }}>
          ↓ Tap a point for details
        </div>
      )}

      {/* Stat bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {STAT_KEYS.map((k, i) => {
          const xp = stats[k];
          const lvl = Math.floor(Math.sqrt(xp / 50)) + 1;
          const isSelected = selected === i;
          return (
            <div key={k} onClick={() => setSelected(selected === i ? null : i)} style={{
              background: isSelected ? `linear-gradient(90deg, ${STAT_COLORS[i]}10, ${CARD})` : CARD,
              border: `1px solid ${isSelected ? STAT_COLORS[i] + "60" : BORDER}`,
              borderRadius: 12, padding: "12px 14px", cursor: "pointer", transition: "all 0.2s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: STAT_COLORS[i], boxShadow: isSelected ? `0 0 8px ${STAT_COLORS[i]}` : "none" }} />
                <span style={{ fontSize: 11, color: isSelected ? STAT_COLORS[i] : TEXT_DIM, letterSpacing: "0.14em", textTransform: "uppercase", flex: 1, fontWeight: 500 }}>{STAT_LABELS[i]}</span>
                {i === apexIdx && hasData && <Star size={10} color={STAT_COLORS[i]} fill={STAT_COLORS[i]} style={{ marginRight: 4 }} />}
                <span style={{ fontFamily: SERIF, fontSize: 18, color: TEXT, fontWeight: 500 }}>{lvl}</span>
              </div>
              <div style={{ height: 3, background: BORDER, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(xp / max) * 100}%`, background: STAT_COLORS[i], borderRadius: 2, transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }} />
              </div>
              <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 4 }}>{xp.toLocaleString()} XP</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
