import { useState, useEffect, useRef } from "react";
import { X, Phone, Check, Plus, Send, Search } from "lucide-react";
import { ACCENT, BG, CARD, CARD_ELEV, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { ARCHETYPES } from "../constants/categories";
import { DISCOVERABLE_USERS, CONTACT_MATCHES } from "../constants/socialData";
import BottomSheet from "../components/ui/BottomSheet";

export default function ContactsSheet({ open, existingFriendIds, onClose, onAdd, onInvited }) {
  const [phase, setPhase] = useState("prompt"); // prompt | scanning | results
  const [added, setAdded] = useState(new Set());
  const [invited, setInvited] = useState(new Set());
  const timerRef = useRef(null);

  // Reset to prompt on close and cancel any in-flight scan timer
  useEffect(() => {
    if (!open) {
      clearTimeout(timerRef.current);
      setPhase("prompt");
      setAdded(new Set());
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
    timerRef.current = setTimeout(() => setPhase("results"), 900);
  };

  const handleAdd = (match, user) => {
    onAdd(user);
    setAdded(s => new Set([...s, match.phone]));
  };

  const handleInvite = (match) => {
    onInvited?.(match);
    setInvited(s => new Set([...s, match.phone]));
  };

  const enriched = CONTACT_MATCHES.map(m => ({
    ...m,
    user: m.matchedUserId ? DISCOVERABLE_USERS.find(u => u.id === m.matchedUserId) : null,
  }));
  const matches    = enriched.filter(m => m.user && !existingFriendIds.has(m.user.id));
  const unmatched  = enriched.filter(m => !m.user);

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

      {phase === "results" && (
        <div style={{ padding: "0 20px 24px" }}>
          {matches.length > 0 && (
            <>
              <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>
                On Prominence · {matches.length}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
                {matches.map(m => {
                  const arch = ARCHETYPES[m.user.archetype] || ARCHETYPES.balanced;
                  const isAdded = added.has(m.phone);
                  return (
                    <div key={m.phone} style={{
                      background: CARD, border: `1px solid ${isAdded ? alpha(ACCENT, "50") : BORDER}`,
                      borderRadius: 12, padding: "10px 12px",
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                        background: `${arch.color}20`, border: `1px solid ${arch.color}50`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontFamily: SERIF, fontSize: 14, color: arch.color }}>{m.user.initial}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: TEXT, fontWeight: 500 }}>{m.name}</div>
                        <div style={{ fontSize: 10, color: TEXT_DIM }}>@{m.user.username} · {arch.label}</div>
                      </div>
                      <button onClick={() => handleAdd(m, m.user)} disabled={isAdded} style={{
                        padding: "7px 14px", borderRadius: 99,
                        background: isAdded ? alpha(ACCENT, "20") : ACCENT,
                        color: isAdded ? ACCENT : BG, border: "none",
                        fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
                        cursor: isAdded ? "default" : "pointer", flexShrink: 0,
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        {isAdded ? <><Check size={11} strokeWidth={3} /> ADDED</> : <><Plus size={11} strokeWidth={2.5} /> ADD</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {unmatched.length > 0 && (
            <>
              <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>
                Not on Prominence yet · {unmatched.length}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {unmatched.map(m => {
                  const isInvited = invited.has(m.phone);
                  return (
                    <div key={m.phone} style={{
                      background: CARD, border: `1px solid ${BORDER}`,
                      borderRadius: 12, padding: "10px 12px",
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                        background: CARD_ELEV, border: `1px solid ${BORDER_BR}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontFamily: SERIF, fontSize: 14, color: TEXT_MID }}>{m.name[0]}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: TEXT, fontWeight: 500 }}>{m.name}</div>
                        <div style={{ fontSize: 10, color: TEXT_DIM }}>{m.phone}</div>
                      </div>
                      <button onClick={() => handleInvite(m)} disabled={isInvited} style={{
                        padding: "7px 14px", borderRadius: 99,
                        background: isInvited ? alpha(ACCENT, "15") : "transparent",
                        color: isInvited ? ACCENT : TEXT_MID,
                        border: `1px solid ${isInvited ? ACCENT : BORDER_BR}`,
                        fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
                        cursor: isInvited ? "default" : "pointer", flexShrink: 0,
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        {isInvited ? <><Check size={11} strokeWidth={3} /> SENT</> : <><Send size={11} /> INVITE</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {matches.length === 0 && unmatched.length === 0 && (
            <div style={{ padding: "20px", textAlign: "center", color: TEXT_MID, fontSize: 13 }}>
              No contacts found to display.
            </div>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
