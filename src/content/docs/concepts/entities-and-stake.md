---
title: "Entities and stake"
description: "Which contracts count as entities, what stake does, and how the Staking Registry works."
sidebar:
  order: 3
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

## Entities

Mempool rules are applied per entity: the sender, the payer and the factory of a transaction. Reputation is tracked per entity address, not per role.

A **default-code entity** is an entity whose account has no code and so runs EIP-8141's default code. It has no bytecode to trace, is never staked, and is exempt from the opcode, call and storage rules.

## What stake buys

Staking is a Sybil defence. Creating an entity is free, so the mempool needs an economic cost for creating an abusive one. A staked entity gets a wider set of permissions:

| Permission | Rule |
|---|---|
| A higher validation gas budget | [BUDGET-010](/rules/budget/) |
| `BALANCE` and `SELFBALANCE` opcodes | [OPCODES-010](/rules/opcodes/) |
| Access to its own storage | [STORAGE-031](/rules/storage/) |
| Read-only access to any storage in a contract that is not an entity of the transaction | [STORAGE-032](/rules/storage/) |
| Write access to slots associated with its address, in any contract that is not an entity of the transaction | [STORAGE-033](/rules/storage/) |
| Factory access to the sender's associated storage in a deploying transaction | [STORAGE-022](/rules/storage/) |
| No sender-wide pending limit while `ACTIVE` | [LIFECYCLE-030](/rules/lifecycle/) |
| No cap on pending transactions while `ACTIVE` | [REPUTATION](/rules/reputation/) |

## The stake is never slashed

There are no penalty mechanisms in the Alternative Mempools protocol. The significant lock-up period is the cost of creating a new abusive entity.

## Definition of staked

[STAKING-010](/rules/staking-and-solvency/): an entity is staked if the Staking Registry reports a stake of at least `MIN_STAKE_VALUE` and an unstake delay of at least `MIN_UNSTAKE_DELAY`, and withdrawal has not been initiated.

- `MIN_STAKE_VALUE` is per chain. It is roughly the equivalent of USD 1000 in the native token.
- `MIN_UNSTAKE_DELAY` is `86400` seconds, one day.

Calling `unlockStake()` starts a withdrawal. From that moment the entity is no longer considered staked, even though the funds stay in the registry until `withdrawStake` is called.

## The Staking Registry

Stake lives in a dedicated contract at `STAKING_REGISTRY_ADDRESS`. It implements:

```solidity
interface IStakingRegistry {
    /// Lock `msg.value` as the caller's stake, with the given unstake delay.
    function addStake(uint32 unstakeDelaySec) external payable;

    /// Begin the withdrawal delay. From this point the caller is not considered to be staked.
    function unlockStake() external;

    /// Withdraw the stake after the delay has passed.
    function withdrawStake(address payable withdrawAddress) external;

    /// Return the stake information.
    function getDepositInfo(address account)
        external
        view
        returns (uint256 stake, uint32 unstakeDelaySec, uint64 withdrawTime);
}
```

The registry keys everything off `msg.sender`. A contract entity such as a paymaster or factory must call `addStake` itself, so it needs code that forwards a call to the registry. See [Staking an entity](/guides/staking/).

## Security note

The stake provisions depend on a registry contract outside the EIP-8141 protocol. The correctness of the deployed registry is critical for the security of the whole Alternative Mempool system.
