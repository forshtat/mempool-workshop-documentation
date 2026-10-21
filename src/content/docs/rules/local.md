---
title: "Local rules (LOCAL)"
description: "Rules that depend on a node's own mempool contents."
sidebar:
  order: 8
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

These rules depend on the other transactions in a node's own mempool and have no network propagation effects. A node applies them when it admits a transaction. A transaction that violates one is rejected without any reputation change for the peer that sent it.

### LOCAL-010

A transaction must not use as its factory or its sponsoring payer an address that is `tx.sender` of another pending transaction in the mempool. A factory or paymaster contract therefore cannot also serve as an account.

### LOCAL-020

A transaction must not use storage associated with its sender, or with a staked entity, in a contract that is `tx.sender` of another pending transaction in the mempool.
