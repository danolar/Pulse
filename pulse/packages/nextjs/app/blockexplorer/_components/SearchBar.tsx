"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isAddress, isHex } from "viem";
import { hardhat } from "viem/chains";
import { usePublicClient } from "wagmi";

export const SearchBar = () => {
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();

  const client = usePublicClient({ chainId: hardhat.id });

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isHex(searchInput)) {
      try {
        const tx = await client?.getTransaction({ hash: searchInput });
        if (tx) {
          router.push(`/blockexplorer/transaction/${searchInput}`);
          return;
        }
      } catch (error) {
        console.error("Failed to fetch transaction:", error);
      }
    }

    if (isAddress(searchInput)) {
      router.push(`/blockexplorer/address/${searchInput}`);
      return;
    }
  };

  return (
    <form onSubmit={handleSearch} className="mb-5 flex w-full items-center gap-3">
      <input
        className="input input-bordered w-full min-w-0 flex-1 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        type="text"
        value={searchInput}
        placeholder="Search by hash or address"
        onChange={e => setSearchInput(e.target.value)}
      />
      <button className="btn btn-sm btn-primary" type="submit">
        Search
      </button>
    </form>
  );
};
