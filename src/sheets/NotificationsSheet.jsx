import { useEffect, useState } from "react";
import { X, Bell, BellOff, Check, Loader2 } from "lucide-react";
import { ACCENT, CARD, BORDER, TEXT, TEXT_DIM, TEXT_MID, alpha } from "../constants/theme";
import BottomSheet from "../components/ui/BottomSheet";
import {
  permissionState,
  requestPermission,
  subscribeToPush,
  saveSubscriptionToFirestore,
  unsubscribeFromPush,
  isCurrentlySubscribed,
  notificationsSupported,
} from "../utils/notifications";

const NOTIF_ITEMS = [
  { key: "dailyReminder",   label: "Daily reminder",  desc: "A nudge each morning to plan your day" },
  { key: "streakAtRisk",    label: "Streak at risk",  desc: "Warning at 11pm if you haven't completed a quest" },
  { key: "friendActivity",  label: "Friend activity", desc: "Cheers, nudges, and shared streak alerts" },
  { key: "levelUp",         label: "Level up",        desc: "Celebrate when you reach a new level" },
  { key: "monthlyComplete", label: "Monthly quest",   desc: "Notify when a monthly line is finished" },
];

const GREEN = "#6EE7B7";

export default function NotificationsSheet({ open, prefs, onClose, onToggle }) {
  const [permission, setPermission] = useState(() => permissionState());
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setPermission(permissionState());
    isCurrentlySubscribed().then(setSubscribed);
  }, [open]);

  const handleEnable = async () => {
    setBusy(true); setError(null);
    try {
      const result = await requestPermission();
      setPermission(result);
      if (result !== "granted") {
        setBusy(false);
        return;
      }
      const sub = await subscribeToPush();
      await saveSubscriptionToFirestore(sub);
      setSubscribed(true);
    } catch (e) {
      setError(e.message || "Couldn't enable push notifications");
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    setBusy(true); setError(null);
    try {
      await unsubscribeFromPush();
      setSubscribed(false);
    } catch (e) {
      setError(e.message || "Couldn't disable push notifications");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <BottomSheet onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 14px" }}>
        <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.22em", textTransform: "uppercase" }}>Notifications</div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: CARD, border: `1px solid ${BORDER}`, color: TEXT_MID, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={14} />
        </button>
      </div>

      {/* ── Permission / subscription status ──────────────────────────────── */}
      <div style={{ padding: "0 20px 16px" }}>
        <PermissionRow
          permission={permission}
          subscribed={subscribed}
          busy={busy}
          error={error}
          onEnable={handleEnable}
          onDisable={handleDisable}
        />
      </div>

      <div style={{ padding: "0 20px 8px", fontSize: 10, color: TEXT_DIM, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>
        Types
      </div>

      <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
        {NOTIF_ITEMS.map(item => {
          const on = !!prefs[item.key];
          return (
            <button key={item.key} onClick={() => onToggle(item.key)} style={{
              background: CARD, border: `1px solid ${on ? alpha(ACCENT, "40") : BORDER}`,
              borderRadius: 12, padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 12,
              cursor: "pointer", textAlign: "left", transition: "border-color 0.2s",
              fontFamily: "inherit",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: TEXT, marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: TEXT_DIM, lineHeight: 1.4 }}>{item.desc}</div>
              </div>
              <div style={{ width: 36, height: 20, borderRadius: 10, background: on ? ACCENT : BORDER, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: 8, background: "#fff", transition: "left 0.2s" }} />
              </div>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}

function PermissionRow({ permission, subscribed, busy, error, onEnable, onDisable }) {
  if (!notificationsSupported()) {
    return (
      <Status
        icon={<BellOff size={16} color={TEXT_MID} />}
        accent={TEXT_DIM}
        title="Not supported"
        body="This browser doesn't support web push notifications."
      />
    );
  }

  if (permission === "denied") {
    return (
      <Status
        icon={<BellOff size={16} color={TEXT_MID} />}
        accent={TEXT_DIM}
        title="Blocked"
        body="Notifications are blocked in your browser settings. Unblock them to receive daily reminders."
      />
    );
  }

  if (permission === "granted" && subscribed) {
    return (
      <Status
        icon={<Check size={16} color={GREEN} />}
        accent={GREEN}
        title="Notifications active"
        body="You'll get reminders even when the app is closed."
        action={busy ? "..." : "Turn off"}
        onAction={onDisable}
        actionDisabled={busy}
      />
    );
  }

  return (
    <Status
      icon={busy
        ? <Loader2 size={16} color={ACCENT} style={{ animation: "spin 1s linear infinite" }} />
        : <Bell size={16} color={ACCENT} />}
      accent={ACCENT}
      title="Enable notifications"
      body={error || "Get daily reminders and friend activity even when the app is closed."}
      action={busy ? "Enabling..." : "Enable"}
      onAction={onEnable}
      actionDisabled={busy}
    />
  );
}

function Status({ icon, accent, title, body, action, onAction, actionDisabled }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${alpha(accent, "10")}, ${CARD})`,
      border: `1px solid ${alpha(accent, "32")}`,
      borderRadius: 12, padding: "14px",
      display: "flex", alignItems: "flex-start", gap: 12,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
        background: alpha(accent, "15"),
        border: `1px solid ${alpha(accent, "30")}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: accent, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ fontSize: 11, color: TEXT_DIM, lineHeight: 1.5 }}>{body}</div>
      </div>
      {action && (
        <button
          onClick={onAction}
          disabled={actionDisabled}
          style={{
            background: alpha(accent, "18"),
            border: `1px solid ${alpha(accent, "40")}`,
            color: accent,
            padding: "8px 12px", borderRadius: 9,
            fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: actionDisabled ? "default" : "pointer",
            opacity: actionDisabled ? 0.6 : 1,
            flexShrink: 0, fontFamily: "inherit",
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}
