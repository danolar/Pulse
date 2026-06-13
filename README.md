# pulse

> configurable onchain attestation oracle

Pulse aggregates weighted signals from independent sources, accumulates them against a configurable threshold, and emits a verifiable onchain event when that threshold is crossed. The question being answered is set per profile, not fixed by the protocol. Pulse does not interpret the outcome. Each consumer decides what it means: inheritance execution, account dormancy, behavioral risk review, key rotation, insurance triggers, and so on.

"Is this human still here?" is the flagship question (and what powers [Legacy Ledger](https://mylegacyledger.com)), but it is one instance of a general mechanism. The same engine answers "does this profile's current behavior still match its expected pattern?" where a perfectly responsive profile can still cross the threshold on deviation alone. Liveness is the easiest case to demonstrate, not the boundary of what Pulse does.

Built as part of Legacy Ledger at ETHGlobal New York 2026 (Ship a Feature), and shipped as open source infrastructure on its own.

---

## The idea

A single missed signal is not evidence of anything. A sustained pattern across multiple independent sources, distributed unpredictably in time and type, is.

Think of a radar in a control tower. The sweep reveals what is present, what is changing, and what has crossed a line that matters. Nobody watches every dot by hand; the system watches for you, all the time, and only demands attention when something has actually changed. Pulse is that radar: a configurable threshold engine that any application can point at any question expressible as weighted signals. It is to attestation what a price feed is to price: a shared primitive no application should have to rebuild alone.

## Core pieces

- **Weighted signal accumulator**: positive and negative signals from authorized sources move a profile toward or away from a configurable threshold. A positive signal (a verified check-in, a confirmation of expected behavior) resets accumulated weight; weight only counts within the current window and epoch.
- **Randomized verification windows**: check-in attempts fire at unpredictable times, in an unpredictable order of verification type, committed onchain and revealed per attempt. Unpredictability is what makes the system hard to game.
- **Owner-bound consent**: profiles can only be created and controlled by their own verified human owner. Identity binding is dual: Device-level for routine actions, Orb-level for the highest-risk ones (freezing evaluation, reversing a false alarm).
- **Verifiable audit trail**: every signal is logged to encrypted decentralized storage; the outcome event carries a reference to the full evidence bundle, so any consumer can audit why an outcome fired.
- **Silent by default**: passive signals accumulate continuously in the background with no user interaction. The owner only acts when an attempt opens or when they choose to. A monitor that stays out of the way until it doesn't.
- **Configurable output routing**: the outcome is always emitted as a public event, and can additionally be pushed to a notification target that is independent of whoever configured the profile (supports white-label and separated config/execution).
- **Pluggable everything**: signal sources and consumers are both interfaces. New verification methods and new applications can be added without touching the core.

## How a profile is configured

Setup follows three stages, mirrored in the reference explorer:

1. **Signals & connections**: choose what counts as a sign of life (onchain activity, voice check-in, trusted contact, and community-contributed adapters), set each one's weight, and authorize who can request an evaluation.
2. **Identity**: the owner verifies with World ID (Device, then Orb to unlock emergency controls). Authorized requestors verify themselves before they can act.
3. **Rhythm**: set the cadence, window duration, attempts per window, response window, missed-attempt weight, and threshold.

## Built with

- **World ID**: used as a recurring verification primitive and a per-action authorization fabric across three roles (owner check-ins at Device level, owner emergency actions at Orb level, requestor authorization at Device level), each bound by nullifier to the specific registered human.
- **Chainlink**: CRE workflows for automated onchain signal evaluation and attempt scheduling, plus Confidential AI for processing sensitive decision inputs and returning verifiable attestations.
- **Walrus + Seal**: Seal-encrypted, access-controlled storage on Walrus for the signal history behind every outcome; the contract stores only the blob reference.
- **Scaffold-ETH 2**: contract + frontend scaffolding (Hardhat).

## How it connects to a consumer

The connection is implicit, not a handshake. A profile is keyed by the owner's address; any app that knows that address reads state directly from the contract. There is no app-registration layer onchain, Pulse never learns which app a profile belongs to.

Legacy Ledger is the reference consumer. It listens for the outcome event, validates the referenced evidence, runs its own logic (challenge periods, beneficiary execution), and acts. None of that logic lives in this repo. Pulse only knows that a threshold was reached and where the evidence is.

```
[ signal sources ]  ->  [ PulseOracle ]  ->  [ outcome event + evidence reference ]  ->  [ any consumer ]
```

Integrators embed World ID with Pulse's shared `app_id`, let their users sign Pulse calls with their own wallet, and read state by address. The contract address, ABI, `app_id`, and action naming convention are the full connection kit.

## Use cases beyond inheritance

- Dead man's switches for DeFi positions
- DAO governance liveness checks for voting weight
- Multisig signer rotation on sustained inactivity
- Parametric insurance triggers
- Wellness monitoring with dignity (deviation-only alerts, no raw activity exposure)
- Delegated AI agents that scale back permissions when their human principal goes quiet
- Behavioral risk review: a configured baseline of expected activity feeds the same accumulator, and an unusual pattern (not unresponsiveness) crosses the threshold instead

## Contributing

Two extension points are designed for community contributions:

- New signal adapters: any verifiable source of "this is still active" (social, onchain, biometric, environmental). An adapter is an authorized address that reports weighted signals with evidence; it is isolated by design, affecting only the profiles that authorized it, only with the weight that profile set, only in the signal direction that profile permitted.
- New consumers: anything that should react to a profile crossing its threshold, by implementing the consumer interface.

More on both as the interfaces stabilize.

## Status

An early, evolving build shipped live during a hackathon. Expect interfaces and parameters to change as the implementation solidifies. This README stays high-level; detailed specs live alongside the code.

## License

MIT
