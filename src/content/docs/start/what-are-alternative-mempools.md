---
title: "What are Alternative Mempools"
description: "The problem Alternative Mempools solve and how they relate to the canonical mempool of EIP-8141."
sidebar:
  order: 1
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

## The short version

[EIP-8141](https://eips.ethereum.org/EIPS/eip-8141) introduces **Frame Transactions**. A Frame Transaction replaces the hard-coded signature check with EVM code. That code runs in the **validation prefix**, and a node must run it before it may relay the transaction.

The public (canonical) mempool defined by EIP-8141 is deliberately narrow. It rejects almost everything that needs real validation logic, such as shared state, balance checks or an expensive signature scheme.

**Alternative Mempools** are rule sets that admit more. [ERC-8421](https://ethereum-magicians.org/t/erc-8421-frame-transaction-alternative-mempools/29800) defines the framework and a default rule set, the **standard Alternative Mempool**. Instead of banning whole features, it prices abuse with **stake** and **reputation**.

Mempool rules need no consensus change. Anyone can run an Alternative Mempool today.

## Why the canonical mempool is strict

A node that relays a Frame Transaction first executes its validation prefix. Nobody pays the node for that work. If the prefix reads state that anyone can change, one cheap write can invalidate thousands of pending transactions at once. This is the **mass invalidation attack**, and every mempool rule exists to bound it.

A transaction that fails admission and never enters the mempool is not an attack. Nodes apply ordinary spam measures for that. The attack that matters is one where many transactions pass admission, propagate through the network, and later become invalid.

## Three tools instead of a ban

| Tool | What it does |
|---|---|
| **Stake** | Creating an on-chain entity is free. A stake of roughly USD 1000 with a one-day unstake delay gives it a price. The stake is never slashed. The lock-up is the cost. |
| **Reputation** | Each node counts how often an entity's transactions are seen and how often they are included. Entities that cause invalidations are throttled, then banned. |
| **Tracing** | Nodes trace the validation simulation and check which storage slots were touched. Slots keyed by the sender's address count as the sender's own. |

## Three kinds of mempool

1. The **canonical public mempool**, defined by EIP-8141. Strictest rules. No stake, no reputation.
2. The **standard Alternative Mempool**, defined by ERC-8421. A permissionless public ruleset that is less restrictive.
3. **Custom Alternative Mempools**, defined by third-party operators with their own rules.

See [Mempool types](/concepts/mempool-types/) for a comparison, and [Choosing a mempool](/guides/choosing-a-mempool/) to decide which one your contract needs.

## Status

ERC-8421 is a **Draft**. Rules and constants in these docs follow the draft and may change. Places where these docs, the landing page, the spec or the reference implementation disagree are marked **(TBD)**.
