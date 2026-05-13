// Browser notification + Web Push helpers.
// - `fireLocalNotification` shows an immediate notification (used for in-app
//   events like cheers/level-ups). Works as long as the browser is open.
// - `requestPermission` + `subscribeToPush` + `sendSubscriptionToServer` form
//   the chain that registers a user with the Vercel push API for scheduled
//   re-engagement pushes (daily reminder, streak-at-risk).

export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function pushSupported() {
  return notificationsSupported() && "serviceWorker" in navigator && "PushManager" in window;
}

export function permissionState() {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission; // "default" | "granted" | "denied"
}

export async function requestPermission() {
  if (!notificationsSupported()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  return result;
}

export function fireLocalNotification(title, body, options = {}) {
  if (!notificationsSupported()) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: options.tag || "prominence-local",
      ...options,
    });
  } catch {
    // Some platforms (iOS Safari) require notifications go through the SW;
    // fail silently — the in-app notification center still shows the event.
  }
}

// Converts a base64 VAPID public key into the Uint8Array PushManager expects.
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export async function subscribeToPush() {
  if (!pushSupported()) throw new Error("Push not supported");
  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;

  const res = await fetch("/api/vapid-key");
  if (!res.ok) throw new Error("Failed to fetch VAPID key");
  const { key } = await res.json();
  if (!key) throw new Error("No VAPID key configured");

  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key),
  });
}

export async function sendSubscriptionToServer(subscription) {
  const res = await fetch("/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });
  return res.ok;
}

export async function unsubscribeFromPush() {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  await fetch("/api/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  }).catch(() => {});
  await sub.unsubscribe();
}

export async function isCurrentlySubscribed() {
  if (!pushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
}
