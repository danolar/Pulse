import { PULSE_COLORS } from "~~/constants/pulseBrand";

type PulseMarkProps = {
  size?: number;
  className?: string;
  /** State / mark color — defaults to Astro Blue */
  color?: string;
  /** Light surfaces use softer ring opacity; solid uses full state color on all rings */
  tone?: "light" | "solid";
};

const VIEWBOX = 48;
const CENTER = VIEWBOX / 2;
const DOT_RADIUS = 2.75;
const RING_RADII = [6.75, 10.75, 14.75] as const;
const RING_STROKE = 1.15;

const ringOpacities = {
  light: [0.2, 0.34, 0.52] as const,
  solid: [0.28, 0.48, 0.72] as const,
};

/**
 * Concentric rings logomark — brand construction (dot + 3 rings).
 * @see Pulse Brand guidelines
 */
export const PulseMark = ({
  size = 40,
  className = "",
  color = PULSE_COLORS.blue,
  tone = "light",
}: PulseMarkProps) => {
  const opacities = ringOpacities[tone];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {RING_RADII.map((radius, index) => (
        <circle
          key={radius}
          cx={CENTER}
          cy={CENTER}
          r={radius}
          stroke={color}
          strokeWidth={RING_STROKE}
          strokeOpacity={opacities[index]}
        />
      ))}
      <circle cx={CENTER} cy={CENTER} r={DOT_RADIUS} fill={color} />
    </svg>
  );
};
