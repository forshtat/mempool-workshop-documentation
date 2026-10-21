---
title: "Stake and solvency (STAKING, SOLVENCY)"
description: "Definition of a staked entity and the payer solvency reservation rules."
sidebar:
  order: 9
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

## Stake

There is no penalization mechanism in the Alternative Mempool protocol and stake is never slashed. It exists only as a configurable mechanism for Sybil attack prevention.

### STAKING-010

An entity is staked if the Staking Registry reports for it a stake of at least `MIN_STAKE_VALUE` and an unstake delay of at least `MIN_UNSTAKE_DELAY`, and withdrawal has not been initiated.

## Payer solvency

### SOLVENCY-010

For every payer, including the sender when it pays for itself, a node must track `reserved_pending_cost(payer)`: the sum of the maximum costs of every pending transaction in its mempool that names this payer. A node must reject a transaction if `available_balance(payer)` is less than its maximum cost, where:

```
available_balance(payer) = balance(payer) - reserved_pending_cost(payer)
```

### SOLVENCY-020

For a canonical paymaster, `available_balance` additionally subtracts `pending_withdrawal_amount(paymaster)`, the amount of any delayed withdrawal currently pending in that paymaster.

### SOLVENCY-030

On admission a node increases `reserved_pending_cost` by the transaction's maximum cost. It decreases it on eviction, replacement, inclusion and removal by reorg. When a replacement changes the payer, the node moves the reservation to the new payer atomically with the replacement.

## Default-code payers

A payer with no code is bounded only by the solvency rules. A sponsor that moves its balance elsewhere between admission and inclusion invalidates every pending transaction it sponsors, up to the balance it appeared to hold. Reservation limits the exposure to the payer's balance at admission time and does not remove it.
