# Pulse

> An open, configurable weighted verification protocol for onchain liveness and behavioral attestations.

Pulse aggregates signals from independent sources, accumulates them against a configurable threshold, and emits a verifiable onchain event when that threshold is reached. The question being answered is configurable: "is this profile still responsive?" is the flagship case (and what powers Legacy Ledger), but the same engine answers "does this profile's current behavior still match its expected pattern?" or any other question that can be expressed as weighted signals crossing a threshold. Pulse itself doesn't interpret the outcome: each consumer decides what it means: inheritance execution, account dormancy, behavioral risk review, key rotation, insurance triggers, and so on.

Built as part of [Legacy Ledger](https://mylegacyledger.com) at ETHGlobal New York 2026 (Ship a Feature), and shipped as open source infrastructure on its own.

---

## The idea

A single missed check-in is not evidence of anything. Sustained, repeated unresponsiveness across multiple independent verifiers, distributed unpredictably in time and type, is.

Pulse is the shared primitive for that: think of it as a price feed, but for "is this human/account/agent still here."

## Core pieces

- **Weighted signal accumulator**: positive and negative signals from authorized sources move a profile toward or away from a configurable threshold.
- **Randomized verification windows**: check-in attempts fire at unpredictable times, in an unpredictable order of verification type, committed onchain and revealed per attempt.
- **Owner-bound consent**: profiles can only be created and controlled by their own verified human owner.
- **Verifiable audit trail**: every signal is logged to encrypted decentralized storage; the final event carries a reference to the full evidence bundle.
- **Silent by default**: passive signals (e.g. onchain activity) accumulate continuously in the background without any user interaction. The profile owner only needs to act when a verification attempt opens or when they choose to (check in early, block, extend, resurrect). The result is a security monitor that stays out of the way until it doesn't.
- **Pluggable everything**: signal sources and consumers are both interfaces. New verification methods and new applications can be added without touching the core.

## Built with

- **World ID**: owner check-ins, owner-level critical actions, and requestor authorization, across distinct verification levels.
- **Chainlink**: automated onchain signal evaluation, scheduling/orchestration, and confidential decision attestations.
- **Walrus**: encrypted, verifiable storage for the signal history behind every outcome.
- **Scaffold-ETH 2**: contract + frontend scaffolding.

## How it connects to Legacy Ledger

Legacy Ledger is the reference consumer. It listens for Pulse's outcome event, checks the referenced evidence, and runs its own logic from there (challenge periods, beneficiary execution, etc.). None of that logic lives in this repo. Pulse only knows that a threshold was reached and where the evidence is.

```
[ signal sources ]  →  [ Pulse contract ]  →  [ outcome event + evidence reference ]  →  [ any consumer ]
```

## Status

This is an early, evolving build shipped live during a hackathon. Expect the interfaces and parameters described here to change as the implementation solidifies. This README intentionally stays high-level. Detailed specs live alongside the code as it stabilizes.

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

- New signal adapters (any verifiable source of "this is still active": social, onchain, biometric, environmental)
- New consumers (anything that should react to a profile crossing its threshold)

More on both as the interfaces stabilize.

## License

MIT
