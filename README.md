# ZarAir Token

Sprint 1 and Sprint 2 implementation for **Zar Air (ZARAI)**, a minimal BEP-20 compatible ERC-20 token and separate USDT token sale contract targeting BNB Smart Chain.

Sprint 1 includes the base token contract. Sprint 2 adds a separate token sale contract. This project still does not include buyback, flight rewards, liquidity, PancakeSwap integration, landing page, admin panel, KYC, oracle integrations, upgradeability, taxes, blacklist logic, or Binance listing work.

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
ZARAI_TOKEN_ADDRESS=deployed_zarai_token_address
PAYMENT_TOKEN_ADDRESS=usdt_or_test_usdt_token_address
TREASURY_WALLET=treasury_wallet_receiving_usdt
INITIAL_TOKEN_PRICE_USDT=140
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

## Sprint 2 Token Sale

Sprint 2 adds `ZarAirTokenSale`, a separate sale contract. It does not modify or redeploy the already deployed ZARAI token.

The sale contract sells ZARAI for USDT. Buyers approve USDT to the sale contract, then call `buyTokens(amount)`. The sale contract transfers USDT directly from the buyer to the treasury wallet and transfers ZARAI from the sale contract balance to the buyer.

This direct-to-treasury payment model is the simpler custody model: the sale contract does not hold routine USDT proceeds, reducing the amount of value parked in the contract. The sale contract must still be funded with ZARAI before purchases can succeed.

Price is stored as payment-token units per `1 ZARAI`. For a price of `140 USDT` per `1 ZARAI`, use:

```text
140000000000000000000
```

The deployment script derives that value from `INITIAL_TOKEN_PRICE_USDT=140`.

### Deploy Sale on BSC Testnet

Warning: do not deploy the sale contract to mainnet until the full testnet sale flow has been tested and approved.

Set these `.env` values for testnet:

```ini
ZARAI_TOKEN_ADDRESS=deployed_testnet_zarai_token_address
PAYMENT_TOKEN_ADDRESS=testnet_usdt_token_address
TREASURY_WALLET=treasury_wallet_receiving_usdt
INITIAL_TOKEN_PRICE_USDT=140
```

Then run:

```bash
pnpm run deploy:sale:bsc-testnet
```

### Fund the Sale Contract

After deploying `ZarAirTokenSale`, transfer the amount of ZARAI allocated for sale from the owner wallet to the sale contract address.

Example using a wallet or block explorer token transfer:

```text
Transfer ZARAI to: <TOKEN_SALE_CONTRACT_ADDRESS>
Amount: <SALE_ALLOCATION>
```

Purchases fail automatically if the sale contract does not have enough ZARAI.

### Update Price

Only the sale contract owner can update price:

```bash
pnpm hardhat console --network bscTestnet
```

```ts
const sale = await ethers.getContractAt(
  "ZarAirTokenSale",
  "<TOKEN_SALE_CONTRACT_ADDRESS>",
);
await sale.setTokenPrice(ethers.parseUnits("140", 18));
```

### Enable or Disable Sale

Only the sale contract owner can enable or disable purchases:

```ts
const sale = await ethers.getContractAt(
  "ZarAirTokenSale",
  "<TOKEN_SALE_CONTRACT_ADDRESS>",
);
await sale.setSaleEnabled(true);
await sale.setSaleEnabled(false);
```

### Withdraw Unsold ZARAI

Only the sale contract owner can withdraw unsold ZARAI:

```ts
const sale = await ethers.getContractAt(
  "ZarAirTokenSale",
  "<TOKEN_SALE_CONTRACT_ADDRESS>",
);
await sale.withdrawUnsoldTokens(
  "<RECIPIENT_ADDRESS>",
  ethers.parseUnits("<AMOUNT>", 18),
);
```

### Frontend Note

Frontend integration is intentionally out of scope for Sprint 2. Later, the landing page Buy Now button should approve USDT and call this `ZarAirTokenSale` contract.

## Security Notes

- Uses OpenZeppelin `ERC20`.
- Fixed supply is minted once in the constructor.
- No public mint function.
- No owner-only hidden mint function.
- No upgradeable proxy.
- No pausable, blacklist, tax, liquidity, oracle, or reward logic in Sprint 1.
- Sprint 2 sale uses OpenZeppelin `Ownable`, `ReentrancyGuard`, `SafeERC20`, and `IERC20`.
- No tax, blacklist, buyback, flight reward, hidden admin mint, or upgradeable proxy logic was added in Sprint 2.
