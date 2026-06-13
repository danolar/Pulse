# Pulse — Chainlink CRE

CRE workflows for the Pulse protocol (spec §10).

| Workflow | Role |
|----------|------|
| `pulse-keeper` | Cron keeper — open/close verification attempts (`keeperTick`) |
| `pulse-onchain-activity` | `ONCHAIN_TX` adapter — evaluate wallet inactivity, `reportSignal` |

## Prerequisites

1. [CRE CLI](https://docs.chain.link/cre/getting-started/cli-installation) — `yarn install:cre`
2. `cre login` — Chainlink account
3. [Bun](https://bun.sh) ≥ 1.2.21 — workflow compilation
4. Deployed `PulseOracle` — `yarn deploy --tags PulseOracle`

## Quick local loop (no CRE login)

With `yarn chain` running:

```bash
yarn deploy --tags PulseOracle
export PULSE_ORACLE_ADDRESS=0x...   # from deploy output
yarn simulate:onchain-activity        # dry run
yarn simulate:onchain-activity -- --broadcast
```

## CRE simulation

```bash
cp cre/.env.example cre/.env
# Add CRE_ETH_PRIVATE_KEY (hardhat #0 for local broadcast tests)

cd cre/pulse-keeper && bun install && cd ../..
cre workflow simulate pulse-keeper --target local-settings --project-root cre

cd cre/pulse-onchain-activity && bun install && cd ../..
cre workflow simulate pulse-onchain-activity --target local-settings --project-root cre
```

Update `config.staging.json` in each workflow with your deployed `pulseOracleAddress` and profile owner addresses.

## Onchain broadcast from CRE

Add `--broadcast` when simulating workflows that write to `PulseOracle` (after wiring EVM writes in `main.ts` for production).

## Verify setup

```bash
yarn verify:cre
```
