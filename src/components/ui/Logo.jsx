// Prominence brand mark.
//
// Two overlapping triangle "peaks" with a five-point star above the taller
// peak. Stroke-only triangles, solid star, gold gradient that themes via
// CSS custom properties from constants/theme.css.
//
// Use this anywhere a brand mark belongs: sidebar header, splash, favicon
// fallback, marketing surfaces. Scale via the `size` prop — geometry is
// designed at 100×100 viewBox so it stays crisp from 16px to 256px+.
export default function Logo({ size = 32, title = "Prominence" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id="prom-logo-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="var(--accent-warm)" />
          <stop offset="100%" stopColor="var(--accent-deep)" />
        </linearGradient>
      </defs>

      {/* Star above the peak — solid gold, R=8 outer / r=3.2 inner.
          Floats clear of the mountain with a ~8-unit gap below it. */}
      <polygon
        points="50,2 51.88,7.41 57.61,7.53 53.04,10.99 54.70,16.47 50,13.2 45.30,16.47 46.96,10.99 42.39,7.53 48.12,7.41"
        fill="url(#prom-logo-gold)"
      />

      {/* Back (right, taller) triangle — stroke-only. Peak at y=24 leaves
          room below the star. */}
      <polygon
        points="15,88 50,24 85,88"
        fill="none"
        stroke="url(#prom-logo-gold)"
        strokeWidth="4"
        strokeLinejoin="miter"
      />

      {/* Front (left, smaller) triangle — stroke-only */}
      <polygon
        points="6,88 32,46 58,88"
        fill="none"
        stroke="url(#prom-logo-gold)"
        strokeWidth="4"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
