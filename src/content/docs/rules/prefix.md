---
title: "Validation prefix and structure (PREFIX)"
description: "Rules about the shape and content of the validation prefix."
sidebar:
  order: 3
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

### PREFIX-010

The validation prefix must match one of these shapes. A transaction whose prefix matches none of them must be rejected.

- `[self_verify]`
- `[deploy, self_verify]`
- `[only_verify, pay]`
- `[deploy, only_verify, pay]`

In every shape, each approving frame (`self_verify`, `only_verify` or `pay`) may be immediately preceded by one `pre_verify` frame (see PREFIX-110). An optional single `expiry_verify` frame is always allowed as the first frame of the prefix.

### PREFIX-020

If a `deploy` frame is present, it must be the first frame of the prefix, not counting a leading `expiry_verify` frame. There is at most one `deploy` frame. The `deploy` frame must result in a successful deployment of the `tx.sender` contract.

### PREFIX-040

No frame in the validation prefix may carry `ATOMIC_BATCH_FLAG`.

### PREFIX-050

No `VERIFY` frame may follow the validation prefix.

### PREFIX-060

A transaction must be rejected if any validation frame reverts, or if a `VERIFY` frame exits without its required `APPROVE`.

### PREFIX-080

A node must reject or drop a transaction whose `expiry_verify` deadline is earlier than the node's view of the current block timestamp.

### PREFIX-100

These frames are exempt from Alternative Mempool rules: a frame whose target is a default-code account, a canonical paymaster, or the `EXPIRY_VERIFIER` contract. A node may evaluate them directly instead of simulating them. It must still apply the same limits it would apply normally.

### PREFIX-110

The target of a `pre_verify` frame must have deployed code.

### PREFIX-120

A `DEFAULT`-mode frame in the validation prefix that is neither the `deploy` frame nor a `pre_verify` frame must cause the transaction to be rejected.

## Why pre_verify exists

ERC-4337 validation functions could write storage under the same associated-storage and stake rules that governed reads. One common use is a paymaster that pulls ERC-20 tokens from the sender during validation, so it is reimbursed before it commits to pay. `VERIFY` frames are static, so the same guarantee needs a non-static frame that runs first.

`pre_verify` marks such a frame and binds it to one approving frame. Each write is then attributed to an entity, and the storage and reputation rules apply to writes exactly as they apply to reads.

## Security considerations

- A `pre_verify` frame is called by `ENTRY_POINT` before any `APPROVE` has happened, so nobody has been authorized yet. Its target should check that the transaction's sender, as reported by `TXPARAM`, is the party whose state it is about to change.
- A failed `DEFAULT` frame in the validation prefix does not invalidate the transaction automatically. The approving frame must check the `pre_verify` frame's status. A node cannot check this requirement, so a payer that ignores it bears the loss.
