# Coolify deployment checklist — see also Dockerfile header

## Coolify settings

| Field | Value |
|-------|--------|
| Repository | `https://github.com/danolar/Pulse` |
| Branch | `main` |
| **Base Directory** | **`pulse`** |
| Build Pack | Dockerfile |
| Port Exposes | `3000` |

## Build arguments (NEXT_PUBLIC_* only)

```
NEXT_PUBLIC_ALCHEMY_API_KEY
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
NEXT_PUBLIC_PULSE_ORACLE_ADDRESS=0x41e60b7c2f067a3bb5a655959c944f7f28bd66e3
NEXT_PUBLIC_PULSE_CRE_ADAPTER_ADDRESS=0xAbb7d2B178Ed352301d1EebF147E1c55DfC232b7
NEXT_PUBLIC_WORLD_APP_ID
NEXT_PUBLIC_WORLD_RP_ID
NEXT_PUBLIC_WORLD_ID_ENVIRONMENT=staging
NEXT_PUBLIC_SHOW_SCAFFOLD_DEV_UI=false
```

Do **not** pass secrets (`WORLD_RP_SIGNING_KEY`, `POSTGRES_URL`, `CRON_SECRET`, etc.) as build args — only as **runtime** environment variables.

## Runtime environment (after deploy)

```
APP_BASE_URL=https://your-coolify-domain.com
WORLD_RP_SIGNING_KEY=0x...
POSTGRES_URL=postgresql://...
```

Register `APP_BASE_URL` in World ID Portal and WalletConnect Cloud.

## Verify locally before push

```bash
cd pulse
DOCKER_BUILD=1 yarn next:build:docker
```

## Common failures

| Error | Fix |
|-------|-----|
| ESLint / prettier on build | Pull latest — uses `yarn next:build:docker` |
| `eslint` in next.config | Removed — Next.js 16 no longer supports it |
| Wrong repo root | Base Directory must be **`pulse`**, not empty |
| Secrets in build args | Move to runtime env only |
