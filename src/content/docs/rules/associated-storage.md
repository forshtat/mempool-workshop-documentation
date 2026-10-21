---
title: "Associated storage (ASSOC)"
description: "Which storage slots count as associated with an address."
sidebar:
  order: 2
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

Several storage rules grant an entity broader access to storage that is **associated** with it, rather than only to a contract's own account storage. Associated storage identifies the slots a well-behaved contract is expected to use to track state for a specific address, such as an ERC-20 balance mapping keyed by that address. The contract does not need to declare those slots in advance.

### ASSOC-010

A storage slot of any contract is associated with address `A` if the slot's own value equals `A`.

### ASSOC-020

A storage slot of any contract is associated with address `A` if the slot was computed as `keccak256(A || x) + n`, where `x` is a `bytes32` value and `n` is an integer from 0 to 128. This covers the common Solidity mapping and dynamic array layouts keyed or indexed by `A`, together with a fixed run of slots reachable from them.

## How nodes test it

A node determines association by testing the slots a validation frame actually accessed, using specialized simulation and tracing interfaces. In the sidecar, those come from a single `ethrex_simulateFrameTransaction` call with tracing enabled.
