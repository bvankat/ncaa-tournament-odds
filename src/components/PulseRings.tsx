type PulseRingsProps = {
  /** Starting radius of rings in pixels */
  startRadius?: number;
  /** How far rings expand beyond startRadius in pixels */
  expandDistance?: number;
  /** Color of the rings (CSS color value) */
  color?: string;
  /** Number of rings in the animation */
  ringCount?: number;
  /** Duration of one complete animation cycle in seconds */
  duration?: number;
  /** Starting stroke opacity (0-1) */
  strokeOpacity?: number;
  /** Starting fill opacity (0-1) */
  fillOpacity?: number;
  /** Starting stroke width in pixels */
  strokeWidth?: number;
  /** Blur amount for glow effect */
  glowBlur?: number;
  /** Additional CSS classes */
  className?: string;
};

export function PulseRings({
  startRadius = 150,
  expandDistance = 200,
  color = '#3b82f6',
  ringCount = 4,
  duration = 6,
  strokeOpacity = 0.15,
  fillOpacity = 0.05,
  strokeWidth = 1,
  glowBlur = 2,
  className = '',
}: PulseRingsProps) {
  const rings = Array.from({ length: ringCount }, (_, i) => i);
  const endRadius = startRadius + expandDistance;
  const svgSize = (endRadius + 20) * 2;
  const uniqueId = `pulse-${startRadius}-${endRadius}-${strokeOpacity}-${fillOpacity}`.replace(/\./g, '_');

  return (
    <div
      className={`pulse-rings-container ${className}`}
      style={{
        position: 'absolute',
        width: svgSize,
        height: svgSize,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        style={{
          overflow: 'visible',
        }}
      >
        <defs>
          <filter
            id={`${uniqueId}-glow`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation={glowBlur} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {rings.map((i) => {
          const delay = (i / ringCount) * duration;
          const center = svgSize / 2;

          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={startRadius}
              fill={color}
              stroke={color}
              strokeWidth={strokeWidth}
              filter={`url(#${uniqueId}-glow)`}
              opacity="0"
              style={{
                animation: `${uniqueId}-expand ${duration}s ease-out infinite`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </svg>

      <style>{`
        @keyframes ${uniqueId}-expand {
          0% {
            r: ${startRadius}px;
            opacity: ${strokeOpacity};
            stroke-width: ${strokeWidth}px;
            fill-opacity: ${fillOpacity};
          }
          100% {
            r: ${endRadius}px;
            opacity: 0;
            stroke-width: ${strokeWidth * 0.5}px;
            fill-opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
