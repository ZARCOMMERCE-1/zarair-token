import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const rawPrivateKey = process.env.PRIVATE_KEY?.trim() ?? "";
const privateKey =
  rawPrivateKey !== "" && !rawPrivateKey.startsWith("0x")
    ? `0x${rawPrivateKey}`
    : rawPrivateKey;
const accounts = privateKey !== "" ? [privateKey] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    bscTestnet: {
      url:
        process.env.BSC_TESTNET_RPC_URL ??
        "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts,
    },
    bscMainnet: {
      url:
        process.env.BSC_MAINNET_RPC_URL ?? "https://bsc-dataseed.binance.org",
      chainId: 56,
      accounts,
    },
  },
};

export default config;
