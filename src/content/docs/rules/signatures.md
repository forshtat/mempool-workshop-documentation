---
title: "Signatures (SIGNATURE)"
description: "How nodes validate transaction signatures before simulation."
sidebar:
  order: 5
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

### SIGNATURE-010

Before simulating any frame, a node must validate every protocol-validated signature (`SECP256K1`, and `P256` per EIP-7951) against its own signed message. The signed message is the transaction's signature hash when `msg` is empty, or the explicit digest that `msg` carries otherwise. A transaction with any invalid signature must be rejected.

## ARBITRARY signatures

The protocol does not validate `ARBITRARY` signatures. A transaction that carries one is only as trustworthy as the frame that inspects it.

## Approval covers all following SENDER frames

`sender_approved` is a single transaction-scoped flag. Once it is set, every `SENDER` frame in the transaction executes as `tx.sender`, not only the frame the approving code inspected.

Wallet code that approves execution should bind its approval to the whole frame list, for example by verifying a signature over the canonical signature hash, which commits to every frame. A signature over an explicit digest that does not commit to the frame list authorizes an open-ended set of `SENDER` frames.
