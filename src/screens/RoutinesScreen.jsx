import { useState } from "react";
import { Flame, Plus, Check, X } from "lucide-react";
import {
  ACCENT, BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha,
} from "../constants/theme";
import { TYPE, SPACE, RADIUS } from "../constants/tokens";
import { useViewport } from "../hooks/useViewport";
import PageHeader from "../components/ui/PageHeader";
import { CATEGORIES } from "../constants/categories";
import {
  ROUTINE_PRESETS,
  MAX_ACTIVE_ROUTINES,
  ROUTINE_XP_DAILY_CAP,
  getRoutinePreset,
} from "../constants/routinesData";

const CATEGORY_ORDER = ["fitness", "mind", "school", "work", "life"];

export default function RoutinesScreen({
  routines = [],
  routineXPToday = 0,
  onBack,
  onSubscribe,
  onUnsubscribe,
}) {
  const [tab, setTab] = useState(routines.length === 0 ? "library" : "mine");
  const { isDesktop } = useViewport();

  const subscribedIds = new Set(routines.map((r) => r.presetId));
  const slotsLeft = MAX_ACTIVE_ROUTINES - routines.length;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, paddingBottom: 90 }}>
      <div style={{ padding: `${SPACE.lg}px ${SPACE.xl}px 0` }}>
        <PageHeader title="Routines" onBack={onBack} />

        <div style={{ ...TYPE.body, color: TEXT_MID, marginBottom: SPACE.lg }}>
          Small daily practices. Each gives a little XP and builds its own streak.
          Skip a day and that streak resets. Ignore for a week and it's dropped.
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: SPACE.sm, marginBottom: SPACE.lg }}>
          <TabButton active={tab === "mine"} onClick={() => setTab("mine")}>
            My Routines · {routines.length}/{MAX_ACTIVE_ROUTINES}
          </TabButton>
          <TabButton active={tab === "library"} onClick={() => setTab("library")}>
            Library
          </TabButton>
        </div>

        {tab === "mine" ? (
          <MyRoutines
            routines={routines}
            routineXPToday={routineXPToday}
            onUnsubscribe={onUnsubscribe}
            onOpenLibrary={() => setTab("library")}
            isDesktop={isDesktop}
          />
        ) : (
          <Library
            subscribedIds={subscribedIds}
            slotsLeft={slotsLeft}
            onSubscribe={onSubscribe}
            onUnsubscribe={onUnsubscribe}
            isDesktop={isDesktop}
          />
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: "10px 12px", borderRadius: RADIUS.control,
        background: active ? alpha(ACCENT, "12") : CARD,
        border: `1px solid ${active ? alpha(ACCENT, "55") : BORDER}`,
        color: active ? ACCENT : TEXT_MID,
        fontSize: 12, fontWeight: 600,
        letterSpacing: "0.08em", textTransform: "uppercase",
        cursor: "pointer", fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

function MyRoutines({ routines, routineXPToday, onUnsubscribe, onOpenLibrary, isDesktop }) {
  if (routines.length === 0) {
    return (
      <button
        onClick={onOpenLibrary}
        style={{
          width: "100%", display: "flex", flexDirection: "column", alignItems: "center",
          gap: SPACE.sm, padding: `${SPACE.xxxl}px ${SPACE.xl}px`,
          background: `linear-gradient(135deg, ${alpha(ACCENT, "08")}, ${CARD})`,
          border: `1px dashed ${alpha(ACCENT, "45")}`,
          borderRadius: RADIUS.card, cursor: "pointer", fontFamily: "inherit",
        }}
      >
        <div style={{
          fontFamily: SERIF, fontSize: 18, color: TEXT, marginBottom: 4,
        }}>
          No routines yet.
        </div>
        <div style={{ ...TYPE.meta }}>
          Pick a few from the library to start.
        </div>
      </button>
    );
  }

  return (
    <>
      <div style={{
        ...TYPE.sectionLabel,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: SPACE.md,
      }}>
        <span>Active</span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
          {routineXPToday} / {ROUTINE_XP_DAILY_CAP} XP today
        </span>
      </div>
      <div style={{
        display: isDesktop ? "grid" : "flex",
        gridTemplateColumns: isDesktop ? "1fr 1fr" : undefined,
        flexDirection: "column", gap: SPACE.sm,
      }}>
        {routines.map((r) => {
          const preset = getRoutinePreset(r.presetId);
          if (!preset) return null;
          const cat = CATEGORIES[preset.category];
          return (
            <div
              key={r.presetId}
              style={{
                display: "flex", alignItems: "center", gap: SPACE.md,
                padding: "12px 14px",
                background: CARD, border: `1px solid ${BORDER}`,
                borderRadius: RADIUS.card,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: RADIUS.control,
                background: alpha(cat?.color || ACCENT, "14"),
                border: `1px solid ${alpha(cat?.color || ACCENT, "35")}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, flexShrink: 0,
              }}>
                {preset.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, color: TEXT, fontWeight: 500,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {preset.title}
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  marginTop: 4, fontSize: 11, color: TEXT_DIM,
                }}>
                  <span style={{ color: cat?.color || TEXT_MID, fontWeight: 600 }}>
                    {cat?.label}
                  </span>
                  <span>·</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                    <Flame size={10} color={r.streak > 0 ? ACCENT : TEXT_DIM} />
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{r.streak}</span>
                    {r.longestStreak > 0 && r.longestStreak !== r.streak && (
                      <span style={{ color: TEXT_DIM, marginLeft: 4 }}>best {r.longestStreak}</span>
                    )}
                  </span>
                  <span>·</span>
                  <span>+{preset.xp} XP</span>
                </div>
              </div>
              <button
                onClick={() => onUnsubscribe(r.presetId)}
                aria-label={`Unsubscribe from ${preset.title}`}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "transparent", border: `1px solid ${BORDER_BR}`,
                  color: TEXT_MID, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Library({ subscribedIds, slotsLeft, onSubscribe, onUnsubscribe, isDesktop }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: SPACE.xxl }}>
      {CATEGORY_ORDER.map((catKey) => {
        const cat = CATEGORIES[catKey];
        const presets = ROUTINE_PRESETS.filter((p) => p.category === catKey);
        return (
          <div key={catKey}>
            <div style={{
              ...TYPE.sectionLabel, color: cat.color,
              display: "flex", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.sm,
            }}>
              {cat.label}
            </div>
            <div style={{
              display: isDesktop ? "grid" : "flex",
              gridTemplateColumns: isDesktop ? "1fr 1fr" : undefined,
              flexDirection: "column", gap: SPACE.sm,
            }}>
              {presets.map((p) => {
                const subscribed = subscribedIds.has(p.id);
                const disabled = !subscribed && slotsLeft <= 0;
                return (
                  <button
                    key={p.id}
                    onClick={() => (subscribed ? onUnsubscribe(p.id) : onSubscribe(p.id))}
                    disabled={disabled}
                    style={{
                      display: "flex", alignItems: "center", gap: SPACE.md,
                      padding: "12px 14px",
                      background: subscribed ? alpha(ACCENT, "08") : CARD,
                      border: `1px solid ${subscribed ? alpha(ACCENT, "45") : BORDER}`,
                      borderRadius: RADIUS.card,
                      cursor: disabled ? "not-allowed" : "pointer",
                      opacity: disabled ? 0.5 : 1,
                      textAlign: "left", fontFamily: "inherit",
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: RADIUS.control,
                      background: alpha(cat.color, "14"),
                      border: `1px solid ${alpha(cat.color, "35")}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, flexShrink: 0,
                    }}>
                      {p.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, color: TEXT, fontWeight: 500,
                      }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 2 }}>
                        +{p.xp} XP per day
                      </div>
                    </div>
                    {subscribed ? (
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: alpha(ACCENT, "18"),
                        border: `1px solid ${alpha(ACCENT, "55")}`,
                        color: ACCENT,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <Check size={14} strokeWidth={2.5} />
                      </div>
                    ) : (
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: "transparent",
                        border: `1px dashed ${BORDER_BR}`,
                        color: TEXT_DIM,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <Plus size={14} strokeWidth={2.5} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
