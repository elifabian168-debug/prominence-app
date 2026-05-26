import { useCallback, useEffect, useMemo } from "react";
import { todayKey } from "../utils/date";
import { fireLocalNotification } from "../utils/notifications";
import { TEXT_MID } from "../constants/theme";

// ── The migration boundary for the social layer ──
// Today: reads/writes state.friends + state.cheersReceived
// + state.cheersGiven + state.nudgesGiven via setState.
// Tomorrow: swap internals to Firestore listeners + Cloud Function calls.
// Components consuming this hook never change.
//
// Also owns the mock simulator for inbound cheers/nudges. When real
// Firestore data lands, gate it behind a flag.
export function useFriends(state, setState, { showToast }) {
  const friends = state.friends || [];
  const cheersReceived = state.cheersReceived || [];

  // ── Simulator: inbound cheers/nudges from random friends every 10–30 min.
  useEffect(() => {
    const scheduleNext = () => {
      const delay = (10 + Math.random() * 20) * 60 * 1000;
      return setTimeout(() => {
        let fired = null;
        setState((prev) => {
          const friendList = prev.friends || [];
          if (friendList.length === 0) return prev;
          if (prev.notifications?.friendActivity === false) return prev;
          const friend = friendList[Math.floor(Math.random() * friendList.length)];
          const isNudge = Math.random() < 0.25;
          const messages = isNudge
            ? [`${friend.name} sent you a nudge`, `${friend.name} thinks you're slacking`]
            : [`${friend.name} cheered your progress`, `${friend.name} is rooting for you`, `${friend.name} sent you a sparkle`];
          const msg = messages[Math.floor(Math.random() * messages.length)];
          fired = { name: friend.name, msg, isNudge };
          return {
            ...prev,
            cheersReceived: [
              { id: Date.now() + Math.random(), fromId: friend.id, fromName: friend.name,
                kind: isNudge ? "nudge_in" : "cheer_in",
                message: msg,
                createdAt: Date.now(), read: false },
              ...(prev.cheersReceived || []),
            ].slice(0, 30),
          };
        });
        if (fired) {
          fireLocalNotification(
            fired.isNudge ? `Nudge from ${fired.name}` : `Cheer from ${fired.name}`,
            fired.msg,
            { tag: `friend-activity-${Date.now()}` },
          );
        }
        timer = scheduleNext();
      }, delay);
    };
    let timer = scheduleNext();
    return () => clearTimeout(timer);
  }, [setState]);

  // ── Send a cheer or nudge to a friend (rate-limited to once per day per friend).
  const sendCheer = useCallback((friend, type = "cheer") => {
    const today = todayKey();
    const lastMap = type === "nudge" ? state.nudgesGiven : state.cheersGiven;
    const lastSent = lastMap?.[friend.id];
    if (lastSent === today) {
      showToast(type === "nudge" ? "Already nudged today" : "Already cheered today", TEXT_MID);
      return false;
    }
    setState((prev) => {
      const key = type === "nudge" ? "nudgesGiven" : "cheersGiven";
      return { ...prev, [key]: { ...prev[key], [friend.id]: today } };
    });
    showToast(type === "nudge" ? `Nudged ${friend.name}` : `Cheered ${friend.name}`);

    // 60% chance the friend "responds" 20–60s later.
    if (Math.random() < 0.6) {
      const delay = 20000 + Math.random() * 40000;
      setTimeout(() => {
        const messages = type === "nudge"
          ? [`${friend.name} acknowledged your nudge`, `${friend.name} is on it`]
          : [`${friend.name} cheered you back!`, `${friend.name} liked your hustle`, `${friend.name} appreciated the boost`];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        let fire = false;
        setState((prev) => {
          if (prev.notifications?.friendActivity === false) return prev;
          fire = true;
          return {
            ...prev,
            cheersReceived: [
              { id: Date.now() + Math.random(), fromId: friend.id, fromName: friend.name,
                kind: type === "nudge" ? "nudge_back" : "cheer_back",
                message: msg,
                createdAt: Date.now(), read: false },
              ...(prev.cheersReceived || []),
            ].slice(0, 30),
          };
        });
        if (fire) {
          fireLocalNotification(
            type === "nudge" ? `${friend.name} responded` : `${friend.name} cheered back`,
            msg,
            { tag: `cheer-back-${Date.now()}` },
          );
        }
      }, delay);
    }
    return true;
  }, [state.cheersGiven, state.nudgesGiven, setState, showToast]);

  // ── Add a friend (no-op if already in circle).
  const addFriend = useCallback((newFriend) => {
    if ((state.friends || []).some((f) => f.id === newFriend.id)) {
      showToast("Already in your circle", TEXT_MID);
      return;
    }
    setState((prev) => ({ ...prev, friends: [...(prev.friends || []), newFriend] }));
    showToast(`Added ${newFriend.name}`);
  }, [state.friends, setState, showToast]);

  // ── Remove a friend. Cleans up every reference to them across the state tree:
  // cheer/nudge rate-limit maps, inbound notifications, and any group
  // memberships or pending invites.
  const removeFriend = useCallback((friend) => {
    setState((prev) => {
      const next = { ...prev };
      next.friends = (prev.friends || []).filter((f) => f.id !== friend.id);

      if (next.cheersGiven) {
        const c = { ...next.cheersGiven }; delete c[friend.id]; next.cheersGiven = c;
      }
      if (next.nudgesGiven) {
        const n = { ...next.nudgesGiven }; delete n[friend.id]; next.nudgesGiven = n;
      }

      // Drop any notifications that came from this friend.
      if (next.cheersReceived) {
        next.cheersReceived = next.cheersReceived.filter((c) => c.fromId !== friend.id);
      }

      // Remove from any group memberships + cancel any pending invites for them.
      if (next.groups) {
        next.groups = next.groups.map((g) => ({
          ...g,
          memberIds: (g.memberIds || []).filter((id) => id !== friend.id),
          pendingInvites: (g.pendingInvites || []).filter((i) => i.friendId !== friend.id),
        }));
      }

      return next;
    });
    showToast(`${friend.name} removed`, TEXT_MID);
  }, [setState, showToast]);

  const markAllNotificationsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      cheersReceived: (prev.cheersReceived || []).map((n) => ({ ...n, read: true })),
    }));
  }, [setState]);

  const dismissNotification = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      cheersReceived: (prev.cheersReceived || []).filter((n) => n.id !== id),
    }));
  }, [setState]);

  return useMemo(() => ({
    friends,
    cheersReceived,
    sendCheer,
    addFriend,
    removeFriend,
    markAllNotificationsRead,
    dismissNotification,
  }), [
    friends, cheersReceived,
    sendCheer, addFriend, removeFriend,
    markAllNotificationsRead, dismissNotification,
  ]);
}
