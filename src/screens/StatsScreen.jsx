import { useMemo } from "react";
import { ACCENT, BORDER, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { CATEGORIES } from "../constants/categories";
import { DAILY_CATEGORY_CAP } from "../constants/questData";
import { getLevelFromXP } from "../utils/xp";
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
  const orderedDays = weekKeys.map((k, i) => ({
    key: k,
    label: dayLabels[(todayDow - 6 + i + 7) % 7],
    xp: activityLog[k]?.xp || 0,
    isToday: k === todayK,
  }));
  const maxWeek = Math.max(1, ...orderedDays.map(d => d.xp));
  const weekTotal = orderedDays.reduce((s, d) => s + d.xp, 0);

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
  const formatXP = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n;

  return (
    <div style={{ padding: "24px 20px 0" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 6 }}>Statistics</div>
        <div style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1.05 }}>{totalXP.toLocaleString()} XP</div>
        <div style={{ fontSize: 12, color: TEXT_MID, marginTop: 4 }}>Level {level} · {weekTotal} XP this week</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
        <StatCard label="Win rate"     value={`${winRate}%`}          sub={`${totalC} won`} />
        <StatCard label="Best streak"  value={longestStreak}          sub={streak > 0 ? `${streak} active` : "0 active"} />
        <StatCard label="Total quests" value={totalC + totalF}        sub={`${totalF} failed`} />
        <StatCard label="Active days"  value={Object.keys(activityLog).length} sub="lifetime" />
      </div>

      {/* Weekly chart */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>This week</div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 6, height: 168, alignItems: "flex-end" }}>
          {orderedDays.map((d, i) => {
            const h = (d.xp / maxWeek) * 100;
            return (
              <div key={d.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                <div style={{
                  fontFamily: SERIF, fontSize: 14, lineHeight: 1, height: 16,
                  color: d.isToday ? ACCENT : TEXT_MID,
                  opacity: d.xp > 0 ? 1 : 0,
                }}>
                  {d.xp > 0 ? formatXP(d.xp) : ""}
                </div>
                <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                  {d.xp > 0 ? (
                    <div style={{
                      width: "100%", borderRadius: "4px 4px 0 0",
                      height: `${Math.max(h, 4)}%`,
                      background: d.isToday ? `linear-gradient(180deg, ${ACCENT}, ${alpha(ACCENT, "DD")})` : `linear-gradient(180deg, ${alpha(ACCENT, "70")}, ${alpha(ACCENT, "30")})`,
                      transition: `height 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms`,
                      boxShadow: d.isToday ? `0 -2px 12px ${alpha(ACCENT, "80")}` : "none", minHeight: 4,
                    }} />
                  ) : (
                    <div style={{ width: "100%", height: 3, background: BORDER, borderRadius: 2 }} />
                  )}
                </div>
                <div style={{ fontSize: 10, color: d.isToday ? ACCENT : TEXT_DIM, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>{d.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly chart */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>Last 6 months</div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, height: 168, alignItems: "flex-end" }}>
          {monthlyData.map((m, i) => {
            const h = (m.xp / maxMonth) * 100;
            return (
              <div key={m.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                <div style={{
                  fontFamily: SERIF, fontSize: 14, lineHeight: 1, height: 16,
                  color: m.isCurrent ? ACCENT : TEXT_MID,
                  opacity: m.xp > 0 ? 1 : 0,
                }}>
                  {m.xp > 0 ? formatXP(m.xp) : ""}
                </div>
                <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                  {m.xp > 0 ? (
                    <div style={{
                      width: "100%", borderRadius: "4px 4px 0 0",
                      height: `${Math.max(h, 4)}%`,
                      background: m.isCurrent ? `linear-gradient(180deg, ${ACCENT}, ${alpha(ACCENT, "DD")})` : `linear-gradient(180deg, ${alpha(ACCENT, "70")}, ${alpha(ACCENT, "30")})`,
                      transition: `height 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms`,
                      boxShadow: m.isCurrent ? `0 -2px 12px ${alpha(ACCENT, "80")}` : "none", minHeight: 4,
                    }} />
                  ) : (
                    <div style={{ width: "100%", height: 3, background: BORDER, borderRadius: 2 }} />
                  )}
                </div>
                <div style={{ fontSize: 10, color: m.isCurrent ? ACCENT : TEXT_DIM, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>{m.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category breakdown */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>By category</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const xp = categoryXP[key] || 0;
            const today = categoryXPToday[key] || 0;
            const cap = DAILY_CATEGORY_CAP[key];
            const todayPct = (today / cap) * 100;
            const I = cat.icon;
            return (
              <div key={key} style={{ background: "#141416", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <I size={14} color={cat.color} />
                  <span style={{ fontSize: 13, color: TEXT, flex: 1, fontWeight: 500 }}>{cat.label}</span>
                  <span style={{ fontSize: 13, color: ACCENT, fontFamily: SERIF }}>{xp.toLocaleString()}</span>
                </div>
                <div style={{ height: 3, background: BORDER, borderRadius: 2, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ height: "100%", width: `${todayPct}%`, background: cat.color, borderRadius: 2, transition: "width 0.4s" }} />
                </div>
                <div style={{ fontSize: 10, color: TEXT_DIM }}>{today} / {cap} XP today</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
