---
title: "Writing a custom mempool"
description: "How a third-party operator defines and serves its own Alternative Mempool rules."
sidebar:
  order: 11
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

The standard Alternative Mempool is not the only possible rule set. Node operators can agree on additional rule sets and opt into them next to the standard one.

## What defines a custom mempool

- **A rule document.** Describes which transactions the mempool admits, which it rejects, and how it tracks the entities in a transaction's validation process.
- **A topic.** Each Alternative Mempool is identified by its own topic, conventionally the IPFS hash of the document that describes its rules. In the architecture view the topic is "the hash of your rules".
- **Its own reputation counters.** `seen` and `included` should be kept separately for each mempool.

A transaction that violates a standard rule must not be propagated in the standard mempool. It can be propagated in any custom mempool whose rules it satisfies. One transaction can be on several mempools at once.

## Ideas

The landing page lists examples of what operators might change: trust a contract you audited, swap hot Solidity for a native binary, or track reputation differently.

## In the sidecar

The reference implementation has configuration hooks that are relevant to custom rules:

| Setting | Effect |
|---|---|
| `supportedMempools` | The list of mempool IDs the node serves, each with its entry point. |
| `standardMempoolId` | The ID of the standard mempool. |
| `whitelistedEntities` | Addresses exempt from stake and opcode validation, per role. Violations are reported as `waived (…)`. |
| `minStake`, `minUnstakeDelay` | Stake thresholds. |
| `minInclusionDenominator`, `throttlingSlack`, `banSlack` | Reputation parameters. |

Serving a fully custom rule set means changing or extending the validation code in the sidecar. (TBD: the sidecar has no plugin mechanism for custom rule sets yet, and the process for registering a mempool topic is not documented.)

## Tutorial

The [workshop repository](https://github.com/forshtat/mempool-workshop) is presented as a tutorial to build your own Alternative Mempool. See [Quickstart](/guides/quickstart/).
