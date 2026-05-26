import { X, Bell, AlertCircle, Sparkles, UserPlus, Check } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { ARCHETYPES } from "../constants/categories";
import BottomSheet from "../components/ui/BottomSheet";

const getIconForKind  = (kind) => (kind === "nudge_in" || kind === "nudge_back") ? AlertCircle : Sparkles;
const getColorForKind = (kind) => (kind === "nudge_in" || kind === "nudge_back") ? "#F87171" : ACCENT;

const formatRel = (ts) => {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1)    return "just now";
  if (mins < 60)   return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
};

export default function NotificationCenterSheet({ open, notifications, friends, friendRequests = [], onAcceptRequest, onDeclineRequest, onClose, onDismiss, onOpenFriend }) {
  if (!open) return null;
  const items       = notifications || [];
  const requests    = friendRequests || [];
  const hasAny      = requests.length > 0 || items.length > 0;

  return (
    <BottomSheet onClose={onClose} maxHeight="85vh">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 14px" }}>
        <div>
          <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 2 }}>Inbox</div>
          <div style={{ fontFamily: SERIF, fontSize: 24 }}>Notifications</div>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: CARD, border: `1px solid ${BORDER}`, color: TEXT_MID, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={14} />
        </button>
      </div>

      {!hasAny ? (
        <div style={{ padding: "40px 20px 60px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px", background: CARD, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={20} color={TEXT_DIM} />
          </div>
          <div style={{ fontSize: 14, color: TEXT, fontWeight: 500, marginBottom: 6 }}>All caught up</div>
          <div style={{ fontSize: 12, color: TEXT_DIM, lineHeight: 1.5 }}>Cheers, nudges, and friend requests will appear here.</div>
        </div>
      ) : (
        <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 8 }}>

          {/* ── Friend requests ── */}
          {requests.map((req, i) => (
            <div key={req.fromUid} style={{
              background: `linear-gradient(90deg, ${alpha(ACCENT, "10")}, ${CARD})`,
              border: `1px solid ${alpha(ACCENT, "40")}`,
              borderRadius: 12, padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 12,
              animation: `notifSlideIn 0.3s cubic-bezier(0.16,1,0.3,1) ${i * 40}ms both`,
            }}>
              {/* Avatar */}
              <div style={{
                width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                background: alpha(ACCENT, "15"), border: `1px solid ${alpha(ACCENT, "45")}`,
                display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
              }}>
                <span style={{ fontFamily: SERIF, fontSize: 16, color: ACCENT }}>{req.fromInitial}</span>
                {/* unread dot */}
                <div style={{ position: "absolute", top: -2, right: -2, width: 10, height: 10, borderRadius: "50%", background: ACCENT, border: `2px solid ${BG}` }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <UserPlus size={11} color={ACCENT} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>
                    {req.fromName} wants to be your friend
                  </span>
                </div>
                <div style={{ fontSize: 10, color: TEXT_DIM }}>{formatRel(req.createdAt)}</div>
              </div>

              {/* Accept / Decline */}
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => onDeclineRequest?.(req)}
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "transparent", border: `1px solid ${BORDER_BR}`,
                    color: TEXT_DIM, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X size={13} />
                </button>
                <button
                  onClick={() => onAcceptRequest?.(req)}
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: ACCENT, border: "none",
                    color: BG, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 0 10px ${alpha(ACCENT, "35")}`,
                  }}
                >
                  <Check size={13} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}

          {/* ── Cheers / nudges ── */}
          {items.map((notif, i) => {
            const friend = friends.find(f => f.id === notif.fromId);
            const arch = friend ? (ARCHETYPES[friend.archetype] || ARCHETYPES.balanced) : ARCHETYPES.balanced;
            const Icon  = getIconForKind(notif.kind);
            const color = getColorForKind(notif.kind);
            return (
              <div key={notif.id} style={{
                background: notif.read ? CARD : `linear-gradient(90deg, ${color}10, ${CARD})`,
                border: `1px solid ${notif.read ? BORDER : color + "30"}`,
                borderRadius: 12, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 12,
                animation: `notifSlideIn 0.3s cubic-bezier(0.16,1,0.3,1) ${(requests.length + i) * 40}ms both`,
              }}>
                <button onClick={() => friend && onOpenFriend(friend)} style={{
                  width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                  background: `${arch.color}20`, border: `1px solid ${arch.color}50`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: friend ? "pointer" : "default", padding: 0, position: "relative",
                }}>
                  <span style={{ fontFamily: SERIF, fontSize: 16, color: arch.color }}>{friend?.initial || "?"}</span>
                  {!notif.read && <div style={{ position: "absolute", top: -2, right: -2, width: 10, height: 10, borderRadius: "50%", background: color, border: `2px solid ${BG}` }} />}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <Icon size={11} color={color} fill={notif.kind === "cheer_in" || notif.kind === "cheer_back" ? color : "none"} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>{notif.message}</span>
                  </div>
                  <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.06em" }}>{formatRel(notif.createdAt)}</div>
                </div>
                <button onClick={() => onDismiss(notif.id)} aria-label="Dismiss notification" style={{ background: "transparent", border: "none", color: TEXT_DIM, cursor: "pointer", padding: 6, display: "flex", flexShrink: 0 }}>
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </BottomSheet>
  );
}
