import { PULSE_COLORS } from "~~/constants/pulseBrand";

type PulseLogoProps = {
  /** Logo height in px — width scales from the asset aspect ratio (280×72). */
  height?: number;
  className?: string;
};

const VIEWBOX_WIDTH = 280;
const VIEWBOX_HEIGHT = 72;
const MARK_CENTER = 36;
const RING_RADII = [22.125, 16.125, 10.125] as const;
const RING_STROKE = 1.725;
const RING_OPACITIES = [0.2, 0.34, 0.52] as const;
const DOT_RADIUS = 4.125;

export const PulseLogo = ({ height = 44, className = "" }: PulseLogoProps) => {
  const width = Math.round((height * VIEWBOX_WIDTH) / VIEWBOX_HEIGHT);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      role="img"
      aria-label="Pulse"
    >
      {RING_RADII.map((radius, index) => (
        <circle
          key={radius}
          cx={MARK_CENTER}
          cy={MARK_CENTER}
          r={radius}
          stroke={PULSE_COLORS.blue}
          strokeWidth={RING_STROKE}
          strokeOpacity={RING_OPACITIES[index]}
        />
      ))}
      <circle cx={MARK_CENTER} cy={MARK_CENTER} r={DOT_RADIUS} fill={PULSE_COLORS.blue} />
      <text
        x="78"
        y="46.5"
        fill="currentColor"
        className="pulse-wordmark"
        fontSize="33"
        fontWeight="600"
      >
        pulse
      </text>
    </svg>
  );
};
