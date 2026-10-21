---
title: "Subscriptions"
description: "WebSocket subscriptions for pending, submitted and on-chain Frame Transactions."
sidebar:
  order: 5
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

`skandha_subscribe` creates a subscription over the WebSocket RPC connection. The sidecar sends data as soon as it occurs, wrapped in a `skandha_subscription` notification.

The event type names (`pendingUserOps`, `submittedUserOps`, `onChainUserOps`) are kept from the original ERC-4337 implementation. Only the payload changed: each event carries `tx` (the full Frame Transaction), `txHash`, and the roles resolved from the validation prefix (`sender`, `payer`, `factory?`).

## Event types

| Type | Meaning |
|---|---|
| `pendingUserOps` | Frame Transactions validated and put in the mempool. |
| `submittedUserOps` | Frame Transactions submitted on chain, reverted, or removed from the mempool. |
| `onChainUserOps` | Frame Transactions confirmed on chain. |
| `explorerEvents` | The explorer lifecycle log. Requires `--explorer.enable`. See [Explorer API](/reference/explorer-api/#live-stream). |

## Subscribe

```json
{ "method": "skandha_subscribe", "params": ["pendingUserOps"], "id": 1, "jsonrpc": "2.0" }
```

The response result is the subscription ID, for example `"0x106eb9867751ff1bf61bad4a80b8b486"`.

## Event

```json
{
  "jsonrpc": "2.0",
  "method": "skandha_subscription",
  "params": {
    "subscription": "0x80e0632d2300aa2e1bcdb1e84329963f",
    "result": {
      "tx": { "...": "FrameTransaction" },
      "txHash": "0xf8a5…4c9e",
      "transaction": "0x3612…9656",
      "status": "Submitted",
      "revertReason": null
    }
  }
}
```

Submitted and on-chain events carry `transaction`, the hash of the on-chain transaction that carried the Frame Transaction. Submitted events also carry `status` and `revertReason`.

## Unsubscribe

```json
{ "method": "skandha_unsubscribe", "params": ["0xcf47424b5f492abfaa97ca5d4aed1f1d"], "id": 1, "jsonrpc": "2.0" }
```

The response result is `"ok"`.
