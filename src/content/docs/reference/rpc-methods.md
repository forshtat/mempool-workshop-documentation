---
title: "RPC methods"
description: "JSON-RPC methods exposed by the sidecar and the ethrex fork."
sidebar:
  order: 1
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

The sidecar exposes JSON-RPC 2.0 over `POST /rpc/` (and WebSocket at the same path). All results except `skandha_config` and `skandha_explorer_*` are hex-encoded.

There is no `eth_sendUserOperation`, `eth_supportedEntryPoints`, `skandha_userOperationStatus` or `skandha_feeHistory`.

## Frame Transaction methods

| Method | Params | Result |
|---|---|---|
| `eth_sendFrameTransaction` | `[tx]`: the full signed transaction in JSON form | The transaction hash. Errors if the transaction fails simulation or the mempool rules. The total frame gas limit is capped by the node's `userOpGasLimit`. |
| `eth_estimateFrameTransactionGas` | `[partialTx]`: needs `sender` and `frames`. `signatures`, `fees` and `nonce` are optional | `{ frames: [{execution, state}], cumulativeGasUsed, maxFeePerGas, maxPriorityFeePerGas }`. Validation prefix frames keep their limits. Body frames are simulated with a large placeholder limit and the measured usage is returned with markup applied. |
| `eth_getFrameTransactionByHash` | `[hash]` | The mempool entry, or `null` if not in this node's mempool. |
| `eth_getFrameTransactionReceipt` | `[hash]` | `{ status, payer, cumulativeGasUsed, frameReceipts: [{status, gasUsed: {execution, state}, logs}] }`. Errors if the transaction is not mined yet. |
| `skandha_frameTransactionStatus` | `[hash]` | `{ tx, sender, payer, factory?, status, transaction?, reason? }`. See below. |

`skandha_frameTransactionStatus` returns `status` as one of `New`, `Pending`, `Submitted`, `OnChain`, `Finalized`, `Cancelled`, `Reverted`. `transaction` appears once submitted. `reason` appears only for `Reverted`. `factory` appears only if the prefix has a `deploy` frame. An unknown hash returns the error "Frame transaction not found". It is a plain request and response call, not a push.

## Other sidecar methods

| Method | Result |
|---|---|
| `skandha_getGasPrice` | `{ maxPriorityFeePerGas, maxFeePerGas }` suggested for this chain. |
| `skandha_config` | Node configuration: chain ID, flags, the entry point sentinel, relayer address, reputation and staking parameters, gas markup settings. Not hexlified. |
| `skandha_connectedPeers` | The connected p2p peers, empty if none. |
| `skandha_subscribe`, `skandha_unsubscribe` | WebSocket push subscriptions. See [Subscriptions](/reference/subscriptions/). |
| `skandha_explorer_*` | Read-only explorer methods. See [Explorer API](/reference/explorer-api/). |
| `eth_chainId`, `web3_clientVersion` | Answered locally. |

With `--redirectRpc`, a whitelist of standard read methods is proxied to the execution client, for example `eth_blockNumber`, `eth_getBalance`, `eth_call`, `eth_getTransactionCount`, `eth_getCode`, `eth_getBlockByNumber`, `eth_getTransactionReceipt` and `eth_sendRawTransaction`.

## debug_bundler_* admin methods

`debug_bundler_dumpMempool`, `dumpMempoolRaw`, `clearState`, `clearMempool`, `clearReputation`, `setReputation`, `dumpReputation`, `setBundlingMode`, `setBundleInterval`, `sendBundleNow`, `setMempool`, `getStakeStatus`, `setPrivilegedRelayTargetBlock`.

These are restricted to requests from localhost, test mode, or an admin key. On the public devnet they are reachable from the internet because the reverse proxy connects from localhost. `debug_bundler_setReputation` takes `[[{ address, opsSeen, opsIncluded }], entryPoint]`.

## ethrex fork methods

On the execution client RPC.

### ethrex_simulateFrameTransaction

Dry-runs a Frame Transaction without submitting it: ethrex's admission checks, followed by a full multi-frame execution.

Params: `[rawTx, block?, options?]`

- `rawTx` is the RLP-encoded type-`0x06` transaction, `0x06 || rlp(fields)`. It is not the JSON form.
- `block` defaults to `latest`.
- `options` is `{ "trace": true }` to also return the full ERC-7562 frame trace.

| Result field | Meaning |
|---|---|
| `valid` | All frame-specific admission gates passed. Necessary but not sufficient for mempool admission. |
| `prefixShape` | Recognized validation prefix shape name, or `null`. |
| `payer` | Payer established by the prefix, or `null`. |
| `maxCost` | Maximum cost in wei, hex. |
| `violation` | Why it is invalid, `null` when `valid`. |
| `gasUsed`, `frames`, `executionStatus`, `executionError` | Execution results, `null` if not executed. |
| `erc7562Trace` | With tracing: one entry per frame with opcode counts, accessed storage and transient-storage slots, `EXTCODE*` accesses, contract sizes and Keccak preimages. |
| `erc7562TraceError` | Set if tracing was requested and the trace pass failed. |

### ethrex_submitPrivilegedFrameTransaction

Params: `[rawTx]`. Forces the transaction into the very next payload build, bypassing ethrex's mempool admission entirely. There is no retry. It is fully unauthenticated, so it is a demo shortcut and not something to copy into a real deployment. The sidecar's `PrivilegedRelayer` uses it.

### Other changes

- `eth_sendRawTransaction` accepts type-`0x06` Frame Transactions and applies ethrex's own (canonical) validation.
- `eth_getTransactionReceipt` on a Frame Transaction adds a `frameReceipts` array.
- `debug_trace*` methods accept a `tracer` option. This fork adds `erc7562FrameTracer`, whose output is an array with one entry per frame.
