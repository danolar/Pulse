import type { ButtonHTMLAttributes, ReactNode } from "react";

type PulseButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

type PulseButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: PulseButtonVariant;
  children: ReactNode;
};

const variantClasses: Record<PulseButtonVariant, string> = {
  primary: "btn btn-primary",
  secondary: "btn btn-outline border-base-content/15 hover:bg-base-300",
  ghost: "btn btn-ghost",
  destructive: "btn btn-error text-white",
};

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
