import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export const PageShell = ({ children, className = "" }: PageShellProps) => {
  return (
    <div className={`pulse-page-x mx-auto w-full max-w-7xl py-6 lg:py-8 ${className}`}>{children}</div>
  );
};
