"use client";

import { motion } from "framer-motion";
import { Cell, Pie, PieChart } from "recharts";
import { useReducedMotion } from "~~/hooks/useReducedMotion";

type ThresholdGaugeProps = {
  value: number;
  max?: number;
  label?: string;
  size?: number;
  compact?: boolean;
};

const GAUGE_START_ANGLE = 210;
const GAUGE_END_ANGLE = -30;

export const ThresholdGauge = ({
  value,
  max = 100,
  label = "Progress to threshold",
  size = 200,
  compact = false,
}: ThresholdGaugeProps) => {
  const reducedMotion = useReducedMotion();
  const clamped = Math.min(Math.max(value, 0), max);
  const percentage = Math.round((clamped / max) * 100);

  const data = [
    { name: "progress", value: percentage },
    { name: "remaining", value: 100 - percentage },
  ];

  // Leave inset so the horseshoe arc is not clipped at the SVG edges.
  const padding = Math.max(10, Math.round(size * 0.1));
  const cx = size / 2;
  // Slight downward shift: the gauge opens at the bottom, so extra headroom is needed at the top.
  const cy = size / 2 + padding * 0.2;
  const outerRadius = size / 2 - padding;
  const innerRadius = outerRadius * 0.72;

  const showLabel = !compact && size >= 160;
  const percentClass = size >= 200 ? "text-3xl" : size >= 150 ? "text-2xl" : "text-xl";

  return (
    <div
      className="relative mx-auto shrink-0"
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      role="img"
      aria-label={`${label}: ${percentage}%`}
    >
      <PieChart width={size} height={size} className="block">
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
          <Cell fill="var(--color-primary)" />
          <Cell fill="color-mix(in srgb, var(--color-base-content) 8%, transparent)" />
        </Pie>
      </PieChart>

      <motion.div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2 text-center"
        style={{ paddingBottom: padding * 0.35 }}
        aria-hidden
        animate={reducedMotion ? undefined : { scale: [1, 1.02, 1] }}
        transition={reducedMotion ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className={`${percentClass} font-bold leading-none text-base-content`}>{percentage}%</span>
        {showLabel ? (
          <span className="mt-1.5 line-clamp-2 max-w-[7.5rem] text-[11px] leading-snug text-pulse-muted">{label}</span>
        ) : null}
      </motion.div>
    </div>
  );
};
