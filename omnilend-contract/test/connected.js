const { expect } = require("chai");
const { ethers } = require("hardhat");

const OMNI_LEND = "0x589C1494089889C077d7AbBA17B40575E961cC8c";
const GATEWAY = "0x0c487a766110c85d301d96e33579c5b317fa4995";

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
    const amount = ethers.parseEther("0.0001");
    await expect(connected.depositEthAndCall({ value: amount }))
      .to.emit(connected, "DepositAndCallTriggered")
      .withArgs(owner.address, amount);
  });
});