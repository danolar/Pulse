"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { isEthAddress, pushRecentSearch } from "~~/utils/pulse/explorerAddress";

type AddressSearchBarProps = {
  label?: string;
  placeholder?: string;
  className?: string;
  size?: "default" | "large";
};

export const AddressSearchBar = ({
  label = "Wallet address",
  placeholder = "0x…",
  className = "",
  size = "default",
}: AddressSearchBarProps) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!isEthAddress(trimmed)) {
      setError("Enter a valid Ethereum address (0x…).");
      return;
    }
    setError(null);
    pushRecentSearch(trimmed);
    router.push(`/explorer/${trimmed}`);
  };

  const inputClass =
    size === "large"
      ? "input input-bordered w-full rounded-2xl font-mono text-sm"
      : "input input-bordered input-sm h-9 min-h-9 w-full min-w-[8rem] max-w-xs rounded-2xl font-mono text-xs sm:max-w-sm";

  return (
    <form onSubmit={handleSubmit} className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <label className="sr-only" htmlFor="address-search">
        {label}
      </label>
      <div className="flex min-w-0 items-center gap-2">
        <input
          id="address-search"
          className={inputClass}
          placeholder={placeholder}
          value={query}
          onChange={event => {
            setQuery(event.target.value);
            if (error) setError(null);
          }}
        />
        <button type="submit" className="btn btn-primary btn-sm btn-square shrink-0 rounded-xl" aria-label="Search">
          <Search className="h-4 w-4" />
        </button>
      </div>
      {error ? <span className="text-xs text-error">{error}</span> : null}
    </form>
  );
};
