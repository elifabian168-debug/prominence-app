import { Check, Clock } from "lucide-react";
import { ACCENT, BG, CARD, CARD_ELEV, BORDER, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../../constants/theme";
import { CATEGORIES, ARCHETYPES } from "../../constants/categories";

const formatDeadline = (deadline) => {
  if (!deadline) return "—";
  const diff = deadline - Date.now();
  if (diff < 0) return "Expired";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "< 1 hr left";
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  return `${days}d left`;
};

// ── SharedQuestCard ──
// A co-op quest belonging to a group. Shows category color, title, deadline,
// member contribution row, XP reward, and "Mark contributed" CTA.
//
// Props:
//   quest    — { id, title, category, xpReward, participantIds, contributedIds, deadline, status }
//   members  — array of { id, name, initial, archetype } resolved by parent
//   onContribute(questId)
export default function SharedQuestCard({ quest, members = [], onContribute }) {
  const cat = CATEGORIES[quest.category] || CATEGORIES.life;
  const total = quest.participantIds.length;
  const done = quest.contributedIds.length;
  const meContributed = quest.contributedIds.includes("me");
  const complete = quest.status === "complete";
  const progress = total > 0 ? done / total : 0;

  return (
    <div style={{
      background: CARD,
      border: `1px solid ${complete ? alpha(cat.color, "50") : BORDER}`,
      borderRadius: 16,
      padding: "16px 18px",
      position: "relative",
      overflow: "hidden",
      boxShadow: complete ? `0 0 24px ${alpha(cat.color, "20")}` : "none",
      transition: "all 0.3s ease",
    }}>
      {/* Category color bar (top edge) */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)`,
        opacity: complete ? 1 : 0.5,
      }} />

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 9, color: cat.color,
            letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 700,
            marginBottom: 6,
          }}>
            {cat.label} · Shared
          </div>
          <div style={{
            fontFamily: SERIF, fontSize: 18, fontWeight: 500,
            color: TEXT, lineHeight: 1.2, letterSpacing: "0.01em",
          }}>
            {quest.title}
          </div>
        </div>
        <div style={{
          fontFamily: SERIF, fontSize: 22, fontWeight: 500,
          color: cat.color, letterSpacing: "0.02em",
          textShadow: `0 0 12px ${alpha(cat.color, "40")}`,
          flexShrink: 0,
        }}>
          +{quest.xpReward}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 3, borderRadius: 2,
        background: alpha(cat.color, "15"),
        marginBottom: 12, overflow: "hidden",
      }}>
        <div style={{
          width: `${progress * 100}%`, height: "100%",
          background: cat.color,
          boxShadow: `0 0 8px ${alpha(cat.color, "60")}`,
          transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }} />
      </div>

      {/* Member contribution row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {quest.participantIds.map((pid) => {
            const m = members.find((x) => x.id === pid);
            const contributed = quest.contributedIds.includes(pid);
            const archColor = m ? (ARCHETYPES[m.archetype]?.color || ACCENT) : cat.color;
            return (
              <div key={pid} title={m?.name || pid} style={{
                width: 24, height: 24, borderRadius: "50%",
                background: contributed
                  ? `linear-gradient(135deg, ${alpha(archColor, "90")}, ${alpha(archColor, "40")})`
                  : alpha(archColor, "12"),
                border: `1px solid ${contributed ? archColor : alpha(archColor, "30")}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
                boxShadow: contributed ? `0 0 8px ${alpha(archColor, "50")}` : "none",
                transition: "all 0.3s ease",
              }}>
                {contributed ? (
                  <Check size={11} color="#FFF" strokeWidth={3} />
                ) : (
                  <span style={{
                    fontFamily: SERIF, fontSize: 10, color: archColor, fontWeight: 700,
                  }}>{m?.initial || (pid === "me" ? "Y" : "?")}</span>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
          fontSize: 10, color: TEXT_DIM,
          letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600,
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <Clock size={10} />
          {formatDeadline(quest.deadline)}
        </div>
      </div>

      {/* Footer status / CTA */}
      {complete ? (
        <div style={{
          padding: "10px 12px",
          background: alpha(cat.color, "12"),
          border: `1px solid ${alpha(cat.color, "40")}`,
          borderRadius: 10,
          fontSize: 11, color: cat.color, fontWeight: 700,
          letterSpacing: "0.22em", textTransform: "uppercase", textAlign: "center",
        }}>
          Complete — XP Granted
        </div>
      ) : (
        <button
          onClick={() => !meContributed && onContribute?.(quest.id)}
          disabled={meContributed}
          style={{
            width: "100%", padding: "10px",
            background: meContributed ? "transparent" : alpha(cat.color, "12"),
            border: `1px solid ${meContributed ? BORDER : cat.color}`,
            borderRadius: 10,
            color: meContributed ? TEXT_DIM : cat.color,
            fontFamily: "'Outfit', sans-serif",
            fontSize: 11, fontWeight: 700,
            letterSpacing: "0.22em", textTransform: "uppercase",
            cursor: meContributed ? "default" : "pointer",
            opacity: meContributed ? 0.6 : 1,
            transition: "all 0.2s ease",
          }}
        >
          {meContributed ? "You Contributed ✓" : "Mark Contributed"}
        </button>
      )}

      {/* Done count */}
      <div style={{
        marginTop: 8, textAlign: "center",
        fontSize: 9, color: TEXT_DIM,
        letterSpacing: "0.28em", textTransform: "uppercase", fontWeight: 600,
      }}>
        {done} of {total} contributed
      </div>
    </div>
  );
}
