// Cron-triggered at 7pm every day (see vercel.json).
// Sends a "don't forget your quests" push to every stored subscription.
// Stale subscriptions (404/410) are auto-removed.
import webpush from "web-push";
import { redis } from "../_lib/redis.js";

const MESSAGES = [
  { title: "Prominence", body: "Don't let today pass without leveling up. Open your quests." },
  { title: "Your quests are waiting", body: "A small step today keeps the streak alive." },
  { title: "Today is unfinished", body: "Check your daily quests before the day slips by." },
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
    const keys = await redis.keys("sub:*");
    const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    const payload = JSON.stringify({ ...message, tag: "prominence-daily", url: "/" });

    const results = await Promise.allSettled(keys.map(async (k) => {
      const sub = await redis.get(k);
      if (!sub) return;
      try {
        await webpush.sendNotification(sub, payload);
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await redis.del(k);
        }
        throw err;
      }
    }));

    const sent = results.filter(r => r.status === "fulfilled").length;
    const failed = results.length - sent;
    res.status(200).json({ sent, failed, total: keys.length });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
