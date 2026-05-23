import { useState } from "react";
import { AlertCircle, Trash2, Check, RotateCcw } from "lucide-react";

import { ACCENT, BG, CARD, BORDER_BR, TEXT, TEXT_MID } from "./constants/theme";

import { useToast } from "./hooks/useToast";
import { useUndoAction } from "./hooks/useUndoAction";
import { useGameState } from "./hooks/useGameState";
import { useGroups } from "./hooks/useGroups";
import { useFriends } from "./hooks/useFriends";
import { getInitialState } from "./utils/state";
import { useTheme } from "./hooks/useTheme";
import { getArchetype } from "./utils/archetype";

import Onboarding from "./components/onboarding/Onboarding";
import TabBar from "./components/ui/TabBar";
import ConfirmDialog from "./components/ui/ConfirmDialog";
import LevelUpMoment from "./components/moments/LevelUpMoment";
import TaskCreateModal from "./components/tasks/TaskCreateModal";
import TaskActionSheet from "./components/tasks/TaskActionSheet";
import TaskEditModal from "./components/tasks/TaskEditModal";

import HomeScreen from "./screens/HomeScreen";
import FeedScreen from "./screens/FeedScreen";
import YouScreen from "./screens/YouScreen";
import LifeStatsScreen from "./screens/LifeStatsScreen";
import FriendsScreen from "./screens/FriendsScreen";
import FriendDetailScreen from "./screens/FriendDetailScreen";
import AddFriendsScreen from "./screens/AddFriendsScreen";
import GroupsScreen from "./screens/GroupsScreen";
import GroupDetailScreen from "./screens/GroupDetailScreen";
import CreateGroupScreen from "./screens/CreateGroupScreen";
import InviteFriendSheet from "./components/groups/InviteFriendSheet";

import EditProfileSheet from "./sheets/EditProfileSheet";
import NotificationsSheet from "./sheets/NotificationsSheet";
import NotificationCenterSheet from "./sheets/NotificationCenterSheet";

const FAIL_COLOR = "#F87171";

