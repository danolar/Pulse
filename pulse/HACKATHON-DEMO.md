# Pulse — Hackathon demo (Sepolia + Walrus testnet)

Guía de **3 minutos** para submission. Tracks: **Walrus**, **Chainlink CRE**, **World ID**.

Pulse es un oráculo de attestation para apps integradoras (consumers): señales ponderadas, evidencia en Walrus, check-in Orb onchain y adapters autorizados (CRE).

---

## Pre-requisitos

| Requisito | Notas |
|-----------|--------|
| Sepolia ETH | Consumer/deployer `0x4D7a…` y CRE adapter `0xAbb7…` (~0.5 ETH cada uno tras fund) |
| `packages/nextjs/.env.local` | `NEXT_PUBLIC_PULSE_ORACLE_ADDRESS`, World ID, Alchemy |
| `packages/hardhat/.keystore/` | `deployer.json` + `cre.json` (ver abajo si falta) |
| Walrus testnet | Aggregator público; sin API key |
| Frontend | `cd pulse && yarn start` → http://localhost:3000 |

Verificación rápida:

```bash
cd pulse
yarn verify:walrus
yarn verify:world-id-env
yarn cre:adapter:info --network sepolia
```

---

## Referencias onchain (Sepolia)

| Recurso | Address / ID | Etherscan |
|---------|----------------|-----------|
| **PulseOracleV2** (activo) | `0x41e60b7c2f067a3bb5a655959c944f7f28bd66e3` | [contrato](https://sepolia.etherscan.io/address/0x41e60b7c2f067a3bb5a655959c944f7f28bd66e3) |
| PulseOracle v0.1 (legacy) | `0xf954586747b7361f9deac0f943160a2d66ec8e5f` | [contrato](https://sepolia.etherscan.io/address/0xf954586747b7361f9deac0f943160a2d66ec8e5f) |
| WorldIDRouter | `0x469449f251692e0779667583026b5a1e99512157` | [contrato](https://sepolia.etherscan.io/address/0x469449f251692e0779667583026b5a1e99512157) |
| Profile owner (demo) | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | [wallet](https://sepolia.etherscan.io/address/0x70997970C51812dc3A010C7d01b50e0d17dc79C8) |
| Profile consumer | `0x4D7a23045f7C76Dc57e2aFd2eb038e2Cf743e284` | [wallet](https://sepolia.etherscan.io/address/0x4D7a23045f7C76Dc57e2aFd2eb038e2Cf743e284) |
| CRE adapter (signer) | `0xAbb7d2B178Ed352301d1EebF147E1c55DfC232b7` | [wallet](https://sepolia.etherscan.io/address/0xAbb7d2B178Ed352301d1EebF147E1c55DfC232b7) |
| **profileId** | `0x15bf86d12556e3bf30fea83549f4a6b4168fc54f8bcb9acbbb9fabbf3397fb05` | `keccak256(owner, consumer)` |

---

## Transacciones y evidencia Walrus (demo real)

### Chainlink CRE → `reportSignal` + Walrus write

| # | Tx Sepolia | Walrus blob ID | Aggregator |
|---|------------|----------------|------------|
| 1 | [0xf2c93…ba16b](https://sepolia.etherscan.io/tx/0xf2c93dbae6bea081f417b34c4b6b41811f1be5af6452ede2b5e56326bf3ba16b) | `cCB-xDKf8XmFmYeJsSdkXmrKk5bInXr7eVBzMvEQvtI` | [JSON](https://aggregator.walrus-testnet.walrus.space/v1/blobs/cCB-xDKf8XmFmYeJsSdkXmrKk5bInXr7eVBzMvEQvtI) |
| 2 | [0x78bc90…1825](https://sepolia.etherscan.io/tx/0x78bc9063e298f7a08c3842f129599cd50d2b859ad26293f9c02a6e3fecdc1825) | `QNGoDRMEErBSWOkmwFCwebFjHdw9Eqx539UM4nNKAe8` | [JSON](https://aggregator.walrus-testnet.walrus.space/v1/blobs/QNGoDRMEErBSWOkmwFCwebFjHdw9Eqx539UM4nNKAe8) |

Onchain guarda `keccak256(blobId)` (bytes32), no el string. La UI resuelve el blob vía `constants/walrusDemoBlobs.ts`.

Evento en Etherscan → **Logs** → `SignalReported(profileId, reporter=CRE adapter, walrusBlobId, epoch, timestamp)`.

### World ID check-in

Tras check-in Orb en el dashboard, buscar tx del **owner** a PulseOracleV2 con método `checkin`. Emite `SignalReported` con `walrusBlobId = 0x0` y `WeightReset`.

*(Añade aquí el hash cuando grabes la demo en vivo.)*

### ThresholdReached (opcional en demo corta)

Requiere acumular peso ≥ threshold (100) con señales CRE (weight 10 c/u). Si se alcanza, evento `ThresholdReached` incluye `auditBlobId` (ref Walrus del último blob negativo).

---

## Script de 3 minutos

| Min | Pantalla | Qué decir / hacer | Track |
|-----|----------|-------------------|-------|
| **0:00** | `/` | Pulse = oráculo de attestation para consumers; señales + evidencia + World ID | Producto |
| **0:30** | `/explorer/0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | Capa pública: lifecycle, timeline Sepolia, badge **Onchain verified** | Producto |
| **1:00** | `/dashboard/:profileId` (owner conectado) | **Check in** → IDKit Orb → `PulseOracleV2.checkin()` | **World ID** |
| **1:30** | Mismo timeline | **View evidence** → JSON desde Walrus aggregator | **Walrus read** |
| **2:00** | Terminal | `yarn cre:report -- --force` → upload Walrus + `reportSignal` | **Chainlink CRE** |
| **2:30** | Etherscan tx CRE | Log `SignalReported`, reporter = CRE adapter | Chainlink + Walrus |
| **3:00** | Link aggregator | Payload `pulse: signal-evidence`, type `onchain-inactivity` | **Walrus write** |

URLs útiles en demo:

- Explorer: http://localhost:3000/explorer/0x70997970C51812dc3A010C7d01b50e0d17dc79C8
- Oracle en Etherscan: https://sepolia.etherscan.io/address/0x41e60b7c2f067a3bb5a655959c944f7f28bd66e3#events

---

## Comandos CRE (antes o durante la demo)

```bash
cd pulse   # repo root con package.json

# Estado adapter
yarn cre:adapter:info

# Si hace falta re-fund / re-authorize (contraseña deployer)
yarn cre:adapter:fund --network sepolia
yarn cre:adapter:authorize --network sepolia

# Broadcast: Walrus upload + reportSignal (contraseña CRE de cre:adapter:generate)
yarn cre:report -- --force

# Dry-run sin tx (evalúa inactividad)
yarn simulate:onchain-activity
```

Tras cada `cre:report`, copia `Walrus blobId:` del output a `packages/nextjs/constants/walrusDemoBlobs.ts` para que **View evidence** resuelva el ref onchain.

---

## Narrativa por track (submission)

### World ID ($5k)

- Contrato: `PulseOracleV2.checkin(profileId, root, nullifier, externalNullifier, signalHash, proof[8])`
- Router Sepolia: `0x469449…`
- Frontend: `ProfileActions` → `usePulseOracleActions.checkinOnchain`
- Prueba Orb legacy (v3) vía IDKit staging

### Walrus ($12k)

- **Write:** `uploadPulseEvidence()` antes de `reportSignal` (pipeline CRE)
- **Read:** modal / `EvidenceViewer` desde aggregator testnet
- **Onchain ref:** `encodeWalrusRefForChain(blobId)` = `keccak256(bytes(blobId))`
- Demo blobs: ver tabla de txs arriba

### Chainlink CRE ($2k)

- Adapter dedicado generado (`yarn cre:adapter:generate`), no cuentas Hardhat públicas (EIP-7702 sweeper en Sepolia)
- Workflow local: `cre/pulse-onchain-activity/`
- Evaluación inactividad + `reportSignal` con peso adapter **10**
- CRE CLI: `yarn cre:report -- --force`

---

## Keystore / contraseñas (recordatorio)

| Acción | Contraseña |
|--------|------------|
| `cre:adapter:fund`, `cre:adapter:authorize`, deploy | Deployer (`yarn account:reimport-deployer`) |
| `cre:report` | CRE adapter (`yarn cre:adapter:generate`) |

Archivos: `packages/hardhat/.keystore/deployer.json`, `cre.json` (gitignored).

---

## Checklist final antes de grabar

- [ ] `yarn start` OK, wallet en Sepolia
- [ ] Explorer muestra eventos CRE con badge **Onchain verified**
- [ ] **View evidence** abre JSON Walrus en txs CRE listadas arriba
- [ ] Check-in Orb genera tx (opcional si ya hay CRE txs)
- [ ] `yarn cre:report -- --force` ejecutado una vez en ensayo
- [ ] Links Etherscan + Walrus pegados en submission

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| `invalid JSON wallet` en fund | `yarn account:reimport-deployer` (keystore corrupto en `.env`) |
| CRE balance 0 | `yarn cre:adapter:fund --network sepolia` |
| `NotAuthorizedAdapter` | `yarn cre:adapter:authorize --network sepolia` |
| View evidence deshabilitado | Añadir blob ID a `walrusDemoBlobs.ts` |
| Eventos no cargan en UI | RPC Sepolia; recargar explorer; verificar `NEXT_PUBLIC_PULSE_ORACLE_ADDRESS` |

---

## Repos y docs

- Walrus EVM × Sui: https://mystenlabs.github.io/evm-sui/
- World ID Developer Portal: https://developer.world.org
- Chainlink CRE: workflow en `pulse/cre/`
