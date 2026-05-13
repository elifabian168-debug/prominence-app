// Server-side Firebase Admin init for Vercel cron jobs.
// Requires three env vars set in Vercel:
//   FIREBASE_PROJECT_ID
//   FIREBASE_CLIENT_EMAIL
//   FIREBASE_PRIVATE_KEY     (paste the full key; \n in the value is normalized)
// Get these from Firebase Console → Project Settings → Service Accounts →
// "Generate new private key" → open the downloaded JSON.
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminDb = getFirestore();
export const SUBSCRIPTIONS_COLLECTION = "push_subscriptions";
