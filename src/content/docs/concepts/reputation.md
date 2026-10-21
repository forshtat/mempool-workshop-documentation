---
title: "Reputation"
description: "How nodes count seen and included transactions and move entities between ACTIVE, THROTTLED and BANNED."
sidebar:
  order: 4
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

Reputation lets a node trust entities that behave and limit those that do not. Each node keeps its own view. There is no global reputation.

## Counters

| Counter | Meaning |
|---|---|
| `seen` | How many times this node received a unique valid transaction that references the entity, over RPC or the mempool network. Admitting a replacement is not a new occurrence. |
| `included` | How many of those transactions were included in a canonical block. The node determines this from the block's transactions and receipts. |
| `inclusionRate` | The ratio of `included` to `seen`. |

Every hour both counters are updated as `value = value * 23 // 24`. This is a practical reputation reset after four days of inactivity.

## States

Let `max_seen = seen // MIN_INCLUSION_RATE_DENOMINATOR`. Every entity is in exactly one state:

| State | Condition |
|---|---|
| **BANNED** | `max_seen > included + BAN_SLACK` |
| **THROTTLED** | `included + THROTTLING_SLACK < max_seen <= included + BAN_SLACK` |
| **ACTIVE** | `max_seen <= included + THROTTLING_SLACK` |

A new entity starts as `ACTIVE`. The slack values let an entity legitimately fail some transactions without penalty.

## What each state means

| State | Effect |
|---|---|
| ACTIVE, staked | No additional limit. No cap on pending transactions or on transactions in a block the node builds. |
| ACTIVE, unstaked payer | At most `opsAllowed` pending transactions. |
| THROTTLED | At most `THROTTLED_ENTITY_MEMPOOL_COUNT` (4) entries in the mempool, `THROTTLED_ENTITY_BLOCK_COUNT` (4) transactions in a block the node builds, and `THROTTLED_ENTITY_LIVE_BLOCKS` (10) blocks of residency. |
| BANNED | Not allowed into the mempool. Every pending transaction that references it is removed. |

For an unstaked sponsoring payer:

```
opsAllowed = SAME_UNSTAKED_ENTITY_MEMPOOL_COUNT
           + inclusionRate * min(included, MAX_TXS_ALLOWED_UNSTAKED_ENTITY)
```

A new entity has `included = 0`, so it gets `SAME_UNSTAKED_ENTITY_MEMPOOL_COUNT` (10) pending transactions.

## Blame attribution

When a pending transaction fails revalidation, the node works out which entity caused it by finding the `VERIFY` frame whose behaviour changed.

- If the `factory` or the `sender` caused the failure, the sponsoring `payer`'s `seen` is decremented. A payer must not lose reputation because of another entity.
- If a staked `factory` is used and the `sender` fails, the factory's `seen` is not decremented. It absorbs the failure in its own inclusion rate.
- A staked `sender` is affected by the failures of all other entities of the transaction, even staked ones.

## Bounded misbehaviour

A staked entity can cause a bounded amount of invalidation before its reputation drops. The bound is `BAN_SLACK * MIN_INCLUSION_RATE_DENOMINATOR / 24` invalid transactions per hour, plus whatever throttling then allows. It is a rate limit, not a guarantee.

The full rules are in [REPUTATION rules](/rules/reputation/).

## In the sidecar

The reference implementation exposes reputation through `skandha_explorer_listReputation` and the admin method `debug_bundler_dumpReputation`. The explorer labels an entity `ok`, `throttled` or `banned`. Status names are lowercase there. See [Explorer API](/reference/explorer-api/).
