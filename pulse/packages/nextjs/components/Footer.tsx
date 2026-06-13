import React from "react";

export const Footer = () => {
  return (
    <footer className="mt-auto min-h-0 px-1 py-6 pb-24">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 text-center text-sm text-pulse-muted">
        <span>Pulse · open verification protocol</span>
        <span aria-hidden className="hidden sm:inline">
          ·
        </span>
        <a href="https://github.com/danolar/Pulse" target="_blank" rel="noreferrer" className="link">
          GitHub
        </a>
        <span aria-hidden>·</span>
        <a href="https://mylegacyledger.com" target="_blank" rel="noreferrer" className="link">
          Legacy Ledger
        </a>
      </div>
    </footer>
  );
};