export default function Prominence() {
  // ── Hooks ────────────────────────────────────────────────────────────────
  const { toast, showToast } = useToast();
  const { undoAction, setUndoAction } = useUndoAction();
  const { theme, toggleTheme } = useTheme();

  const [showLevelUp, setShowLevelUp]     = useState(null);
  const [levelingUp, setLevelingUp]       = useState(false);
  const [xpGains, setXpGains]             = useState([]);

  const {
    user, setUser, state, setState,
    handleCreateTask, completeTask, completeMainQuest,
    saveEdit, markFailed, deleteTask,
    completeWeeklyQuest, saveWeeklyEdit, failWeeklyQuest, deleteWeeklyQuest,
    resetAll,
    updateProfile, toggleNotification,
  } = useGameState({
    showToast,
    onLevelUp: (level) => {
      setLevelingUp(true);
      setTimeout(() => { setShowLevelUp(level); setLevelingUp(false); }, 600);
    },
    onXpGain: (gain) => {
      setXpGains(g => [...g, gain]);
      setTimeout(() => setXpGains(g => g.filter(x => x.id !== gain.id)), 1400);
    },
  });

  // ── UI state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]               = useState("home");
  const [modalOpen, setModalOpen]               = useState(false);
  const [modalMode, setModalMode]               = useState("normal"); // "normal" | "weekly"
  const [actionTask, setActionTask]             = useState(null);
  const [actionKind, setActionKind]             = useState("task"); // "task" | "main" | "weekly"
  const [editTask, setEditTask]                 = useState(null);
  const [confirmFail, setConfirmFail]           = useState(null);
  const [confirmDelete, setConfirmDelete]       = useState(null);
  const [confirmReset, setConfirmReset]         = useState(false);
  const [showLifeStats, setShowLifeStats]       = useState(false);
  const [showFriends, setShowFriends]           = useState(false);
  const [showAddFriends, setShowAddFriends]     = useState(false);
  const [friendDetail, setFriendDetail]         = useState(null);
  const [editProfileOpen, setEditProfileOpen]   = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifCenterOpen, setNotifCenterOpen]   = useState(false);
  const [confirmRemoveFriend, setConfirmRemoveFriend] = useState(null);

  // ── Circles state ─────────────────────────────────────────────────────────
  // The Circles list lives on its own tab (activeTab === "circles"). The
  // detail / create / invite flows still ride on top as overlays.
  const [groupDetail, setGroupDetail]               = useState(null);          // Circle object currently open
  const [creatingGroup, setCreatingGroup]           = useState(false);
  const [respondingToInvite, setRespondingToInvite] = useState(null);          // invite object
  const [invitingForGroup, setInvitingForGroup]     = useState(null);          // Circle when picking friend

  const {
    groups, groupInvites,
    createGroup, inviteFriend, cancelInvite,
    acceptInvite, declineInvite, leaveGroup,
  } = useGroups(state, setState);

  const {
    sendCheer, toggleFriendStreak, addFriend, removeFriend,
    markAllNotificationsRead, dismissNotification,
  } = useFriends(state, setState, { showToast });

  // ── Action handlers ───────────────────────────────────────────────────────
  // kind: "task" | "main" | "weekly"
  const openActions  = (task, kind = "task") => { setActionTask(task); setActionKind(kind); };
  const closeActions = () => setActionTask(null);

  const handleEdit    = (task, kind) => { setEditTask({ task, kind }); closeActions(); };
  const handleSaveEdit = (updates) => {
    if (editTask.kind === "weekly") saveWeeklyEdit(editTask.task, updates);
    else saveEdit(editTask.task, editTask.kind === "main", updates);
    setEditTask(null);
  };

  const handleFailRequest   = (task, kind) => { setConfirmFail({ task, kind }); closeActions(); };
  const handleDeleteRequest = (task, kind) => { setConfirmDelete({ task, kind }); closeActions(); };

  const handleConfirmFail = () => {
    const { task, kind } = confirmFail;
    if (kind === "weekly") failWeeklyQuest(task);
    else markFailed(task, kind === "main");
    setUndoAction({ type: "fail", task, kind, deadline: Date.now() + 5000 });
    setConfirmFail(null);
    showToast("Marked as failed", FAIL_COLOR);
  };

  const handleConfirmDelete = () => {
    const { task, kind } = confirmDelete;
    const wasPending = task.status === "pending";
    if (kind === "weekly") deleteWeeklyQuest(task);
    else deleteTask(task, kind === "main");
    // Only allow undo for pending deletions — completed/failed deletions reverse aggregates
    // and an undo would need to re-apply XP/streak/log entries, which we deliberately don't support.
    if (wasPending) {
      setUndoAction({ type: "delete", task, kind, deadline: Date.now() + 5000 });
      showToast("Quest deleted");
    } else {
      showToast("Removed from history");
    }
    setConfirmDelete(null);
  };

  const handleUndo = () => {
    if (!undoAction) return;
    const { type, task, kind } = undoAction;
    if (type === "delete") {
      if (kind === "weekly") {
        setState(prev => ({ ...prev, weeklyQuests: [...(prev.weeklyQuests || []), task] }));
      } else if (kind === "main") {
        setState(prev => ({ ...prev, mainQuest: task }));
      } else {
        setState(prev => ({ ...prev, tasks: [...prev.tasks, task] }));
      }
    } else if (type === "fail") {
      if (kind === "weekly") {
        setState(prev => ({
          ...prev,
          weeklyQuests: prev.weeklyQuests.map(q => q.id === task.id ? { ...q, status: "pending" } : q),
          completedHistory: { ...prev.completedHistory, failed: Math.max(0, prev.completedHistory.failed - 1) },
        }));
      } else if (kind === "main") {
        setState(prev => ({
          ...prev,
          mainQuest: { ...prev.mainQuest, status: "pending" },
          completedHistory: { ...prev.completedHistory, failed: Math.max(0, prev.completedHistory.failed - 1) },
        }));
      } else {
        setState(prev => ({
          ...prev,
          tasks: prev.tasks.map(t => t.id === task.id ? { ...t, status: "pending" } : t),
          completedHistory: { ...prev.completedHistory, failed: Math.max(0, prev.completedHistory.failed - 1) },
        }));
      }
    }
    setUndoAction(null);
    showToast("Restored");
  };

  const onCreateTask = (data) => {
    const result = handleCreateTask(data);
    if (result?.kind === "main") setActiveTab("home");
    if (result?.kind === "weekly") setActiveTab("home");
  };

  const weeklyCategoriesTaken = (state.weeklyQuests || [])
    .filter(q => q.status === "pending")
    .map(q => q.category);

  const openCreateModal = (mode = "normal") => { setModalMode(mode); setModalOpen(true); };

  // ── Onboarding guard ──────────────────────────────────────────────────────
  if (!user) {
    return <Onboarding onComplete={(u, firstQuest) => { setUser(u); setState(getInitialState(firstQuest)); }} />;
  }

  const showOverlayNav =
    !showLifeStats && !showFriends && !showAddFriends && !friendDetail &&
    !groupDetail && !creatingGroup;

  const userArchetype = getArchetype(state.statXP);
  const userWeeklyXP  = state.activityLog?.[new Date().toISOString().slice(0, 10)]?.xp || 0;

  const handleAcceptInvite = (invite) => {
    const joined = acceptInvite(invite.groupId);
    setRespondingToInvite(null);
    if (joined) {
      setGroupDetail(joined);
      showToast(`Joined ${invite.groupName}`);
    }
  };

  const handleDeclineInvite = (invite) => {
    declineInvite(invite.groupId);
    setRespondingToInvite(null);
    showToast("Invite declined");
  };

  const refreshedGroupDetail = groupDetail ? groups.find((g) => g.id === groupDetail.id) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="app-atmos" style={{ background: BG, minHeight: "100vh", color: TEXT, paddingBottom: 90 }}>
      <div className="app-page" style={{ maxWidth: 480, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {showLifeStats ? (
          <div style={{ animation: "screenIn 0.3s ease" }}>
            <LifeStatsScreen state={state} name={user.name} onBack={() => setShowLifeStats(false)} />
          </div>
        ) : friendDetail ? (
          <div key={friendDetail.id} style={{ animation: "heroIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <FriendDetailScreen friend={friendDetail} state={state}
              onBack={() => setFriendDetail(null)}
              onCheer={sendCheer}
              onToggleFriendStreak={toggleFriendStreak}
              onRemoveFriend={() => setConfirmRemoveFriend(friendDetail)} />
          </div>
        ) : showAddFriends ? (
          <div style={{ animation: "screenIn 0.3s ease" }}>
            <AddFriendsScreen state={state} userName={user.name}
              onBack={() => setShowAddFriends(false)}
              onAdd={addFriend}
              onInvited={(contact) => showToast(`Invite sent to ${contact.name}`)} />
          </div>
        ) : creatingGroup ? (
          <div style={{ animation: "screenIn 0.3s ease" }}>
            <CreateGroupScreen
              userArchetype={userArchetype}
              onBack={() => setCreatingGroup(false)}
              onConfirm={(payload) => {
                const g = createGroup(payload);
                setCreatingGroup(false);
                if (g) {
                  setGroupDetail(g);
                  showToast(`${g.name} founded`);
                }
              }}
            />
          </div>
        ) : refreshedGroupDetail ? (
          <div key={refreshedGroupDetail.id} style={{ animation: "heroIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <GroupDetailScreen
              group={refreshedGroupDetail}
              friends={state.friends || []}
              userName={user.name}
              userArchetype={userArchetype}
              userWeeklyXP={userWeeklyXP}
              onBack={() => setGroupDetail(null)}
              onInvite={() => setInvitingForGroup(refreshedGroupDetail)}
              onCancelInvite={(gid, fid) => { cancelInvite(gid, fid); showToast("Invite cancelled"); }}
              onLeaveGroup={(gid) => { leaveGroup(gid); setGroupDetail(null); showToast("Left the Circle"); }}
            />
          </div>
        ) : showFriends ? (
          <div style={{ animation: "screenIn 0.3s ease" }}>
            <FriendsScreen state={state} userXP={state.totalXP} userName={user.name}
              onBack={() => setShowFriends(false)}
              onOpenFriend={setFriendDetail}
              onCheer={sendCheer}
              onOpenAdd={() => setShowAddFriends(true)}
              onOpenGroups={() => setActiveTab("circles")}
              groupCount={groups.length}
              pendingInviteCount={groupInvites.length} />
          </div>
        ) : (
          <>
            {/* Each tab gets its own animation wrapper — no key needed on the parent */}
            {activeTab === "home" && (
              <div style={{ animation: "screenIn 0.25s ease" }}>
                <HomeScreen state={state} name={user.name} levelingUp={levelingUp} xpGains={xpGains}
                  completeTask={completeTask} completeMainQuest={completeMainQuest}
                  completeWeeklyQuest={completeWeeklyQuest}
                  onOpenActions={openActions} onOpenFriends={() => setShowFriends(true)}
                  onOpenLifeStats={() => setShowLifeStats(true)}
                  onOpenNotifs={() => setNotifCenterOpen(true)}
                  onAddWeekly={() => openCreateModal("weekly")}
                  onCreateQuest={() => openCreateModal("normal")}
                  groups={groups}
                  groupInvites={groupInvites}
                  onOpenGroups={() => setActiveTab("circles")}
                  onOpenCircle={(g) => setGroupDetail(g)} />
              </div>
            )}
            {activeTab === "feed" && (
              <div style={{ animation: "screenIn 0.25s ease" }}>
                <FeedScreen
                  state={state}
                  circles={groups}
                  onOpenNotifs={() => setNotifCenterOpen(true)}
                  onOpenFriends={() => setShowAddFriends(true)} />
              </div>
            )}
            {activeTab === "circles" && (
              <div style={{ animation: "screenIn 0.25s ease" }}>
                <GroupsScreen
                  groups={groups}
                  groupInvites={groupInvites}
                  onOpenGroup={(g) => setGroupDetail(g)}
                  onOpenCreate={() => setCreatingGroup(true)}
                  onOpenInvite={(invite) => setRespondingToInvite(invite)} />
              </div>
            )}
            {activeTab === "you" && (
              <div style={{ animation: "screenIn 0.25s ease" }}>
                <YouScreen name={user.name} bio={user.bio} createdAt={user.createdAt} state={state}
                  onReset={() => setConfirmReset(true)}
                  onOpenLifeStats={() => setShowLifeStats(true)}
                  onEditProfile={() => setEditProfileOpen(true)}
                  onOpenNotifications={() => setNotificationsOpen(true)}
                  theme={theme}
                  onToggleTheme={toggleTheme} />
              </div>
            )}
          </>
        )}

        {showOverlayNav && (
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} onAdd={() => openCreateModal("normal")} />
        )}

        <TaskCreateModal open={modalOpen} onClose={() => setModalOpen(false)}
          onCreate={onCreateTask} streak={state.streak}
          weeklyCategoriesTaken={weeklyCategoriesTaken}
          defaultMode={modalMode} />

        <EditProfileSheet open={editProfileOpen} name={user.name} bio={user.bio || ""}
          onClose={() => setEditProfileOpen(false)} onSave={updateProfile} />

        <NotificationsSheet open={notificationsOpen} prefs={state.notifications || {}}
          onClose={() => setNotificationsOpen(false)} onToggle={toggleNotification} />

        <NotificationCenterSheet open={notifCenterOpen}
          notifications={state.cheersReceived || []}
          friends={state.friends || []}
          onClose={() => { setNotifCenterOpen(false); markAllNotificationsRead(); }}
          onDismiss={dismissNotification}
          onOpenFriend={(f) => { setNotifCenterOpen(false); setFriendDetail(f); }} />

        <TaskActionSheet task={actionTask} kind={actionKind} open={!!actionTask}
          onClose={closeActions} onEdit={handleEdit}
          onFail={handleFailRequest} onDelete={handleDeleteRequest} />

        {/* ── Circles invite confirmation ── */}
        {respondingToInvite && (
          <ConfirmDialog
            title={`Join ${respondingToInvite.groupName}?`}
            message={respondingToInvite.motto
              ? `"${respondingToInvite.motto}" — invited by ${respondingToInvite.fromName}.`
              : `Invited by ${respondingToInvite.fromName}.`}
            confirmLabel="Join"
            confirmColor={ACCENT}
            onConfirm={() => handleAcceptInvite(respondingToInvite)}
            onCancel={() => handleDeclineInvite(respondingToInvite)}
          />
        )}

        <InviteFriendSheet
          open={!!invitingForGroup}
          friends={state.friends || []}
          group={invitingForGroup}
          onClose={() => setInvitingForGroup(null)}
          onPick={(friend) => {
            const group = invitingForGroup;
            inviteFriend(group.id, friend.id);
            setInvitingForGroup(null);
            showToast(`Invited ${friend.name}`);
          }}
        />

        {editTask && (
          <TaskEditModal task={editTask.task}
            isMain={editTask.kind === "main"}
            isWeekly={editTask.kind === "weekly"}
            streak={state.streak}
            onClose={() => setEditTask(null)} onSave={handleSaveEdit} />
        )}

        {confirmFail && (
          <ConfirmDialog
            icon={AlertCircle} title="Mark as failed?"
            message={`"${confirmFail.task.title}" will count against your win rate.`}
            confirmLabel="Mark Failed" confirmColor={FAIL_COLOR}
            onConfirm={handleConfirmFail} onCancel={() => setConfirmFail(null)} />
        )}

        {confirmDelete && (() => {
          const s = confirmDelete.task.status;
          const isComplete = s === "complete";
          const isPending  = s === "pending";
          const title = isPending  ? "Delete this quest?"
                      : isComplete ? "Remove from history?"
                                   : "Remove from history?";
          const message = isPending
            ? `"${confirmDelete.task.title}" will be removed.`
            : isComplete
              ? `"${confirmDelete.task.title}" will be deleted. Its XP and contribution to your stats, streak, and history will all be reversed.`
              : `"${confirmDelete.task.title}" will be deleted from your history.`;
          const confirmLabel = isPending ? "Delete" : "Remove";
          return (
            <ConfirmDialog
              icon={Trash2} title={title} message={message}
              confirmLabel={confirmLabel} confirmColor={FAIL_COLOR}
              onConfirm={handleConfirmDelete} onCancel={() => setConfirmDelete(null)} />
          );
        })()}

        {confirmRemoveFriend && (
          <ConfirmDialog
            icon={AlertCircle} title="Remove friend?"
            message={`${confirmRemoveFriend.name} will be removed from your circle. Any shared streak will end.`}
            confirmLabel="Remove" confirmColor={FAIL_COLOR}
            onConfirm={() => {
              removeFriend(confirmRemoveFriend);
              setConfirmRemoveFriend(null);
              setFriendDetail(null);
            }}
            onCancel={() => setConfirmRemoveFriend(null)} />
        )}

        {confirmReset && (
          <ConfirmDialog
            icon={RotateCcw} title="Reset all progress?"
            message="This cannot be undone. All XP, quests, and stats will be cleared."
            confirmLabel="Reset" confirmColor={FAIL_COLOR}
            onConfirm={() => { resetAll(); setConfirmReset(false); }}
            onCancel={() => setConfirmReset(false)} />
        )}

        {showLevelUp !== null && (
          <LevelUpMoment level={showLevelUp} onDismiss={() => setShowLevelUp(null)} />
        )}

        {/* Fix #1: undo at bottom 110, toast at bottom 168 so they never overlap */}
        {undoAction && (
          <div style={{
            position: "fixed", bottom: 110, left: "50%", zIndex: 60,
            background: CARD, border: `1px solid ${BORDER_BR}`, borderRadius: 99,
            padding: "8px 8px 8px 18px", display: "flex", alignItems: "center", gap: 12,
            transform: "translateX(-50%)", animation: "fadeUp 0.3s ease",
          }}>
            <span style={{ fontSize: 13, color: TEXT_MID }}>{undoAction.type === "delete" ? "Quest deleted" : "Quest failed"}</span>
            <button onClick={handleUndo} style={{
              background: ACCENT, color: BG, border: "none",
              padding: "6px 14px", borderRadius: 99,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              letterSpacing: "0.04em",
            }}>UNDO</button>
          </div>
        )}

        {toast && (
          <div style={{
            position: "fixed", bottom: 168, left: "50%", zIndex: 60,
            background: "rgba(20,20,22,0.95)", backdropFilter: "blur(20px)",
            border: `1px solid color-mix(in srgb, ${toast.color} 25%, transparent)`, borderRadius: 99,
            padding: "10px 18px", display: "flex", alignItems: "center", gap: 8,
            animation: "toastIn 2.4s cubic-bezier(0.16,1,0.3,1) forwards",
            transform: "translateX(-50%)",
          }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: toast.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={10} color="#0A0A0B" strokeWidth={3} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#FFFFFF" }}>{toast.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
