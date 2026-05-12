import { useState } from "react";
import { X, Copy, Check, Share2, Link2 } from "lucide-react";
import { ACCENT, BG, CARD, CARD_ELEV, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import BottomSheet from "../components/ui/BottomSheet";

const slugify = (s) => (s || "friend").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16) || "friend";

export default function InviteSheet({ open, userName, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!open) return null;

  const code = slugify(userName);
  const link = `https://prominence.app/i/${code}`;
  const shareText = `Join me on Prominence — a quest journal that turns your days into XP.`;

  const handleCopy = async () => {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
        ok = true;
      }
    } catch {}
    if (!ok) {
      // Fallback for HTTP / older browsers
      try {
        const ta = document.createElement("textarea");
        ta.value = link;
        ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        ok = true;
      } catch {}
    }
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1600); }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Prominence", text: shareText, url: link });
      } catch (err) {
        // Only fall back to copy if share is genuinely unavailable, not if user cancelled
        if (err?.name !== "AbortError") handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <BottomSheet onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 14px" }}>
        <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.22em", textTransform: "uppercase" }}>Invite a friend</div>
        <button onClick={onClose} aria-label="Close" style={{
          width: 32, height: 32, borderRadius: "50%", background: CARD, border: `1px solid ${BORDER}`,
          color: TEXT_MID, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}><X size={14} /></button>
      </div>

      <div style={{ padding: "0 20px 8px" }}>
        <div style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1.15, marginBottom: 8 }}>Bring someone with you</div>
        <div style={{ fontSize: 13, color: TEXT_MID, lineHeight: 1.5, marginBottom: 20 }}>
          Share your personal link. When they join, you'll both start a Friend Streak.
        </div>

        <div style={{
          background: `linear-gradient(135deg, ${alpha(ACCENT, "15")}, ${CARD})`,
          border: `1px solid ${alpha(ACCENT, "40")}`,
          borderRadius: 14, padding: "14px 16px", marginBottom: 14,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: alpha(ACCENT, "20"), border: `1px solid ${alpha(ACCENT, "50")}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Link2 size={16} color={ACCENT} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 2 }}>Your invite link</div>
            <div style={{ fontSize: 13, color: TEXT, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button onClick={handleCopy} style={{
            flex: 1, padding: "13px", borderRadius: 12,
            background: copied ? alpha(ACCENT, "15") : CARD_ELEV,
            border: `1px solid ${copied ? ACCENT : BORDER_BR}`,
            color: copied ? ACCENT : TEXT, fontSize: 13, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s",
          }}>
            {copied ? <><Check size={14} strokeWidth={3} /> Copied</> : <><Copy size={14} /> Copy link</>}
          </button>
          <button onClick={handleShare} style={{
            flex: 1, padding: "13px", borderRadius: 12,
            background: ACCENT, color: BG, border: "none",
            fontSize: 13, fontWeight: 600, letterSpacing: "0.04em", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <Share2 size={14} strokeWidth={2.5} /> Share
          </button>
        </div>

        <div style={{
          background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
          padding: "12px 14px", marginBottom: 24,
        }}>
          <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>What they'll see</div>
          <div style={{ fontSize: 12, color: TEXT_MID, lineHeight: 1.5, fontStyle: "italic" }}>"{shareText}"</div>
        </div>
      </div>
    </BottomSheet>
  );
}
