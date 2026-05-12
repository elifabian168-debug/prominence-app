import { Edit3, TrendingUp, Settings, Star, RotateCcw, ChevronRight, Sun, Moon } from "lucide-react";
import { ACCENT, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF } from "../constants/theme";
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
          <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 6 }}>Profile</div>
          <div style={{ fontFamily: SERIF, fontSize: 32, marginBottom: 4 }}>{name}</div>
          {bio && <div style={{ fontSize: 13, color: TEXT_MID, lineHeight: 1.4 }}>{bio}</div>}
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

      <div onClick={onOpenLifeStats} style={{
        background: `linear-gradient(135deg, ${archetype.color}15, ${CARD})`,
        border: `1px solid ${archetype.color}40`, borderRadius: 16,
        padding: "20px", marginBottom: 16, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: `${archetype.color}20`, border: `1px solid ${archetype.color}60`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <ArchI size={22} color={archetype.color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SERIF, fontSize: 22, color: TEXT }}>{archetype.label}</div>
          <div style={{ fontSize: 12, color: TEXT_MID, marginTop: 2 }}>{archetype.desc} · Level {level}</div>
        </div>
        <ChevronRight size={18} color={TEXT_DIM} />
      </div>

      <div style={{
        background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
        padding: "14px 16px", marginBottom: 16,
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
      }}>
        {[
          { value: state.totalXP.toLocaleString(), label: "Total XP" },
          { value: state.streak,                   label: "Streak" },
          { value: state.completedHistory.completed, label: "Completed" },
        ].map(({ value, label }) => (
          <div key={label}>
            <div style={{ fontFamily: SERIF, fontSize: 22, color: TEXT, fontWeight: 500 }}>{value}</div>
            <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>{label}</div>
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
