import { expect } from "chai";
import { ethers } from "hardhat";

const INITIAL_PRICE = ethers.parseUnits("140", 18);
const SALE_ALLOCATION = ethers.parseUnits("1000", 18);

async function deploySaleFixture() {
  const [owner, buyer, treasury, recipient, other] = await ethers.getSigners();

  const zarai = await ethers.deployContract("MockERC20", [
    "Mock ZARAI",
    "ZARAI",
    18,
  ]);
  const usdt = await ethers.deployContract("MockERC20", [
    "Mock USDT",
    "USDT",
    18,
  ]);

  const sale = await ethers.deployContract("ZarAirTokenSale", [
    await zarai.getAddress(),
    await usdt.getAddress(),
    treasury.address,
    INITIAL_PRICE,
  ]);

  await zarai.mint(await sale.getAddress(), SALE_ALLOCATION);
  await usdt.mint(buyer.address, ethers.parseUnits("1000000", 18));

  return { owner, buyer, treasury, recipient, other, zarai, usdt, sale };
}

describe("ZarAirTokenSale", function () {
  it("deploys with the correct constructor values", async function () {
    const { treasury, zarai, usdt, sale } = await deploySaleFixture();

    expect(await sale.zaraiToken()).to.equal(await zarai.getAddress());
    expect(await sale.paymentToken()).to.equal(await usdt.getAddress());
    expect(await sale.treasury()).to.equal(treasury.address);
    expect(await sale.saleEnabled()).to.equal(false);
  });

  it("sets the correct initial price", async function () {
    const { sale } = await deploySaleFixture();

    expect(await sale.tokenPrice()).to.equal(INITIAL_PRICE);
  });

  it("allows the owner to update the price", async function () {
    const { sale } = await deploySaleFixture();
    const newPrice = ethers.parseUnits("150", 18);

    await expect(sale.setTokenPrice(newPrice))
      .to.emit(sale, "PriceUpdated")
      .withArgs(INITIAL_PRICE, newPrice);

    expect(await sale.tokenPrice()).to.equal(newPrice);
  });

  it("prevents non-owners from updating the price", async function () {
    const { buyer, sale } = await deploySaleFixture();
    const newPrice = ethers.parseUnits("150", 18);

    await expect(sale.connect(buyer).setTokenPrice(newPrice))
      .to.be.revertedWithCustomError(sale, "OwnableUnauthorizedAccount")
      .withArgs(buyer.address);
  });

  it("allows the owner to enable and disable the sale", async function () {
    const { sale } = await deploySaleFixture();

    await expect(sale.setSaleEnabled(true))
      .to.emit(sale, "SaleStatusUpdated")
      .withArgs(true);
    expect(await sale.saleEnabled()).to.equal(true);

    await expect(sale.setSaleEnabled(false))
      .to.emit(sale, "SaleStatusUpdated")
      .withArgs(false);
    expect(await sale.saleEnabled()).to.equal(false);
  });

  it("prevents users from buying when the sale is disabled", async function () {
    const { buyer, sale } = await deploySaleFixture();

    await expect(
      sale.connect(buyer).buyTokens(ethers.parseUnits("1", 18)),
    ).to.be.revertedWith("Sale is disabled");
  });

  it("allows users to buy when sale is enabled and USDT is approved", async function () {
    const { buyer, treasury, zarai, usdt, sale } = await deploySaleFixture();
    const zaraiAmount = ethers.parseUnits("2", 18);
    const paymentAmount = ethers.parseUnits("280", 18);

    await sale.setSaleEnabled(true);
    await usdt.connect(buyer).approve(await sale.getAddress(), paymentAmount);

    await expect(sale.connect(buyer).buyTokens(zaraiAmount))
      .to.emit(sale, "TokensPurchased")
      .withArgs(buyer.address, zaraiAmount, paymentAmount);

    expect(await zarai.balanceOf(buyer.address)).to.equal(zaraiAmount);
    expect(await usdt.balanceOf(treasury.address)).to.equal(paymentAmount);
  });

  it("fails when USDT allowance is insufficient", async function () {
    const { buyer, usdt, sale } = await deploySaleFixture();
    const zaraiAmount = ethers.parseUnits("2", 18);
    const insufficientAllowance = ethers.parseUnits("279", 18);

    await sale.setSaleEnabled(true);
    await usdt
      .connect(buyer)
      .approve(await sale.getAddress(), insufficientAllowance);

    await expect(sale.connect(buyer).buyTokens(zaraiAmount)).to.be.reverted;
  });

  it("fails when the sale contract has insufficient ZARAI", async function () {
    const { buyer, usdt, sale } = await deploySaleFixture();
    const zaraiAmount = ethers.parseUnits("1001", 18);
    const paymentAmount = ethers.parseUnits("140140", 18);

    await sale.setSaleEnabled(true);
    await usdt.connect(buyer).approve(await sale.getAddress(), paymentAmount);

    await expect(sale.connect(buyer).buyTokens(zaraiAmount)).to.be.revertedWith(
      "Insufficient ZARAI in sale contract",
    );
  });

  it("allows the owner to withdraw unsold tokens", async function () {
    const { recipient, zarai, sale } = await deploySaleFixture();
    const withdrawAmount = ethers.parseUnits("100", 18);

    await expect(sale.withdrawUnsoldTokens(recipient.address, withdrawAmount))
      .to.emit(sale, "UnsoldTokensWithdrawn")
      .withArgs(recipient.address, withdrawAmount);

    expect(await zarai.balanceOf(recipient.address)).to.equal(withdrawAmount);
  });

  it("allows the owner to withdraw accidentally sent ERC20 tokens", async function () {
    const { owner, other, usdt, sale } = await deploySaleFixture();
    const accidentalAmount = ethers.parseUnits("25", 18);

    await usdt.mint(await sale.getAddress(), accidentalAmount);

    await expect(
      sale.withdrawAccidentalERC20(
        await usdt.getAddress(),
        other.address,
        accidentalAmount,
      ),
    )
      .to.emit(sale, "AccidentalTokensWithdrawn")
      .withArgs(await usdt.getAddress(), other.address, accidentalAmount);

    expect(await usdt.balanceOf(other.address)).to.equal(accidentalAmount);
    expect(await sale.owner()).to.equal(owner.address);
  });
});
