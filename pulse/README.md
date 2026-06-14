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

- **Weighted signal accumulator**: positive and negative signals from authorized sources move a profile toward or away from a configurable threshold. A positive signal resets accumulated weight; weight only counts within the current window and epoch.
- **Randomized verification windows**: check-in attempts fire at unpredictable times, in an unpredictable order of verification type, committed onchain and revealed per attempt. Unpredictability is what makes the system hard to game.
- **Owner-bound consent**: profiles can only be created and controlled by their own verified human owner. Identity binding is dual: Device-level for routine actions, Orb-level for the highest-risk ones.
- **Multi-consumer isolation**: a single user can be monitored by multiple consumer apps independently. Each consumer's profile for the same user has its own configuration, adapters, threshold, and accumulated weight. No state is shared between consumers.
- **Public results, private progress**: the outcome of the oracle (threshold crossed, lifecycle state) is public and verifiable by anyone because that is the function of an oracle. The progress toward that outcome (accumulated weight, signal direction, threshold value) is visible only to the consumer who configured the profile. This prevents targeting while preserving auditability.
- **Verifiable audit trail**: every signal generates an encrypted evidence blob on Walrus. The public can verify that evidence exists; only authorized parties can read its contents.
- **Silent by default**: passive signals accumulate continuously in the background. The owner only acts when an attempt opens or when they choose to.
- **Configurable output routing**: the outcome event is always public. An active push to a notification target can additionally be configured independently of who set up the profile.
- **Pluggable everything**: signal sources and consumers are both interfaces. New verification methods and applications can be added without touching the core.

## How a consumer integrates

Setup follows three stages:

1. **Signals and connections**: choose what counts as evidence (onchain activity, voice check-in, trusted contact, and community-contributed adapters from an open catalog), set each one's weight, and authorize who can request an evaluation.
2. **Identity**: the user verifies with World ID inside the consumer's own app (not in Pulse). The consumer generates the proof using Pulse's shared app_id and sends it to the contract. The user never sees or touches Pulse.
3. **Rhythm**: set the cadence: window duration, attempts per window, response window, missed-attempt weight, and threshold. Attempt timing and verification type are randomized by the protocol (Chainlink VRF in production), not controlled by the consumer.

## Built with

- **World ID**: recurring verification and per-action authorization across three roles (owner check-ins at Device level, owner emergency actions at Orb level, requestor authorization at Device level), each bound by nullifier to the specific registered human.
- **Chainlink**: CRE workflows for automated onchain signal evaluation and attempt scheduling. VRF for verifiable randomness of attempt timing and verification type sequences.
- **Walrus + Seal**: Seal-encrypted, access-controlled storage on Walrus for signal evidence. The contract stores only blob references. Public layer proves evidence exists; private layer (consumer with Seal access) reads decoded contents.
- **Scaffold-ETH 2**: contract + frontend scaffolding (Hardhat).

## How it connects to a consumer

A profile is identified by `keccak256(ownerAddress, consumerAddress)`. The consumer creates the profile using their own wallet; the user participates via World ID proofs generated inside the consumer's app. Two consumers monitoring the same user operate on completely separate profiles with independent state.

Legacy Ledger is the reference consumer. It listens for the outcome event, validates the referenced evidence, runs its own logic, and acts. None of that logic lives in this repo.

```
[ signal sources ]  ->  [ PulseOracle ]  ->  [ outcome event + evidence reference ]  ->  [ any consumer ]
```

Integrators embed World ID with Pulse's shared app_id, let their users sign Pulse calls with their own wallet, and read state by profileId. The contract address, ABI, app_id, and action naming convention are the full connection kit.

## Privacy model

The visibility model separates results from progress:

**Public (Explorer, anyone):** lifecycle state (ACTIVE, THRESHOLD_REACHED, FINAL), threshold-crossed events with audit blob references, adapter types configured per profile (not their weights), signal count and timestamps (not direction or weight), and Walrus blob references (encrypted, content inaccessible without Seal access). This is enough to verify the oracle spoke and that evidence backs the outcome, without revealing how close any active profile is to crossing its threshold.

**Private (Dashboard, consumer wallet only):** accumulated weight vs threshold, signal direction and weight per signal, decoded Walrus blob contents via Seal, requestor list and claim status, and notification target. This is what enables targeting if made public, so it stays scoped to the consumer who configured the profile.

The composite profileId (`keccak256(owner, consumer)`) prevents enumeration: knowing only the owner's address is not enough to discover their profiles without also knowing each consumer's address.

## Use cases beyond inheritance

- Dead man's switches for DeFi positions
- DAO governance liveness checks for voting weight
- Multisig signer rotation on sustained inactivity
- Parametric insurance triggers
- Wellness monitoring with dignity (deviation-only alerts, no raw activity exposure)
- Delegated AI agents that scale back permissions when their human principal goes quiet
- Behavioral risk review: a configured baseline feeds the same accumulator, and pattern deviation crosses the threshold

## Contributing

Two extension points for community contributions:

- New signal adapters: any verifiable source (social, onchain, biometric, environmental). An adapter is an authorized address that reports signals with evidence, isolated by design to affect only profiles that authorized it, with the weight and direction that profile set.
- New consumers: anything that reacts to a profile crossing its threshold, by implementing the consumer interface.

## Status

An early, evolving build shipped live during a hackathon. Expect interfaces and parameters to change.

## License

MIT