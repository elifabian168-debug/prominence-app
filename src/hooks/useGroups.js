import { useCallback, useEffect, useMemo } from "react";
import {
  MAX_GROUPS_PER_USER,
  GROUP_XP_AWARDS,
  FEED_EVENT_TYPES,
  pushFeedEvent,
  getGroupLevelFromXP,
} from "../constants/groupsData";

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
      const now = Date.now();
      const next = {
        id,
        name: name.trim(),
        motto: motto?.trim() || "",
        themeColor: themeColor || "solar",
        crestSeed,
        founderId: "me",
        createdAt: now,
        memberIds: ["me"],
        pendingInvites: [],
        sharedQuests: [],
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

  // ── Accept an inbound invite — move user into the group as a member.
  // Returns the new group object on success, or null if the invite is gone
  // or the user is at the group cap. Returning lets callers navigate to
  // the newly-joined group without waiting for state to propagate.
  const acceptInvite = useCallback(
    (groupId) => {
      const invite = (state.groupInvites || []).find((i) => i.groupId === groupId);
      if (!invite) return null;
      if ((state.groups || []).length >= MAX_GROUPS_PER_USER) {
        // Cap enforced — still consume the invite so it doesn't linger.
        setState((prev) => ({
          ...prev,
          groupInvites: (prev.groupInvites || []).filter((i) => i.groupId !== groupId),
        }));
        return null;
      }
      const now = Date.now();
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
    [state.groups, state.groupInvites, setState]
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
      const now = Date.now();
      const quest = {
        id: `sq_${now}_${Math.floor(Math.random() * 1000)}`,
        title: title.trim(),
        category: category || "fitness",
        xpReward: xpReward || 150,
        participantIds: participantIds && participantIds.length ? participantIds : ["me"],
        contributedIds: [],
        deadline: deadline || now + 1000 * 60 * 60 * 24 * 7,
        status: "active",
      };
      setState((prev) => ({
        ...prev,
        groups: (prev.groups || []).map((g) => {
          if (g.id !== groupId) return g;
          let updated = { ...g, sharedQuests: [...g.sharedQuests, quest] };
          updated = pushFeedEvent(updated, {
            id: now + Math.random(),
            type: FEED_EVENT_TYPES.QUEST_CREATED,
            actorId: "me",
            timestamp: now,
            payload: { questId: quest.id, questTitle: quest.title, category: quest.category },
          });
          return updated;
        }),
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

        const contribXP = GROUP_XP_AWARDS.SHARED_CONTRIBUTION;
        const completeXP = allDone
          ? GROUP_XP_AWARDS.SHARED_COMPLETION + (quest.xpReward || 0)
          : 0;
        const groupXPDelta = contribXP + completeXP;
        const now = Date.now();

        const nextGroups = (prev.groups || []).map((g) => {
          if (g.id !== groupId) return g;
          const oldXP = g.groupXP || 0;
          const newXP = oldXP + groupXPDelta;
          const oldLevel = getGroupLevelFromXP(oldXP).level;
          const newLevel = getGroupLevelFromXP(newXP).level;

          let updated = {
            ...g,
            groupXP: newXP,
            sharedQuests: g.sharedQuests.map((q) =>
              q.id !== questId
                ? q
                : { ...q, contributedIds: nextContributed, status: allDone ? "complete" : "active" }
            ),
          };

          updated = pushFeedEvent(updated, {
            id: now + Math.random(),
            type: FEED_EVENT_TYPES.CONTRIBUTION,
            actorId: "me",
            timestamp: now,
            xpDelta: contribXP,
            payload: { questId, questTitle: quest.title },
          });

          if (allDone) {
            updated = pushFeedEvent(updated, {
              id: now + 1 + Math.random(),
              type: FEED_EVENT_TYPES.QUEST_COMPLETE,
              actorId: "me",
              timestamp: now + 1,
              xpDelta: completeXP,
              payload: { questId, questTitle: quest.title, baseReward: quest.xpReward || 0 },
            });
          }

          for (let lv = oldLevel + 1; lv <= newLevel; lv++) {
            updated = pushFeedEvent(updated, {
              id: now + 100 + lv + Math.random(),
              type: FEED_EVENT_TYPES.LEVEL_UP,
              timestamp: now + 2,
              payload: { newLevel: lv },
            });
          }
          return updated;
        });
        return { ...prev, groups: nextGroups };
      });
    },
    [setState]
  );

  // ── Mock-only simulator: other members occasionally contribute to active
  // shared quests so the activity feed feels lived-in. Gated by the
  // VITE_MOCK_ORDER_ACTIVITY env flag so it can be disabled when Firestore
  // lands. Mirrors the friend-activity simulator pattern in useFriends.
  useEffect(() => {
    if (import.meta.env.VITE_MOCK_ORDER_ACTIVITY === "false") return;
    const scheduleNext = () => {
      const delay = (8 + Math.random() * 12) * 60 * 1000;
      return setTimeout(() => {
        setState((prev) => {
          const myGroups = (prev.groups || []).filter((g) => g.memberIds?.includes("me"));
          if (myGroups.length === 0) return prev;

          // Find (group, quest, member) candidates where a non-user member
          // hasn't yet contributed to an active shared quest.
          const candidates = [];
          for (const g of myGroups) {
            for (const q of g.sharedQuests || []) {
              if (q.status !== "active") continue;
              for (const mid of q.participantIds) {
                if (mid === "me") continue;
                if (q.contributedIds.includes(mid)) continue;
                candidates.push({ groupId: g.id, questId: q.id, memberId: mid });
              }
            }
          }
          if (candidates.length === 0) return prev;
          const pick = candidates[Math.floor(Math.random() * candidates.length)];
          const now = Date.now();

          const nextGroups = prev.groups.map((g) => {
            if (g.id !== pick.groupId) return g;
            const q = g.sharedQuests.find((x) => x.id === pick.questId);
            if (!q) return g;
            const nextContributed = [...q.contributedIds, pick.memberId];
            const allDone = q.participantIds.every((id) => nextContributed.includes(id));
            const contribXP = GROUP_XP_AWARDS.SHARED_CONTRIBUTION;
            const completeXP = allDone
              ? GROUP_XP_AWARDS.SHARED_COMPLETION + (q.xpReward || 0)
              : 0;
            const oldXP = g.groupXP || 0;
            const newXP = oldXP + contribXP + completeXP;
            const oldLevel = getGroupLevelFromXP(oldXP).level;
            const newLevel = getGroupLevelFromXP(newXP).level;

            let updated = {
              ...g,
              groupXP: newXP,
              sharedQuests: g.sharedQuests.map((sq) =>
                sq.id !== pick.questId
                  ? sq
                  : { ...sq, contributedIds: nextContributed, status: allDone ? "complete" : "active" }
              ),
            };
            updated = pushFeedEvent(updated, {
              id: now + Math.random(),
              type: FEED_EVENT_TYPES.CONTRIBUTION,
              actorId: pick.memberId,
              timestamp: now,
              xpDelta: contribXP,
              payload: { questId: q.id, questTitle: q.title },
            });
            if (allDone) {
              updated = pushFeedEvent(updated, {
                id: now + 1 + Math.random(),
                type: FEED_EVENT_TYPES.QUEST_COMPLETE,
                actorId: pick.memberId,
                timestamp: now + 1,
                xpDelta: completeXP,
                payload: { questId: q.id, questTitle: q.title, baseReward: q.xpReward || 0 },
              });
            }
            for (let lv = oldLevel + 1; lv <= newLevel; lv++) {
              updated = pushFeedEvent(updated, {
                id: now + 100 + lv + Math.random(),
                type: FEED_EVENT_TYPES.LEVEL_UP,
                timestamp: now + 2,
                payload: { newLevel: lv },
              });
            }
            return updated;
          });
          return { ...prev, groups: nextGroups };
        });
        timer = scheduleNext();
      }, delay);
    };
    let timer = scheduleNext();
    return () => clearTimeout(timer);
  }, [setState]);

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
