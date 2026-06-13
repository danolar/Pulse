import { PulseMark } from "~~/components/pulse/brand/PulseMark";
import { PULSE_COLORS } from "~~/constants/pulseBrand";

type PulseLogoProps = {
  markSize?: number;
  className?: string;
  animateMark?: boolean;
};

export const PulseLogo = ({
  markSize = 22,
  className = "",
  animateMark = true,
}: PulseLogoProps) => {
  return (
    <div className={`flex min-w-0 items-center gap-2 ${className}`}>
      <PulseMark
        size={markSize}
        color={PULSE_COLORS.blue}
        tone="light"
        className={animateMark ? "shrink-0 animate-pulse-rings" : "shrink-0"}
      />
      <span className="pulse-wordmark hidden text-[1.375rem] leading-none sm:inline">pulse</span>
    </div>
  );
};
