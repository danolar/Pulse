import type { LucideIcon } from "lucide-react";

export type SequenceStep = {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  status: "completed" | "active" | "upcoming";
};

type SequenceCardProps = {
  title: string;
  steps: SequenceStep[];
};

const statusStyles = {
  completed: "border-success bg-success/10 text-success",
  active: "border-accent bg-accent/10 text-accent",
  upcoming: "border-base-content/10 bg-base-200 text-pulse-muted",
};

export const SequenceCard = ({ title, steps }: SequenceCardProps) => {
  return (
    <div className="pulse-card flex h-full flex-col p-5">
      <h3 className="pulse-section-title mb-4 shrink-0">{title}</h3>
      <ol className="min-h-0 flex-1 space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.id} className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${statusStyles[step.status]}`}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <p className="text-sm font-medium leading-snug text-base-content">
                  {index + 1}. {step.label}
                </p>
                {step.description ? (
                  <p className="mt-0.5 text-sm leading-relaxed text-pulse-muted">{step.description}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
