---
title: "Explorer API"
description: "The skandha_explorer_* methods: admission reports, lifecycle events, peers and reputation."
sidebar:
  order: 4
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

A read-only JSON-RPC surface for explorer UIs. It answers three questions the regular RPC methods cannot: why did this node accept or reject a Frame Transaction (a rule-by-rule report), what happened to it afterwards (a lifecycle event log, also a live stream), and how much does this node trust each entity (reputation and stake).

It requires the node to be started with `--explorer.enable`. Without the flag every call fails with `-32601`. History is kept in memory only, bounded (10,000 lifecycle events and 10,000 admission records by default) and cleared on restart. The methods never change node state and are not gated to localhost or an admin key.

## Conventions

- Requests are JSON-RPC 2.0 over `POST /rpc/` or the WebSocket at the same path. `params` is a positional array.
- Numbers are JSON numbers: `seq`, `at`, `id`, `errorCode`, `frameIndex`, `chainId` and every time field (Unix milliseconds). Nonces and fee quantities, which can exceed 2^53, are `0x` hex strings.
- Cursors are opaque. Pass back the `nextCursor` of the previous page unchanged. A page without `nextCursor` is the last one.
- `limit` defaults to 50 and is capped at 200.
- Invalid arguments return `-32600`. `getTransaction` on a hash the node knows nothing about returns `-32600` with `Frame transaction not found`.
- Stored `detail` and `reason` texts are truncated to 1,024 characters.

## Methods

| Method | Params | Returns |
|---|---|---|
| `skandha_explorer_info` | none | Node identity and history buffer state: `protocolVersion`, `chainId`, `version`, `commit`, `bundlingMode`, `p2pEnabled`, `latestSeq`, `oldestSeq`, `historyCapacity`, `bootId`. Call it first. |
| `skandha_explorer_listTransactions` | `[{ status?, cursor?, limit? }]` | The transactions currently in this node's mempool store, newest first. |
| `skandha_explorer_listAdmissions` | `[{ outcome?, cursor?, limit? }]` | Admission records, newest first. Covers rejected and replaced transactions too. |
| `skandha_explorer_getTransaction` | `[txHash]` | The mempool entry (or `null`), the admission record (or `null`) and the retained lifecycle events for one hash. |
| `skandha_explorer_peers` | none | The connected p2p peers: `peerId`, `direction`, `connectedAt`, `lastReceivedAt`, `agentVersion`, `supportedMempools`. Empty without p2p. |
| `skandha_explorer_listReputation` | `[{ cursor?, limit? }]` | Every tracked entity: `address`, `opsSeen`, `opsIncluded`, `status` (`ok`, `throttled`, `banned`), `isWhitelisted`, `isBlacklisted`, `stake`, `unstakeDelaySec`, `withdrawTime`, `isStaked`. |

`listReputation` makes up to `limit` concurrent on-chain reads per call (one `getDepositInfo` per address), so a polling caller can repeat a real cost.

## Admission records

An admission record is this node's verdict on one transaction hash.

| Field | Meaning |
|---|---|
| `id` | Monotonic number, used as the pagination cursor. |
| `txHash`, `sender` | Hash and sender. |
| `nonce`, `nonceKeys` | The EIP-8250 `nonceSeq` and keys, in hex. |
| `at` | Unix ms when this node received the transaction, before validation started. |
| `source` | `rpc`, `gossip:<peerId>` or `sync:<peerId>`. |
| `outcome` | `accepted`, `rejected`, `included`, `replaced` or `dropped`. |
| `errorCode` | JSON-RPC error code of a rejection, if it was an `RpcError`. |
| `includer` | The including block's miner address. Only when `outcome` is `included`. |
| `checks` | The rule-by-rule report, a list of `RuleCheck`. |

Outcomes:

- `accepted`: in the mempool, not yet resolved.
- `rejected`: validation or the mempool refused it.
- `included`: landed on chain, whether or not the Frame Transaction itself succeeded. Once set, `included` is never overwritten.
- `replaced`: set on the old transaction's record when a newer one takes its slot.
- `dropped`: the node's own bundler gave up on an accepted transaction.

A `RuleCheck` has `rule`, `verdict` (`pass`, `fail`, `skipped`), `detail`, and for per-entity rules `frameIndex` and `entity`.

## Lifecycle events

Events have a `seq` that starts at 1 and grows by 1 per event. `kind` is one of:

| `kind` | Recorded when |
|---|---|
| `admitted` | The transaction entered the mempool. |
| `rejected` | An admission attempt failed. `reason` holds the error. |
| `replaced` | A newer transaction took this one's slot. Recorded on the old hash. |
| `statusChanged` | The transaction was submitted or reverted. |
| `dropped` | The transaction was cancelled. |
| `included` | The transaction was found on chain. |

Not every status change produces an event. A change to `Pending` does not.

## Live stream

The log is also a push stream over the WebSocket RPC. Use `skandha_subscribe` with the event type `explorerEvents`. To resume after a disconnect, keep the highest `seq` and the `bootId`, and subscribe again with `seq` as `sinceSeq`. If `bootId` changed, the node restarted: reload state. If `sinceSeq + 1 < info.oldestSeq`, events were evicted and the client should reload.

## Rule IDs

The sidecar's `RuleCheck.rule` is one of these IDs. They are the sidecar's own and differ from the ERC-8421 rule IDs (TBD). See [Spec and implementation differences](/project/differences/).

Global rules, in order:

| Rule ID | What it checks |
|---|---|
| `gas-limit` | The sum of all frames' gas limits is within the per-transaction cap. |
| `recent-root` | Every EIP-8272 recent-root reference is usable. |
| `prefix` | The leading frames form a recognized validation prefix. |
| `structure` | The prefix follows the EIP-8141 structural rules. |
| `signature` | Every signature verifies. |
| `simulation` | The traced simulation succeeded. |
| `trace-alignment` | The trace lines up with the frames. |
| `OP-061` | No nested `CALL` with non-zero value during validation. |
| `execution` | The simulation reported no execution error. |
| `mempool` | The mempool accepted it: replacement fee rules and reputation or ban checks passed. |

Per-entity rules:

| Rule ID | What it checks |
|---|---|
| `out-of-gas` | The entity did not run out of gas internally. |
| `OP-011` | The entity used none of the banned opcodes. |
| `create` | No forbidden contract creation. |
| `storage` | Only storage the entity may access. |
| `COD-010` | No access to the code of a contract that is not deployed. |
| `entrypoint-access` | No read of the code of the EIP-8141 `ENTRY_POINT` address. |

Catch-all: `admission` is a failure that no other rule claimed.
