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
3. **Chainlink MCP** needs an **OpenAI API key** (not Cursor) for doc search. Add to your shell profile:
   ```bash
   export OPENAI_API_KEY=sk-...
   ```
   Or set it in Cursor → Settings → MCP → chainlink → env. The config uses `"${env:OPENAI_API_KEY}"`.
4. Restart MCP in Cursor (Settings → MCP)
5. Confirm **context7**, **chainlink**, **worldcoin-developer-portal** connect (chainlink should no longer log `OpenAI API key not found`)

Validate JSON:

```bash
python3 -m json.tool pulse/.cursor/mcp.json
```

## Phase 2 — World ID Developer Portal

1. Register at https://developer.world.org
2. Open your app → click **Enable World ID 4.0** (RP migration banner) if present
3. Copy `packages/nextjs/.env.local.example` → `packages/nextjs/.env.local`
4. Set env vars (they are **not** the same value):
   - `NEXT_PUBLIC_WORLD_APP_ID` → `app_...`
   - `NEXT_PUBLIC_WORLD_RP_ID` → `rp_...` (public relying party id)
   - `WORLD_RP_SIGNING_KEY` → **signing key** from the same RP section (private hex key, usually `0x` + 64 hex chars — never put `rp_` here)
5. **World ID dev setup (two separate knobs):**
   - `NEXT_PUBLIC_WORLD_ID_ENVIRONMENT=staging` → IDKit + [simulator.worldcoin.org](https://simulator.worldcoin.org) (modo prueba)
   - Verify en servidor → `developer.world.org` por defecto (app migrada a 4.0). **No hace falta poner production** solo para verify.
   - Solo activa `NEXT_PUBLIC_WORLD_ID_USE_STAGING_VERIFY=true` si tu app también está migrada en `staging-developer.worldcoin.org`.
6. Restart `yarn start`
7. On `/setup`: Step 1 Device, then Step 2 Orb. World ID is independent of wallet connect.

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
cre login   # interactive — required for cre init / deploy
```

Install [Bun](https://bun.sh) (≥ 1.2.21) for TypeScript workflow compilation.

### Deploy PulseOracle (local)

With `yarn chain` running:

```bash
cd pulse && yarn deploy:pulse-oracle
export PULSE_ORACLE_ADDRESS=0x...   # from deploy logs
echo "NEXT_PUBLIC_PULSE_ORACLE_ADDRESS=$PULSE_ORACLE_ADDRESS" >> packages/nextjs/.env.local
```

Update `cre/pulse-keeper/config.staging.json` and `cre/pulse-onchain-activity/config.staging.json` with the same oracle address and profile owner addresses.

### Workflows

| Workflow | Path | Role |
|----------|------|------|
| Keeper | `cre/pulse-keeper/` | Cron `keeperTick` (open/close attempts) |
| ONCHAIN_TX | `cre/pulse-onchain-activity/` | Inactivity evaluation → `reportSignal` |

See [cre/README.md](cre/README.md) for full CRE setup.

### Local simulation (no CRE login)

```bash
cd pulse && yarn simulate:onchain-activity
cd pulse && yarn simulate:onchain-activity -- --broadcast
```

In the app: console → **Chainlink · ONCHAIN_TX** → **Run evaluation** (uses `/api/chainlink/activity`).

### CRE CLI simulation (after login + bun install)

```bash
cd cre/pulse-keeper && bun install && cd ../..
yarn cre:simulate:keeper

cd cre/pulse-onchain-activity && bun install && cd ../..
yarn cre:simulate:onchain
```

Verify CLI:

```bash
cd pulse && yarn verify:cre
```

Use **Chainlink MCP** in Cursor for workflow docs. Live DON deployment requires `cre login` and Chainlink team support during the event.
