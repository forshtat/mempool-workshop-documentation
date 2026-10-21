---
title: "Spec and implementation differences"
description: "Known places where the landing page, the ERC-8421 draft, the sidecar and the workshop disagree."
sidebar:
  order: 2
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

Every place in these docs where sources disagree is marked **(TBD)**. Search this site for `(TBD)` to find them all. This page collects the known differences.

## Landing page and ERC-8421 draft

| Topic | Landing page | ERC-8421 draft |
|---|---|---|
| Validation gas, unstaked entity | 250,000 | 100,000 (`MAX_VERIFY_GAS_PER_ENTITY`) |
| Validation gas, staked entity | 2,500,000 | 1,000,000 (`MAX_VERIFY_GAS_STAKED_ENTITY`) |
| Privacy withdrawal proof check | About 200,000 gas, fits without stake | Not stated. Fits without stake only if the unstaked budget is at least that |
| Post-quantum signature | About 700,000 gas or more, needs stake | Not stated |
| FOCIL | The rules partially satisfy the FOCIL profile | Only states that no change to the FOCIL rules is required |
| Proof aggregation, mempool encryption | Mentioned as possibilities | Not mentioned |

The landing page values were updated after review feedback and the draft has not been updated yet.

## Sidecar and ERC-8421 draft

The sidecar's rules come from an earlier ERC-7562-derived draft (`forshtat/ERCs` PR #6, "Update ERC-7562: Add EIP-8141 specific rules"), which later evolved into ERC-8421. The two are not equivalent. The workshop shows the earlier behaviour.

| Topic | Sidecar and workshop | ERC-8421 draft |
|---|---|---|
| Rule IDs | `OP-011`, `COD-010`, `storage`, `prefix` and so on, and an earlier `GREP-*` family | `BUDGET-010`, `STORAGE-021`, `REPUTATION-220` and so on |
| Validation gas | A single `MAX_VERIFY_GAS` of 100,000 in the workshop's decision guide, with a separate staked budget | Per-entity budgets |
| State gas cap | A per-entity state-gas cap existed in the earlier draft | No cap |
| Per-sender pending limits | Linear transactions: 4 per sender. Keyed transactions: no per-sender cap | `SAME_NONCE_KEY_MEMPOOL_COUNT` 4 per `(sender, key)` and `SAME_SENDER_MEMPOOL_COUNT` 64 per unstaked sender |
| Minimum unstake delay | Default 0 | 86,400 seconds |
| Pending identity | `chainId:sender:nonceSeq` for linear, `chainId:sender:k[keys]:nonceSeq` for keyed | `(sender, nonce_keys, nonce_seq)` |
| Reputation state names | `ok`, `throttled`, `banned` | `ACTIVE`, `THROTTLED`, `BANNED` |
| Registry | Calls it the EIP-8421 `IStakingRegistry` | `IStakingRegistry` at `STAKING_REGISTRY_ADDRESS` |

## Explorer URLs

The sidecar README links `altmempoolexplorer.forshtat.com`. The landing page and this site link `explorer.altmempool.wtf`.

## Resolving

When the spec review happens, each **(TBD)** in these docs should be removed or turned into a firm statement, and the tables above updated or deleted.
