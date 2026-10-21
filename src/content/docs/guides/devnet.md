---
title: "Public devnet"
description: "Connecting to the public EIP-8141 devnet and what it offers."
sidebar:
  order: 5
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

A public, demonstration-only devnet for trying Frame Transactions and the Alternative Mempool. It runs an ethrex fork (execution) with Lighthouse (consensus), plus the sidecar as the mempool and relay.

> This is a throwaway network. It has no security model, no faucet and no persistence guarantee, and may be reset at any time. Do not send anything of value to it. Several admin surfaces are deliberately left open.

## Endpoints

| | |
|---|---|
| Execution RPC (ethrex) | `https://altmempool.forshtat.com` |
| Mempool RPC (sidecar) | `https://altmempool.forshtat.com/rpc` |
| Sidecar WebSocket | `wss://altmempool.forshtat.com/rpc` |
| Chain ID | `1337` (`0x539`) |
| Block time | 6 seconds |
| Explorer | [explorer.altmempool.wtf](https://explorer.altmempool.wtf/) |

(TBD: the sidecar README links an explorer at `altmempoolexplorer.forshtat.com`. The landing page links `explorer.altmempool.wtf`.)

Both HTTPS routes accept `POST` with a JSON-RPC 2.0 body and send permissive CORS headers.

- The **root URL** talks to ethrex. Use it for standard `eth_*`, `net_*`, `web3_*` and `txpool_*` methods, for legacy and 1559 transactions, and for the `ethrex_*` and `debug_*` methods.
- **`/rpc`** talks to the sidecar. Use it to submit Frame Transactions into the Alternative Mempool and to follow them. The sidecar also proxies a whitelist of standard read methods to ethrex.

## Getting funds

There is no faucet. One account is funded at genesis, and its key is published on purpose in the sidecar repository (`deploy/devnet/genesis.values.env`). Everyone shares it, so nonce collisions are possible. Generate your own key and fund it once from the shared account with a plain transfer. The workshop's `step_1_check` does this for you. Never use the shared key on a real network.

## Plain transfers need more gas

The network runs the Amsterdam+ resource-based gas model. A transfer to a brand-new account costs an extra 183,600 state gas, so `gas: 21000` fails. Budget at least 204,600 gas. 250,000 is comfortable. A transfer to an existing account still costs 21,000.

## Life of a Frame Transaction

1. A client calls `eth_sendFrameTransaction` on the sidecar.
2. The sidecar makes one `ethrex_simulateFrameTransaction` call with tracing, recognizes the validation prefix shape, and enforces the rules per role.
3. The transaction enters the sidecar's mempool and is gossiped to other sidecars over libp2p.
4. In `auto` mode the sidecar relays it to the local ethrex node through `ethrex_submitPrivilegedFrameTransaction`.
5. Once a block includes it, the sidecar reads the receipt and sets the status to `OnChain` or `Reverted`.

ethrex's own mempool is not the Alternative Mempool. A Frame Transaction can also be sent to ethrex directly with `eth_sendRawTransaction` (type `0x06`), where ethrex applies the canonical rules.

## Predeployed contracts

Real mainnet contracts are deployed on the devnet by replaying their deployment transactions, including LINK, USDT, BAYC, Tornado Cash (0.1 ETH pool), USDC, WETH9, Permit2, Uniswap v4 and Railgun. A `NaiveStakingRegistry` implementing `IStakingRegistry` is deployed at `0xd51c04d7a0b01124e84de152f4e56d9eecb22d2f`. The full list with addresses is in the sidecar repository, `deployments/devnet.md`. Addresses can change when the devnet is reset.

## Known limitations

- The `debug_bundler_*` admin methods are reachable from the internet. Do not call the `clear*` or `set*` methods unless you mean to affect everyone.
- `ethrex_submitPrivilegedFrameTransaction` is unauthenticated on this devnet.
- The explorer history is in memory only and is cleared on restart.
