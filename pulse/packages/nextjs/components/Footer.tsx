import Link from "next/link";
import { SHOW_SCAFFOLD_DEV_UI } from "~~/constants/pulseAppConfig";

export const Footer = () => {
  return (
    <footer className={`mt-auto min-h-0 px-1 py-8 ${SHOW_SCAFFOLD_DEV_UI ? "pb-24" : "pb-8"}`}>
      <div className="pulse-page-x mx-auto max-w-7xl">
        <div className="mb-4 h-px w-10 bg-primary/40" aria-hidden />
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-pulse-muted">
          <span className="pulse-label normal-case tracking-wide text-pulse-muted">silent by default</span>
          <span aria-hidden className="hidden sm:inline">
            ·
          </span>
          <span>weighted, randomized, verifiable</span>
          {SHOW_SCAFFOLD_DEV_UI ? (
            <>
              <span aria-hidden className="hidden sm:inline">
                ·
              </span>
              <Link href="/debug" className="link">
                debug
              </Link>
              <span aria-hidden>·</span>
              <Link href="/blockexplorer" className="link">
                explorer
              </Link>
            </>
          ) : null}
          <span aria-hidden className="hidden sm:inline">
            ·
          </span>
          <a href="https://github.com/danolar/Pulse" target="_blank" rel="noreferrer" className="link">
            github
          </a>
        </div>
      </div>
    </footer>
  );
};
