// Stores a push subscription in Upstash Redis under a key derived from its endpoint.
// Endpoint URLs are stable per-device, so storing by endpoint tail dedupes
// repeat subscribes from the same browser.
import { redis } from "./_lib/redis.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const sub = req.body;
  if (!sub || !sub.endpoint) {
    return res.status(400).json({ error: "Missing subscription" });
  }
  try {
    const key = `sub:${sub.endpoint.slice(-24)}`;
    await redis.set(key, sub);
    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
