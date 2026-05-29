import { useState } from "react";
import { Bell, UserPlus, Sparkles, MessageCircle, Send, Trash2 } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { ARCHETYPES, CATEGORIES } from "../constants/categories";
import { useViewport } from "../hooks/useViewport";
import { LAYOUT } from "../constants/tokens";

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
// Build a short "shared with" line for a post.
//
// - shared-mode Circle: show the Circle name (e.g. "Shared in Run Crew")
// - private-mode Circle: show co-recipient avatars / count, no name
// - no Circle attached (audienceCircleIds empty): "Shared with friends"
function describeAudience(post, circles, allFriends, currentUserId) {
  const circleIds = post.audienceCircleIds || [];
  if (circleIds.length === 0) {
    return { kind: "friends", label: "Shared with friends", avatars: [] };
  }
  // Use the first attached Circle as the source of mode/name (multi-Circle
  // posts aren't reachable through the current picker but the model supports it).
  const circle = circles.find((c) => c.id === circleIds[0]);
  if (!circle) {
    return { kind: "friends", label: "Shared with friends", avatars: [] };
  }
  if (post.audienceMode === "shared" || circle.audienceMode === "shared") {
    return { kind: "shared", label: `Shared in ${circle.name}`, circle, avatars: [] };
  }
  // Private label: list co-recipients (members except the viewer + the author).
  const coRecipients = (circle.memberIds || [])
    .filter((id) => id !== currentUserId && id !== post.authorId)
    .map((id) => allFriends.find((f) => f.id === id))
    .filter(Boolean)
    .slice(0, 4);
  return {
    kind: "private",
    label: coRecipients.length > 0
      ? `Shared with ${coRecipients.map((f) => f.name.split(" ")[0]).join(", ")}`
      : "Shared privately",
    avatars: coRecipients,
  };
}

export default function FeedScreen({
  state,
  userName = "You",
  circles = [],
  posts = [],
  onCheer,
  onUncheer,
  onAddComment,
  onDeleteComment,
  onDeletePost,
  onOpenNotifs,
  onOpenFriends,
  friendRequestCount = 0,
}) {
  const { isDesktop } = useViewport();
  const unreadNotifs = (state.cheersReceived || []).filter((n) => !n.read).length + friendRequestCount;
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all"
    ? posts
    : posts.filter((p) => (p.audienceCircleIds || []).includes(filter));

  // Split "your posts" off the top — same data, different section, lets the
  // user manage their own posts (delete) without scrolling through the feed.
  const yourPosts = filtered.filter((p) => p.authorId === "me");
  const otherPosts = filtered.filter((p) => p.authorId !== "me");

  const chips = [{ id: "all", label: "All" }, ...circles.map((c) => ({ id: c.id, label: c.name }))];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, paddingBottom: 40 }}>
      {/* Header — hidden on desktop because DesktopTopBar handles title + bell. */}
      {!isDesktop && (
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
      )}

      {/* Reading column — comfortable centered width on desktop. */}
      <div style={{
        maxWidth: isDesktop ? LAYOUT.reading : undefined,
        margin: isDesktop ? "0 auto" : undefined,
      }}>
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
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{
            margin: "24px 0",
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
          <>
            {yourPosts.length > 0 && (
              <FeedSectionHeader label={`Your Posts · ${yourPosts.length}`} />
            )}
            {yourPosts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                author={resolveAuthor(state, userName, p.authorId)}
                resolveCommenter={(id) => resolveAuthor(state, userName, id)}
                audience={describeAudience(p, circles, state.friends || [], "me")}
                onCheer={onCheer}
                onUncheer={onUncheer}
                onAddComment={onAddComment}
                onDeleteComment={onDeleteComment}
                onDeletePost={onDeletePost}
              />
            ))}

            {otherPosts.length > 0 && yourPosts.length > 0 && (
              <FeedSectionHeader label="Friends" />
            )}
            {otherPosts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                author={resolveAuthor(state, userName, p.authorId)}
                resolveCommenter={(id) => resolveAuthor(state, userName, id)}
                audience={describeAudience(p, circles, state.friends || [], "me")}
                onCheer={onCheer}
                onUncheer={onUncheer}
                onAddComment={onAddComment}
                onDeleteComment={onDeleteComment}
              />
            ))}
          </>
        )}
      </div>
      </div>
    </div>
  );
}

function FeedSectionHeader({ label }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 4px 4px",
    }}>
      <div style={{
        fontSize: 10, color: TEXT_DIM,
        letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 700,
      }}>
        {label}
      </div>
      <div style={{
        flex: 1, height: 1,
        background: `linear-gradient(90deg, ${alpha(TEXT_DIM, "40")}, transparent)`,
      }} />
    </div>
  );
}

