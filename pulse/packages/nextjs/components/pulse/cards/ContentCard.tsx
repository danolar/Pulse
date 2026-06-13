import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";

type ContentCardProps = {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  badge?: ReactNode;
  children?: ReactNode;
  onPreview?: () => void;
  onEdit?: () => void;
};

export const ContentCard = ({ title, subtitle, icon: Icon, badge, children, onPreview, onEdit }: ContentCardProps) => {
  return (
    <article className="pulse-card pulse-card-interactive flex h-full min-h-[320px] flex-col p-5">
      <div className="mb-4 space-y-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-base-300 text-primary">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold leading-snug text-base-content">{title}</h3>
            {subtitle ? <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-pulse-muted">{subtitle}</p> : null}
          </div>
        </div>
        {badge ? <div className="flex flex-wrap gap-2">{badge}</div> : null}
      </div>

      {children ? (
        <div className="mb-4 flex min-h-[8.5rem] flex-1 items-center justify-center py-1">{children}</div>
      ) : (
        <div className="flex-1" />
      )}

      <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
        {onPreview ? (
          <PulseButton variant="secondary" className="w-full btn-sm" onClick={onPreview}>
            View
          </PulseButton>
        ) : null}
        {onEdit ? (
          <PulseButton variant="ghost" className="w-full btn-sm" onClick={onEdit}>
            Edit
          </PulseButton>
        ) : null}
      </div>
    </article>
  );
};
