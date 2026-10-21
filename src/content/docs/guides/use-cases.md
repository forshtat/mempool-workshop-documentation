---
title: "Use cases"
description: "What you can build with an Alternative Mempool and what each one needs."
sidebar:
  order: 3
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

These are the use cases the standard Alternative Mempool is designed to admit. Gas figures are illustrative.

## Privacy protocols

Some withdrawals need far more than 100k gas to verify. A privacy pool uses a shared sender and a keyed nonce per user, so every transaction is independent.

- **Keyed nonces:** each user picks a fresh nonce key, typically derived from a nullifier. See [Keyed nonces](/guides/keyed-nonces/).
- **Gas:** a proof check of about 200k gas (landing page figure, TBD). The draft allows 100,000 per unstaked entity and 1,000,000 per staked entity. The landing page shows 250,000 and 2,500,000 (TBD).
- **Sender-wide pending cap:** a staked sender has none while `ACTIVE`.
- **Rules involved:** [BUDGET-010](/rules/budget/#budget-010), [LIFECYCLE-030](/rules/lifecycle/#lifecycle-030).

## Stateful paymasters

Token paymasters are the best-known case. ERC-20 balances and allowances live in arbitrary storage. More broadly, a paymaster can keep its own state, such as quotas, subscriptions or credits.

- A `pre_verify` frame lets the paymaster collect or update that state before it commits to pay.
- A staked paymaster keeps its own storage and has no pending cap while `ACTIVE`.
- **Rules involved:** [PREFIX-110](/rules/prefix/#prefix-110), [STORAGE-031](/rules/storage/#storage-031).

## Keystore contracts

Credentials live in storage outside the sender account. Slots associated with the sender are readable.

- Reading storage associated with the sender in an external contract is allowed when the sender's account already exists ([STORAGE-021](/rules/storage/#storage-021)).
- Deploying the account in the same transaction needs a staked factory ([STORAGE-022](/rules/storage/#storage-022)).

## Post-quantum signatures

Post-quantum signatures run in plain EVM code, without precompiles. That costs gas well beyond the canonical limit. The landing page cites about 700k gas, or more, for plain-EVM verification (TBD).

- A staked sender gets a higher budget ([BUDGET-010](/rules/budget/#budget-010)). Whether it is enough depends on the scheme and the final budget value (TBD).

## Zero-knowledge proofs

Verifying a proof in validation needs a higher budget. A minimal check may fit the unstaked budget, and stake buys more (TBD: the amounts depend on the final budget values).

## Rules of your own

Trust a contract you audited. Replace hot Solidity with a native binary. Track reputation differently. It is your mempool. See [Writing a custom mempool](/guides/custom-mempool/).
