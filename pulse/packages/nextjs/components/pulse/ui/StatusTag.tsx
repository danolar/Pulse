type StatusTagProps = {
  label: string;
  tone?: "neutral" | "success" | "warning" | "accent";
};

const toneClasses: Record<NonNullable<StatusTagProps["tone"]>, string> = {
  neutral: "bg-base-300 text-pulse-muted",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  accent: "bg-accent/15 text-accent",
};

export const StatusTag = ({ label, tone = "neutral" }: StatusTagProps) => (
  <span className={`badge badge-sm border-none ${toneClasses[tone]}`}>{label}</span>
);
