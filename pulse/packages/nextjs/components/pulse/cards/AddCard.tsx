import Link from "next/link";
import { Plus } from "lucide-react";

type AddCardProps = {
  title: string;
  description: string;
  href: string;
};

export const AddCard = ({ title, description, href }: AddCardProps) => {
  return (
    <Link
      href={href}
      className="group pulse-card pulse-card-interactive flex h-full min-h-[320px] flex-col items-center justify-center gap-3 border-2 border-dashed border-base-content/15 p-6 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-base-300 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-content">
        <Plus className="h-6 w-6" aria-hidden />
      </span>
      <div className="max-w-xs">
        <p className="text-base font-semibold text-base-content">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-pulse-muted">{description}</p>
      </div>
    </Link>
  );
};
