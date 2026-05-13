import { redis } from "./_lib/redis.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { endpoint } = req.body || {};
  if (!endpoint) return res.status(400).json({ error: "Missing endpoint" });
  try {
    await redis.del(`sub:${endpoint.slice(-24)}`);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
