# Auth + Real Friend System — Design Spec

> Status: **Designed, not built.** Park until ready to implement.  
> Decision: Cloud Functions over callable endpoints (easier to add rate limiting, server-side validation, and scale later).

---

## Auth

- **Providers**: Google one-tap + Apple Sign-In via Firebase Auth
- **Flow**: Sign-in → claim username → land in app
- **Username**: chosen at onboarding, stored in `usernames/{username}` (doc ID = username, value = uid) for uniqueness enforcement

### Firestore: `users/{uid}`
```
{
  uid: string,
  username: string,           // unique, lowercase, 3-20 chars
  displayName: string,
  photoURL: string,
  createdAt: timestamp,
  friends: string[],          // array of uids for quick lookup
}
```

### Firestore: `users/{uid}/friends/{friendUid}`
```
{
  uid: string,
  username: string,
  displayName: string,
  photoURL: string,
  addedAt: timestamp,
}
```
Denormalized subcollection — mirrors the friend's user doc snapshot at add time. Update on profile changes.

### Firestore: `friendRequests/{requestId}`
```
{
  fromUid: string,
  toUid: string,
  status: "pending" | "accepted" | "rejected",
  createdAt: timestamp,
}
```
Mutual model: both sides must accept. No one-sided following.

---

## Cloud Functions

### `claimUsername(username)`
- Validates: 3–20 chars, alphanumeric + underscores, not taken
- Writes `usernames/{username}` + updates `users/{uid}.username`
- Returns: `{ ok: true }` or `{ error: "taken" | "invalid" }`

### `sendFriendRequest(toUid)`
- Guards: not already friends, no existing pending request
- Creates `friendRequests/{id}` with `status: "pending"`
- Triggers push notification to `toUid`

### `acceptFriendRequest(requestId)`
- Sets request status → "accepted"
- Writes `users/{myUid}/friends/{fromUid}` + `users/{fromUid}/friends/{myUid}` (both sides)
- Appends each uid to the other's `friends[]` array

### `rejectFriendRequest(requestId)`
- Sets request status → "rejected"
- No writes to friend subcollections

---

## Friend Discovery (v1 options, pick one or combine)

1. **Username search** — type exact username, send request
2. **Invite link** — deep link `prominence.app/add/{username}` opens app to that profile
3. **Contacts sync** — hash phone numbers, match against users who also opted in (privacy-safe)

---

## Migration path from current mock state

Current app uses local `state.friends[]` array with mock data. When building:
1. Keep mock friends in dev (feature-flagged)
2. Add Firebase Auth wrapper around app root
3. Replace `state.friends` reads with Firestore listener on `users/{uid}/friends`
4. Wire friend request UI into existing `AddFriendsScreen.jsx`

---

## Switching cost from current to Cloud Functions

Low. Cloud Functions live entirely server-side — client code just calls `httpsCallable(functions, "functionName")(args)`. The Firestore data model is the same whether using callable endpoints or Cloud Functions. No refactor of existing screens needed.
