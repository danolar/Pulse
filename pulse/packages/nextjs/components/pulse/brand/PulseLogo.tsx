import { PulseMark } from "~~/components/pulse/brand/PulseMark";
import { PULSE_COLORS } from "~~/constants/pulseBrand";

type PulseLogoProps = {
  markSize?: number;
  showTagline?: boolean;
  className?: string;
  animateMark?: boolean;
};

const WORDMARK_HEIGHT = "1.375rem";

export const PulseLogo = ({
  markSize = 22,
  showTagline = true,
  className = "",
  animateMark = true,
}: PulseLogoProps) => {
  return (
    <div className={`flex min-w-0 gap-2 ${className}`}>
      <div className="flex shrink-0 items-center" style={{ height: WORDMARK_HEIGHT }}>
        <PulseMark
          size={markSize}
          color={PULSE_COLORS.blue}
          tone="light"
          className={animateMark ? "shrink-0 animate-pulse-rings" : "shrink-0"}
        />
      </div>

      <div className="hidden min-w-0 flex-col sm:flex">
        <span
          className="pulse-wordmark flex items-center text-[1.375rem] leading-none"
          style={{ height: WORDMARK_HEIGHT }}
        >
          pulse
        </span>
        {showTagline ? <span className="pulse-logo-tagline mt-[3px]">onchain liveness oracle</span> : null}
      </div>
    </div>
  );
};
