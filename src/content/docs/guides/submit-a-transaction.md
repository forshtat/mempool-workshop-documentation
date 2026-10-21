---
title: "Submit a Frame Transaction"
description: "Send a Frame Transaction to the sidecar, follow it and dry-run it first."
sidebar:
  order: 6
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

## Send

Submit the JSON form of the transaction to the sidecar with `eth_sendFrameTransaction`.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_sendFrameTransaction",
  "params": [
    {
      "chainId": "0x539",
      "nonce": "0x6",
      "sender": "0x5544596212F91984C986A919C8026DF0576816f9",
      "frames": [
        { "mode": 1, "flags": 3, "target": null,
          "limits": { "execution": "0x7530", "state": "0x0" }, "value": "0x0", "data": "0x" },
        { "mode": 2, "flags": 0, "target": "0x5544596212F91984C986A919C8026DF0576816f9",
          "limits": { "execution": "0xc350", "state": "0x0" }, "value": "0x1", "data": "0x" }
      ],
      "signatures": [
        { "scheme": 1, "signer": "0x", "msg": "0x",
          "signature": "0x00<r: 32 bytes><s: 32 bytes>" }
      ],
      "fees": {
        "maxPriorityFeePerGas": "0x3b9aca00",
        "maxFeePerGas": "0x77359400",
        "maxFeePerBlobGas": "0x0"
      },
      "blobVersionedHashes": []
    }
  ]
}
```

This is a self relay. Frame 0 is a `VERIFY` frame that approves both execution and payment (`flags: 3`, so the sender pays its own gas). Frame 1 is a `SENDER` frame that moves 1 wei. The signature is over the canonical signature hash, packed as `<1 byte y-parity (0/1)><r><s>`. `signer: "0x"` means `tx.sender`, and `msg: "0x"` means the canonical signature hash.

The response is the transaction hash, `keccak256(encodeRawFrameTx(tx))`. A rejected transaction returns no hash. Compute `keccak256(0x06 || rlp(tx))` yourself if you want to look the rejection up.

The helpers that build and sign this shape are `buildUnsignedFrameTx`, `signFrameTx` and `toWire` in the sidecar repository's `test/e2e/helpers.ts`, backed by `computeSigHash` in `packages/executor/src/services/FrameTxService/codec.ts`.

## Frame limits

Execution and state gas are limited separately, per frame. A frame that creates a new account needs a non-zero `state` limit. With `state: 0` it silently fails and drags the transaction's top-level result to failure. Sending value to an existing account needs no state gas.

## Follow it

```sh
# The sidecar's view: Submitted -> OnChain
curl -s -X POST https://altmempool.forshtat.com/rpc -H 'content-type: application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"skandha_frameTransactionStatus","params":["0x<hash>"]}'

# Per-frame receipt
curl -s -X POST https://altmempool.forshtat.com/rpc -H 'content-type: application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"eth_getFrameTransactionReceipt","params":["0x<hash>"]}'
```

`skandha_frameTransactionStatus` returns one of `New`, `Pending`, `Submitted`, `OnChain`, `Finalized`, `Cancelled` or `Reverted`. For an unknown hash it returns the error "Frame transaction not found".

## Dry run

- `eth_estimateFrameTransactionGas` on `/rpc` returns per-frame gas limits with markup applied.
- `ethrex_simulateFrameTransaction` on the ethrex URL runs ethrex's admission check plus full execution, optionally with a validation trace. It takes the RLP-encoded raw transaction (`0x06 || rlp(...)`), not the JSON form.

## Common gotchas

- Fund a paymaster through the `value` of its `CREATE`, never by a later plain transfer. Any external call runs the contract's runtime code, which calls `APPROVE` outside a frame and halts.
- A freshly created contract account starts at nonce 1. Use `nonce: "0x1"` for the first Frame Transaction from such a wallet.
- Give a wallet contract a non-zero balance if a `SENDER` frame transfers value from it.
- More nonce keys cost more validation gas.
