---
title: "Storage and state access (STORAGE)"
description: "Which storage an entity may read or write during validation."
sidebar:
  order: 7
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

Storage access by `SLOAD`, `SSTORE`, `TLOAD` and `TSTORE` is restricted. Writes are possible only in `deploy` and `pre_verify` frames. Transient storage (EIP-1153) is treated exactly like persistent storage.

### STORAGE-000

Access to storage is always restricted unless one of the following rules allows it.

### STORAGE-010

Access to `tx.sender`'s own storage is always allowed.

### STORAGE-021

Access to storage associated with `tx.sender`, in an external contract that is not an entity of the transaction, is allowed when the sender's account already exists, meaning the transaction has no `deploy` frame.

### STORAGE-022

The same access is allowed when the transaction has a `deploy` frame and the factory is a staked entity.

### STORAGE-031

A staked entity may access its own storage.

### STORAGE-032

A staked entity has read-only access to any storage in a contract that is not an entity of the transaction.

### STORAGE-033

A staked entity has write access to slots associated with the entity address in any contract that is not an entity of the transaction.

## Summary

| Who | Own storage | Slots associated with the sender, in other contracts | Any storage in other contracts | Slots associated with itself, in other contracts |
|---|---|---|---|---|
| Sender | Yes (010) | Yes if the account exists (021), or staked factory when deploying (022) | No | No |
| Staked entity | Yes (031) | As above | Read-only (032) | Read and write (033) |
| Unstaked non-sender entity | No | No | No | No |

Canonical mempool, by contrast: only the sender's own storage, plus the code of other contracts it calls.

## Examples from the workshop

A wallet that reads another contract's storage during validation is rejected by the canonical mempool and by the standard Alternative Mempool while unstaked. Once the entity is staked, the standard Alternative Mempool admits it, and the canonical mempool still rejects it. See [Quickstart](/guides/quickstart/).
