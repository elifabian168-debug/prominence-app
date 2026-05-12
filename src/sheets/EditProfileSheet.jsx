import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, TEXT, TEXT_DIM, TEXT_MID, SERIF } from "../constants/theme";
import BottomSheet from "../components/ui/BottomSheet";
import Section from "../components/ui/Section";

export default function EditProfileSheet({ open, name, bio, onClose, onSave }) {
  const [draftName, setDraftName] = useState(name || "");
  const [draftBio, setDraftBio]   = useState(bio || "");

  useEffect(() => {
    if (open) { setDraftName(name || ""); setDraftBio(bio || ""); }
  }, [open, name, bio]);

  if (!open) return null;

  const submit = () => {
    if (!draftName.trim()) return;
    onSave({ name: draftName, bio: draftBio });
    onClose();
  };

  return (
    <BottomSheet onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 14px" }}>
        <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.22em", textTransform: "uppercase" }}>Edit Profile</div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: CARD, border: `1px solid ${BORDER}`, color: TEXT_MID, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={14} />
        </button>
      </div>

      <Section label="Name">
        <input value={draftName} onChange={e => setDraftName(e.target.value)} placeholder="Your name" autoFocus
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, background: CARD, border: `1px solid ${BORDER}`, color: TEXT, fontFamily: SERIF, fontSize: 18, outline: "none" }} />
      </Section>

      <Section label="Bio">
        <textarea value={draftBio} onChange={e => setDraftBio(e.target.value)}
          placeholder="A line or two about yourself" rows={3} maxLength={120}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, background: CARD, border: `1px solid ${BORDER}`, color: TEXT, fontSize: 13, fontFamily: "inherit", outline: "none", resize: "none", lineHeight: 1.5 }} />
        <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 4, textAlign: "right" }}>{draftBio.length} / 120</div>
      </Section>

      <div style={{ padding: "16px 20px 24px", borderTop: `1px solid ${BORDER}`, background: BG, position: "sticky", bottom: 0 }}>
        <button onClick={submit} disabled={!draftName.trim()} style={{
          width: "100%", padding: "14px", borderRadius: 12,
          background: draftName.trim() ? ACCENT : CARD, color: draftName.trim() ? BG : TEXT_DIM,
          border: "none", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em",
          cursor: draftName.trim() ? "pointer" : "not-allowed", opacity: draftName.trim() ? 1 : 0.5,
        }}>SAVE CHANGES</button>
      </div>
    </BottomSheet>
  );
}
