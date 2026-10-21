---
title: "Keyed nonces and recent roots"
description: "How one sender can have many independent transactions in flight."
sidebar:
  order: 10
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

Frame Transactions carry an [EIP-8250](https://eips.ethereum.org/EIPS/eip-8250) keyed nonce and, optionally, [EIP-8272](https://eips.ethereum.org/EIPS/eip-8272) recent-root references. Together they let one sender, such as a privacy pool contract, have many independent transactions in flight. Each uses its own nonce key, for example derived from a nullifier, and proves against a root the sender published on chain.

## RPC fields

These apply to `eth_sendFrameTransaction` and `eth_estimateFrameTransactionGas`. All values are hex.

| Field | Meaning |
|---|---|
| `nonceKeys` | 1 to 16 strictly increasing keys. `["0x0"]` is the sender's ordinary account nonce. Other keys are tracked in the `NONCE_MANAGER` predeploy (`0x…8250`). Key 0 is only valid on its own. |
| `nonceSeq` | Must equal the current sequence of every key in `nonceKeys`. |
| `recentRootReferences` | Optional, up to 16 `{ sourceId, slot, root }`. Each must be committed in `RECENT_ROOT_ADDRESS` (`0x…8272`) and usable: `1 ≤ head_slot + 1 − slot ≤ 8191`. |
| `nonce` | Legacy shorthand for `nonceKeys: ["0x0"], nonceSeq: nonce`. Send either this or the pair, not both. |

Transactions returned by `eth_getFrameTransactionByHash` and `debug_bundler_dumpMempool` carry `nonceKeys`, `nonceSeq` and `recentRootReferences`.

## Mempool rules in the draft

- A pending transaction is identified by `(sender, nonce_keys, nonce_seq)`. Two transactions with the same `nonce_seq` whose keys overlap conflict, and the later one is a replacement that needs a 10% fee bump. See [LIFECYCLE-020](/rules/lifecycle/#lifecycle-020).
- At most `SAME_NONCE_KEY_MEMPOOL_COUNT` (4) pending transactions may select the same `(sender, key)` pair.
- At most `SAME_SENDER_MEMPOOL_COUNT` (64) pending transactions of an **unstaked** sender, whatever keys they select. A staked sender has no sender-wide limit while `ACTIVE`. See [LIFECYCLE-030](/rules/lifecycle/#lifecycle-030).

## Rules in the sidecar

The sidecar deliberately keeps its rules minimal and they differ from the draft (TBD).

- A linear (`["0x0"]`) transaction occupies `sender:nonceSeq`. A keyed one occupies its exact key set plus `nonceSeq`. A transaction in an occupied slot is a replacement and needs a 10% fee bump.
- **One pending transaction per `(sender, key)`.** A keyed transaction that shares a key with a pending one in another slot is rejected. Disjoint key sets coexist freely, and linear and keyed transactions of one sender do not block each other.
- **No per-sender cap on keyed transactions.** Linear transactions keep a per-sender limit of 4, counted among linear transactions only. Third-party payers and factories are capped as before.
- **Balances.** Pending transactions never owe an account more than its balance. A payer owes each transaction's maximum gas cost, and a sender owes the `value` of its top-level frames. This is checked at admission and every block, and the newest entries are dropped first when a balance falls.
- **Recent roots.** The slot window is checked before simulation, and commitment is checked by the simulation. Entries whose reference expires are evicted each block, and ones about to expire are not relayed. Failures appear under the explorer's `recent-root` rule.

## Cost

More keys cost more validation gas. Observed on the devnet, a `VERIFY` frame with 7 nonce keys ran out of gas at 30,000 and succeeded at 80,000.

Keyed nonces change the p2p wire format. See [P2P mempool](/guides/p2p/#wire-format-version).
