# pulse

> configurable onchain attestation oracle

Pulse aggregates weighted signals from independent sources, accumulates them against a configurable threshold, and emits a verifiable onchain event when that threshold is crossed. The question being answered is set per profile, not fixed by the protocol. Pulse does not interpret the outcome. Each consumer decides what it means: inheritance execution, account dormancy, behavioral risk review, key rotation, insurance triggers, and so on.

"Is this human still here?" is the flagship question (and what powers [Legacy Ledger](https://mylegacyledger.com)), but it is one instance of a general mechanism. The same engine answers "does this profile's current behavior still match its expected pattern?" where a perfectly responsive profile can still cross the threshold on deviation alone.

Built as part of Legacy Ledger at ETHGlobal New York 2026 (Ship a Feature), and shipped as open source infrastructure on its own.

---

## The idea

A single missed signal is not evidence of anything. A sustained pattern across multiple independent sources, distributed unpredictably in time and type, is.

Think of a radar in a control tower. The sweep reveals what is present, what is changing, and what has crossed a line that matters. Nobody watches every dot by hand; the system watches for you, all the time, and only demands attention when something has actually changed. Pulse is that radar: a configurable threshold engine that any application can point at any question expressible as weighted signals.

## Core pieces

- **Weighted signal accumulator**: positive and negative signals from authorized sources move a profile toward or away from a configurable threshold. A positive signal (a verified check-in, a confirmation of expected behavior) resets accumulated weight; weight only counts within the current window and epoch.
- **Randomized verification windows**: check-in attempts fire at unpredictable times, in an unpredictable order of verification type, committed onchain and revealed per attempt. Unpredictability is what makes the system hard to game.
- **Owner-bound consent**: profiles can only be created and controlled by their own verified human owner. Identity binding is dual: Device-level for routine actions, Orb-level for the highest-risk ones (freezing evaluation, reversing a false alarm).
- **Verifiable audit trail**: every signal is logged as an encrypted blob to Walrus; the outcome event carries a reference to the full evidence bundle. The public can verify signals exist; only authorized parties can read their contents.
- **Silent by default**: passive signals accumulate continuously in the background with no user interaction. The owner only acts when an attempt opens or when they choose to. A monitor that stays out of the way until it doesn't.
- **Multi-consumer isolation**: a single user can be monitored by multiple consumer apps independently. Each consumer's profile for the same user has its own configuration, adapters, threshold, and accumulated weight, completely isolated from other consumers. No state is shared or leaked between them.
- **Configurable output routing**: the outcome is always emitted as a public event, and can additionally be pushed to a notification target that is independent of whoever configured the profile.
- **Pluggable everything**: signal sources and consumers are both interfaces. New verification methods and new applications can be added without touching the core.

## How a consumer integrates

Setup follows three stages:

1. **Signals and connections**: choose what counts as evidence (onchain activity, voice check-in, trusted contact, and community-contributed adapters from an open catalog), set each one's weight, and authorize who can request an evaluation.
2. **Identity**: the user verifies with World ID inside the consumer's own app (not in Pulse). The consumer generates the proof using Pulse's shared app_id and sends it to the contract. The user never sees or touches Pulse.
3. **Rhythm**: set the cadence: window duration, attempts per window, response window, missed-attempt weight, and threshold. Attempt timing and verification type are randomized by the protocol (Chainlink VRF in production), not controlled by the consumer.

## Built with

- **World ID**: used as a recurring verification primitive and a per-action authorization fabric across three roles (owner check-ins at Device level, owner emergency actions at Orb level, requestor authorization at Device level), each bound by nullifier to the specific registered human.
- **Chainlink**: CRE workflows for automated onchain signal evaluation and attempt scheduling. Chainlink VRF for verifiable randomness of attempt timing and verification type sequences.
- **Walrus + Seal**: Seal-encrypted, access-controlled storage on Walrus for the signal history behind every outcome; the contract stores only the blob reference. Public layer shows encrypted blobs exist; private layer (consumer with Seal access) reads decoded contents.
- **Scaffold-ETH 2**: contract + frontend scaffolding (Hardhat).

## How it connects to a consumer

A profile is identified by `keccak256(ownerAddress, consumerAddress)`. The consumer creates the profile using their own wallet; the user participates via World ID proofs generated inside the consumer's app. Two consumers monitoring the same user operate on completely separate profiles with independent state.

Legacy Ledger is the reference consumer. It listens for the outcome event, validates the referenced evidence, runs its own logic (challenge periods, beneficiary execution), and acts. None of that logic lives in this repo.

```
[ signal sources ]  ->  [ PulseOracle ]  ->  [ outcome event + evidence reference ]  ->  [ any consumer ]
```

Integrators embed World ID with Pulse's shared app_id, let their users sign Pulse calls with their own wallet, and read state by profileId. The contract address, ABI, app_id, and action naming convention are the full connection kit.

## Deployed contracts (Sepolia testnet)

| Contract | Address | Notes |
|----------|---------|--------|
| **PulseOracleV2** (active) | [`0x41e60b7c2f067a3bb5a655959c944f7f28bd66e3`](https://sepolia.etherscan.io/address/0x41e60b7c2f067a3bb5a655959c944f7f28bd66e3) | `reportSignal`, World ID `checkin`, `ThresholdReached` |
| PulseOracle v0.1 (legacy) | [`0xf954586747b7361f9deac0f943160a2d66ec8e5f`](https://sepolia.etherscan.io/address/0xf954586747b7361f9deac0f943160a2d66ec8e5f) | Earlier hackathon deploy; kept for comparison |
| World ID Router | [`0x469449f251692e0779667583026b5a1e99512157`](https://sepolia.etherscan.io/address/0x469449f251692e0779667583026b5a1e99512157) | Passed to `PulseOracleV2` constructor on Sepolia |

**Profile ID:** `keccak256(owner, consumer)` — e.g. owner `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` + consumer `0x4D7a23045f7C76Dc57e2aFd2eb038e2Cf743e284` → `0x15bf86d12556e3bf30fea83549f4a6b4168fc54f8bcb9acbbb9fabbf3397fb05`.

**Integrator wiring:**

- Set `NEXT_PUBLIC_PULSE_ORACLE_ADDRESS` to the V2 address (see `packages/nextjs/.env.example`).
- ABI + typed hooks: `packages/nextjs/contracts/deployedContracts.ts`
- Solidity: `packages/hardhat/contracts/PulseOracleV2.sol`
- Redeploy: `yarn deploy:pulse-oracle-v2 --network sepolia` (from `pulse/`)

Hackathon demo script, sample txs, and Walrus blob IDs: [`pulse/HACKATHON-DEMO.md`](pulse/HACKATHON-DEMO.md).

## Privacy model

The public layer (Pulse Explorer) shows only that encrypted signal blobs exist for an address: timestamps, adapter sources, and blob references. No weights, thresholds, lifecycle states, or signal contents are publicly visible.

The private layer (consumer dashboard) shows full decoded state, but only for profiles where the connected wallet is the consumer who configured them. Decryption of Walrus blobs uses Seal access policies set per profile. This two-layer design resolves the privacy concern by architecture rather than by mitigation: threshold progress is never publicly observable.

## Use cases beyond inheritance

- Dead man's switches for DeFi positions
- DAO governance liveness checks for voting weight
- Multisig signer rotation on sustained inactivity
- Parametric insurance triggers
- Wellness monitoring with dignity (deviation-only alerts, no raw activity exposure)
- Delegated AI agents that scale back permissions when their human principal goes quiet
- Behavioral risk review: a configured baseline of expected activity feeds the same accumulator, and an unusual pattern crosses the threshold instead

## Contributing

Two extension points are designed for community contributions:

- New signal adapters: any verifiable source of "this is still active" (social, onchain, biometric, environmental). An adapter is an authorized address that reports weighted signals with evidence; it is isolated by design, affecting only the profiles that authorized it, only with the weight that profile set, only in the signal direction that profile permitted.
- New consumers: anything that should react to a profile crossing its threshold, by implementing the consumer interface.

## Status

An early, evolving build shipped live during a hackathon. Expect interfaces and parameters to change as the implementation solidifies.

## License

MIT