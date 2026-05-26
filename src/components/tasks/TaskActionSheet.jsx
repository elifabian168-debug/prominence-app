import { Edit3, AlertCircle, Trash2 } from "lucide-react";
import { CARD, CARD_ELEV, BORDER, TEXT, TEXT_DIM } from "../../constants/theme";
import { CATEGORIES } from "../../constants/categories";
import { useViewport } from "../../hooks/useViewport";

export default function TaskActionSheet({ task, kind = "task", open, onClose, onEdit, onFail, onDelete }) {
  const { isDesktop } = useViewport();
  if (!open || !task) return null;

  const actions = [
    { icon: Edit3,       label: "Edit quest",   color: TEXT,      onClick: () => onEdit(task, kind) },
    { icon: AlertCircle, label: "Mark failed",  color: "#F87171", onClick: () => onFail(task, kind) },
    { icon: Trash2,      label: "Delete quest", color: "#F87171", onClick: () => onDelete(task, kind) },
  ];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: isDesktop ? "center" : "flex-end", justifyContent: "center",
      padding: isDesktop ? 24 : 0,
      animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: CARD, border: `1px solid ${BORDER}`,
        borderRadius: isDesktop ? 20 : 0,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        width: "100%", maxWidth: 480, padding: "20px",
        animation: isDesktop ? "fadeIn 0.25s ease" : "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {!isDesktop && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: BORDER }} />
          </div>
        )}
        <div style={{ fontSize: 14, color: TEXT, marginBottom: 4, fontWeight: 500 }}>{task.title}</div>
        <div style={{ fontSize: 11, color: TEXT_DIM, marginBottom: 16 }}>
          +{task.xp} XP · {CATEGORIES[task.category]?.label}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {actions.map(a => {
            const I = a.icon;
            return (
              <button key={a.label} onClick={() => { a.onClick(); onClose(); }} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", background: "transparent", border: "none",
                borderRadius: 10, color: a.color, cursor: "pointer", fontSize: 14, textAlign: "left",
              }}
              onMouseEnter={e => e.currentTarget.style.background = CARD_ELEV}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <I size={16} />{a.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
