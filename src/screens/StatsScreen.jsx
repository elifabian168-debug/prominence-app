import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ACCENT, BORDER, BORDER_BR, CARD, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { CATEGORIES } from "../constants/categories";
import { DAILY_CATEGORY_CAP } from "../constants/questData";
import { getLevelFromXP, formatXP } from "../utils/xp";
import { lastNDayKeys, todayKey } from "../utils/date";
import StatCard from "../components/ui/StatCard";

export default function StatsScreen({ state }) {
  const { totalXP, streak, longestStreak, completedHistory, activityLog, categoryXP, categoryXPToday } = state;
  const { level } = getLevelFromXP(totalXP);
  const totalC = completedHistory.completed;
  const totalF = completedHistory.failed;
  const winRate = totalC + totalF > 0 ? Math.round((totalC / (totalC + totalF)) * 100) : 0;

  const weekKeys = useMemo(() => lastNDayKeys(7), []);
  const todayK = todayKey();
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const todayDow = new Date().getDay();
  const weekDays = weekKeys.map((k, i) => ({
    key: k,
    label: dayLabels[(todayDow - 6 + i + 7) % 7],
    xp: activityLog[k]?.xp || 0,
    isToday: k === todayK,
  }));
  const maxWeek = Math.max(1, ...weekDays.map(d => d.xp));
  const weekTotal = weekDays.reduce((s, d) => s + d.xp, 0);

  // Previous week for trend comparison
  const prevWeekKeys = useMemo(() => {
    const all = lastNDayKeys(14);
    return all.slice(0, 7);
  }, []);
  const prevWeekTotal = prevWeekKeys.reduce((s, k) => s + (activityLog[k]?.xp || 0), 0);
  const weekTrend = prevWeekTotal === 0 ? 0 : Math.round(((weekTotal - prevWeekTotal) / prevWeekTotal) * 100);

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = useMemo(() => {
    const now = new Date();
    const buckets = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: monthLabels[d.getMonth()],
        xp: 0,
        isCurrent: i === 0,
      });
    }
    Object.entries(activityLog).forEach(([k, v]) => {
      const ym = k.slice(0, 7);
      const b = buckets.find(b => b.key === ym);
      if (b) b.xp += v.xp || 0;
    });
    return buckets;
  }, [activityLog]);
  const maxMonth = Math.max(1, ...monthlyData.map(m => m.xp));

  return (
    <div style={{ padding: "24px 20px 0", position: "relative" }}>
      {/* Ambient bloom */}
      <div className="bloom" style={{
        width: 280, height: 280, right: -60, top: -30,
        background: `radial-gradient(circle, ${alpha(ACCENT, "20")} 0%, transparent 70%)`,
      }} />

      <div style={{ marginBottom: 26, position: "relative" }}>
        <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>Statistics</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontFamily: SERIF, fontSize: 48, lineHeight: 1, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{totalXP.toLocaleString()}</div>
          <div style={{ fontSize: 14, color: alpha(ACCENT, "95"), letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600 }}>XP</div>
        </div>
        <div style={{ fontSize: 12, color: TEXT_MID, marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
          <span>Level {level}</span>
          <span style={{ color: TEXT_DIM }}>·</span>
          <span>{weekTotal} XP this week</span>
          {weekTrend !== 0 && (
            <>
              <span style={{ color: TEXT_DIM }}>·</span>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                color: weekTrend > 0 ? "#6EE7B7" : "#F87171", fontWeight: 600,
              }}>
                {weekTrend > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {Math.abs(weekTrend)}%
              </span>
            </>
          )}
        </div>
      </div>

      <div className="stagger" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 26 }}>
        <div style={{ "--i": 0 }}><StatCard label="Win rate"     value={`${winRate}%`}          sub={`${totalC} won`} /></div>
        <div style={{ "--i": 1 }}><StatCard label="Best streak"  value={longestStreak}          sub={streak > 0 ? `${streak} active` : "0 active"} /></div>
        <div style={{ "--i": 2 }}><StatCard label="Total quests" value={totalC + totalF}        sub={`${totalF} failed`} /></div>
        <div style={{ "--i": 3 }}><StatCard label="Active days"  value={Object.keys(activityLog).length} sub="lifetime" /></div>
      </div>

      {/* Weekly heatmap strip — replaces bar chart */}
      <div style={{ marginBottom: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: alpha(ACCENT, "95"), letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600 }}>This Week</div>
          <div style={{ fontSize: 10, color: TEXT_DIM, fontVariantNumeric: "tabular-nums" }}>{weekTotal} XP · 7 days</div>
        </div>
        <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, "--stagger-base": "60ms" }}>
          {weekDays.map((d, i) => {
            const intensity = d.xp > 0 ? Math.max(0.18, Math.min(1, d.xp / maxWeek)) : 0;
            const bg = d.xp === 0
              ? alpha(TEXT_DIM, "10")
              : `linear-gradient(135deg, ${alpha(ACCENT, intensity)}, ${alpha(ACCENT, intensity * 0.6)})`;
            return (
              <div key={d.key} style={{ "--i": i, display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
                <div style={{
                  width: "100%", aspectRatio: "1 / 1.3", borderRadius: 8,
                  background: bg,
                  border: `1px solid ${d.isToday ? ACCENT : (d.xp > 0 ? alpha(ACCENT, "40") : BORDER)}`,
                  boxShadow: d.isToday ? `0 0 16px ${alpha(ACCENT, "60")}` : (d.xp > 0 ? `0 2px 8px ${alpha(ACCENT, "20")}` : "none"),
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  position: "relative", overflow: "hidden",
                }}>
                  {d.xp > 0 ? (
                    <div style={{
                      fontFamily: SERIF, fontSize: 16, lineHeight: 1,
                      color: intensity > 0.55 ? "#0A0A0B" : TEXT,
                      fontWeight: 600,
                      textShadow: intensity > 0.55 ? "none" : `0 1px 4px ${alpha("#000", "30")}`,
                      fontVariantNumeric: "tabular-nums",
                    }}>{formatXP(d.xp)}</div>
                  ) : (
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: alpha(TEXT_DIM, "40") }} />
                  )}
                </div>
                <div style={{
                  fontSize: 10, color: d.isToday ? ACCENT : TEXT_DIM,
                  letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: d.isToday ? 700 : 500,
                }}>{d.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly chart */}
      <div style={{ marginBottom: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: TEXT_MID, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600 }}>Last 6 months</div>
          <div style={{ fontSize: 10, color: TEXT_DIM, fontVariantNumeric: "tabular-nums" }}>{monthlyData.reduce((s, m) => s + m.xp, 0).toLocaleString()} XP</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, height: 168, alignItems: "flex-end" }}>
          {monthlyData.map((m, i) => {
            const h = (m.xp / maxMonth) * 100;
            return (
              <div key={m.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                <div style={{
                  fontFamily: SERIF, fontSize: 13, lineHeight: 1, height: 16,
                  color: m.isCurrent ? ACCENT : TEXT_MID,
                  opacity: m.xp > 0 ? 1 : 0,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {m.xp > 0 ? formatXP(m.xp) : ""}
                </div>
                <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                  {m.xp > 0 ? (
                    <div style={{
                      width: "100%", borderRadius: "6px 6px 2px 2px",
                      height: `${Math.max(h, 4)}%`,
                      background: m.isCurrent
                        ? `linear-gradient(180deg, ${ACCENT}, ${alpha(ACCENT, "70")})`
                        : `linear-gradient(180deg, ${alpha(ACCENT, "60")}, ${alpha(ACCENT, "20")})`,
                      transition: `height 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms`,
                      boxShadow: m.isCurrent ? `0 -2px 12px ${alpha(ACCENT, "80")}` : "none",
                      minHeight: 4,
                    }} />
                  ) : (
                    <div style={{ width: "100%", height: 3, background: BORDER, borderRadius: 2 }} />
                  )}
                </div>
                <div style={{ fontSize: 10, color: m.isCurrent ? ACCENT : TEXT_DIM, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: m.isCurrent ? 700 : 500 }}>{m.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category breakdown — beefed up */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: TEXT_MID, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>By category</div>
        <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.entries(CATEGORIES).map(([key, cat], i) => {
            const xp = categoryXP[key] || 0;
            const today = categoryXPToday[key] || 0;
            const cap = DAILY_CATEGORY_CAP[key];
            const todayPct = Math.min(100, (today / cap) * 100);
            const I = cat.icon;
            return (
              <div key={key} style={{
                "--i": i,
                background: `linear-gradient(135deg, ${alpha(cat.color, "08")}, ${CARD})`,
                border: `1px solid ${alpha(cat.color, "25")}`,
                borderRadius: 12, padding: "12px 14px",
                position: "relative", overflow: "hidden",
              }}>
                {/* Watermark icon */}
                <I size={84} color={alpha(cat.color, "08")}
                  style={{ position: "absolute", right: -14, top: -14, pointerEvents: "none" }}
                  strokeWidth={1} />
                <div style={{ position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: alpha(cat.color, "15"),
                      border: `1px solid ${alpha(cat.color, "30")}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <I size={14} color={cat.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: TEXT, fontWeight: 600, lineHeight: 1.1 }}>{cat.label}</div>
                      <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.08em", marginTop: 2 }}>{cat.attribute}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: SERIF, fontSize: 18, color: cat.color, fontWeight: 600, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                        {xp.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 9, color: TEXT_DIM, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>total XP</div>
                    </div>
                  </div>
                  <div style={{ height: 8, background: alpha(cat.color, "10"), borderRadius: 4, overflow: "hidden", marginBottom: 5, position: "relative" }}>
                    <div style={{
                      height: "100%", width: `${todayPct}%`,
                      background: `linear-gradient(90deg, ${cat.color}, ${alpha(cat.color, "85")})`,
                      borderRadius: 4,
                      transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
                      boxShadow: todayPct > 0 ? `0 0 10px ${alpha(cat.color, "60")}` : "none",
                    }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: TEXT_DIM }}>
                    <span>Today: <span style={{ color: TEXT_MID, fontWeight: 600 }}>{today}</span> / {cap} XP</span>
                    {todayPct >= 100 && (
                      <span style={{ color: cat.color, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Capped</span>
                    )}
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
