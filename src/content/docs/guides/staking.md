---
title: "Staking an entity"
description: "Stake an entity at the Staking Registry and see the effect on admission."
sidebar:
  order: 7
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

Stake lives in the Staking Registry. The sidecar needs `stakingRegistryAddress` in its configuration (or the `SKANDHA_STAKING_REGISTRY_ADDRESS` environment variable). If it is unset or zero, every entity reads as unstaked.

## Whose address is staked

The registry keys everything off `msg.sender`. Stake the role's own address, not just "your key".

- A plain EOA `sender` (the self relay shape, where the sender is its own payer) can call `addStake` directly from its own funded key.
- A `payer` or `factory` **contract** cannot be staked by calling `addStake` from your own key. That would only stake your EOA. The contract itself has to call `addStake` as part of its own logic. Staking a contract entity needs a purpose-built contract with an `addStake` forwarding call.
- A contract wallet can stake itself with no special code: in a self relay transaction the `SENDER` frame calls as `tx.sender`, so a `SENDER` frame that targets the registry with `addStake(86400)` and a value makes the wallet the staker.

## Walkthrough on the devnet (self relay)

1. Fund your own key from the shared devnet key.
2. Call `addStake(86400)` on the `NaiveStakingRegistry` (`0xd51c04d7a0b01124e84de152f4e56d9eecb22d2f` on the devnet) from that key. Send **more than** the node's `minStake` as the value. The sidecar's `BALANCE`/`SELFBALANCE` carve-out checks `stake > minStake` strictly, while the other staked-entity thresholds use `>=`. The devnet's `minStake` is 0.01 ETH, and the workshop stakes 0.012 ETH.
3. Submit a Frame Transaction using the self relay shape (`[self_verify]`) from that key as `tx.sender`.
4. Check the admission report with `skandha_explorer_getTransaction`. It shows the staked-entity permissions applying: wider associated-storage access, `BALANCE` and `SELFBALANCE` allowed, and the staked gas budget as the effective cap.
5. Call `unlockStake()` to start a withdrawal, and after the delay `withdrawStake(yourAddress)` to get the ETH back.

Calling `unlockStake()` alone drops every staked-entity permission immediately, because the registry's `withdrawTime` becomes non-zero. This is the rule [STAKING-010](/rules/staking-and-solvency/#staking-010). The explorer's reputation view shows the state as "unlocking", which is distinct from "staked".

## Safety

Never stake from the shared genesis key or the published deployer key. Anyone holding those keys can call `unlockStake` and `withdrawStake` and take the funds.

## Minimum unstake delay

ERC-8421 requires an unstake delay of at least `MIN_UNSTAKE_DELAY` (86,400 seconds). The sidecar's documented default for `minUnstakeDelay` is 0 (TBD).
