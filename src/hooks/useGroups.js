import { useCallback, useMemo } from "react";
import { GROUP_XP_AWARDS, FEED_EVENT_TYPES } from "../constants/groupsData";

// ── The migration boundary ──
// Today: reads/writes state.groups + state.groupInvites via setState.
// Tomorrow: swap internals to Firestore listeners + Cloud Function calls.
// Components consuming this hook never change.
export function useGroups(state, setState) {
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
    ({ name, motto, themeColor, audienceMode }) => {
      if (!name?.trim()) return null;
      const id = `g_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const crestSeed = `${name.trim().toLowerCase().replace(/\s+/g, "-")}-${id}`;
      const now = Date.now();
      const next = {
        id,
        name: name.trim(),
        motto: motto?.trim() || "",
        themeColor: themeColor || "solar",
        audienceMode: audienceMode === "shared" ? "shared" : "private",
        crestSeed,
        founderId: "me",
        createdAt: now,
        memberIds: ["me"],
        pendingInvites: [],
        groupXP: GROUP_XP_AWARDS.MEMBER_JOIN, // founder counts as the first join
        streakDays: 0,
        lastActivityDate: null,
        activityFeed: [
          {
            id: now,
            type: FEED_EVENT_TYPES.FOUNDED,
            actorId: "me",
            timestamp: now,
            payload: { memberId: "me", memberName: "You", groupName: name.trim() },
          },
        ],
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
      const now = Date.now();
      const newGroup = {
        id: invite.groupId,
        name: invite.groupName,
        motto: invite.motto || "",
        themeColor: invite.themeColor || "solar",
        audienceMode: invite.audienceMode === "shared" ? "shared" : "private",
        crestSeed: invite.crestSeed || invite.groupId,
        founderId: invite.fromId,
        createdAt: invite.invitedAt,
        memberIds: [invite.fromId, "me"],
        pendingInvites: [],
        groupXP: GROUP_XP_AWARDS.MEMBER_JOIN,
        streakDays: 0,
        lastActivityDate: null,
        activityFeed: [
          {
            id: now,
            type: FEED_EVENT_TYPES.MEMBER_JOIN,
            actorId: "me",
            timestamp: now,
            xpDelta: GROUP_XP_AWARDS.MEMBER_JOIN,
            payload: { memberId: "me", memberName: "You" },
          },
        ],
      };
      setState((prev) => ({
        ...prev,
        groups: [...(prev.groups || []), newGroup],
        groupInvites: (prev.groupInvites || []).filter((i) => i.groupId !== groupId),
      }));
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
