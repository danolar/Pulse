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
  showPulseLine?: boolean;
  pulseActive?: boolean;
  pulseDuration?: number;
  pulseOpacity?: number;
};

const GAUGE_START_ANGLE = 210;
const GAUGE_END_ANGLE = -30;

export const CONSOLE_GAUGE_SIZE = 280;

export const ThresholdGauge = ({
  value,
  max = 100,
  label = "Progress to threshold",
  size = 200,
  compact = false,
  showPulseLine = false,
  pulseActive = true,
  pulseDuration = 2.4,
  pulseOpacity = 1,
}: ThresholdGaugeProps) => {
  const reducedMotion = useReducedMotion();
  const clamped = Math.min(Math.max(value, 0), max);
  const percentage = Math.round((clamped / max) * 100);

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
  const pulseLineWidth = size >= 260 ? 176 : 140;
  const pulseLineHeight = size >= 260 ? 36 : 30;

  return (
    <div
      className="relative mx-auto shrink-0 [&_.recharts-wrapper]:mx-auto [&_.recharts-wrapper]:max-w-none"
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      role="img"
      aria-label={`${label}: ${percentage}%`}
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
          <Cell fill="var(--color-primary)" />
          <Cell fill="color-mix(in srgb, var(--color-base-content) 8%, transparent)" />
        </Pie>
      </PieChart>

      <div
        className="pointer-events-none absolute left-1/2 top-[47%] w-full -translate-x-1/2 -translate-y-1/2 px-4 text-center"
        aria-hidden
      >
        <motion.div
          className="inline-flex flex-col items-center"
          animate={reducedMotion ? undefined : { scale: [1, 1.02, 1] }}
          transition={reducedMotion ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className={`${percentClass} font-bold leading-none text-base-content`}>{percentage}%</span>
          {showLabel ? <span className="mt-2 max-w-[9rem] text-xs leading-snug text-pulse-muted">{label}</span> : null}

          {showPulseLine ? (
            <svg
              className="mt-3"
              width={pulseLineWidth}
              height={pulseLineHeight}
              viewBox="0 0 176 36"
              aria-hidden
              style={{ opacity: pulseOpacity }}
            >
              <motion.path
                d="M 0 18 L 30 18 L 40 4 L 50 32 L 60 18 L 176 18"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0.45 }}
                animate={
                  reducedMotion || !pulseActive
                    ? { pathLength: 1, opacity: 0.35 }
                    : { pathLength: [0, 1], opacity: [0.5, 1, 0.5] }
                }
                transition={
                  reducedMotion ? { duration: 0 } : { duration: pulseDuration, repeat: Infinity, ease: "linear" }
                }
              />
            </svg>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
};
