// Cron-triggered at 11pm every day (see vercel.json).
// Final warning: streak is at risk if no quest completed today.
import webpush from "web-push";
import { adminDb, SUBSCRIPTIONS_COLLECTION } from "../_lib/firebase-admin.js";

const MESSAGES = [
  { title: "Your streak is on the line", body: "One quest before midnight keeps the fire alive." },
  { title: "Streak at risk", body: "60 minutes left. Complete a single quest to stay alive." },
  { title: "Don't break the chain", body: "One quick win and your streak survives the night." },
];

export default async function handler(req, res) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return res.status(500).json({ error: "VAPID keys not configured" });
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:noreply@prominence.app",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );

  try {
    const snapshot = await adminDb.collection(SUBSCRIPTIONS_COLLECTION).get();
    const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    const payload = JSON.stringify({ ...message, tag: "prominence-streak", url: "/" });

    const results = await Promise.allSettled(snapshot.docs.map(async (docSnap) => {
      const sub = docSnap.data();
      try {
        await webpush.sendNotification(sub, payload);
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await docSnap.ref.delete();
        }
        throw err;
      }
    }));

    const sent = results.filter(r => r.status === "fulfilled").length;
    const failed = results.length - sent;
    res.status(200).json({ sent, failed, total: snapshot.size });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
