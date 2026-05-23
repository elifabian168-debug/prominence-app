import { useState } from "react";
import { Bell, UserPlus, Sparkles } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { ARCHETYPES, CATEGORIES } from "../constants/categories";

const formatRelative = (ts) => {
  const mins = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
};

const resolveAuthor = (state, userName, authorId) => {
  if (authorId === "me") {
    return {
      id: "me",
      name: userName || "You",
      initial: (userName || "Y")[0]?.toUpperCase() || "Y",
      archetype: null,
      isMe: true,
    };
  }
  const f = (state.friends || []).find((x) => x.id === authorId);
  return f || { id: authorId, name: "Someone", initial: "?", archetype: "balanced" };
};

const goalVerb = (kind) => {
  if (kind === "weekly") return "completed weekly goal";
  if (kind === "main") return "completed the big goal";
  return "completed";
};

// ── FeedScreen ──
// Witness feed: reverse-chronological list of posts the user can see.
// Each post is one friend (or you) completing a goal. Cheers are one-tap;
// comments land in step 5.
export default function FeedScreen({
  state,
  userName = "You",
  circles = [],
  posts = [],
  onCheer,
  onUncheer,
  onOpenNotifs,
  onOpenFriends,
}) {
  const unreadNotifs = (state.cheersReceived || []).filter((n) => !n.read).length;
  const [filter, setFilter] = useState("all");

  const visiblePosts = filter === "all"
    ? posts
    : posts.filter((p) => (p.audienceCircleIds || []).includes(filter));

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
      {chips.length > 1 && (
        <div style={{
          display: "flex", gap: 8, overflowX: "auto",
          padding: "0 20px 18px",
          scrollbarWidth: "none",
        }}>
          {chips.map((c) => {
            const active = filter === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
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
      )}

      {/* Posts */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {visiblePosts.length === 0 ? (
          <div style={{
            margin: "24px 4px",
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
        ) : (
          visiblePosts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              author={resolveAuthor(state, userName, p.authorId)}
              onCheer={onCheer}
              onUncheer={onUncheer}
            />
          ))
        )}
      </div>
    </div>
  );
}

function PostCard({ post, author, onCheer, onUncheer }) {
  const arch = ARCHETYPES[author.archetype] || ARCHETYPES.balanced;
  const cat = CATEGORIES[post.goalRef?.category] || null;
  const youCheered = (post.cheers || []).some((c) => c.userId === "me");
  const cheerCount = (post.cheers || []).length;

  const toggleCheer = () => {
    if (youCheered) onUncheer?.(post.id);
    else onCheer?.(post.id);
  };

  return (
    <div style={{
      background: CARD,
      border: `1px solid ${BORDER}`,
      borderRadius: 14,
      padding: "14px 16px",
      animation: "fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
    }}>
      {/* Author row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: `linear-gradient(135deg, ${alpha(arch.color, "70")}, ${alpha(arch.color, "25")})`,
          border: `1.5px solid ${alpha(arch.color, "60")}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: "#FFF",
            textShadow: `0 1px 2px ${alpha("#000", "50")}`,
          }}>
            {author.initial}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: TEXT, fontWeight: 600, lineHeight: 1.1 }}>
            {author.name}{author.isMe && (
              <span style={{
                marginLeft: 6, fontSize: 9, color: ACCENT,
                letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700,
              }}>You</span>
            )}
          </div>
          <div style={{
            fontSize: 11, color: TEXT_DIM, marginTop: 2,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span>{formatRelative(post.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Goal body */}
      <div style={{ marginBottom: post.body ? 6 : 10 }}>
        <div style={{
          fontSize: 9, color: cat?.color || TEXT_MID,
          letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700,
          marginBottom: 4,
        }}>
          {goalVerb(post.goalRef?.kind)}
        </div>
        <div style={{
          fontFamily: SERIF, fontSize: 17, fontWeight: 500,
          color: TEXT, lineHeight: 1.25, letterSpacing: "0.01em",
        }}>
          {post.goalRef?.title || "a goal"}
        </div>
      </div>

      {post.body && (
        <div style={{
          fontSize: 13, color: TEXT_MID, lineHeight: 1.45, marginBottom: 10,
        }}>
          {post.body}
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        paddingTop: 8, borderTop: `1px solid ${alpha(BORDER, "70")}`,
      }}>
        <button
          onClick={toggleCheer}
          className="tappable"
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 10px",
            background: youCheered ? alpha(ACCENT, "15") : "transparent",
            border: `1px solid ${youCheered ? alpha(ACCENT, "45") : BORDER_BR}`,
            borderRadius: 99,
            color: youCheered ? ACCENT : TEXT_MID,
            fontSize: 11, fontWeight: 600,
            letterSpacing: "0.04em",
            cursor: "pointer",
          }}
        >
          <Sparkles size={12} />
          <span>{cheerCount > 0 ? `Cheered · ${cheerCount}` : "Cheer"}</span>
        </button>
      </div>
    </div>
  );
}
