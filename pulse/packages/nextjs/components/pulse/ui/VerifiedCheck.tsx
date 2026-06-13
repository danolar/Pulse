import { Check } from "lucide-react";

type VerifiedCheckProps = {
  verified: boolean;
  label?: string;
};

export const VerifiedCheck = ({ verified, label = "Verified" }: VerifiedCheckProps) => (
  <span
    className={`inline-flex items-center gap-1.5 text-xs font-medium ${
      verified ? "text-success" : "text-pulse-muted"
    }`}
    aria-label={verified ? label : `${label} pending`}
  >
    <span
      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
        verified ? "border-success/30 bg-success/10" : "border-base-content/15 bg-base-200/60"
      }`}
    >
      {verified ? <Check className="h-3 w-3" strokeWidth={2.5} /> : null}
    </span>
    {verified ? label : "Pending"}
  </span>
);
