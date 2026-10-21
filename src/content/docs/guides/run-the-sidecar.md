---
title: "Run the sidecar"
description: "Install, configure and start the reference mempool node."
sidebar:
  order: 4
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

The sidecar is a TypeScript node for EIP-8141. It exposes `eth_sendFrameTransaction`, validates and simulates transactions against an execution client, relays them on chain, and gossips them to other sidecars over libp2p.

There is no EntryPoint and no `eth_sendUserOperation`. It needs an execution client that implements EIP-8141. Today that is the `eip8141-tracer` branch of [ethrex](https://github.com/lambdaclass/ethrex). A standard client such as geth cannot validate or simulate Frame Transactions.

The sidecar is a fork of [Etherspot's Skandha](https://github.com/etherspot/skandha), which was an ERC-4337 bundler. The reference repository is [mempool-workshop-sidecar](https://github.com/forshtat/mempool-workshop-sidecar).

## From source

```sh
bun install
bun run build
cp config.json.default config.json
```

Edit `config.json`:

- Point `rpcEndpoint` and `rpcEndpointSubmit` at an EIP-8141-aware execution client.
- Set `relayers` to the private key or keys that will submit transactions on chain.

Then start the node:

```sh
./skandha standalone
```

The RPC API is available at `http://localhost:14337/rpc/`.

## With Docker

```sh
cp config.json.default config.json
# edit config.json
docker build -t skandha .
docker run \
  --mount type=bind,source="$(pwd)"/config.json,target=/usr/app/config.json,readonly \
  -dp 14337:14337 \
  skandha standalone
```

## Modes

| Mode | Command | Description |
|---|---|---|
| Standalone | `./skandha standalone` | RPC, validation and relaying. No p2p. |
| Node | `./skandha node` | The same, plus the libp2p gossip network. See [P2P mempool](/guides/p2p/). |

## Required configuration

`entryPoints`, `canonicalEntryPoint` and `supportedMempools[].entryPoint` must all be set to the fixed EIP-8141 sentinel address `0x00000000000000000000000000000000000000aa`. It is not a deployed contract. Leaving one of them at a stale ERC-4337-style address silently disables gossip publishing in `node` mode.

```json
{
  "entryPoints": ["0x00000000000000000000000000000000000000aa"],
  "canonicalEntryPoint": "0x00000000000000000000000000000000000000aa",
  "standardMempoolId": "QmcFZKUX9qoo3StwVycJTAhwdiqbEjcwNvQVK246p3z1rk",
  "supportedMempools": [
    {
      "mempoolId": "QmcFZKUX9qoo3StwVycJTAhwdiqbEjcwNvQVK246p3z1rk",
      "entryPoint": "0x00000000000000000000000000000000000000aa"
    }
  ],
  "relayers": ["0x{RELAYER_PRIVATE_KEY}"],
  "rpcEndpoint": "http://localhost:8545"
}
```

`relayers` and a few other fields can also be set with environment variables such as `SKANDHA_RELAYERS`, `SKANDHA_BENEFICIARY` and `SKANDHA_RPC`. See [Configuration](/reference/configuration/) and [CLI options](/reference/cli/).

## How relaying works

In `auto` bundling mode the sidecar relays validated transactions on an interval through the `PrivilegedRelayer`. It calls `ethrex_submitPrivilegedFrameTransaction` on a co-located, trusted ethrex node. That method forces the transaction into the next payload build and bypasses ethrex's own mempool. It is unauthenticated, so run it only against your own trusted node. The sidecar is an outsourced mempool client for one node, not a general-purpose bundler.

## Enable the explorer API

Start with `--explorer.enable` to record admission reports and lifecycle events. See [Reading admission reports](/guides/admission-reports/).
