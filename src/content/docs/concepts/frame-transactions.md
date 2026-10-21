---
title: "Frame Transactions and the validation prefix"
description: "Frames, modes, subclasses and the validation prefix shapes that mempools recognize."
sidebar:
  order: 1
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

## Frames

A Frame Transaction is a list of frames. Each frame has a **mode**, **flags**, a **target**, separate **execution** and **state** gas limits, a **value** and **data**.

| Mode | Value | Meaning |
|---|---|---|
| `DEFAULT` | `0` | Ordinary call frame. |
| `VERIFY` | `1` | Validation frame. It must call `APPROVE` to grant the scope in `flags`. Runs in static mode. |
| `SENDER` | `2` | Body frame, executed with `tx.sender` as the caller. |

The approval scope is in bits 0-1 of `flags`: `0` none, `1` payment, `2` execution, `3` execution and payment. Bit 2 (`0x4`) is the atomic-batch flag. A `null` target resolves to `tx.sender`.

Transactions also carry signatures. Each has a scheme: `0` ARBITRARY (no cryptographic check, the signer's contract logic decides), `1` SECP256K1, `2` P256.

## Validation prefix and execution body

The **validation prefix** is the shortest prefix of frames whose successful execution sets the `payer`. Every frame after it belongs to the **execution body**. Mempool rules apply to the validation prefix only.

## Frame subclasses

Mempools classify validation frames by role.

| Subclass | Mode | Flags | Role |
|---|---|---|---|
| `self_verify` | `VERIFY` | `0x3` | Validates the transaction and approves both sender and payer. |
| `only_verify` | `VERIFY` | `0x2` | Validates the transaction and approves only the sender. |
| `pay` | `VERIFY` | `0x1` | Approves only the payer. |
| `expiry_verify` | `VERIFY` | `0x0` | Calls the expiry verifier contract. |
| `deploy` | `DEFAULT` | `0x0` | Deploys a new smart account, typically through a deterministic factory. |
| `pre_verify` | `DEFAULT` | any | Added by ERC-8421. A state-writing frame bound to the approving frame that follows it. |

`pre_verify` is described in [Stateful validation with pre_verify](#stateful-validation-with-pre_verify).

## Recognized validation prefixes

The canonical mempool recognizes four prefix shapes:

| Shape | Frames |
|---|---|
| Self relay | `[self_verify]` |
| Self relay, new account | `[deploy, self_verify]` |
| Canonical paymaster | `[only_verify, pay]` |
| Canonical paymaster, new account | `[deploy, only_verify, pay]` |

An optional `expiry_verify` frame may come first in any shape. The standard Alternative Mempool recognizes the same four shapes, and additionally allows one `pre_verify` frame immediately before each approving frame. See [PREFIX rules](/rules/prefix/).

## Entities

Every validation frame is attributed to exactly one entity:

- The **sender** is `tx.sender`. It runs the `self_verify` or `only_verify` frame.
- The **payer** is the target of the frame that calls `APPROVE` with a payment scope. It runs the `pay` frame, or the `self_verify` frame when sender and payer are the same.
- The **factory** is the target of the `deploy` frame.

An `expiry_verify` frame is attributed to no entity, because its code is protocol-defined. See [Entities and stake](/concepts/entities-and-stake/).

## Stateful validation with pre_verify

`VERIFY` frames run in static mode, so they cannot write state. Some real validation logic needs a write first. A paymaster that pulls ERC-20 tokens from the sender during validation is the main example. The `pre_verify` frame provides that.

A `pre_verify` frame is a `DEFAULT`-mode frame whose target is the same as the target of the approving `VERIFY` frame that **immediately follows it**. Each approving frame may be preceded by at most one `pre_verify` frame.

The approving frame **must** check the status of the `pre_verify` frame before it calls `APPROVE`, using the frame status parameter of `FRAMEPARAM`. A failed `DEFAULT` frame does not invalidate a Frame Transaction, so without this check the approving frame could approve after the state writes it depends on were reverted.

## Keyed nonces and recent roots

Frame Transactions carry an [EIP-8250](https://eips.ethereum.org/EIPS/eip-8250) keyed nonce (`nonce_keys`, `nonce_seq`). One sender, such as a privacy pool contract, can then have many independent transactions in flight. Transactions may also carry [EIP-8272](https://eips.ethereum.org/EIPS/eip-8272) recent-root references. See [Keyed nonces](/guides/keyed-nonces/).
