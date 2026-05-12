import { useState, useMemo } from "react";
import { ChevronLeft, Users, X, Plus, Check, Flame, Link2, Phone } from "lucide-react";
import { ACCENT, BG, CARD, CARD_ELEV, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { ARCHETYPES } from "../constants/categories";
import { DISCOVERABLE_USERS } from "../constants/socialData";
import { getLevelFromXP } from "../utils/xp";
import InviteSheet from "../sheets/InviteSheet";
import ContactsSheet from "../sheets/ContactsSheet";

export default function AddFriendsScreen({ state, userName, onBack, onAdd, onInvited }) {
  const [query, setQuery]                   = useState("");
  const [adding, setAdding]                 = useState(null);
  const [inviteOpen, setInviteOpen]         = useState(false);
  const [contactsOpen, setContactsOpen]     = useState(false);

  const existingIds = useMemo(() => new Set((state.friends || []).map(f => f.id)), [state.friends]);
  const available   = useMemo(() => DISCOVERABLE_USERS.filter(u => !existingIds.has(u.id)), [existingIds]);

  const filtered = useMemo(() => {
    const raw = query.trim();
    if (!raw) return available;
    const q = raw.toLowerCase().replace(/^@/, "");
    return available.filter(u =>
      u.name.toLowerCase().includes(q) ||
      (u.username || "").toLowerCase().includes(q) ||
      (ARCHETYPES[u.archetype]?.label || "").toLowerCase().includes(q)
    );
  }, [query, available]);

  const handleAdd = (user) => {
    setAdding(user.id);
    setTimeout(() => { onAdd(user); setAdding(null); }, 280);
  };

  return (
    <div style={{ padding: "24px 20px 0" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: TEXT_MID, padding: "0 0 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
        <ChevronLeft size={16} /> Back
      </button>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 6 }}>Discover</div>
        <div style={{ fontFamily: SERIF, fontSize: 32 }}>Add friends</div>
        <div style={{ fontSize: 12, color: TEXT_MID, marginTop: 4 }}>People in the Prominence community</div>
      </div>

      {/* Quick actions: invite link + contacts */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button onClick={() => setInviteOpen(true)} style={{
          flex: 1, padding: "12px 14px", borderRadius: 12,
          background: `linear-gradient(135deg, ${alpha(ACCENT, "12")}, ${CARD})`,
          border: `1px solid ${alpha(ACCENT, "40")}`,
          color: TEXT, fontSize: 12, fontWeight: 500, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, textAlign: "left",
        }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: alpha(ACCENT, "20"), border: `1px solid ${alpha(ACCENT, "50")}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Link2 size={13} color={ACCENT} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Share invite</div>
            <div style={{ fontSize: 10, color: TEXT_DIM }}>Send a personal link</div>
          </div>
        </button>
        <button onClick={() => setContactsOpen(true)} style={{
          flex: 1, padding: "12px 14px", borderRadius: 12,
          background: CARD, border: `1px solid ${BORDER_BR}`,
          color: TEXT, fontSize: 12, fontWeight: 500, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, textAlign: "left",
        }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: CARD_ELEV, border: `1px solid ${BORDER_BR}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Phone size={13} color={TEXT_MID} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>From contacts</div>
            <div style={{ fontSize: 10, color: TEXT_DIM }}>Match phone book</div>
          </div>
        </button>
      </div>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <Users size={14} color={TEXT_DIM} />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or @username"
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: TEXT, fontFamily: "inherit", fontSize: 13 }} />
        {query && (
          <button onClick={() => setQuery("")} style={{ background: "transparent", border: "none", color: TEXT_DIM, cursor: "pointer", padding: 0, display: "flex" }}>
            <X size={14} />
          </button>
        )}
      </div>

      <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>
        {query ? `${filtered.length} match${filtered.length === 1 ? "" : "es"}` : `Suggested · ${filtered.length}`}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: CARD, border: `1px dashed ${BORDER_BR}`, borderRadius: 12, padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: TEXT_MID, marginBottom: 4 }}>No matches found</div>
          <div style={{ fontSize: 11, color: TEXT_DIM }}>Try a different search, or invite them directly</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 24 }}>
          {filtered.map(user => {
            const arch = ARCHETYPES[user.archetype] || ARCHETYPES.balanced;
            const ArchI = arch.icon;
            const lvl = getLevelFromXP(user.totalXP).level;
            const isAdding = adding === user.id;
            return (
              <div key={user.id} style={{
                background: CARD, border: `1px solid ${isAdding ? alpha(ACCENT, "60") : BORDER}`,
                borderRadius: 14, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 12,
                opacity: isAdding ? 0.5 : 1,
                transform: isAdding ? "translateX(-30px)" : "translateX(0)",
                transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
              }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: `radial-gradient(circle, ${arch.color}30 0%, ${arch.color}08 70%)`, border: `1px solid ${arch.color}50`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: SERIF, fontSize: 18, color: arch.color }}>{user.initial}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>{user.name}</span>
                    {user.username && (
                      <span style={{ fontSize: 11, color: TEXT_DIM }}>@{user.username}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                    <ArchI size={9} color={arch.color} />
                    <span style={{ fontSize: 10, color: TEXT_DIM }}>{arch.label} · Lv. {lvl}</span>
                    {user.streak >= 7 && (
                      <><span style={{ fontSize: 10, color: TEXT_DIM }}>·</span><Flame size={9} color={ACCENT} /><span style={{ fontSize: 10, color: ACCENT }}>{user.streak}d</span></>
                    )}
                  </div>
                </div>
                <button onClick={() => handleAdd(user)} disabled={isAdding} style={{
                  padding: "8px 16px", borderRadius: 99,
                  background: isAdding ? alpha(ACCENT, "30") : ACCENT, color: BG, border: "none",
                  fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
                  cursor: isAdding ? "default" : "pointer", flexShrink: 0,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  {isAdding ? <Check size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={2.5} />}
                  {isAdding ? "ADDED" : "ADD"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <InviteSheet open={inviteOpen} userName={userName} onClose={() => setInviteOpen(false)} />
      <ContactsSheet
        open={contactsOpen}
        existingFriendIds={existingIds}
        onClose={() => setContactsOpen(false)}
        onAdd={onAdd}
        onInvited={onInvited} />
    </div>
  );
}
