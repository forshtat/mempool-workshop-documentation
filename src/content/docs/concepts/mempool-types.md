---
title: "Mempool types"
description: "Comparing the canonical public mempool, the standard Alternative Mempool and custom Alternative Mempools."
sidebar:
  order: 2
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

A transaction that violates a canonical public mempool rule must not be propagated over the public mempool. It may be propagated over an Alternative Mempool's own transport if it satisfies that mempool's rules. One transaction may travel over several Alternative Mempools if it satisfies all of their rules.

## Comparison

| | Canonical public (EIP-8141) | Standard Alternative (ERC-8421) | Custom |
|---|---|---|---|
| Defined by | EIP-8141 | ERC-8421 | The mempool operator |
| Stake and reputation | None | Yes | Operator's choice |
| Trust to earn | None | Stake plus reputation | Operator's choice |
| Identified by | The public network | A topic on the p2p network | Its own topic, conventionally the IPFS hash of a document that describes its rules |

## Limits side by side

| Limit | Canonical (EIP-8141) | Standard Alternative (ERC-8421) |
|---|---|---|
| Validation gas | `MAX_VERIFY_GAS`: 100,000 for signatures and the whole validation prefix | `MAX_VERIFY_GAS_PER_ENTITY`: 100,000 per unstaked entity. `MAX_VERIFY_GAS_STAKED_ENTITY`: 1,000,000 per staked entity. The landing page currently shows 250,000 and 2,500,000 (TBD) |
| State gas | `MAX_VERIFY_STATE_GAS`: 500,000 across the prefix | No cap. The payer's solvency check already reserves it |
| Writes in the prefix | Only in the first `deploy` frame, to the sender's own storage and code | Also in `pre_verify` frames |
| Storage of other contracts | Rejected | Storage associated with the sender is allowed. A staked entity may also read any storage and write slots keyed by its own address |
| `BALANCE` and `SELFBALANCE` | Banned | Allowed for staked entities |
| Pending per non-canonical paymaster | 1 | An unstaked payer starts at 10, growing with inclusions. No cap for an active staked payer |
| Payer solvency | Explicit reservation for canonical paymasters, and per-payer exposure tracking | Reserved cost tracked for every payer |

## Standard Alternative Mempool extends the canonical one

A wallet author who targets the canonical public mempool needs no knowledge of ERC-8421. Everything the canonical mempool admits, the standard Alternative Mempool admits too.

## Reputation is per mempool

Reputation counters (`seen` and `included`) should be kept separately for each mempool. An entity throttled in one mempool is unaffected in another.

## Custom Alternative Mempools

Operators can define their own rule sets, and nodes opt into the ones they want to serve. Each is identified by its own topic. See [Writing a custom mempool](/guides/custom-mempool/).
