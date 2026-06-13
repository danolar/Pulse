import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { PulseGaugeStateId } from "~~/constants/pulseBrand";

type PulseButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "safe"
  | "monitoring"
  | "accumulating"
  | "unresponsive"
  | "destructive";

type PulseButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: PulseButtonVariant;
  children: ReactNode;
};

const variantClasses: Record<PulseButtonVariant, string> = {
  primary: "btn btn-primary",
  secondary: "btn btn-outline border-primary/25 text-base-content hover:border-primary/40 hover:bg-primary/5",
  ghost: "btn btn-ghost",
  safe: "btn btn-pulse-safe",
  monitoring: "btn btn-pulse-monitoring",
  accumulating: "btn btn-pulse-accumulating",
  unresponsive: "btn btn-pulse-unresponsive",
  destructive: "btn btn-pulse-unresponsive",
};

/** Map gauge state ids to button variants for lifecycle-driven actions */
export const pulseButtonVariantForState = (stateId: PulseGaugeStateId): PulseButtonVariant => stateId;

export const PulseButton = ({
  variant = "primary",
  className = "",
  children,
  type = "button",
  ...props
}: PulseButtonProps) => {
  return (
    <button type={type} className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
