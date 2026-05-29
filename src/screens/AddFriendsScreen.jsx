import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Users, X, Plus, Check, Search } from "lucide-react";
import { ACCENT, BG, CARD, CARD_ELEV, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import { TYPE, SPACE, RADIUS, LAYOUT } from "../constants/tokens";
import { useViewport } from "../hooks/useViewport";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { ARCHETYPES } from "../constants/categories";
import { getLevelFromXP } from "../utils/xp";
import { searchUsers, auth } from "../utils/firebase";
import InviteSheet from "../sheets/InviteSheet";
import ContactsSheet from "../sheets/ContactsSheet";
import { Link2, Phone } from "lucide-react";

// Convert a Firestore user profile into the friend shape the app expects.
function profileToFriend(profile) {
  return {
    id: profile.uid,
    name: profile.name,
    username: profile.username,
    initial: profile.name?.[0]?.toUpperCase() ?? "?",
    totalXP: 0,
    weeklyXP: 0,
    streak: 0,
    archetype: "balanced",
    categoryXP: { fitness: 0, school: 0, life: 0, work: 0, mind: 0 },
  };
}

// onSendRequest(profile) — called for real Firestore users found via search
// onAdd(friendObj)        — called for contacts added directly (ContactsSheet)
export default function AddFriendsScreen({ state, userName, onBack, onSendRequest, onAdd, onInvited }) {
  const [query, setQuery]           = useState("");
  const [results, setResults]       = useState([]);
  const [searching, setSearching]   = useState(false);
  const [sending, setSending]       = useState(null);   // uid currently being requested
  const [sent, setSent]             = useState(new Set()); // uids already requested
  const [inviteOpen, setInviteOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);

  const existingIds = useMemo(() => new Set((state.friends || []).map(f => f.id)), [state.friends]);
  const debounceRef = useRef(null);

  useEffect(() => {
    const raw = query.trim();
    clearTimeout(debounceRef.current);

    if (raw.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const currentUid = auth.currentUser?.uid;
        const found = await searchUsers(raw, currentUid);
        setResults(found.filter(u => !existingIds.has(u.uid)));
      } catch (err) {
        console.error("Friend search failed:", err?.code, err?.message);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query, existingIds]);

  const handleSendRequest = useCallback(async (profile) => {
    setSending(profile.uid);
    try {
      await onSendRequest(profile);
      setSent(prev => new Set([...prev, profile.uid]));
    } finally {
      setSending(null);
    }
  }, [onSendRequest]);

  const showEmpty   = query.trim().length >= 2 && !searching && results.length === 0;
  const showPrompt  = query.trim().length < 2;
  const { isDesktop } = useViewport();

  return (
    <div style={{
      padding: "24px 20px 0",
      maxWidth: isDesktop ? LAYOUT.reading : undefined,
      margin: isDesktop ? "0 auto" : undefined,
    }}>
      <PageHeader eyebrow="Discover" title="Add friends" onBack={onBack} />
      <div style={{ ...TYPE.meta, marginTop: -SPACE.md, marginBottom: SPACE.xl }}>
        Search by @username or name
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button onClick={() => setInviteOpen(true)} style={{
          flex: 1, padding: "12px 14px", borderRadius: RADIUS.control,
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
          flex: 1, padding: "12px 14px", borderRadius: RADIUS.control,
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

      {/* Search input */}
      <div style={{
        background: CARD, border: `1px solid ${BORDER}`,
        borderRadius: RADIUS.control, padding: "10px 14px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        {searching
          ? <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${BORDER_BR}`, borderTopColor: ACCENT, animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
          : <Search size={14} color={TEXT_DIM} />
        }
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search @username or name…"
          style={{
            flex: 1, background: "transparent", border: "none",
            outline: "none", color: TEXT, fontFamily: "inherit", fontSize: 13,
          }}
        />
        {query && (
          <button onClick={() => setQuery("")} style={{ background: "transparent", border: "none", color: TEXT_DIM, cursor: "pointer", padding: 0, display: "flex" }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* States */}
      {showPrompt && (
        <EmptyState
          icon={Users}
          title="Search for friends"
          body="Type at least 2 characters — try a @username or first name."
        />
      )}

      {showEmpty && (
        <EmptyState
          title={`No one found for "${query.replace(/^@/, "")}"`}
          body="Try their exact @username, or invite them to join."
        />
      )}

      {results.length > 0 && (
        <>
          <div style={{ ...TYPE.sectionLabel, marginBottom: SPACE.md }}>
            {results.length} result{results.length !== 1 ? "s" : ""}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 24 }}>
            {results.map(profile => {
              const arch = ARCHETYPES.balanced;
              const initial = profile.name?.[0]?.toUpperCase() ?? "?";
              const isSending = sending === profile.uid;
              const isSent    = sent.has(profile.uid) || existingIds.has(profile.uid);

              return (
                <div key={profile.uid} style={{
                  background: CARD,
                  border: `1px solid ${isSent ? alpha(ACCENT, "40") : BORDER}`,
                  borderRadius: 14, padding: "12px 14px",
                  display: "flex", alignItems: "center", gap: 12,
                  transition: "border-color 0.25s ease",
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                    background: `radial-gradient(circle, ${arch.color}30 0%, ${arch.color}08 70%)`,
                    border: `1px solid ${arch.color}50`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontFamily: SERIF, fontSize: 18, color: arch.color }}>{initial}</span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>{profile.name}</span>
                      {profile.username && (
                        <span style={{ fontSize: 11, color: TEXT_DIM }}>@{profile.username}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 2 }}>
                      {isSent ? "Request sent" : "On Prominence"}
                    </div>
                  </div>

                  {/* Request button */}
                  <button
                    onClick={() => !isSent && !isSending && handleSendRequest(profile)}
                    disabled={isSent || isSending}
                    style={{
                      padding: "8px 16px", borderRadius: 99,
                      background: isSent ? alpha(ACCENT, "15") : isSending ? alpha(ACCENT, "30") : ACCENT,
                      color: isSent ? ACCENT : BG,
                      border: `1px solid ${isSent ? alpha(ACCENT, "40") : "transparent"}`,
                      fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
                      cursor: isSent || isSending ? "default" : "pointer", flexShrink: 0,
                      display: "flex", alignItems: "center", gap: 4,
                      transition: "all 0.25s ease",
                    }}
                  >
                    {isSent
                      ? <><Check size={12} strokeWidth={3} /> SENT</>
                      : isSending
                        ? "…"
                        : <><Plus size={12} strokeWidth={2.5} /> ADD</>
                    }
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      <InviteSheet open={inviteOpen} userName={userName} onClose={() => setInviteOpen(false)} />
      <ContactsSheet
        open={contactsOpen}
        onClose={() => setContactsOpen(false)}
        onInvited={onInvited}
      />
    </div>
  );
}
