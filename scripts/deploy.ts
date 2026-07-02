import { ethers, network } from "hardhat";

const TOKEN_OWNER = "0x40a44BCd809d8cfB9449BF7d2f7D249517ddFe09";
const EXPECTED_TOTAL_SUPPLY = ethers.parseUnits("1400000", 18);

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(`Deploying ZarAirToken to ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Initial supply receiver: ${TOKEN_OWNER}`);

  const token = await ethers.deployContract("ZarAirToken");
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  const totalSupply = await token.totalSupply();
  const ownerBalance = await token.balanceOf(TOKEN_OWNER);

  if (totalSupply !== EXPECTED_TOTAL_SUPPLY) {
    throw new Error("Deployment invariant failed: unexpected total supply");
  }

  if (ownerBalance !== totalSupply) {
    throw new Error(
      "Deployment invariant failed: owner wallet did not receive total supply",
    );
  }

  console.log(`ZarAirToken deployed: ${tokenAddress}`);
  console.log(`Total supply: ${ethers.formatUnits(totalSupply, 18)} ZARAI`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
