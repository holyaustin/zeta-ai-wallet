const { expect } = require("chai");
const { ethers } = require("hardhat");

const OMNI_LEND = "0x08f3fe12B7c79D9e618BD41212b1246d7141B47B";
const GATEWAY = "0xe57bc19a7236771c879033036515312b9353797b"; //base mainnet

describe("ConnectedContract", function () {
  let connected, owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const ConnectedContract = await ethers.getContractFactory("ConnectedContract");
    connected = await ConnectedContract.deploy(GATEWAY, OMNI_LEND);
    await connected.waitForDeployment();
  });

  it("Should deploy with correct addresses", async function () {
    expect(await connected.gateway()).to.equal(GATEWAY);
    expect(await connected.omniLend()).to.equal(OMNI_LEND);
  });

  it("Should allow depositEthAndCall", async function () {
    const amount = ethers.parseEther("0.000000000000001");
    await expect(connected.depositEthAndCall({ value: amount }))
      .to.emit(connected, "DepositAndCallTriggered")
      .withArgs(owner.address, amount);
  });
});