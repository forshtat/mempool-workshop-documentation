---
title: "Propagation (PROPAGATION)"
description: "How nodes handle transactions received from peers."
sidebar:
  order: 12
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

The wire protocol is out of scope for ERC-8421. The following rules apply to any transport that carries transactions between nodes of the standard mempool.

### PROPAGATION-010

A transaction is broadcast with two items: the transaction itself, and the block hash against which it was last validated.

### PROPAGATION-020

A node that receives a transaction from a peer must validate it locally before it propagates it.

### PROPAGATION-030

If a received transaction fails a static check, such as an invalid encoding, a value below a minimum, or an outdated block hash, the node drops it and keeps the connection.

### PROPAGATION-040

A node silently drops a transaction that conflicts (see LIFECYCLE-020) with a transaction recently included in a block. This is almost certainly a network race. It causes no reputation change.

### PROPAGATION-050

If a received transaction fails against the current block, the node should retry validation against the block named in the transaction's message. If it succeeds, the node silently drops the transaction and keeps the connection. If it fails, that indicates a peer propagating a known invalid or incompatible payload. The node should mark the sending peer as a **spammer**, disconnect from it, or block it permanently.

## The sidecar's wire format

The sidecar gossips over libp2p. See [P2P mempool](/guides/p2p/) for the topic, req/resp protocols and the wire format version.
