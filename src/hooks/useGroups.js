import { useCallback, useMemo } from "react";
import { MAX_GROUPS_PER_USER, GROUP_XP_AWARDS } from "../constants/groupsData";

// ── The migration boundary ──
// Today: reads/writes state.groups + state.groupInvites via setState.
// Tomorrow: swap internals to Firestore listeners + Cloud Function calls.
// Components consuming this hook never change.
export function useGroups(state, setState) {
  const groups = state.groups || [];
  const groupInvites = state.groupInvites || [];
  const canCreateMore = groups.length < MAX_GROUPS_PER_USER;

  // Lookup helpers
  const getGroup = useCallback(
    (groupId) => groups.find((g) => g.id === groupId),
    [groups]
  );

  // ── Create a new group (user becomes founder + first member)
  const createGroup = useCallback(
    ({ name, motto, themeColor }) => {
      if (!name?.trim()) return null;
      const id = `g_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const crestSeed = `${name.trim().toLowerCase().replace(/\s+/g, "-")}-${id}`;
      const next = {
        id,
        name: name.trim(),
        motto: motto?.trim() || "",
        themeColor: themeColor || "solar",
        crestSeed,
        founderId: "me",
        createdAt: Date.now(),
        memberIds: ["me"],
        pendingInvites: [],
        sharedQuests: [],
        groupXP: GROUP_XP_AWARDS.MEMBER_JOIN, // founder counts as the first join
        streakDays: 0,
        lastActivityDate: null,
      };
      setState((prev) => {
        const cur = prev.groups || [];
        if (cur.length >= MAX_GROUPS_PER_USER) return prev;
        return { ...prev, groups: [...cur, next] };
      });
      return next;
    },
    [setState]
  );

  // ── Invite a friend to a group (sender side of the seal)
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

  // ── Accept an inbound invite — move user into the group as a member
  const acceptInvite = useCallback(
    (groupId) => {
      setState((prev) => {
        const invite = (prev.groupInvites || []).find((i) => i.groupId === groupId);
        if (!invite) return prev;
        // Build a group record from the invite. The user becomes a member
        // of a freshly-known group (we don't have the founder's full member
        // list in mock data — that's fine for v1).
        const newGroup = {
          id: invite.groupId,
          name: invite.groupName,
          motto: invite.motto || "",
          themeColor: invite.themeColor || "solar",
          crestSeed: invite.crestSeed || invite.groupId,
          founderId: invite.fromId,
          createdAt: invite.invitedAt,
          memberIds: [invite.fromId, "me"],
          pendingInvites: [],
          sharedQuests: [],
          // The act of joining awards the group MEMBER_JOIN XP.
          // In a real Firestore world this would increment the existing
          // group's XP; in mock-data it's the starting balance of the
          // local copy.
          groupXP: GROUP_XP_AWARDS.MEMBER_JOIN,
          streakDays: 0,
          lastActivityDate: null,
        };
        const cur = prev.groups || [];
        if (cur.length >= MAX_GROUPS_PER_USER) {
          // Cap enforced — just remove the invite, don't add the group.
          return {
            ...prev,
            groupInvites: (prev.groupInvites || []).filter((i) => i.groupId !== groupId),
          };
        }
        return {
          ...prev,
          groups: [...cur, newGroup],
          groupInvites: (prev.groupInvites || []).filter((i) => i.groupId !== groupId),
        };
      });
    },
    [setState]
  );

  // ── Decline an inbound invite (scroll burns away)
  const declineInvite = useCallback(
    (groupId) => {
      setState((prev) => ({
        ...prev,
        groupInvites: (prev.groupInvites || []).filter((i) => i.groupId !== groupId),
      }));
    },
    [setState]
  );

  // ── Leave a group
  const leaveGroup = useCallback(
    (groupId) => {
      setState((prev) => ({
        ...prev,
        groups: (prev.groups || []).filter((g) => g.id !== groupId),
      }));
    },
    [setState]
  );

  // ── Create a shared quest within a group
  const createSharedQuest = useCallback(
    (groupId, { title, category, participantIds, xpReward, deadline }) => {
      if (!title?.trim()) return null;
      const quest = {
        id: `sq_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        title: title.trim(),
        category: category || "fitness",
        xpReward: xpReward || 150,
        participantIds: participantIds && participantIds.length ? participantIds : ["me"],
        contributedIds: [],
        deadline: deadline || Date.now() + 1000 * 60 * 60 * 24 * 7, // default: 1 week
        status: "active",
      };
      setState((prev) => ({
        ...prev,
        groups: (prev.groups || []).map((g) =>
          g.id === groupId ? { ...g, sharedQuests: [...g.sharedQuests, quest] } : g
        ),
      }));
      return quest;
    },
    [setState]
  );

  // ── Mark the current user's contribution to a shared quest.
  //
  // Group XP awarded:
  //   • SHARED_CONTRIBUTION per individual contribution
  //   • SHARED_COMPLETION + quest.xpReward bonus when all members have contributed
  //
  // The user does NOT get personal XP from shared quests — those XP awards
  // belong to the order, not the individual. (This is intentional per the
  // group XP rules: only shared quests, member join, and streaks contribute.)
  const markContributed = useCallback(
    (groupId, questId) => {
      setState((prev) => {
        const group = (prev.groups || []).find((g) => g.id === groupId);
        if (!group) return prev;
        const quest = group.sharedQuests.find((q) => q.id === questId);
        if (!quest || quest.status !== "active") return prev;
        if (quest.contributedIds.includes("me")) return prev;
        const nextContributed = [...quest.contributedIds, "me"];
        const allDone = quest.participantIds.every((id) => nextContributed.includes(id));

        const groupXPDelta =
          GROUP_XP_AWARDS.SHARED_CONTRIBUTION +
          (allDone ? GROUP_XP_AWARDS.SHARED_COMPLETION + (quest.xpReward || 0) : 0);

        const nextGroups = (prev.groups || []).map((g) =>
          g.id !== groupId
            ? g
            : {
                ...g,
                groupXP: (g.groupXP || 0) + groupXPDelta,
                sharedQuests: g.sharedQuests.map((q) =>
                  q.id !== questId
                    ? q
                    : { ...q, contributedIds: nextContributed, status: allDone ? "complete" : "active" }
                ),
              }
        );
        return { ...prev, groups: nextGroups };
      });
    },
    [setState]
  );

  return useMemo(
    () => ({
      groups,
      groupInvites,
      canCreateMore,
      getGroup,
      createGroup,
      inviteFriend,
      cancelInvite,
      acceptInvite,
      declineInvite,
      leaveGroup,
      createSharedQuest,
      markContributed,
    }),
    [
      groups,
      groupInvites,
      canCreateMore,
      getGroup,
      createGroup,
      inviteFriend,
      cancelInvite,
      acceptInvite,
      declineInvite,
      leaveGroup,
      createSharedQuest,
      markContributed,
    ]
  );
}
