---
title: "CLI options"
description: "Command line flags of the skandha executable."
sidebar:
  order: 3
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

```sh
./skandha standalone   # RPC, validation and relaying, no p2p
./skandha node         # the same, plus the libp2p network
```

| Flag | Description | Default |
|---|---|---|
| `--configFile <path>` | Path to the config file. | `./config.json` |
| `--dataDir <path>` | Path to the data directory. | `~/.skandha/db/` |
| `--redirectRpc` | Proxy standard `eth_*` calls straight to the underlying execution client. | `false` |
| `--executor.bundlingMode manual\|auto` | Relay transactions on an interval (`auto`), or only on demand (`manual`). Either way the node keeps following the chain, so transactions it holds are marked `OnChain` or `Reverted` when mined, including by another node. | `auto` |
| `--api.port <port>` | RPC server port. | `14337` |
| `--api.wsPort <port>` | WebSocket port. It does not follow `--api.port`, so set it explicitly when running several nodes on one machine. | `14337` |
| `--api.address <host>` | RPC bind address. | |
| `--explorer.enable` | Record admission reports and lifecycle events and serve `skandha_explorer_*`. | off |
| `--metrics.enable` | Enable Prometheus metrics. | `false` |
| `--metrics.host <host>` | Metrics server host. | `127.0.0.1` |
| `--metrics.port <port>` | Metrics server port. | `8008` |
| `--unsafeMode` | Vestigial. Only affects EIP-2930 transaction type selection. | `false` |

P2P flags used in the walkthrough: `--p2p.host`, `--p2p.enrHost`, `--p2p.port`, `--p2p.enrPort`, `--p2p.retainPeerId` and `--p2p.bootEnrs <ENR>`. See [P2P mempool](/guides/p2p/).

Run `./skandha standalone --help` or `./skandha node --help` for the full list.
