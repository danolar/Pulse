"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getRecentSearches } from "~~/utils/pulse/explorerAddress";

export const RecentSearches = () => {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(getRecentSearches());
  }, []);

  if (recent.length === 0) return null;

  return (
    <div className="mx-auto w-full max-w-lg">
      <p className="mb-2 text-xs font-medium text-pulse-muted">Recent</p>
      <ul className="flex flex-wrap gap-2">
        {recent.map(address => (
          <li key={address}>
            <Link
              href={`/explorer/${address}`}
              className="rounded-xl border border-base-content/10 bg-base-200/40 px-3 py-1.5 font-mono text-xs hover:border-primary/30"
            >
              {address.slice(0, 6)}…{address.slice(-4)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
