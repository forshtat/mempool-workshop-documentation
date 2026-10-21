---
title: "Budgets (BUDGET)"
description: "Per-entity validation gas budgets for staked and unstaked entities."
sidebar:
  order: 4
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

### BUDGET-010

A node must track the sum of `limits.execution` **separately per entity**, over that entity's own validation frames.

- The `pre_verify` frame counts toward the entity of the approving frame it immediately precedes.
- The intrinsic cost of validating `tx.signatures` counts toward `tx.sender`.
- For **unstaked entities**, the sum must not exceed `MAX_VERIFY_GAS_PER_ENTITY` (100,000 in the draft).
- For **staked entities**, the sum must not exceed `MAX_VERIFY_GAS_STAKED_ENTITY` (1,000,000 in the draft).

The landing page shows 250,000 and 2,500,000 for these two budgets (TBD).

## Why a per-entity budget

EIP-8141 uses a single combined gas budget for the whole validation prefix. That budget cannot be raised for a staked entity without also raising it for every unstaked entity in the same transaction, since the rule sees only one sum.

The Alternative Mempool tracks the sum separately per entity. A staked payer, sender or factory can have a materially higher allowance for more expensive validation logic, such as a signature aggregation check or a Merkle proof check. Every unstaked entity of the transaction stays bound by the lower budget, exactly as if no staked entity were in the transaction.

## No cap on state gas

EIP-8141 caps `limits.state` at `MAX_VERIFY_STATE_GAS` across the validation prefix. The standard Alternative Mempool has no such cap. The payer's solvency check already reserves the cost of every frame's declared `limits.state`, so a large budget is paid for. The prefix structure already limits where state can be written. A `deploy` frame that needs a large state gas budget for a code deposit can declare it without hitting a mempool-specific limit.

## More nonce keys cost more validation gas

Observed on the devnet: a `VERIFY` frame with 7 nonce keys ran out of gas at 30,000 and succeeded at 80,000. The headroom under a 100,000 budget shrinks toward the 16-key maximum.
