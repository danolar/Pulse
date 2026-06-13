"use client";

import { EXPLORER_BROWSE_NOTE } from "~~/constants/explorerCopy";

export const ExplorerBrowseNote = () => (
  <section className="rounded-2xl border border-base-content/10 bg-base-200/40 px-4 py-3">
    <p className="text-sm text-pulse-muted">{EXPLORER_BROWSE_NOTE}</p>
  </section>
);
