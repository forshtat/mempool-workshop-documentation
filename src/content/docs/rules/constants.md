---
title: "Constants"
description: "Constants defined by the ERC-8421 draft and the canonical mempool."
sidebar:
  order: 1
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

## ERC-8421 (standard Alternative Mempool)

| Name | Value | Description |
|---|---|---|
| `MAX_VERIFY_GAS_PER_ENTITY` | `100_000` | Maximum execution gas budget for a single unstaked or default-code entity's validation frames. |
| `MAX_VERIFY_GAS_STAKED_ENTITY` | `1_000_000` | Maximum execution gas budget for a single staked entity's validation frames. |
| `MIN_UNSTAKE_DELAY` | `86400` | One day. A withdrawal delay long enough to deter most Sybil attacks. |
| `MIN_STAKE_VALUE` | per chain | A non-trivial but not excessive amount, roughly USD 1000 in the native token. |
| `SAME_NONCE_KEY_MEMPOOL_COUNT` | `4` | Maximum pending transactions that select the same `(sender, nonce key)` pair. |
| `SAME_SENDER_MEMPOOL_COUNT` | `64` | Maximum pending transactions from one unstaked sender, regardless of how many nonce keys they select. |
| `SAME_UNSTAKED_ENTITY_MEMPOOL_COUNT` | `10` | Base number of pending transactions that may reference the same unstaked sponsoring payer. |
| `THROTTLED_ENTITY_MEMPOOL_COUNT` | `4` | Pending transactions allowed for a throttled entity. |
| `THROTTLED_ENTITY_LIVE_BLOCKS` | `10` | Blocks a transaction referencing a throttled entity may stay in the mempool. |
| `THROTTLED_ENTITY_BLOCK_COUNT` | `4` | Transactions referencing a throttled entity that a node may include in one block it builds. |
| `MIN_INCLUSION_RATE_DENOMINATOR` | `10` | Denominator in the reputation formula. |
| `THROTTLING_SLACK` | `10` | Lets an entity legitimately fail some transactions without being throttled. |
| `BAN_SLACK` | `50` | Lets a throttled entity fail some transactions without being banned. |
| `MAX_TXS_ALLOWED_UNSTAKED_ENTITY` | `10000` | Upper bound on `included` when computing the allowance of an unstaked sponsoring payer. |
| `STAKING_REGISTRY_ADDRESS` | per chain | Address of the Staking Registry contract. |

The landing page shows validation gas budgets of 250,000 per unstaked entity and 2,500,000 per staked entity, and a minimal proof check of about 200,000 gas. These do not match the draft's 100,000 and 1,000,000 (TBD).

## EIP-8141 (canonical public mempool)

| Name | Value | Description |
|---|---|---|
| `MAX_VERIFY_GAS` | `100_000` | Maximum gas a node should spend validating signatures and simulating the validation prefix. |
| `MAX_VERIFY_STATE_GAS` | `500_000` | Maximum state gas that may be budgeted across the validation prefix. |
| `MAX_PENDING_TXS_USING_NON_CANONICAL_PAYMASTER` | `1` | Maximum pending transactions using any given non-canonical paymaster. |
