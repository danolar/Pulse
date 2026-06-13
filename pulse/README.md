# Pulse

> Open weighted verification protocol UI built on Scaffold-ETH 2.

See the [root README](../README.md) for the product overview.

## Stack

- **Hardhat** — smart contracts (`PulseOracle` + CRE adapter hooks)
- **Next.js** — `/` console and `/setup` wizard
- **Recharts** — radial gauge
- **Framer Motion** — pulse / timeline animations
- **World ID (@worldcoin/idkit)** — device and Orb verification flows

## Requirements

- [Node (>= v22.10.0)](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/getting-started/install)

## Quickstart

```bash
yarn install
yarn chain      # terminal 1
yarn deploy     # terminal 2
yarn start      # terminal 3
```

- Console: [http://localhost:3000](http://localhost:3000)
- Setup wizard: [http://localhost:3000/setup](http://localhost:3000/setup)

## External integrations (paused setup)

Follow [SETUP-EXTERNAL.md](./SETUP-EXTERNAL.md) for World ID, Walrus, MCP, and CRE CLI — one phase at a time.

Optional env vars in `packages/nextjs/.env.local`:

```bash
NEXT_PUBLIC_WORLD_APP_ID=app_...
NEXT_PUBLIC_WORLD_RP_ID=rp_...
```

Without World ID env vars, verification buttons use mock success for demo UI.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Pulse console (gauge, owner/requestor actions, attempts, timeline) |
| `/setup` | One-time profile setup wizard |
| `/debug` | Scaffold-ETH contract debug (local dev) |

## Mock contract wiring

All PulseOracle actions use local Zustand mock state in `services/store/pulseStore.ts`. Each action button includes a `// TODO: wire to PulseOracle.functionName()` comment for mechanical replacement once the contract is deployed.

## License

MIT
