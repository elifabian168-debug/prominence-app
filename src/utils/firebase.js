// Client-side Firebase initialization. The web SDK config below is public by
// design — Firebase API keys aren't secrets; security is enforced via
// Firestore Security Rules in the Firebase Console.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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

export const SUBSCRIPTIONS_COLLECTION = "push_subscriptions";

// Derive a Firestore-safe document ID from a push subscription endpoint.
// Firestore doc IDs can't contain `/`, so swap those (and `=`) for `_`.
export function subscriptionDocId(endpoint) {
  return endpoint.slice(-40).replace(/[\/=]/g, "_");
}
