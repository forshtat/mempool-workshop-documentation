---
title: "Replacement, eviction and revalidation (LIFECYCLE)"
description: "How pending transactions are identified, replaced, limited and revalidated."
sidebar:
  order: 11
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

### LIFECYCLE-010

A pending transaction is identified by `(sender, nonce_keys, nonce_seq)`, as defined by EIP-8250. A node may admit a transaction only if its `nonce_seq` is the next **contiguous** sequence value for **each** key in its `nonce_keys`. That is either the key's on-chain sequence, `current_nonce_seq(sender, key)`, or one more than the `nonce_seq` of a pending transaction of the same sender that selects that key. Forming a nonce gap on any key is not allowed.

### LIFECYCLE-020

Two transactions of the same sender **conflict** if they have the same `nonce_seq` and their `nonce_keys` share at least one key, because at most one of them can ever be included. The mempool must not hold two conflicting transactions.

A transaction that conflicts with one or more pending transactions is a **replacement** for all of them.

- A replacement must be valid under every rule in this document.
- A node should accept and propagate it only if it increases both `max_fee_per_gas` and `max_priority_fee_per_gas` by at least 10% over **each** transaction it replaces.
- A replacement may name a different factory or payer.
- On accepting a replacement, a node removes every transaction it replaces and evicts every pending transaction of the sender that no longer satisfies LIFECYCLE-010.

### LIFECYCLE-030

A node must keep at most `SAME_NONCE_KEY_MEMPOOL_COUNT` pending transactions that select any one `(sender, key)` pair. A transaction with several `nonce_keys` counts once against each of its keys.

A node must keep at most `SAME_SENDER_MEMPOOL_COUNT` pending transactions of an unstaked sender, regardless of how many nonce keys they select. A staked sender has no sender-wide limit while `ACTIVE`. [REPUTATION-020](/rules/reputation/#reputation-020) limits it once it is `THROTTLED`.

These limits count only the keys selected by pending transactions. A replacement releases every key that a replaced transaction selected and the replacement does not. For example, replacing a pending transaction with `nonce_keys = [1, 3, 5]` by one with `nonce_keys = [1, 5]` at the same `nonce_seq` releases key `3`.

### LIFECYCLE-040

When a new block is accepted, a node must remove the transactions the block includes and update payer reservations. It must revalidate every pending transaction that **depends on state the block changed**. This includes at least:

- transactions for the same sender
- transactions whose recorded storage dependencies changed
- transactions whose payer's balance or code changed
- transactions that reference an entity whose stake status changed

A transaction that no longer satisfies the rules must be evicted.

To keep revalidation cheap, a node should record for each admitted transaction the set of state it depended on: the storage slots read, and the code, balance and nonce of every address whose value the validation used. It should use this set to select the transactions that need revalidation.

## Why conflicts are treated as replacements

Treating any two transactions that cannot both be included as a replacement keeps the pending transactions of a sender free of conflicts. A node can then track each key's pending sequences independently, and a limit on a key counts only the transactions that actually select it.

## Revalidation load

A new head can force many revalidations. A node that does not filter the affected transactions exposes itself to a load attack proportional to the size of its mempool.
