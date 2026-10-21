---
title: "Reputation (REPUTATION)"
description: "Rules for banned, throttled and unstaked entities and for blame attribution."
sidebar:
  order: 10
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

The calculation of reputation states is explained in [Reputation](/concepts/reputation/). The rules below apply to all staked entities and to unstaked sponsoring payers, unless stated otherwise.

## General rules

### REPUTATION-010

A `BANNED` address is not allowed into the mempool. Every pending transaction that references it is removed.

### REPUTATION-020

A `THROTTLED` address is limited to `THROTTLED_ENTITY_MEMPOOL_COUNT` entries in the mempool, to `THROTTLED_ENTITY_BLOCK_COUNT` transactions in a block the node builds, and to `THROTTLED_ENTITY_LIVE_BLOCKS` blocks of residency in the mempool.

### REPUTATION-040

Admitting a replacement is not a new occurrence of `seen` for any unchanged entity. If the replacement changes the `payer`, the `factory`, or both, the node decrements each changed role's old address's `seen` by 1 and increments its new address's `seen` by 1, atomically with the replacement.

## Unstaked entities

### REPUTATION-210

A `THROTTLED` sender is limited to `THROTTLED_ENTITY_MEMPOOL_COUNT` pending transactions in total, regardless of how many nonce keys it uses.

### REPUTATION-220

An unstaked sponsoring payer that is neither `THROTTLED` nor `BANNED` may have at most `opsAllowed` pending transactions in the mempool. This replaces the canonical mempool's cap of one pending transaction per non-canonical paymaster. It lets an unstaked payer with a good record carry more.

## Blame attribution

### REPUTATION-310

If a transaction fails revalidation because of the `factory` or the `sender`, the sponsoring `payer`'s `seen` is decremented by 1. A payer must not lose reputation because of another entity's failure.

### REPUTATION-320

If a staked `factory` is used and the `sender`'s validation frame fails, the factory's `seen` is not decremented under REPUTATION-310. It absorbs the failure in its own inclusion rate, exactly as if its own frame had failed.

### REPUTATION-330

If a staked `sender` is used, its reputation is affected by failures of all other entities of the transaction, even if those entities are staked.