function PostCard({ post, author, resolveCommenter, audience, onCheer, onUncheer, onAddComment, onDeleteComment, onDeletePost }) {
  const arch = ARCHETYPES[author.archetype] || ARCHETYPES.balanced;
  const cat = CATEGORIES[post.goalRef?.category] || null;
  const youCheered = (post.cheers || []).some((c) => c.userId === "me");
  const cheerCount = (post.cheers || []).length;
  const comments = post.comments || [];
  const [showComments, setShowComments] = useState(comments.length > 0 && comments.length <= 2);
  const [draft, setDraft] = useState("");

  const toggleCheer = () => {
    if (youCheered) onUncheer?.(post.id);
    else onCheer?.(post.id);
  };

  const submitComment = () => {
    const text = draft.trim();
    if (!text) return;
    onAddComment?.(post.id, text);
    setDraft("");
    setShowComments(true);
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
        {author.isMe && onDeletePost && (
          <button
            onClick={() => onDeletePost(post)}
            aria-label="Delete post"
            style={{
              background: "transparent", border: `1px solid ${BORDER_BR}`,
              width: 30, height: 30, borderRadius: 8,
              color: TEXT_DIM, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Trash2 size={13} />
          </button>
        )}
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

      {/* Audience chip */}
      {audience && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 10, color: TEXT_DIM,
          letterSpacing: "0.06em",
          marginBottom: 8,
        }}>
          {audience.avatars.length > 0 && (
            <div style={{ display: "flex", marginRight: 2 }}>
              {audience.avatars.map((f, i) => {
                const a = ARCHETYPES[f.archetype] || ARCHETYPES.balanced;
                return (
                  <div
                    key={f.id}
                    style={{
                      width: 16, height: 16, borderRadius: "50%",
                      marginLeft: i === 0 ? 0 : -5,
                      background: `linear-gradient(135deg, ${alpha(a.color, "70")}, ${alpha(a.color, "25")})`,
                      border: `1.5px solid ${CARD}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <span style={{ fontFamily: SERIF, fontSize: 8, color: "#FFF", fontWeight: 600 }}>
                      {f.initial}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <span>{audience.label}</span>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
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
        <button
          onClick={() => setShowComments((v) => !v)}
          className="tappable"
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 10px",
            background: "transparent",
            border: `1px solid ${BORDER_BR}`,
            borderRadius: 99,
            color: TEXT_MID,
            fontSize: 11, fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <MessageCircle size={12} />
          <span>{comments.length > 0 ? `${comments.length}` : "Comment"}</span>
        </button>
      </div>

      {showComments && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {comments.map((c) => {
            const cAuthor = resolveCommenter(c.userId);
            const cArch = ARCHETYPES[cAuthor.archetype] || ARCHETYPES.balanced;
            return (
              <div key={c.id} style={{
                display: "flex", gap: 8, alignItems: "flex-start",
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                  background: `linear-gradient(135deg, ${alpha(cArch.color, "65")}, ${alpha(cArch.color, "20")})`,
                  border: `1px solid ${alpha(cArch.color, "55")}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontFamily: SERIF, fontSize: 10, color: "#FFF", fontWeight: 600 }}>
                    {cAuthor.initial}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.35 }}>
                    <span style={{ fontWeight: 600, marginRight: 6 }}>{cAuthor.name}</span>
                    {c.text}
                  </div>
                  <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 2, display: "flex", gap: 8 }}>
                    <span>{formatRelative(c.at)}</span>
                    {c.userId === "me" && onDeleteComment && (
                      <button
                        onClick={() => onDeleteComment(post.id, c.id)}
                        style={{
                          background: "transparent", border: "none", padding: 0,
                          color: TEXT_DIM, fontSize: 10, cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Compose */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 8px 6px 12px",
            background: BG,
            border: `1px solid ${BORDER_BR}`,
            borderRadius: 99,
            marginTop: comments.length > 0 ? 4 : 0,
          }}>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, 280))}
              onKeyDown={(e) => { if (e.key === "Enter") submitComment(); }}
              placeholder="Add a comment…"
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: TEXT, fontSize: 13, fontFamily: "inherit", padding: "4px 0",
              }}
            />
            <button
              onClick={submitComment}
              disabled={!draft.trim()}
              aria-label="Send"
              style={{
                width: 28, height: 28, borderRadius: "50%",
                background: draft.trim() ? ACCENT : "transparent",
                color: draft.trim() ? BG : TEXT_DIM,
                border: `1px solid ${draft.trim() ? ACCENT : BORDER_BR}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: draft.trim() ? "pointer" : "not-allowed",
                flexShrink: 0,
                transition: "all 0.2s ease",
              }}
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
