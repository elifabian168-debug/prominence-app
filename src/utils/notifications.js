// Browser notification + Web Push helpers.
// - `fireLocalNotification` shows an immediate in-app notification (used for
//   cheers/level-ups). Works as long as the browser is open.
// - `requestPermission` + `subscribeToPush` + `saveSubscriptionToFirestore`
//   form the chain that registers a device with Firestore so the Vercel cron
//   jobs can send scheduled pushes (daily reminder, streak-at-risk).
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db, SUBSCRIPTIONS_COLLECTION, subscriptionDocId } from "./firebase";

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
  return await Notification.requestPermission();
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

// PushSubscription objects don't serialize cleanly (they have getters and
// methods), so round-trip through JSON to get a plain object Firestore accepts.
function subscriptionToPlain(sub) {
  return JSON.parse(JSON.stringify(sub));
}

export async function saveSubscriptionToFirestore(subscription) {
  const id = subscriptionDocId(subscription.endpoint);
  await setDoc(doc(db, SUBSCRIPTIONS_COLLECTION, id), {
    ...subscriptionToPlain(subscription),
    createdAt: serverTimestamp(),
    userAgent: navigator.userAgent.slice(0, 200),
  });
  return true;
}

export async function unsubscribeFromPush() {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  try {
    const id = subscriptionDocId(sub.endpoint);
    await deleteDoc(doc(db, SUBSCRIPTIONS_COLLECTION, id));
  } catch {
    // Don't block local unsubscribe on a Firestore failure
  }
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
