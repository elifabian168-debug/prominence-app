import { Edit3, TrendingUp, Settings, Star, RotateCcw, ChevronRight, Sun, Moon } from "lucide-react";
import { ACCENT, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { ARCHETYPES } from "../constants/categories";
import { getLevelFromXP } from "../utils/xp";
import { getArchetype } from "../utils/archetype";
import SettingsRow from "../components/ui/SettingsRow";

export default function ProfileScreen({ name, bio, state, onReset, onOpenLifeStats, onEditProfile, onOpenNotifications, onOpenPro, theme, onToggleTheme }) {
  const archetype = ARCHETYPES[getArchetype(state.statXP)];
  const ArchI = archetype.icon;
  const { level } = getLevelFromXP(state.totalXP);
  const activeNotifs = Object.values(state.notifications || {}).filter(Boolean).length;
  const totalNotifs  = Object.keys(state.notifications || {}).length;
  const isPro = !!state.isPro;

  return (
    <div style={{ padding: "24px 20px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>Profile</div>
          <div style={{ fontFamily: SERIF, fontSize: 34, marginBottom: 4, letterSpacing: "-0.01em" }}>{name}</div>
          {bio && <div style={{ fontSize: 13, color: TEXT_MID, lineHeight: 1.45, fontStyle: "italic" }}>{bio}</div>}
        </div>
        <button onClick={onEditProfile} aria-label="Edit profile" style={{
          width: 36, height: 36, borderRadius: 10,
          background: CARD, border: `1px solid ${BORDER_BR}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: TEXT_MID, cursor: "pointer", flexShrink: 0,
        }}>
          <Edit3 size={14} />
        </button>
      </div>

      {/* Hero Archetype card — dramatic aura */}
      <div onClick={onOpenLifeStats} style={{
        position: "relative",
        background: `linear-gradient(135deg, ${alpha(archetype.color, "18")} 0%, ${alpha(archetype.color, "04")} 60%, ${CARD} 100%)`,
        border: `1px solid ${alpha(archetype.color, "40")}`, borderRadius: 18,
        padding: "28px 22px", marginBottom: 18, cursor: "pointer",
        overflow: "hidden",
        boxShadow: `0 8px 32px ${alpha(archetype.color, "12")}, inset 0 1px 0 ${alpha(archetype.color, "12")}`,
      }}>
        {/* Aura — soft pulsing blob behind icon */}
        <div style={{
          position: "absolute", left: -30, top: -30,
          width: 220, height: 220, borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(archetype.color, "35")} 0%, ${alpha(archetype.color, "10")} 40%, transparent 70%)`,
          filter: "blur(20px)",
          animation: "archetypeAura 5s ease-in-out infinite",
          pointerEvents: "none",
        }} />
        {/* Decorative orbital ring */}
        <svg viewBox="0 0 200 200" style={{
          position: "absolute", left: -20, top: -20, width: 180, height: 180,
          pointerEvents: "none", opacity: 0.22,
          animation: "archetypeOrbit 30s linear infinite",
        }}>
          <circle cx="100" cy="100" r="78" fill="none"
            stroke={archetype.color} strokeWidth="0.7"
            strokeDasharray="3 9" />
          <circle cx="100" cy="100" r="92" fill="none"
            stroke={archetype.color} strokeWidth="0.5"
            strokeDasharray="1 5" />
        </svg>

        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 18 }}>
          {/* Big iconic archetype symbol */}
          <div style={{
            position: "relative", width: 78, height: 78, flexShrink: 0,
          }}>
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha(archetype.color, "55")} 0%, ${alpha(archetype.color, "12")} 70%)`,
              border: `1.5px solid ${alpha(archetype.color, "70")}`,
              boxShadow: `0 0 32px ${alpha(archetype.color, "45")}, inset 0 0 18px ${alpha(archetype.color, "25")}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ArchI size={32} color={archetype.color} strokeWidth={1.6} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 9, color: alpha(archetype.color, "95"),
              letterSpacing: "0.28em", textTransform: "uppercase",
              fontWeight: 700, marginBottom: 4,
            }}>Your path</div>
            <div style={{ fontFamily: SERIF, fontSize: 32, color: TEXT, lineHeight: 1, letterSpacing: "-0.01em", marginBottom: 4 }}>
              {archetype.label}
            </div>
            <div style={{ fontSize: 12, color: TEXT_MID, fontStyle: "italic" }}>{archetype.desc}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8,
              padding: "3px 10px", borderRadius: 99,
              background: alpha(archetype.color, "12"),
              border: `1px solid ${alpha(archetype.color, "30")}`,
            }}>
              <span style={{ fontSize: 9, color: TEXT_DIM, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>Level</span>
              <span style={{ fontFamily: SERIF, fontSize: 14, color: archetype.color, fontWeight: 600, lineHeight: 1 }}>{level}</span>
            </div>
          </div>
          <ChevronRight size={18} color={alpha(archetype.color, "60")} />
        </div>
      </div>

      {/* Stat tiles */}
      <div style={{
        background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
        padding: "16px 18px", marginBottom: 18,
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
      }}>
        {[
          { value: state.totalXP.toLocaleString(), label: "Total XP" },
          { value: state.streak,                   label: "Streak" },
          { value: state.completedHistory.completed, label: "Completed" },
        ].map(({ value, label }, idx) => (
          <div key={label} style={{
            position: "relative",
            paddingLeft: idx > 0 ? 12 : 0,
            borderLeft: idx > 0 ? `1px solid ${BORDER}` : "none",
          }}>
            <div style={{ fontFamily: SERIF, fontSize: 24, color: TEXT, fontWeight: 500, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{value}</div>
            <div style={{ fontSize: 9, color: TEXT_DIM, letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 4, fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
        <SettingsRow icon={TrendingUp} label="View Life Stats"  onClick={onOpenLifeStats} />
        <SettingsRow icon={Edit3}      label="Edit Profile"     onClick={onEditProfile} />
        <SettingsRow icon={Settings}   label="Notifications"    note={`${activeNotifs} of ${totalNotifs}`} onClick={onOpenNotifications} />
        <SettingsRow icon={theme === "light" ? Moon : Sun} label={theme === "light" ? "Dark mode" : "Light mode"} onClick={onToggleTheme} />
        <SettingsRow icon={Star}       label="Prominence Pro"   note={isPro ? "Active" : "Unlock everything"} pro={!isPro} onClick={onOpenPro} />
      </div>

      <button onClick={onReset} style={{
        width: "100%", padding: "12px", borderRadius: 12,
        background: "transparent", border: `1px solid ${BORDER_BR}`,
        color: "#F87171", fontSize: 13, fontWeight: 500, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        <RotateCcw size={14} /> Reset all progress
      </button>
    </div>
  );
}
