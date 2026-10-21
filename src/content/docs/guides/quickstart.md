---
title: "Quickstart: the workshop"
description: "Eleven one-line commands that send Frame Transactions to a public devnet and show the canonical mempool and the standard Alternative Mempool side by side."
sidebar:
  order: 1
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

The [workshop repository](https://github.com/forshtat/mempool-workshop) is a hands-on tutorial. In eleven commands you send Frame Transactions to a public devnet, watch the canonical mempool reject a transaction that the standard Alternative Mempool accepts once the sender is staked, and debug a rejection.

> The devnet is a throwaway network and can be reset at any time. The workshop's reference node follows an earlier draft of the rules, not exactly ERC-8421 (TBD). See [Spec and implementation differences](/project/differences/).

## Requirements

Node 20.12 or newer and npm. Foundry is optional, and only needed to change the contracts.

## Install

```sh
git clone https://github.com/forshtat/mempool-workshop.git && cd mempool-workshop
npm install
npm run step_1_check
```

`step_1_check` creates a throwaway key in `.env` (devnet only, never reuse it on a real network) and funds it from the devnet's shared key.

## The steps

| Command | You achieve |
|---|---|
| `npm run step_1_check` | Confirm the devnet, explorer and your funded key work. |
| `npm run step_2_tx_first` | Broadcast your first Frame Transaction. |
| `npm run step_3_tx_paymaster` | Broadcast a Frame Transaction paid for by a paymaster. |
| `npm run step_4_wallet_deploy` | Deploy your own validation-frame wallet contract. |
| `npm run step_5_tx_wallet` | Send a transaction validated by your wallet. |
| `npm run step_6_tx_violating_canonical` | **Fail** to broadcast a rule-violating transaction to the canonical mempool. |
| `npm run step_7_stake` | Stake the wallet. |
| `npm run step_8_tx_violating_alt` | Send **the same transaction** to the standard Alternative Mempool. It is accepted. |
| `npm run step_9_reputation_burn` | Get the entity banned. This is a declared shortcut, see below. |
| `npm run step_10_tx_violating_alt_banned` | **Fail** to send the transaction because of low reputation. |
| `npm run step_11_debug -- <txHash>` | Debug any transaction: admission report, lifecycle, status. |

Every step prints a short summary, accepts `--json` for one machine-readable object, and exits 0 when the expected outcome happened. For the "fail" steps, the expected outcome is the rejection. Run the steps in order the first time. State such as deployed addresses and the last transaction hash is kept in `.workshop-state.json`. If the devnet was reset, re-run the deploy steps with `--fresh`.

## Step 9 cheats

Reputation should fall because an entity keeps producing transactions that are admitted but never included. That cannot be reproduced reliably on the devnet. `step_9_reputation_burn` writes the reputation counters directly through the devnet's open `debug_bundler_setReputation` method, for your own wallet only. Real nodes restrict that method. Everything else exercises the real mechanism. `-- --reset` undoes the shortcut.

## What you see

Steps 6 to 8 use the same transaction, a wallet that reads another contract's storage during validation:

- The canonical mempool (ethrex on the devnet) rejects it with `StorageReadNonSender`.
- The standard Alternative Mempool (the sidecar) rejects it with `unstaked payer accessed … slot …` while the wallet is unstaked.
- Once the wallet is staked (step 7), the sidecar admits and mines it. The canonical mempool still rejects it.

## Working with an AI agent

Point your agent at the repository's `AGENTS.md`. Every step can be run alone, `--json` output is a single object, and the error codes are listed with fixes.
