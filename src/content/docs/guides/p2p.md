---
title: "P2P mempool"
description: "Run two sidecar nodes and watch a Frame Transaction propagate by gossip."
sidebar:
  order: 9
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

Running `./skandha node` instead of `./skandha standalone` joins a libp2p network that gossips Frame Transactions between sidecar nodes. Gossipsub handles propagation and discv5 handles peer discovery.

## Wire format version

Nodes must run the same wire format to share a mempool. Adding keyed nonces (EIP-8250) and recent-root references (EIP-8272) changed the SSZ `FrameTransaction`, so both protocols that carry it were versioned.

| Protocol | Before | Now |
|---|---|---|
| Gossip topic | `/account_abstraction/<mempool>/frame_transaction/ssz_snappy` | `…/frame_transaction_v2/ssz_snappy` |
| Req/resp `pooled_frame_txs_by_hash` | version 1 | version 2 |

Old and new nodes simply do not exchange Frame Transactions. Upgrade every node of a network together. The other req/resp protocols (`pooled_frame_tx_hashes`, `status`, `ping`, `metadata`, `goodbye`) are unchanged.

## Walkthrough

This is a bootnode and a regular node against a local ethrex devnet.

1. **Build and start ethrex** from the `eip8141-tracer` branch. It does not build natively on macOS, so `test/e2e/ethrex-devnet.sh` builds and runs it in Docker: `./test/e2e/ethrex-devnet.sh build` once, then `./test/e2e/ethrex-devnet.sh up`. It listens on `http://127.0.0.1:8555` with chain ID 9 and the `ethrex` API namespace enabled.
2. **Configure the bootnode.** Create `nodeA/config.json` with the sentinel entry point address, the standard mempool ID, a funded relayer key and `rpcEndpoint` set to `http://127.0.0.1:8555`. See [Run the sidecar](/guides/run-the-sidecar/).
3. **Run the bootnode:**

   ```sh
   bun --bun packages/cli/bin/skandha.js node \
     --configFile ./nodeA/config.json --dataDir ./nodeA \
     --api.address 127.0.0.1 --api.port 14337 --api.wsPort 14337 \
     --p2p.host 127.0.0.1 --p2p.enrHost 127.0.0.1 --p2p.port 4337 --p2p.enrPort 4337 \
     --p2p.retainPeerId \
     --executor.bundlingMode manual
   ```

   `--api.wsPort` defaults to `14337` and does not follow `--api.port`. Set it explicitly. `--p2p.retainPeerId` persists the node's ENR to `./nodeA/enr`.
4. **Read the ENR** with `cat ./nodeA/enr`.
5. **Run the second node** with its own config, data directory and ports, and `--p2p.bootEnrs <the ENR>`. Use ports 14338 and 4338 on the same machine.
6. **Confirm the nodes peered.** Gossipsub silently drops a publish with no subscribed peers. Call `skandha_connectedPeers` on both nodes and wait for a non-empty array.
7. **Submit a Frame Transaction to node A** with `eth_sendFrameTransaction`. See [Submit a Frame Transaction](/guides/submit-a-transaction/).
8. **Confirm it reached node B** with `eth_getFrameTransactionByHash` on node B's RPC. A non-null result proves the transaction was published by gossip and that node B validated it and stored it in its own mempool.

## Automated version

```sh
./test/e2e/ethrex-devnet.sh build   # once
bun run build
bun run test:e2e
```

## Connecting to the public devnet

A sidecar can peer with the devnet's mempool by using the devnet's ENR as a boot node. See `deploy/devnet/devnet-readme.md` in the sidecar repository for the ENR and flags.
