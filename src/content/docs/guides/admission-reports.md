---
title: "Reading admission reports"
description: "Use the explorer API to see why a node accepted or rejected a transaction."
sidebar:
  order: 8
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

An admission report is the rule-by-rule verdict of a node on one transaction. It tells you which rule failed and for which entity.

## Enable it

Start the sidecar with `--explorer.enable`. Without the flag no history is recorded and every `skandha_explorer_*` call fails with "method not found" (`-32601`). The history is in memory only, bounded (10,000 events and 10,000 admission records by default), and cleared on restart.

Anyone who can reach the RPC port can read the explorer data. Enable the flag only on a node that does not hold private order flow.

## Look a transaction up

```json
{ "jsonrpc": "2.0", "id": 1, "method": "skandha_explorer_getTransaction", "params": ["0x<txHash>"] }
```

Or list recent rejections:

```json
{ "jsonrpc": "2.0", "id": 3, "method": "skandha_explorer_listAdmissions", "params": [{ "outcome": "rejected", "limit": 5 }] }
```

Each check in `checks` has a `rule`, a `verdict` (`pass`, `fail` or `skipped`), an optional `detail`, and for per-entity rules a `frameIndex` and `entity` (`sender`, `payer` or `factory`).

- `fail` means the rule ran and the transaction broke it. `detail` holds the same message the node returned to the submitter.
- `skipped` means an earlier rule already failed. A rejected report lists every later rule as `skipped`.
- A whitelisted entity's violations show as `pass` with a `detail` that starts with `waived (…)`.

## Rule IDs in the sidecar

The sidecar's report uses its own rule IDs, which do not match the ERC-8421 IDs (TBD). See [Explorer API](/reference/explorer-api/#rule-ids) for the list and [Spec and implementation differences](/project/differences/).

## Reading a rejection

- The execution client reports every failure of the validation prefix as "validation prefix frame reverted". A lack of funds, running out of gas, a revert and a loop look alike. The sidecar adds what it can tell: when the payer's balance is below the transaction's maximum cost, the message says so with both amounts. Otherwise it lists the gas limits given to the prefix frames.
- Throttled still admits a transaction. Only a `BANNED` entity is rejected. The rejection text of a banned entity can be the generic "unstaked payer accessed …", so check the entity's reputation status in `skandha_explorer_listReputation` to find the real cause.
- A rejection that only ethrex produced has no admission record in the sidecar.

## From the workshop

`npm run step_11_debug -- <txHash>` collects the admission report, the lifecycle events, `skandha_frameTransactionStatus` and ethrex's receipt for a hash.
