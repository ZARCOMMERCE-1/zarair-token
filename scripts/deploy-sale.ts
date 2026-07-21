import { ethers, network } from "hardhat";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (value === undefined || value === "") {
    throw new Error(`${name} is required`);
  }

  return value;
}

async function main() {
  const zaraiTokenAddress = ethers.getAddress(
    requireEnv("ZARAI_TOKEN_ADDRESS"),
  );
  const paymentTokenAddress = ethers.getAddress(
    requireEnv("PAYMENT_TOKEN_ADDRESS"),
  );
  const treasuryWallet = ethers.getAddress(requireEnv("TREASURY_WALLET"));
  const initialTokenPrice = ethers.parseUnits(
    process.env.INITIAL_TOKEN_PRICE_USDT?.trim() ?? "140",
    18,
  );
  const [deployer] = await ethers.getSigners();

  console.log(`Deploying ZarAirTokenSale to ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`ZARAI token: ${zaraiTokenAddress}`);
  console.log(`Payment token: ${paymentTokenAddress}`);
  console.log(`Treasury wallet: ${treasuryWallet}`);
  console.log(
    `Initial price: ${ethers.formatUnits(initialTokenPrice, 18)} USDT per ZARAI`,
  );

  const sale = await ethers.deployContract("ZarAirTokenSale", [
    zaraiTokenAddress,
    paymentTokenAddress,
    treasuryWallet,
    initialTokenPrice,
  ]);
  await sale.waitForDeployment();

  console.log(`ZarAirTokenSale deployed: ${await sale.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
