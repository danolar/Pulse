import { RECENT_SEARCHES_KEY } from "~~/constants/explorerCopy";

const ETH_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

export const isEthAddress = (value: string): boolean => ETH_ADDRESS.test(value.trim());

export const normalizeAddress = (value: string): string => value.trim().toLowerCase();

export const getRecentSearches = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string" && isEthAddress(item));
  } catch {
    return [];
  }
};

export const pushRecentSearch = (address: string): void => {
  if (typeof window === "undefined" || !isEthAddress(address)) return;
  const normalized = normalizeAddress(address);
  const next = [normalized, ...getRecentSearches().filter(item => item !== normalized)].slice(0, 8);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
};
