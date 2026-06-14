"use client";

import { motion } from "framer-motion";
import { Cell, Pie, PieChart } from "recharts";
import { PulseMark } from "~~/components/pulse/brand/PulseMark";
import { getGaugeStateForPercentage } from "~~/constants/pulseBrand";
import { useReducedMotion } from "~~/hooks/useReducedMotion";

type ThresholdGaugeProps = {
  value: number;
  max?: number;
  label?: string;
  size?: number;
  compact?: boolean;
  showPulseLine?: boolean;
  showStateLabel?: boolean;
  showArcLabel?: boolean;
  pulseActive?: boolean;
  pulseDuration?: number;
  pulseOpacity?: number;
};

const GAUGE_START_ANGLE = 210;
const GAUGE_END_ANGLE = -30;

export const CONSOLE_GAUGE_SIZE = 280;

export { getGaugeStateForPercentage, gaugeColorForPercentage } from "~~/constants/pulseBrand";

export const ThresholdGauge = ({
  value,
  max = 100,
  label = "Progress to threshold",
  size = 200,
  compact = false,
  showPulseLine = false,
  showStateLabel = false,
  showArcLabel = true,
  pulseActive = true,
  pulseDuration = 2.4,
  pulseOpacity = 1,
}: ThresholdGaugeProps) => {
  const reducedMotion = useReducedMotion();
  const clamped = Math.min(Math.max(value, 0), max);
  const percentage = Math.round((clamped / max) * 100);
  const gaugeState = getGaugeStateForPercentage(percentage);
  const progressColor = gaugeState.color;

  const data = [
    { name: "progress", value: percentage },
    { name: "remaining", value: 100 - percentage },
  ];

  const padding = Math.max(16, Math.round(size * 0.11));
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - padding;
  const innerRadiusRatio = size >= 260 ? 0.7 : 0.78;
  const innerRadius = outerRadius * innerRadiusRatio;

  const showLabel = !compact && size >= 180 && showArcLabel;
  const percentClass =
    size >= 260 ? "text-4xl" : size >= 220 ? "text-2xl" : size >= 150 ? "text-xl" : "text-lg";
  const markSize = size >= 260 ? 44 : size >= 220 ? 30 : 28;

  return (
    <div
      className="relative mx-auto shrink-0 [&_.recharts-wrapper]:mx-auto [&_.recharts-wrapper]:max-w-none"
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      role="img"
      aria-label={`${label}: ${percentage}% · ${gaugeState.label}`}
    >
      <PieChart width={size} height={size} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} className="mx-auto block">
        <Pie
          data={data}
          cx={cx}
          cy={cy}
          startAngle={GAUGE_START_ANGLE}
          endAngle={GAUGE_END_ANGLE}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={0}
          dataKey="value"
          stroke="none"
          isAnimationActive={!reducedMotion}
        >
          <Cell fill={progressColor} />
          <Cell fill="color-mix(in srgb, var(--color-base-content) 8%, transparent)" />
        </Pie>
      </PieChart>

      <div
        className="pointer-events-none absolute left-1/2 top-[51%] w-full max-w-[72%] -translate-x-1/2 -translate-y-1/2 text-center"
        aria-hidden
      >
        <motion.div
          className="inline-flex flex-col items-center gap-1.5"
          animate={reducedMotion || !pulseActive ? undefined : { scale: [1, 1.02, 1] }}
          transition={reducedMotion ? undefined : { duration: pulseDuration, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className={`${percentClass} font-semibold leading-none text-base-content`}>{percentage}%</span>
          {showStateLabel ? (
            <span className="pulse-label text-[10px] sm:text-xs" style={{ color: progressColor }}>
              {gaugeState.label}
            </span>
          ) : null}
          {showLabel ? <span className="max-w-[9rem] text-xs leading-snug text-pulse-muted">{label}</span> : null}

          {showPulseLine ? (
            <motion.div
              style={{ opacity: pulseOpacity }}
              animate={reducedMotion || !pulseActive ? undefined : { opacity: [0.45, 1, 0.45] }}
              transition={reducedMotion ? undefined : { duration: pulseDuration, repeat: Infinity, ease: "easeInOut" }}
            >
              <PulseMark size={markSize} color={progressColor} tone="solid" />
            </motion.div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
};
