"use client";

import { Check } from "lucide-react";

export type VerificationStep = {
  id: string;
  label: string;
  description?: string;
  status: "completed" | "active" | "upcoming";
};

type VerificationStepperProps = {
  steps: VerificationStep[];
  title?: string;
};

export const VerificationStepper = ({ steps, title = "Verification window" }: VerificationStepperProps) => {
  return (
    <div className="pulse-card flex h-full flex-col p-5">
      <h3 className="pulse-section-title mb-5 shrink-0">{title}</h3>
      <ol className="min-h-0 flex-1 space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isCompleted = step.status === "completed";
          const isActive = step.status === "active";

          return (
            <li key={step.id} className="flex gap-4">
              <div className="flex w-9 shrink-0 flex-col items-center">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                    isCompleted
                      ? "border-success bg-success text-white"
                      : isActive
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-base-content/15 bg-base-200 text-pulse-muted"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
                </span>
                {!isLast ? <span className="my-1 w-px flex-1 min-h-8 bg-base-content/10" aria-hidden /> : null}
              </div>
              <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-5"}`}>
                <p
                  className={`text-sm font-medium leading-snug ${isActive ? "text-base-content" : "text-base-content/90"}`}
                >
                  {step.label}
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
