import { X, Star, Sparkles, TrendingUp, Award, Heart } from "lucide-react";
import { ACCENT, BG, CARD, BORDER, BORDER_BR, TEXT, TEXT_DIM, TEXT_MID, SERIF, alpha } from "../constants/theme";
import BottomSheet from "../components/ui/BottomSheet";

const FEATURES = [
  { icon: Star,       title: "All themes",         desc: "Unlock the full theme library" },
  { icon: Sparkles,   title: "Custom categories",  desc: "Build your own quest types" },
  { icon: TrendingUp, title: "Advanced analytics", desc: "Trends, projections, exports" },
  { icon: Award,      title: "All monthly quests", desc: "Pre-order future months" },
  { icon: Heart,      title: "Support development",desc: "Help Prominence keep growing" },
];

export default function ProUpgradeSheet({ open, isPro, onClose, onUpgrade }) {
  if (!open) return null;

  return (
    <BottomSheet onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 20px 8px" }}>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: CARD, border: `1px solid ${BORDER}`, color: TEXT_MID, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ padding: "0 24px 24px", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px", background: `linear-gradient(135deg, ${alpha(ACCENT, "40")}, ${alpha(ACCENT, "10")})`, border: `1px solid ${alpha(ACCENT, "60")}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 40px ${alpha(ACCENT, "30")}` }}>
          <Star size={28} color={ACCENT} fill={ACCENT} />
        </div>
        <div style={{ fontSize: 11, color: ACCENT, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 8 }}>Prominence Pro</div>
        <div style={{ fontFamily: SERIF, fontSize: 36, lineHeight: 1.1, marginBottom: 8 }}>{isPro ? "You're a Pro" : "Unlock everything"}</div>
        <div style={{ fontSize: 14, color: TEXT_MID, lineHeight: 1.5 }}>
          {isPro ? "Thank you for supporting Prominence." : "Custom categories, all themes, advanced stats, and every monthly quest."}
        </div>
      </div>

      <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
        {FEATURES.map(f => {
          const I = f.icon;
          return (
            <div key={f.title} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: alpha(ACCENT, "15"), border: `1px solid ${alpha(ACCENT, "30")}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <I size={15} color={ACCENT} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: TEXT, marginBottom: 2 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: TEXT_DIM }}>{f.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: "16px 20px 24px", borderTop: `1px solid ${BORDER}`, background: BG, position: "sticky", bottom: 0 }}>
        {isPro ? (
          <button onClick={onClose} style={{ width: "100%", padding: "14px", borderRadius: 12, background: CARD, border: `1px solid ${BORDER_BR}`, color: TEXT, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            Close
          </button>
        ) : (
          <>
            <button onClick={() => { onUpgrade(); onClose(); }} style={{
              width: "100%", padding: "14px", borderRadius: 12,
              background: ACCENT, color: BG, border: "none",
              fontSize: 14, fontWeight: 600, letterSpacing: "0.06em",
              cursor: "pointer", marginBottom: 8, boxShadow: `0 4px 16px ${alpha(ACCENT, "40")}`,
            }}>$4.99 / MONTH · UPGRADE</button>
            <div style={{ fontSize: 10, color: TEXT_DIM, textAlign: "center", letterSpacing: "0.05em" }}>
              Real billing arrives at App Store launch · Cancel anytime
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
