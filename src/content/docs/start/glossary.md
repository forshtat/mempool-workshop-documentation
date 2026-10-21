---
title: "Glossary"
description: "Terms used throughout the Alternative Mempools documentation."
sidebar:
  order: 2
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

| Term | Meaning |
|---|---|
| **Frame Transaction** | The EIP-8141 transaction type (type `0x06`). A list of frames executed in order. |
| **Frame** | One step of a Frame Transaction, with a mode (`DEFAULT`, `VERIFY` or `SENDER`), flags, a target, gas limits, a value and data. |
| **Validation prefix** | The shortest prefix of frames whose successful execution sets the `payer`. Everything after it is the **execution body**. |
| **Validation frame** | A frame inside the validation prefix. |
| **Frame subclass** | A role label for a validation frame: `self_verify`, `only_verify`, `pay`, `expiry_verify`, `deploy`, and `pre_verify` (added by ERC-8421). See [Frame subclasses](/concepts/frame-transactions/#frame-subclasses). |
| **Entity** | A contract that a validation frame executes directly: the **sender**, the **payer** or the **factory**. |
| **Default-code entity** | An entity with empty code, which runs EIP-8141's default code. Never staked and exempt from opcode, call and storage rules. |
| **Staked entity** | An entity with at least `MIN_STAKE_VALUE` staked, an unstake delay of at least `MIN_UNSTAKE_DELAY`, and no withdrawal in progress. |
| **Associated storage** | Storage slots a well-behaved contract uses to track state for a specific address. See [Associated storage](/rules/associated-storage/). |
| **Canonical paymaster** | A paymaster whose runtime code exactly matches the implementation defined by EIP-8141. |
| **Canonical public mempool** | The public mempool defined by EIP-8141. |
| **Standard Alternative Mempool** | The default ruleset of ERC-8421. |
| **Custom Alternative Mempool** | A ruleset defined by a third-party operator and identified by its own topic. |
| **Network-wide rule** | A rule whose violation damages the reputation of the peer that sent the transaction. |
| **Local rule** | A rule that depends on one node's own mempool contents. Violating it never penalizes a peer. |
| **Admission validation** | The simulation a node performs before it first accepts a transaction. |
| **Revalidation** | A re-simulation of a pending transaction against a newer head. |
| **Spammer** | A peer that sends many transactions that were never valid. |
| **Mass invalidation attack** | Many transactions pass admission and propagate, then later become invalid together. |
| **`seen` / `included`** | Per-entity counters used by reputation. See [Reputation](/concepts/reputation/). |
| **Staking Registry** | The on-chain contract that records stake. Its interface is `IStakingRegistry`. |
| **Sidecar** | The reference mempool node, a TypeScript fork of Skandha. See [Run the sidecar](/guides/run-the-sidecar/). |
