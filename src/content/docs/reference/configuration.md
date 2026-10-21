---
title: "Configuration"
description: "The sidecar's config.json fields."
sidebar:
  order: 2
---

> Disclaimer: Content created from source code using generative AI. Contact us for clarifications or if you find mistakes in this document.

The sidecar reads `config.json` (start from `config.json.default`). `relayers` and a few other fields can also be set with `SKANDHA_*` environment variables such as `SKANDHA_RELAYERS`, `SKANDHA_BENEFICIARY`, `SKANDHA_RPC` and `SKANDHA_STAKING_REGISTRY_ADDRESS`.

`entryPoints`, `canonicalEntryPoint` and `supportedMempools[].entryPoint` must all be the fixed EIP-8141 sentinel `0x00000000000000000000000000000000000000aa`. See [Run the sidecar](/guides/run-the-sidecar/#required-configuration).

```jsonc
{
  "entryPoints": ["0x00000000000000000000000000000000000000aa"],
  "canonicalEntryPoint": "0x00000000000000000000000000000000000000aa", // must match entryPoints[0]
  "standardMempoolId": "QmcFZKUX9qoo3StwVycJTAhwdiqbEjcwNvQVK246p3z1rk",
  "supportedMempools": [
    {
      "mempoolId": "QmcFZKUX9qoo3StwVycJTAhwdiqbEjcwNvQVK246p3z1rk",
      "entryPoint": "0x00000000000000000000000000000000000000aa"
    }
  ],
  "relayers": ["0x{RELAYER_PRIVATE_KEY}"],
  "beneficiary": "0x{FEE_COLLECTOR_ADDRESS}", // optional, defaults to the relayer
  "rpcEndpoint": "http://localhost:8545",
  "rpcEndpointSubmit": "", // optional, used only when submitting a relayed transaction
  "minInclusionDenominator": 10, // optional, reputation parameter
  "throttlingSlack": 10, // optional, reputation parameter
  "banSlack": 50, // optional, reputation parameter
  "minStake": 10000000000, // optional, minimum entity stake in wei
  "minUnstakeDelay": 0, // optional, minimum entity unstake delay
  "stakingRegistryAddress": "0x...", // optional, IStakingRegistry address; unset or zero means every entity reads as unstaked
  "minSignerBalance": 1, // optional, minimum relayer balance (ETH) before it stops being used as a fee collector
  "multicall": "0xcA11bde05977b3631167028862bE2a173976CA11", // optional
  "estimationStaticBuffer": 21000, // optional, gas added to callGasLimit on estimation
  "receiptLookupRange": 1024, // optional, block range searched for receipts
  "etherscanApiKey": "", // optional, used to fetch gas prices
  "conditionalTransactions": false, // optional
  "gasPriceMarkup": 0, // optional, markup on skandha_getGasPrice in bps (500 = 5%)
  "enforceGasPrice": false, // optional, reject transactions priced below the network gas price
  "enforceGasPriceThreshold": 1000, // optional, allowed shortfall in bps
  "eip2930": false, // optional
  "useropsTTL": 300, // optional, mempool entry time-to-live in seconds
  "whitelistedEntities": { // optional, addresses exempt from stake and opcode validation
    "factory": [],
    "paymaster": [],
    "account": []
  },
  "maxConcurrentSubmissions": 10, // optional, maximum in-flight relay submissions
  "bundleInterval": 10000, // interval (ms) between relay passes in auto mode
  "maxSubmitAttempts": 3, // optional, resubmission attempts before an entry is cancelled
  "bundleSize": 4, // optional, maximum transactions relayed per pass
  "pvgMarkup": 0 // optional, gas added on top of the estimated pre-verification gas
}
```

## Differences from the draft

Some defaults differ from ERC-8421 values (TBD): `minUnstakeDelay` defaults to 0 while the draft requires 86,400, and `minStake` is expressed in wei instead of a per-chain USD-equivalent.
