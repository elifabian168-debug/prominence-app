// Returns the VAPID public key so the client can subscribe to push.
// The private key stays on the server and is used only when sending pushes.
export default function handler(req, res) {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    return res.status(500).json({ error: "VAPID_PUBLIC_KEY not configured" });
  }
  res.status(200).json({ key });
}
