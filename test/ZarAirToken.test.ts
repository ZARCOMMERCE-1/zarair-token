import { expect } from "chai";
import { ethers, network } from "hardhat";

const TOKEN_OWNER = "0x40a44BCd809d8cfB9449BF7d2f7D249517ddFe09";
const INITIAL_SUPPLY = ethers.parseUnits("1400000", 18);

async function deployToken() {
  const token = await ethers.deployContract("ZarAirToken");
  await token.waitForDeployment();
  return token;
}

describe("ZarAirToken", function () {
  it("has the correct token name", async function () {
    const token = await deployToken();

    expect(await token.name()).to.equal("Zar Air");
  });

  it("has the correct token symbol", async function () {
    const token = await deployToken();

    expect(await token.symbol()).to.equal("ZARAI");
  });

  it("uses 18 decimals", async function () {
    const token = await deployToken();

    expect(await token.decimals()).to.equal(18);
  });

  it("mints the fixed total supply", async function () {
    const token = await deployToken();

    expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY);
  });

  it("sends all tokens to the owner wallet on deployment", async function () {
    const token = await deployToken();

    expect(await token.balanceOf(TOKEN_OWNER)).to.equal(
      await token.totalSupply(),
    );
  });

  it("allows the owner wallet to transfer tokens", async function () {
    const token = await deployToken();
    const [, recipient] = await ethers.getSigners();
    const transferAmount = ethers.parseUnits("100", 18);
    const ownerStartingBalance = await token.balanceOf(TOKEN_OWNER);

    await network.provider.request({
      method: "hardhat_setBalance",
      params: [TOKEN_OWNER, ethers.toQuantity(ethers.parseEther("1"))],
    });
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [TOKEN_OWNER],
    });

    try {
      const ownerSigner = await ethers.getSigner(TOKEN_OWNER);
      await token
        .connect(ownerSigner)
        .transfer(recipient.address, transferAmount);
    } finally {
      await network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [TOKEN_OWNER],
      });
    }

    expect(await token.balanceOf(recipient.address)).to.equal(transferAmount);
    expect(await token.balanceOf(TOKEN_OWNER)).to.equal(
      ownerStartingBalance - transferAmount,
    );
  });

  it("does not expose any additional mint function", async function () {
    const token = await deployToken();
    const mintFunctions = token.interface.fragments.filter(
      (fragment) =>
        fragment.type === "function" &&
        fragment.name.toLowerCase().includes("mint"),
    );

    expect(mintFunctions).to.have.lengthOf(0);
  });
});
