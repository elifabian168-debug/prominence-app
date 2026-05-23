import { Bell, UserPlus } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";

// ── FeedScreen ──
// The witness feed. Friends' + Circles' activity, reverse-chronological.
// Step 2 scaffold: header, filter chips, and an empty state. The Post
// model + real post stream land in step 3.
export default function FeedScreen({ state, circles = [], onOpenNotifs, onOpenFriends }) {
  const unreadNotifs = (state.cheersReceived || []).filter((n) => !n.read).length;

  // Filter chips: All + one per Circle. Tap is wired but no-op until step 3.
  const chips = [{ id: "all", label: "All" }, ...circles.map((c) => ({ id: c.id, label: c.name }))];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{
        padding: "20px 20px 12px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{
          fontFamily: SERIF, fontSize: 32, fontWeight: 500,
          color: TEXT, letterSpacing: "0.02em", lineHeight: 1,
        }}>
          Feed
        </div>
        <button
          onClick={onOpenNotifs}
          aria-label="Notifications"
          style={{
            position: "relative",
            background: CARD, border: `1px solid ${BORDER_BR}`,
            width: 36, height: 36, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: TEXT_MID,
          }}
        >
          <Bell size={16} />
          {unreadNotifs > 0 && (
            <div style={{
              position: "absolute", top: -3, right: -3,
              minWidth: 14, height: 14, borderRadius: 99,
              background: ACCENT, color: BG,
              fontSize: 9, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 4px", border: `2px solid ${BG}`,
            }}>
              {unreadNotifs > 9 ? "9+" : unreadNotifs}
            </div>
          )}
        </button>
      </div>

      {/* Filter chips */}
      <div style={{
        display: "flex", gap: 8, overflowX: "auto",
        padding: "0 20px 18px",
        scrollbarWidth: "none",
      }}>
        {chips.map((c, i) => {
          const active = i === 0;
          return (
            <button
              key={c.id}
              className="tappable"
              style={{
                flexShrink: 0,
                background: active ? alpha(ACCENT, "15") : "transparent",
                border: `1px solid ${active ? alpha(ACCENT, "50") : BORDER}`,
                color: active ? ACCENT : TEXT_MID,
                padding: "6px 14px", borderRadius: 99,
                fontSize: 11, fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Empty state — replaced by the real feed in step 3 */}
      <div style={{
        margin: "24px 20px",
        padding: "48px 24px",
        textAlign: "center",
        border: `1px dashed ${BORDER}`,
        borderRadius: 18,
        color: TEXT_DIM,
      }}>
        <div style={{
          fontFamily: SERIF, fontSize: 22, color: TEXT,
          letterSpacing: "0.02em", marginBottom: 8,
        }}>
          Your feed is quiet
        </div>
        <div style={{
          fontFamily: SERIF, fontSize: 13, fontStyle: "italic",
          color: TEXT_DIM, lineHeight: 1.5, marginBottom: 22,
        }}>
          When friends complete a goal, it shows up here.
        </div>
        <button
          onClick={onOpenFriends}
          className="tappable"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 18px",
            background: alpha(ACCENT, "12"),
            border: `1px solid ${alpha(ACCENT, "45")}`,
            borderRadius: 99,
            color: ACCENT,
            fontFamily: "'Outfit', sans-serif",
            fontSize: 11, fontWeight: 700,
            letterSpacing: "0.22em", textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          <UserPlus size={13} />
          Add a friend
        </button>
      </div>
    </div>
  );
}
