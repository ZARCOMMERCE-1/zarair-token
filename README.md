# ZarAir Token

Sprint 1 implementation for **Zar Air (ZARAI)**, a minimal BEP-20 compatible ERC-20 token targeting BNB Smart Chain.

This sprint only includes the base token contract. It does not include presale, buyback, flight rewards, liquidity, PancakeSwap integration, landing page, admin panel, KYC, oracle integrations, upgradeability, taxes, blacklist logic, or Binance listing work.

## Token

- Name: `Zar Air`
- Symbol: `ZARAI`
- Decimals: `18`
- Fixed supply: `1,400,000 ZARAI`
- Initial supply receiver: `0x40a44BCd809d8cfB9449BF7d2f7D249517ddFe09`
- Standard: OpenZeppelin ERC-20, BEP-20 compatible

All tokens are minted once during deployment to the fixed owner wallet. There is no public or hidden mint function.

## Install

```bash
corepack enable
pnpm install
```

## Test

```bash
pnpm test
```

## Environment

Create a local `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Required variables:

```ini
PRIVATE_KEY=your_deployer_private_key_without_0x
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
BSC_MAINNET_RPC_URL=https://bsc-dataseed.bnbchain.org
ETHERSCAN_API_KEY=your_etherscan_api_v2_key
```

Never commit private keys, seed phrases, or real `.env` files.

## Deploy to BSC Testnet

1. Fund the deployer wallet with BNB testnet gas.
2. Set `PRIVATE_KEY` and `BSC_TESTNET_RPC_URL` in `.env`.
3. Run:

```bash
pnpm run deploy:bsc-testnet
```

## Deploy to BSC Mainnet Later

Mainnet deployment should happen only after testnet deployment, contract verification, and final owner approval.

1. Fund the deployer wallet with mainnet BNB for gas.
2. Set `PRIVATE_KEY` and `BSC_MAINNET_RPC_URL` in `.env`.
3. Run:

```bash
pnpm run deploy:bsc-mainnet
```

## Verify Contract

Verify on BSC Testnet:

```bash
pnpm hardhat verify --network bscTestnet <CONTRACT_ADDRESS>
```

Verify on BSC Mainnet:

```bash
pnpm hardhat verify --network bscMainnet <CONTRACT_ADDRESS>
```

## Security Notes

- Uses OpenZeppelin `ERC20`.
- Fixed supply is minted once in the constructor.
- No public mint function.
- No owner-only hidden mint function.
- No upgradeable proxy.
- No pausable, blacklist, tax, liquidity, oracle, or reward logic in Sprint 1.
