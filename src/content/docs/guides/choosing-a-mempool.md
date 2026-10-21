---
title: "Choosing a mempool"
description: "Questions that decide whether your contract needs the canonical mempool or the standard Alternative Mempool."
sidebar:
  order: 2
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

Answer in order. The first "yes" in questions 1 to 3 means the canonical mempool will reject your validation code.

1. **Does validation read storage that is not the sender's own or associated storage?** For example another contract's slot: an allowlist, an oracle, a shared nullifier set. Canonical: rejected. Standard Alternative: rejected while unstaked, accepted once the entity is staked.
2. **Does validation use `BALANCE` or `SELFBALANCE`, or another gated opcode?** `BALANCE` is rejected for an unstaked entity and allowed for a staked one. Environment opcodes such as `TIMESTAMP`, `NUMBER`, `COINBASE`, `ORIGIN` and `GASPRICE` are rejected by **both** mempools, staked or not.
3. **Does validation need more gas than the canonical cap** (`MAX_VERIFY_GAS`, 100,000 across the whole prefix)? The standard Alternative Mempool has a separate per-entity budget, higher for staked entities.
4. **Can your entity stake and carry reputation risk?** A staked entity whose transactions keep being admitted but not included becomes `THROTTLED`, then `BANNED`. A banned entity is excluded even though it is staked. If you cannot accept that, stay inside the canonical rules.
5. **Who will include your transaction?** A transaction admitted only by an Alternative Mempool reaches only nodes and block builders that run it. A canonical-mempool transaction reaches every EIP-8141 node.

## Rule of thumb

| Your validation code | Choose |
|---|---|
| Only the account's own storage, no gated opcodes, within the gas cap | **Canonical mempool.** Widest propagation, no stake. |
| Needs shared state (registries, nullifier sets, allowlists) or gated opcodes, and the entity can stake | **Standard Alternative Mempool**, with a staked entity. |
| Needs `TIMESTAMP`, `NUMBER`, `COINBASE`, `ORIGIN`, `GASPRICE` or similar in validation | **Neither.** Move that logic into the execution frames. Validation may not use environment opcodes. |
| Needs a rule set neither mempool offers | A [custom Alternative Mempool](/guides/custom-mempool/). |

## Practical limits you will hit

- Fund contracts only through their creation `value`. A plain transfer runs the contract's validation code outside a frame and fails.
- Validation code cannot see the transaction signature hash from Solidity. The workshop wallets read the protocol-verified signer through `SIGPARAM`.
- Deploying a contract on the devnet needs about 6M gas, because the code deposit is charged as state gas.
- A transfer that creates a new account needs a non-zero `state` gas limit on the frame.

See [Use cases](/guides/use-cases/) for common contract types.
