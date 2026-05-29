import { useState, useEffect, useRef } from "react";
import { X, Phone, Send, Search } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import BottomSheet from "../components/ui/BottomSheet";

export default function ContactsSheet({ open, onClose, onInvited }) {
  const [phase, setPhase] = useState("prompt"); // prompt | scanning | done
  const [invited, setInvited] = useState(new Set());
  const timerRef = useRef(null);

  useEffect(() => {
    if (!open) {
      clearTimeout(timerRef.current);
      setPhase("prompt");
      setInvited(new Set());
    }
  }, [open]);

  if (!open) return null;

  const handleAllow = async () => {
    setPhase("scanning");
    try {
      if ("contacts" in navigator && typeof navigator.contacts.select === "function") {
        await navigator.contacts.select(["name", "tel"], { multiple: true });
      }
    } catch {}
    timerRef.current = setTimeout(() => setPhase("done"), 900);
  };

  const handleInvite = () => {
    const url = window.location.origin;
    if (navigator.share) {
      navigator.share({ title: "Join me on Prominence", url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    onInvited?.({ name: "contact" });
    setInvited(s => new Set([...s, "shared"]));
  };

  return (
    <BottomSheet onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 14px" }}>
        <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.22em", textTransform: "uppercase" }}>From contacts</div>
        <button onClick={onClose} aria-label="Close" style={{
          width: 32, height: 32, borderRadius: "50%", background: CARD, border: `1px solid ${BORDER}`,
          color: TEXT_MID, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}><X size={14} /></button>
      </div>

      {phase === "prompt" && (
        <div style={{ padding: "0 20px 28px", textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", margin: "8px auto 18px",
            background: `radial-gradient(circle, ${alpha(ACCENT, "30")} 0%, ${alpha(ACCENT, "08")} 70%)`,
            border: `1px solid ${alpha(ACCENT, "50")}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Phone size={26} color={ACCENT} />
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 24, lineHeight: 1.2, marginBottom: 10 }}>Find friends in your contacts</div>
          <div style={{ fontSize: 13, color: TEXT_MID, lineHeight: 1.55, marginBottom: 22, padding: "0 8px" }}>
            We'll check which of your contacts are already on Prominence. Numbers are never stored or shared.
          </div>
          <button onClick={handleAllow} style={{
            width: "100%", padding: "14px", borderRadius: 12,
            background: ACCENT, color: BG, border: "none",
            fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", cursor: "pointer",
          }}>
            ALLOW ACCESS
          </button>
          <button onClick={onClose} style={{
            width: "100%", marginTop: 8, padding: "12px",
            background: "transparent", border: "none", color: TEXT_MID, fontSize: 12, cursor: "pointer",
          }}>Not now</button>
        </div>
      )}

      {phase === "scanning" && (
        <div style={{ padding: "32px 20px 36px", textAlign: "center" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", margin: "0 auto 18px",
            background: alpha(ACCENT, "15"), border: `1px solid ${alpha(ACCENT, "50")}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "ringPulse 1.4s ease-in-out infinite",
          }}>
            <Search size={22} color={ACCENT} />
          </div>
          <div style={{ fontSize: 14, color: TEXT, fontWeight: 500, marginBottom: 4 }}>Scanning contacts...</div>
          <div style={{ fontSize: 12, color: TEXT_DIM }}>This only takes a second</div>
        </div>
      )}

      {phase === "done" && (
        <div style={{ padding: "0 20px 28px", textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontSize: 20, marginBottom: 8 }}>None of your contacts are on Prominence yet.</div>
          <div style={{ fontSize: 13, color: TEXT_MID, lineHeight: 1.55, marginBottom: 22 }}>
            Invite them and they'll show up as friends when they sign up.
          </div>
          <button onClick={handleInvite} style={{
            width: "100%", padding: "14px", borderRadius: 12,
            background: invited.has("shared") ? alpha(ACCENT, "15") : ACCENT,
            color: invited.has("shared") ? ACCENT : BG,
            border: `1px solid ${invited.has("shared") ? alpha(ACCENT, "40") : "transparent"}`,
            fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <Send size={14} />
            {invited.has("shared") ? "LINK COPIED" : "SHARE INVITE LINK"}
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
