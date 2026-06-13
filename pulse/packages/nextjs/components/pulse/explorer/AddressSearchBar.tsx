"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { isEthAddress, pushRecentSearch } from "~~/utils/pulse/explorerAddress";

type AddressSearchBarProps = {
  label?: string;
  placeholder?: string;
  className?: string;
  size?: "default" | "large";
};

const SIZE_CLASSES = {
  default: {
    row: "h-10",
    input: "input-sm h-10 min-h-10 rounded-2xl font-mono text-sm",
    button: "btn-sm h-10 min-h-10 rounded-2xl px-3",
    icon: "h-4 w-4",
  },
  large: {
    row: "h-12",
    input: "h-12 min-h-12 rounded-2xl font-mono text-sm",
    button: "h-12 min-h-12 rounded-2xl px-5",
    icon: "h-4 w-4",
  },
} as const;

export const AddressSearchBar = ({
  label = "Wallet address",
  placeholder = "0x…",
  className = "",
  size = "default",
}: AddressSearchBarProps) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const styles = SIZE_CLASSES[size];

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

  return (
    <form onSubmit={handleSubmit} className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <label className="sr-only" htmlFor="address-search">
        {label}
      </label>
      <div className={`flex min-w-0 items-stretch gap-2 ${styles.row}`}>
        <input
          id="address-search"
          className={`input input-bordered w-full min-w-0 ${styles.input}`}
          placeholder={placeholder}
          value={query}
          onChange={event => {
            setQuery(event.target.value);
            if (error) setError(null);
          }}
        />
        <PulseButton
          type="submit"
          className={`shrink-0 gap-2 ${styles.button}`}
          aria-label="Search profile"
        >
          <Search className={styles.icon} />
          {size === "large" ? <span>Search</span> : null}
        </PulseButton>
      </div>
      {error ? <span className="text-xs text-error">{error}</span> : null}
    </form>
  );
};
