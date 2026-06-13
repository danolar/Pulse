/**
 * Scaffold-ETH dev affordances: floating bar (faucet, ETH price, debug/explorer shortcuts),
 * debug & block explorer nav links, and the manual "Acting as" role switcher.
 *
 * Set NEXT_PUBLIC_SHOW_SCAFFOLD_DEV_UI=true in .env.local for local hackathon dev.
 * Leave unset or false for demo/production builds.
 */
export const SHOW_SCAFFOLD_DEV_UI = process.env.NEXT_PUBLIC_SHOW_SCAFFOLD_DEV_UI === "true";
