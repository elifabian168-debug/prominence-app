// Client-side Firebase initialization. The web SDK config below is public by
// design — Firebase API keys aren't secrets; security is enforced via
// Firestore Security Rules in the Firebase Console.
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, collection, query as fsQuery, where, getDocs, limit } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD5Y1TtKTRngjNTorkfMWWlFU8APj5s69I",
  authDomain: "promience-5a166.firebaseapp.com",
  projectId: "promience-5a166",
  storageBucket: "promience-5a166.firebasestorage.app",
  messagingSenderId: "557967885167",
  appId: "1:557967885167:web:b8d3f40e3e013d9f69de9a",
  measurementId: "G-KZQ5BWK4J9",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const SUBSCRIPTIONS_COLLECTION = "push_subscriptions";

export async function checkUsernameAvailable(username) {
  const snap = await getDoc(doc(db, "usernames", username));
  return !snap.exists();
}

export async function saveUserProfile({ uid, name, username, email }) {
  await Promise.all([
    setDoc(doc(db, "users", uid), {
      uid, name, username, email,
      nameLower: name.trim().toLowerCase(),
      onboardingComplete: true,
      createdAt: Date.now(),
    }),
    setDoc(doc(db, "usernames", username), { uid }),
  ]);
}

// Prefix-search users by @username or display name.
// Returns up to 10 results, excluding the caller's own uid.
export async function searchUsers(rawQuery, currentUid) {
  const q = rawQuery.toLowerCase().trim().replace(/^@/, "");
  if (q.length < 2) return [];

  const usersRef = collection(db, "users");

  // Run username-prefix and name-prefix queries in parallel
  const [byUsername, byName] = await Promise.all([
    getDocs(fsQuery(usersRef, where("username", ">=", q), where("username", "<=", q + ""), limit(10))),
    getDocs(fsQuery(usersRef, where("nameLower", ">=", q), where("nameLower", "<=", q + ""), limit(10))),
  ]);

  const seen = new Set();
  const results = [];
  for (const snap of [byUsername, byName]) {
    for (const d of snap.docs) {
      const data = d.data();
      if (data.uid === currentUid || seen.has(data.uid)) continue;
      seen.add(data.uid);
      results.push(data);
    }
  }
  return results.slice(0, 10);
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// Derive a Firestore-safe document ID from a push subscription endpoint.
// Firestore doc IDs can't contain `/`, so swap those (and `=`) for `_`.
export function subscriptionDocId(endpoint) {
  return endpoint.slice(-40).replace(/[\/=]/g, "_");
}
