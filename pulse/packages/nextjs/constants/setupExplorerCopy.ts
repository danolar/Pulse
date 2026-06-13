/** StageSignals — Explorer scope (spec: no per-user OAuth in Explorer). */
export const SIGNALS_STAGE_SCOPE_NOTE =
  "Authorizing an adapter here is an onchain act: this signer address may report weighted signals for your profile. It does not connect a user's Google account, phone, or other personal accounts. Those connections happen inside consumer apps (for example Legacy Ledger) during that user's onboarding, via the consumer's own OAuth and the adapter data-plane API — never in Pulse Explorer.";
