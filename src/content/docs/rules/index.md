---
title: "Rules overview"
description: "How the ERC-8421 rules are organized, what the rule types are and in which order a node applies them."
sidebar:
  order: 0
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

These pages describe the rules of the **standard Alternative Mempool** from the ERC-8421 draft. Every rule has an ID such as `BUDGET-010`. IDs are the headings on these pages, so you can link to a rule directly, for example `/rules/budget/#budget-010`.

> The reference implementation does not implement ERC-8421 exactly. It follows an earlier ERC-7562-derived draft, and its rule IDs differ (TBD). See [Spec and implementation differences](/project/differences/).

## Rule families

| Family | Topic | Page |
|---|---|---|
| ASSOC | Associated storage | [Associated storage](/rules/associated-storage/) |
| PREFIX | Validation prefix and structure | [Prefix](/rules/prefix/) |
| BUDGET | Per-entity validation gas | [Budgets](/rules/budget/) |
| SIGNATURE | Signature checks | [Signatures](/rules/signatures/) |
| OPCODES, CREATION, CALLING | Opcodes, contract creation, calls | [Opcodes, creation and calls](/rules/opcodes/) |
| STORAGE | Storage and state access | [Storage](/rules/storage/) |
| LOCAL | Rules that depend on the node's own mempool | [Local rules](/rules/local/) |
| STAKING, SOLVENCY | Stake and payer solvency | [Stake and solvency](/rules/staking-and-solvency/) |
| REPUTATION | Reputation limits | [Reputation](/rules/reputation/) |
| LIFECYCLE | Replacement, eviction, revalidation | [Lifecycle](/rules/lifecycle/) |
| PROPAGATION | Gossip behaviour | [Propagation](/rules/propagation/) |

Constants are listed on [Constants](/rules/constants/).

## Two kinds of rules

Mempools are distributed. Each node keeps its own view of the mempool and of participant reputations. That gives two kinds of rules.

- A **network-wide rule** is one whose violation damages the reputation of the peer that sent the transaction into the standard mempool. A peer with critically low standing is treated as a spammer. See [Propagation](/rules/propagation/).
- A **local rule** depends on a node's own mempool contents and its local tracking of reputations. Different nodes hold different contents, so no consensus is possible. Peers are never penalized for a local rule violation. Local rules are collected in [Local rules](/rules/local/). All other rules are network-wide.

A violation of any rule results in the transaction being rejected from submission, or dropped from the mempool if it was already there.

## Acceptance algorithm

A node applies the rules in this order:

1. Validate the signatures.
2. Determine the validation prefix and check its structure.
3. Resolve each entity's role, address and stake, and check reputation.
4. Simulate the prefix and trace it, applying the OPCODES, CREATION, CALLING and STORAGE rules to every validation frame.
5. Check payer solvency and reserve the cost.
6. Check the local rules and the per-sender limitations.
7. If the transaction is a replacement, apply the replacement rules.
8. If every check passes, record the dependency set, admit the transaction and propagate it.

## Execution model

`VERIFY` frames run in static mode. Non-static `DEFAULT` mode frames in the validation prefix are allowed for two subclasses only: the `deploy` frame and the `pre_verify` frame. Rules that mention writes, contract creation or value calls take effect only in those frames.
