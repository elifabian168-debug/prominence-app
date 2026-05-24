import { useCallback, useEffect, useMemo, useRef } from "react";

// ── The migration boundary ──
// Today: reads/writes state.groups + state.groupInvites via setState.
// Tomorrow: swap internals to Firestore listeners + Cloud Function calls.
// Components consuming this hook never change.
// Mock-only: pending outbound invites auto-resolve (the friend "accepts")
// this many ms after they're sent. Keeps the mutual-Circle flow feeling
// alive without a real backend. Disable with VITE_MOCK_INVITE_ACCEPT="false".
const MOCK_INVITE_ACCEPT_MS = 6000;

export function useGroups(state, setState, { onInviteAccepted } = {}) {
  const groups = state.groups || [];
  const groupInvites = state.groupInvites || [];

  // Lookup helpers
  const getGroup = useCallback(
    (groupId) => groups.find((g) => g.id === groupId),
    [groups]
  );

  // ── Create a new Circle (user becomes founder + first member)
  // audienceMode is locked at creation:
  //   'private' (default) — Circle name is creator-only. Members see only
  //     co-recipient avatars on posts shared to this Circle.
  //   'shared' — Circle name is visible to all members.
  const createGroup = useCallback(
    ({ name, themeColor, audienceMode }) => {
      if (!name?.trim()) return null;
      const id = `g_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const crestSeed = `${name.trim().toLowerCase().replace(/\s+/g, "-")}-${id}`;
      const now = Date.now();
      const next = {
        id,
        name: name.trim(),
        themeColor: themeColor || "solar",
        audienceMode: audienceMode === "shared" ? "shared" : "private",
        crestSeed,
        founderId: "me",
        createdAt: now,
        memberIds: ["me"],
        pendingInvites: [],
        streakDays: 0,
        lastStreakDay: null,
      };
      setState((prev) => ({ ...prev, groups: [...(prev.groups || []), next] }));
      return next;
    },
    [setState]
  );

  // ── Invite a friend to a Circle
  const inviteFriend = useCallback(
    (groupId, friendId) => {
      setState((prev) => ({
        ...prev,
        groups: (prev.groups || []).map((g) => {
          if (g.id !== groupId) return g;
          if (g.memberIds.includes(friendId)) return g;
          if (g.pendingInvites.some((i) => i.friendId === friendId)) return g;
          return {
            ...g,
            pendingInvites: [
              ...g.pendingInvites,
              { friendId, invitedBy: "me", invitedAt: Date.now() },
            ],
          };
        }),
      }));
    },
    [setState]
  );

  // ── Cancel a sent invite
  const cancelInvite = useCallback(
    (groupId, friendId) => {
      setState((prev) => ({
        ...prev,
        groups: (prev.groups || []).map((g) =>
          g.id === groupId
            ? { ...g, pendingInvites: g.pendingInvites.filter((i) => i.friendId !== friendId) }
            : g
        ),
      }));
    },
    [setState]
  );

  // ── Accept an inbound invite — move user into the Circle as a member.
  // Returns the new Circle object on success, or null if the invite is gone.
  const acceptInvite = useCallback(
    (groupId) => {
      const invite = (state.groupInvites || []).find((i) => i.groupId === groupId);
      if (!invite) return null;
      const newGroup = {
        id: invite.groupId,
        name: invite.groupName,
        themeColor: invite.themeColor || "solar",
        audienceMode: invite.audienceMode === "shared" ? "shared" : "private",
        crestSeed: invite.crestSeed || invite.groupId,
        founderId: invite.fromId,
        createdAt: invite.invitedAt,
        memberIds: [invite.fromId, "me"],
        pendingInvites: [],
        streakDays: 0,
        lastStreakDay: null,
      };
      setState((prev) => {
        // Guard against double-invocation (StrictMode) — don't push duplicate
        // Circles with the same id.
        const already = (prev.groups || []).some((g) => g.id === newGroup.id);
        return {
          ...prev,
          groups: already ? prev.groups : [...(prev.groups || []), newGroup],
          groupInvites: (prev.groupInvites || []).filter((i) => i.groupId !== groupId),
        };
      });
      return newGroup;
    },
    [state.groupInvites, setState]
  );

  // ── Decline an inbound invite
  const declineInvite = useCallback(
    (groupId) => {
      setState((prev) => ({
        ...prev,
        groupInvites: (prev.groupInvites || []).filter((i) => i.groupId !== groupId),
      }));
    },
    [setState]
  );

  // ── Leave a Circle
  const leaveGroup = useCallback(
    (groupId) => {
      setState((prev) => ({
        ...prev,
        groups: (prev.groups || []).filter((g) => g.id !== groupId),
      }));
    },
    [setState]
  );

  // Auto-resolve outbound pending invites after a short delay so the mock
  // mutual-Circle flow feels real. Each pending invite gets a scheduled
  // timer keyed by `${groupId}:${friendId}`; timers are cleared if the
  // invite is cancelled before resolving (since the pending entry vanishes).
  const timersRef = useRef(new Map());
  useEffect(() => {
    if (import.meta.env.VITE_MOCK_INVITE_ACCEPT === "false") return;
    const timers = timersRef.current;
    // Identify pending invites that aren't already scheduled.
    const seen = new Set();
    for (const g of groups) {
      for (const inv of g.pendingInvites || []) {
        const key = `${g.id}:${inv.friendId}`;
        seen.add(key);
        if (timers.has(key)) continue;
        const t = setTimeout(() => {
          timers.delete(key);
          setState((prev) => {
            const friend = (prev.friends || []).find((f) => f.id === inv.friendId);
            const nextGroups = (prev.groups || []).map((grp) => {
              if (grp.id !== g.id) return grp;
              // Still pending? promote → member.
              const stillPending = (grp.pendingInvites || []).some((i) => i.friendId === inv.friendId);
              if (!stillPending) return grp;
              if (grp.memberIds.includes(inv.friendId)) return grp;
              return {
                ...grp,
                memberIds: [...grp.memberIds, inv.friendId],
                pendingInvites: grp.pendingInvites.filter((i) => i.friendId !== inv.friendId),
              };
            });
            if (friend && onInviteAccepted) {
              // Fire after commit via microtask so showToast lands in the
              // next event loop, not inside the reducer.
              queueMicrotask(() => onInviteAccepted(friend, g));
            }
            return { ...prev, groups: nextGroups };
          });
        }, MOCK_INVITE_ACCEPT_MS);
        timers.set(key, t);
      }
    }
    // Cancel timers for invites that no longer exist (cancelled/removed).
    for (const key of Array.from(timers.keys())) {
      if (!seen.has(key)) {
        clearTimeout(timers.get(key));
        timers.delete(key);
      }
    }
    return undefined;
  }, [groups, setState, onInviteAccepted]);
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const t of timers.values()) clearTimeout(t);
      timers.clear();
    };
  }, []);

  return useMemo(
    () => ({
      groups,
      groupInvites,
      getGroup,
      createGroup,
      inviteFriend,
      cancelInvite,
      acceptInvite,
      declineInvite,
      leaveGroup,
    }),
    [
      groups,
      groupInvites,
      getGroup,
      createGroup,
      inviteFriend,
      cancelInvite,
      acceptInvite,
      declineInvite,
      leaveGroup,
    ]
  );
}
