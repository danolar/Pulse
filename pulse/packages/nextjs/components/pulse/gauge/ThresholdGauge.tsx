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

  const padding = Math.max(14, Math.round(size * 0.1));
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - padding;
  const innerRadius = outerRadius * 0.7;

  const showLabel = !compact && size >= 180;
  const percentClass = size >= 260 ? "text-4xl" : size >= 200 ? "text-3xl" : size >= 150 ? "text-2xl" : "text-xl";
  const markSize = size >= 260 ? 44 : 36;

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
        className="pointer-events-none absolute left-1/2 top-[47%] w-full -translate-x-1/2 -translate-y-1/2 px-4 text-center"
        aria-hidden
      >
        <motion.div
          className="inline-flex flex-col items-center"
          animate={reducedMotion || !pulseActive ? undefined : { scale: [1, 1.02, 1] }}
          transition={reducedMotion ? undefined : { duration: pulseDuration, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className={`${percentClass} font-semibold leading-none text-base-content`}>{percentage}%</span>
          {showStateLabel ? (
            <span className="pulse-label mt-2" style={{ color: progressColor }}>
              {gaugeState.label}
            </span>
          ) : null}
          {showLabel ? <span className="mt-2 max-w-[9rem] text-xs leading-snug text-pulse-muted">{label}</span> : null}

          {showPulseLine ? (
            <motion.div
              className="mt-3"
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
