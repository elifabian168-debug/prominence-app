import { useState, useMemo } from "react";
import { ChevronLeft, Users, X, Plus, Check, Flame } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { ARCHETYPES } from "../constants/categories";
import { DISCOVERABLE_USERS } from "../constants/socialData";
import { getLevelFromXP } from "../utils/xp";

export default function AddFriendsScreen({ state, onBack, onAdd }) {
  const [query, setQuery]   = useState("");
  const [adding, setAdding] = useState(null);

  const existingIds = new Set((state.friends || []).map(f => f.id));
  const available   = DISCOVERABLE_USERS.filter(u => !existingIds.has(u.id));

  const filtered = useMemo(() => {
    if (!query.trim()) return available;
    const q = query.toLowerCase().trim();
    return available.filter(u =>
      u.name.toLowerCase().includes(q) ||
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

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <Users size={14} color={TEXT_DIM} />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or archetype"
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
          <div style={{ fontSize: 11, color: TEXT_DIM }}>Try a different search</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(user => {
            const arch = ARCHETYPES[user.archetype] || ARCHETYPES.balanced;
            const ArchI = arch.icon;
            const lvl = getLevelFromXP(user.totalXP).level;
            const isAdding = adding === user.id;
            return (
              <div key={user.id} style={{
                background: CARD, border: `1px solid ${isAdding ? ACCENT + "60" : BORDER}`,
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
                  <div style={{ fontSize: 14, fontWeight: 500, color: TEXT, marginBottom: 2 }}>{user.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
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

      <div style={{ marginTop: 24, padding: "14px 16px", borderRadius: 12, background: CARD, border: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6 }}>Coming soon</div>
        <div style={{ fontSize: 12, color: TEXT_MID, lineHeight: 1.55 }}>
          Search by username, share invite links, and find friends through your contacts once Prominence ships.
        </div>
      </div>
    </div>
  );
}
