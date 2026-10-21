---
title: "Opcodes, creation and calls"
description: "OPCODES, CREATION and CALLING rules for validation frames."
sidebar:
  order: 6
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

Every validation frame is bound by the banned opcodes of EIP-8141's validation trace rules, except for the frames that PREFIX-100 exempts. The OPCODES section lists only the differences.

## Banned opcodes in the canonical mempool

`GASPRICE`, `BLOCKHASH`, `COINBASE`, `TIMESTAMP`, `NUMBER`, `PREVRANDAO`, `GASLIMIT`, `BASEFEE`, `BLOBBASEFEE`, `SLOTNUM`, `GAS` (except when immediately followed by a `*CALL`), `CREATE`, `CREATE2` and `SETDELEGATE` (except inside the first `deploy` frame), `INVALID`, `SELFDESTRUCT`, `BALANCE`, `SELFBALANCE`, and `SSTORE` (except to the sender's storage inside the first `deploy` frame).

`TIMESTAMP` is allowed only in the canonical expiry verifier code. The environment opcodes (`TIMESTAMP`, `NUMBER`, `COINBASE`, `GASPRICE` and similar) are banned in **both** the canonical and the standard Alternative Mempool, staked or not.

## Opcodes

### OPCODES-010

`BALANCE` (`0x31`) and `SELFBALANCE` (`0x47`) are allowed for a staked entity. They remain banned for every other entity.

### OPCODES-020

`SSTORE` is not banned outright. The [Storage](/rules/storage/) rules decide which frames may write and where.

### OPCODES-030

Any unassigned opcode is blocked.

### OPCODES-040

A revert on "out of gas" is forbidden, because it can leak the gas limit or the call-stack depth.

## Contract creation

### CREATION-010

`CREATE`, `CREATE2` and `SETDELEGATE` (EIP-7819) are allowed only inside the `deploy` frame, and only to install code at `tx.sender`. Any one of these opcodes may be executed at most once, and it must install code for `tx.sender`.

## Calls and code access

### CALLING-010

Using an address that has no deployed or default code is forbidden.

### CALLING-040

Precompiles that access nothing in the blockchain state or environment are allowed. These include the core precompiles `0x01` to `0x11` and the `P256VERIFY` precompile.
