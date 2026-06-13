import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  eyebrow?: string;
};

export const SectionHeader = ({ title, subtitle, action, eyebrow }: SectionHeaderProps) => {
  const heading = (
    <div className="min-w-0 space-y-2">
      {eyebrow ? <p className="pulse-label m-0">{eyebrow}</p> : null}
      <h1 className="pulse-page-title">{title}</h1>
      {subtitle ? (
        <p className="m-0 max-w-2xl text-sm font-light leading-relaxed text-pulse-muted sm:text-base">{subtitle}</p>
      ) : null}
    </div>
  );

  return (
    <div className="mb-6 w-full text-left sm:mb-8">
      {action ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          {heading}
          <div className="shrink-0">{action}</div>
        </div>
      ) : (
        heading
      )}
    </div>
  );
};
