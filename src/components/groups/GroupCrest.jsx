import { alpha } from "../../constants/theme";
import { ARCHETYPES } from "../../constants/categories";
import { GROUP_THEMES, hashSeed, getCrestSymbol } from "../../constants/groupsData";

// ── Heraldic group crest ──
// Deterministic from crestSeed + themeColor. Renders at any size.
// Includes: hex shield, dashed inner hex, primary symbol, optional member
// dots radiating outward (one per memberArchetypes entry).
export default function GroupCrest({
  seed = "default",
  themeColor = "solar",
  memberArchetypes = [],
  size = 120,
  animated = false,
}) {
  const theme = GROUP_THEMES[themeColor] || GROUP_THEMES.solar;
  const color = theme.color;
  const accent = theme.accent;
  const symbol = getCrestSymbol(seed);
  const hash = hashSeed(String(seed));

  const r = size / 2;
  const outer = r * 0.92;
  const inner = r * 0.62;

  // Hex points around (r, r). Phase shifts the rotation for variety per seed.
  const phaseOffset = ((hash % 12) / 12) * (Math.PI / 6);
  const hex = (radius, phase = 0) =>
    Array.from({ length: 6 })
      .map((_, i) => {
        const a = (Math.PI / 3) * i + phase + phaseOffset;
        return `${r + radius * Math.cos(a)},${r + radius * Math.sin(a)}`;
      })
      .join(" ");

  // Member dots radiate from a circle slightly outside the hex
  const dotR = r * 1.04;
  const dotCount = Math.min(memberArchetypes.length, 8);
  const memberDots = Array.from({ length: dotCount }).map((_, i) => {
    const a = (Math.PI * 2 * i) / Math.max(dotCount, 1) - Math.PI / 2;
    const arch = ARCHETYPES[memberArchetypes[i]] || ARCHETYPES.balanced;
    return {
      x: r + dotR * Math.cos(a),
      y: r + dotR * Math.sin(a),
      color: arch.color,
    };
  });

  // Symbol scale relative to inner hex
  const symbolScale = (r * 0.42) / 10;

  const filterId = `crestBloom-${hashSeed(String(seed))}`;
  const gradId = `crestGrad-${hashSeed(String(seed))}`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible", display: "block" }}>
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={alpha(color, "30")} />
          <stop offset="60%" stopColor={alpha(color, "10")} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id={`${gradId}-stroke`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
        <filter id={filterId}>
          <feGaussianBlur stdDeviation="1.6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer bloom */}
      <circle cx={r} cy={r} r={r * 1.1} fill={`url(#${gradId})`} />

      {/* Outer hex shield (stroke gradient) */}
      <polygon
        points={hex(outer)}
        fill={alpha(color, "12")}
        stroke={`url(#${gradId}-stroke)`}
        strokeWidth={Math.max(1, size / 90)}
        filter={`url(#${filterId})`}
        style={animated ? { animation: "sigilRotate 30s linear infinite", transformOrigin: `${r}px ${r}px` } : {}}
      />

      {/* Dashed inner hex */}
      <polygon
        points={hex(r * 0.78, Math.PI / 6)}
        fill="none"
        stroke={alpha(color, "55")}
        strokeWidth="0.6"
        strokeDasharray="3 3"
      />

      {/* Inner hex (solid faint) */}
      <polygon
        points={hex(inner, Math.PI / 6)}
        fill="none"
        stroke={alpha(color, "70")}
        strokeWidth={Math.max(0.6, size / 160)}
      />

      {/* Primary symbol (centered, glowing) */}
      <g
        transform={`translate(${r} ${r}) scale(${symbolScale})`}
        style={{ filter: `drop-shadow(0 0 ${size / 30}px ${alpha(color, "70")})` }}
      >
        <path d={symbol.path} fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        {symbol.circle && <circle cx="0" cy="0" r={symbol.circle} fill={accent} />}
      </g>

      {/* Corner dots on the hex itself */}
      {hex(outer)
        .split(" ")
        .map((pt, i) => {
          const [x, y] = pt.split(",").map(Number);
          return <circle key={i} cx={x} cy={y} r={Math.max(1.2, size / 80)} fill={accent} opacity="0.9" />;
        })}

      {/* Member dots radiating outward */}
      {memberDots.map((d, i) => (
        <g key={i}>
          <circle cx={d.x} cy={d.y} r={Math.max(2, size / 50)} fill={d.color} opacity="0.95" />
          <circle cx={d.x} cy={d.y} r={Math.max(3.5, size / 32)} fill={d.color} opacity="0.18" />
        </g>
      ))}
    </svg>
  );
}
