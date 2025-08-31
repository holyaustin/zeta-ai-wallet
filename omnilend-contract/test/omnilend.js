const { expect } = require("chai");
const { ethers } = require("hardhat");

const ZRC20_WETH = "0x5772c0e91daa3aa9739691ccb1631a528957666d"; // WETH.z
const GOERLI = 5;
const BASE_SEPOLIA = 84532;

describe("OmniLend", function () {
  let omniLend, owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const OmniLend = await ethers.getContractFactory("OmniLend");
    omniLend = await OmniLend.deploy();
    await omniLend.waitForDeployment();
  });

  it("Should accept deposit via onCall with sourceChainId", async function () {
    // ✅ Encode sourceChainId in message
    const message = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "address", "uint256"],
      [user.address, ZRC20_WETH, GOERLI]
    );

    // ✅ context.chainID = destination chain ID (7000)
    const context = {
      sender: user.address,
      chainID: 7000, // ZetaChain
      isCall: true,
    };

    await expect(
      omniLend.connect(owner).onCall(context, ZRC20_WETH, ethers.parseEther("1"), message)
    )
      .to.emit(omniLend, "Deposited")
      .withArgs(user.address, ethers.parseEther("1"), ZRC20_WETH, GOERLI);

    const pos = await omniLend.positions(user.address);
    expect(pos.exists).to.be.true;
    expect(pos.depositAmount).to.equal(ethers.parseEther("1"));
    expect(pos.depositChainId).to.equal(GOERLI);
  });

  it("Should allow borrow via withdrawAndCall", async function () {
    const message = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "address", "uint256"],
      [user.address, ZRC20_WETH, GOERLI]
    );

    const context = { sender: user.address, chainID: 7000, isCall: true };
    await omniLend.connect(owner).onCall(context, ZRC20_WETH, ethers.parseEther("2"), message);

    const receiver = ethers.zeroPadValue(user.address, 32);
    const callOptions = { gasLimit: 500_000, isArbitraryCall: false };
    const revertOptions = {
      revertAddress: await omniLend.getAddress(),
      callOnRevert: true,
      abortAddress: ethers.ZeroAddress,
      revertMessage: "0x",
      onRevertGasLimit: 100_000,
    };

    await expect(
      omniLend.connect(user).borrow(
        ethers.parseEther("1"),
        ZRC20_WETH,
        BASE_SEPOLIA,
        receiver,
        callOptions,
        revertOptions
      )
    ).to.not.be.reverted;
  });

  it("Should handle revert", async function () {
    const revertContext = {
      sender: await omniLend.getAddress(),
      destinationChainId: 7000,
      sourceChainId: BASE_SEPOLIA,
      message: "0x",
      zrc20: ZRC20_WETH,
      amount: 0,
      success: false,
      callInfo: { isCall: true, isSystem: false },
      revertInfo: { isRevert: true, isAbort: false },
    };

    await expect(omniLend.connect(owner).onRevert(revertContext))
      .to.emit(omniLend, "RevertEvent");
  });
});