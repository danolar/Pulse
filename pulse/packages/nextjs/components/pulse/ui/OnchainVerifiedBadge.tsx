import { ShieldCheck } from "lucide-react";

type OnchainVerifiedBadgeProps = {
  className?: string;
};

export const OnchainVerifiedBadge = ({ className = "" }: OnchainVerifiedBadgeProps) => (
  <span
    className={`badge badge-sm gap-1 border-none bg-success/15 text-success ${className}`.trim()}
    title="Recorded on PulseOracleV2 (Sepolia)"
  >
    <ShieldCheck className="h-3 w-3" />
    Onchain verified
  </span>
);
