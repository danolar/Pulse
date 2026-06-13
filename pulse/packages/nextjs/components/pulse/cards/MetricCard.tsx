import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "error" | "info";
};

const toneClasses = {
  default: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  error: "text-error bg-error/10",
  info: "text-info bg-info/10",
};

export const MetricCard = ({ label, value, icon: Icon, tone = "default" }: MetricCardProps) => {
  return (
    <div className="pulse-card flex h-full min-h-[7.5rem] flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="text-sm leading-snug text-pulse-muted">{label}</p>
          <p className="text-3xl font-bold leading-none tracking-tight text-base-content">{value}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
    </div>
  );
};
