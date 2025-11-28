"use client";

/**
 * AuroraBackground - Animated aurora/northern lights effect
 *
 * Creates a subtle, animated gradient background effect
 */
export function AuroraBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" />

      {/* Aurora layers */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(6, 182, 212, 0.3), transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(8, 145, 178, 0.2), transparent 50%),
            radial-gradient(ellipse 40% 30% at 50% 80%, rgba(14, 116, 144, 0.15), transparent 50%)
          `,
          animation: "aurora-shift 20s ease-in-out infinite",
        }}
      />

      {/* Secondary aurora layer */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            radial-gradient(ellipse 50% 40% at 70% 60%, rgba(6, 182, 212, 0.25), transparent 50%),
            radial-gradient(ellipse 70% 50% at 30% 30%, rgba(20, 184, 166, 0.15), transparent 50%)
          `,
          animation: "aurora-shift 25s ease-in-out infinite reverse",
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-950 to-transparent" />

      <style jsx>{`
        @keyframes aurora-shift {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(2%, -2%) scale(1.02);
          }
          50% {
            transform: translate(-1%, 1%) scale(0.98);
          }
          75% {
            transform: translate(-2%, -1%) scale(1.01);
          }
        }
      `}</style>
    </div>
  );
}
