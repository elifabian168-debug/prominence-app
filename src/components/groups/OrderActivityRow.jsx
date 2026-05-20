import { TrendingUp, CheckCircle2, Plus, UserPlus, Flag, Flame, ChevronsUp } from "lucide-react";
import { CARD, BORDER, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../../constants/theme";
import { ARCHETYPES } from "../../constants/categories";
import { GROUP_THEMES } from "../../constants/groupsData";
import { formatRelativeTime } from "../../utils/date";

const TYPE_ICON = {
  contribution:     TrendingUp,
  quest_complete:   CheckCircle2,
  quest_created:    Plus,
  member_join:      UserPlus,
  founded:          Flag,
  streak_milestone: Flame,
  level_up:         ChevronsUp,
};

const resolveActor = (actorId, friends, userName) => {
  if (!actorId) return null;
  if (actorId === "me") return { id: "me", name: userName || "You", archetype: "balanced", isMe: true };
  const f = (friends || []).find((x) => x.id === actorId);
  return f || { id: actorId, name: "Someone", archetype: "balanced" };
};

const eventText = (event, actor) => {
  const who = actor?.isMe ? "You" : (actor?.name || "Someone");
  switch (event.type) {
    case "contribution":
      return `${who} contributed to "${event.payload?.questTitle || "a shared quest"}"`;
    case "quest_complete":
      return `"${event.payload?.questTitle || "Shared quest"}" complete`;
    case "quest_created":
      return `${who} forged "${event.payload?.questTitle || "a shared quest"}"`;
    case "member_join":
      return `${who} joined the order`;
    case "founded":
      return `${who} founded the order`;
    case "streak_milestone":
      return `${event.payload?.streakDays || ""}-day streak milestone`;
    case "level_up":
      return `Reached Level ${event.payload?.newLevel || ""}`;
    default:
      return "Activity";
  }
};

export default function OrderActivityRow({ event, group, friends, userName }) {
  const theme = GROUP_THEMES[group?.themeColor] || GROUP_THEMES.solar;
  const Icon = TYPE_ICON[event.type] || TrendingUp;
  const actor = resolveActor(event.actorId, friends, userName);
  const arch = ARCHETYPES[actor?.archetype] || ARCHETYPES.balanced;
  const minsAgo = Math.max(0, Math.floor((Date.now() - event.timestamp) / 60000));

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 12px",
      background: CARD,
      border: `1px solid ${BORDER}`,
      borderRadius: 10,
    }}>
      {/* Type icon chip */}
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        flexShrink: 0,
        background: alpha(theme.color, "12"),
        border: `1px solid ${alpha(theme.color, "30")}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={13} color={theme.color} />
      </div>

      {/* Actor avatar (when present) */}
      {actor && (
        <div style={{
          width: 22, height: 22, borderRadius: "50%",
          flexShrink: 0,
          background: `linear-gradient(135deg, ${alpha(arch.color, "70")}, ${alpha(arch.color, "20")})`,
          border: `1px solid ${alpha(arch.color, "55")}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontFamily: SERIF, fontSize: 11, color: "#FFF", fontWeight: 600,
            textShadow: `0 1px 2px ${alpha("#000", "40")}`,
          }}>
            {actor.isMe ? (userName?.[0]?.toUpperCase() || "Y") : (actor.initial || actor.name?.[0]?.toUpperCase() || "?")}
          </span>
        </div>
      )}

      {/* Text + timestamp */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, color: TEXT, lineHeight: 1.35,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {eventText(event, actor)}
        </div>
        <div style={{
          fontSize: 9, color: TEXT_DIM, marginTop: 2,
          letterSpacing: "0.06em",
        }}>
          {formatRelativeTime(minsAgo)}
        </div>
      </div>

      {/* XP delta chip */}
      {event.xpDelta > 0 && (
        <div style={{
          fontFamily: SERIF, fontSize: 12, color: theme.color, fontWeight: 600,
          flexShrink: 0, fontVariantNumeric: "tabular-nums",
        }}>
          +{event.xpDelta}
        </div>
      )}
    </div>
  );
}
