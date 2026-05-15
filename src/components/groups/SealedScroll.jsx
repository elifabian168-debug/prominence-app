import { useEffect, useState } from "react";
import { ACCENT, BG, CARD, BORDER, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../../constants/theme";
import { GROUP_THEMES } from "../../constants/groupsData";
import GroupCrest from "./GroupCrest";

// ── SealedScroll ──
// A full-screen ceremonial modal used for sending or receiving group invitations.
//
// Modes:
//   "receive"  — invitee side. Shows "You have been summoned" + accept/decline.
//   "send"     — sender side. Shows preview + send/cancel.
//
// On accept: seal breaks + scroll flashes gold → onAccept().
// On decline: scroll burns away → onDecline().
// On send: brief seal stamp → onSend().
// On cancel: scroll fades → onCancel().
export default function SealedScroll({
  mode = "receive",      // "receive" | "send"
  groupName,
  motto,
  themeColor = "solar",
  crestSeed,
  fromName,
  toName,                // sender-side: friend's name for the inscription
  onAccept,
  onDecline,
  onSend,
  onCancel,
}) {
  const theme = GROUP_THEMES[themeColor] || GROUP_THEMES.solar;
  const [phase, setPhase] = useState("entering"); // entering → ready → accepting → declining → sending → closed
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 30);
    const t2 = setTimeout(() => setPhase("ready"), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleAccept = () => {
    if (phase !== "ready") return;
    setPhase("accepting");
    setTimeout(() => onAccept?.(), 900);
  };
  const handleDecline = () => {
    if (phase !== "ready") return;
    setPhase("declining");
    setTimeout(() => onDecline?.(), 600);
  };
  const handleSend = () => {
    if (phase !== "ready") return;
    setPhase("sending");
    setTimeout(() => onSend?.(), 600);
  };
  const handleCancel = () => {
    if (phase !== "ready") return;
    setPhase("declining");
    setTimeout(() => onCancel?.(), 500);
  };

  const isReceive = mode === "receive";
  const declining = phase === "declining";
  const accepting = phase === "accepting";
  const sending = phase === "sending";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: alpha(BG, "F2"),
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "fadeIn 0.4s ease",
        padding: "24px 20px",
        overflow: "hidden",
      }}
    >
      {/* Edge vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at center, transparent 35%, ${BG} 95%)`,
      }} />

      {/* Beam descend behind scroll */}
      <div style={{
        position: "absolute", top: 0, left: "50%",
        width: 2, height: "50%",
        background: `linear-gradient(to bottom, transparent, ${alpha(theme.color, "55")})`,
        filter: `drop-shadow(0 0 8px ${alpha(theme.color, "55")})`,
        animation: "beamDescend 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        pointerEvents: "none",
      }} />

      {/* Accept flash */}
      {accepting && (
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(circle at center, ${alpha(theme.color, "45")} 0%, transparent 60%)`,
          animation: "lvlFlash 0.9s ease-out forwards",
          pointerEvents: "none",
        }} />
      )}

      {/* Scroll body */}
      <div
        style={{
          position: "relative",
          width: "100%", maxWidth: 360,
          padding: "44px 28px 28px",
          borderRadius: 6,
          background: `linear-gradient(180deg, ${alpha(theme.color, "10")} 0%, ${CARD} 28%, ${CARD} 72%, ${alpha(theme.color, "10")} 100%)`,
          border: `1px solid ${alpha(theme.color, "40")}`,
          boxShadow: `0 24px 60px ${alpha("#000", "50")}, inset 0 1px 0 ${alpha(theme.color, "25")}, 0 0 40px ${alpha(theme.color, "20")}`,
          textAlign: "center",
          transformOrigin: "top center",
          transform: declining
            ? "scaleY(0.92) translateY(20px)"
            : show
              ? "scaleY(1) translateY(0)"
              : "scaleY(0) translateY(-40px)",
          opacity: declining ? 0 : show ? 1 : 0,
          filter: declining ? "blur(2px)" : "none",
          transition: declining
            ? "opacity 0.55s ease, transform 0.55s ease, filter 0.55s ease"
            : "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease",
        }}
      >
        {/* Edge curl ornaments */}
        <div style={{
          position: "absolute", top: 0, left: 12, right: 12, height: 1,
          background: `linear-gradient(90deg, transparent, ${alpha(theme.color, "55")}, transparent)`,
        }} />
        <div style={{
          position: "absolute", bottom: 0, left: 12, right: 12, height: 1,
          background: `linear-gradient(90deg, transparent, ${alpha(theme.color, "55")}, transparent)`,
        }} />

        {/* Wax seal — crest pressed into a circular medallion */}
        <div
          style={{
            position: "absolute", top: -36, left: "50%",
            transform: `translateX(-50%) ${accepting ? "rotate(-8deg)" : "rotate(0deg)"}`,
            width: 80, height: 80,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 30%, ${theme.accent} 0%, ${theme.color} 55%, ${alpha(theme.color, "70")} 100%)`,
            border: `2px solid ${alpha(theme.color, "70")}`,
            boxShadow: `0 6px 18px ${alpha("#000", "50")}, inset 0 2px 4px ${alpha("#fff", "30")}, 0 0 24px ${alpha(theme.color, "45")}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: accepting ? 0.55 : 1,
            transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease",
            animation: "scaleIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both",
          }}
        >
          <GroupCrest seed={crestSeed || groupName} themeColor={themeColor} size={56} />
        </div>

        {/* Inscription */}
        <div style={{ marginTop: 52 }}>
          {/* Top label */}
          <div style={{
            fontSize: 10, color: TEXT_DIM,
            letterSpacing: "0.36em", textTransform: "uppercase", fontWeight: 700,
            marginBottom: 18,
            animation: "fadeUp 0.6s ease 0.4s both",
          }}>
            {isReceive ? "You have been summoned" : "Summon to the order"}
          </div>

          {/* Group name */}
          <div style={{
            fontFamily: SERIF,
            fontSize: 38, fontWeight: 500,
            color: TEXT,
            letterSpacing: "0.02em",
            lineHeight: 1.1,
            marginBottom: 10,
            textShadow: `0 0 30px ${alpha(theme.color, "55")}`,
            animation: "fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.55s both",
          }}>
            {groupName}
          </div>

          {/* Motto */}
          {motto && (
            <div style={{
              fontFamily: SERIF,
              fontSize: 15, color: TEXT_MID,
              fontStyle: "italic",
              lineHeight: 1.4,
              marginBottom: 22,
              animation: "fadeUp 0.6s ease 0.75s both",
            }}>
              {motto}
            </div>
          )}

          {/* Sigil rule */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            marginBottom: 22,
            animation: "fadeIn 0.5s ease 0.9s both",
          }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: theme.color, boxShadow: `0 0 8px ${theme.color}` }} />
            <div style={{ width: 90, height: 1, background: `linear-gradient(90deg, transparent, ${theme.color}, transparent)` }} />
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: theme.color, boxShadow: `0 0 8px ${theme.color}` }} />
          </div>

          {/* Subline */}
          <div style={{
            fontSize: 11, color: TEXT_DIM,
            letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 600,
            marginBottom: 30,
            animation: "fadeIn 0.5s ease 1.05s both",
          }}>
            {isReceive
              ? <>Summoned by <span style={{ color: theme.color }}>{fromName}</span></>
              : toName
                ? <>To <span style={{ color: theme.color }}>{toName}</span></>
                : "Choose your invitee"}
          </div>

          {/* CTAs */}
          <div style={{
            display: "flex", gap: 10,
            animation: "fadeUp 0.5s ease 1.2s both",
          }}>
            {isReceive ? (
              <>
                <button
                  onClick={handleDecline}
                  style={{
                    flex: 1, padding: "14px",
                    background: "transparent",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 10,
                    color: TEXT_DIM,
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.22em", textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "color 0.2s ease, border-color 0.2s ease",
                  }}
                >
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  style={{
                    flex: 2, padding: "14px",
                    background: theme.color,
                    color: BG,
                    border: `1px solid ${theme.color}`,
                    borderRadius: 10,
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.22em", textTransform: "uppercase",
                    cursor: "pointer",
                    boxShadow: `0 0 24px ${alpha(theme.color, "40")}`,
                  }}
                >
                  Accept the Summons
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  style={{
                    flex: 1, padding: "14px",
                    background: "transparent",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 10,
                    color: TEXT_DIM,
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.22em", textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={!toName}
                  style={{
                    flex: 2, padding: "14px",
                    background: toName ? theme.color : "transparent",
                    color: toName ? BG : TEXT_DIM,
                    border: `1px solid ${toName ? theme.color : BORDER}`,
                    borderRadius: 10,
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.22em", textTransform: "uppercase",
                    cursor: toName ? "pointer" : "not-allowed",
                    opacity: toName ? 1 : 0.5,
                    boxShadow: toName ? `0 0 24px ${alpha(theme.color, "40")}` : "none",
                  }}
                >
                  Send Summons
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
