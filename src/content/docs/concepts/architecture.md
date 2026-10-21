---
title: "Architecture"
description: "Gateway nodes, per-mempool topics and block builders: how modular mempools fit together."
sidebar:
  order: 5
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

A mempool is an app, not a protocol constant. Nobody in the world has to agree on one set of rules. Each mempool bundles its own validation rules, and nodes opt into the ones they want to serve. That is why we call them **modular**.

## Components

```
User or wallet
      |
      v
Gateway node  -- picks the mempools -->  Canonical public mempool   (EIP-8141 rules)
                                         Standard Alternative       (ERC-8421 rules)
                                         Your mempool               (topic = hash of your rules)
                                                  |
                       one p2p network, one topic per mempool
                                                  |
                                                  v
                                         Block builders (RPC)
```

- A **gateway node** receives a transaction from a user and forwards it to every mempool whose rules it satisfies.
- Mempools gossip over **one peer-to-peer network, on separate topics**.
- **Block builders** pull transactions from mempool nodes over RPC.
- Each mempool node is a separate process. Reputation counters are kept per mempool.

## Topics

Each Alternative Mempool is identified by its own topic, conventionally the IPFS hash of a document that describes its rules. The standard mempool's ID in the sidecar's default config is `QmcFZKUX9qoo3StwVycJTAhwdiqbEjcwNvQVK246p3z1rk`.

## Local and network-wide rules

A node can also act as a solo submission channel with custom rules and no p2p connection. For that reason rules are split into network-wide rules, which damage the reputation of the sending peer, and local rules. See [Rules overview](/rules/).

## Reaching the mempool is only the first step

The Alternative Mempool rules partially satisfy the FOCIL profile for Frame Transactions. A transaction that complies may get better censorship resistance in an adversarial environment. FOCIL forces inclusion unless the transaction is invalid, so attesters need to know whether it is valid. (TBD: the ERC-8421 draft says only that it requires no change to the FOCIL rules of EIP-7805. The partial-satisfaction claim comes from the landing page.)

## What modular mempools could add

These are possibilities that a dedicated mempool could add. They are not part of ERC-8421 or the sidecar today.

- **Proof aggregation.** A mempool could verify and aggregate proofs before inclusion.
- **Pre-inclusion privacy.** A mempool could encrypt transactions until they are included.

## The sidecar

The reference implementation of this architecture is the [mempool sidecar](/guides/run-the-sidecar/). It runs in `standalone` mode, with no p2p, or `node` mode, which joins the libp2p network. See [P2P mempool](/guides/p2p/).
