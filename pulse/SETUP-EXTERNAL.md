# External setup (paused plan)

One phase at a time. Do not skip the **Done** checklist before moving on.

## Phase 0 — Local base

```bash
cd pulse
yarn install
yarn chain    # terminal 1
yarn deploy   # terminal 2
yarn start    # terminal 3
```

Verify: `http://localhost:3000`, `/setup`, `/debug` return 200.

## Phase 0b — Secrets hygiene

- `.cursor/mcp.json` and `.env.local` are gitignored.
- Template: [`.cursor/mcp.json.example`](.cursor/mcp.json.example)
- **Rotate** any Worldcoin MCP key that was ever committed (see git history).
- Paste the new key into local `pulse/.cursor/mcp.json` only.

## Phase 1 — MCP in Cursor

1. Copy `pulse/.cursor/mcp.json.example` → `pulse/.cursor/mcp.json`
2. Replace `YOUR_WORLD_ID_MCP_API_KEY` with your rotated Developer Portal MCP token
3. Restart MCP in Cursor (Settings → MCP)
4. Confirm **context7**, **chainlink**, **worldcoin-developer-portal** connect

Validate JSON:

```bash
python3 -m json.tool pulse/.cursor/mcp.json
```

## Phase 2 — World ID Developer Portal

1. Register at https://developer.world.org
2. Copy `packages/nextjs/.env.local.example` → `packages/nextjs/.env.local`
3. Set `NEXT_PUBLIC_WORLD_APP_ID` and `NEXT_PUBLIC_WORLD_RP_ID`
4. Restart `yarn start`
5. On `/setup`, click **Verify & Create Profile** (real widget, not mock)

```bash
cd packages/nextjs && yarn verify:world-id-env
```

## Phase 3 — Walrus testnet

Track progress in [`.local/SETUP_NOTES.md`](.local/SETUP_NOTES.md) (gitignored).

1. Create a Sui wallet for Walrus testnet (optional for read-only demo; public testnet publisher needs no wallet)
2. Request WAL from the Walrus testnet faucet if you plan to run your own publisher
3. Record address, network, and balance in `SETUP_NOTES.md`

Verify aggregator + demo blobs:

```bash
cd pulse && yarn verify:walrus
```

Upload/read roundtrip (seeds a new blob on testnet):

```bash
cd pulse && yarn test:walrus-roundtrip
```

In the app: complete setup, open `/`, click **View evidence** on signal timeline items.

Optional env in `packages/nextjs/.env.local`:

- `NEXT_PUBLIC_WALRUS_AGGREGATOR_URL` (default: testnet public aggregator)
- `WALRUS_PUBLISHER_URL` (for upload scripts only)

## Phase 4 — Chainlink CRE

Install CLI (macOS/Linux):

```bash
bash pulse/scripts/install-cre-cli.sh
cre version
```

Create a Chainlink account and run `cre login` when ready. Use **Chainlink MCP** in Cursor to explore workflow docs before deploying (requires `PulseOracle` later).

Verify CLI + login:

```bash
cd pulse && yarn verify:cre
```

Optional for TypeScript workflows later: install [Bun](https://bun.sh) (`bun` warning from CRE installer).
