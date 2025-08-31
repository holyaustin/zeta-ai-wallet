const { expect } = require("chai");
const { ethers } = require("hardhat");

// 🔹 Chain IDs
const BASE_SEPOLIA = 84532;
const ZETA_TESTNET = 7000;

// 🔹 Gateway Address
const GATEWAY = "0x6c533f7fE93fAE114d0954697069Df33C9B74fD7";

// 🔹 ZRC-20 Tokens — USE LOWERCASE TO AVOID CHECKSUM ISSUES
const ZRC20_WETH_BASE = "0x5772c0E91dAa3AA9739691Ccb1631a528957666D";
const ZRC20_ZETA = "0x5FD55a1B9Fc24967C4dB09c513c3Ba0afEA6a45B";

// 🔹 Test User
const USER_ADDRESS = "0x2c3b2B2325610a6814f2f822D0bF4DAB8CF16e16";
const AMOUNT = ethers.parseEther("0.0001");

describe("OmniLend - Working Test", function () {
  let omniLend, owner, IZRC20;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const OmniLend = await ethers.getContractFactory("OmniLend");
    omniLend = await OmniLend.deploy();
    await omniLend.waitForDeployment();

    // Connect to ZRC-20 for approval
    IZRC20 = await ethers.getContractAt("IZRC20", ZRC20_WETH_BASE);
  });

  const mockDeposit = async (user, amount, asset, chainId) => {
    return omniLend.connect(owner).mockDeposit(user, amount, asset, chainId);
  };

  it("Should accept deposit from Base Sepolia", async function () {
    await expect(mockDeposit(USER_ADDRESS, AMOUNT, ZRC20_WETH_BASE, BASE_SEPOLIA))
      .to.emit(omniLend, "Deposited")
      .withArgs(USER_ADDRESS, AMOUNT, ZRC20_WETH_BASE, BASE_SEPOLIA);
  });

  it("Should accept deposit from ZetaChain (self)", async function () {
    await expect(mockDeposit(USER_ADDRESS, AMOUNT, ZRC20_ZETA, ZETA_TESTNET))
      .to.emit(omniLend, "Deposited")
      .withArgs(USER_ADDRESS, AMOUNT, ZRC20_ZETA, ZETA_TESTNET);
  });

  it("Should allow borrow", async function () {
    await mockDeposit(USER_ADDRESS, AMOUNT, ZRC20_WETH_BASE, BASE_SEPOLIA);

    // ✅ Approve ZRC-20
    await IZRC20.connect(owner).approve(omniLend.target, AMOUNT);

    const receiver = ethers.zeroPadValue(USER_ADDRESS, 32);

    await ethers.provider.send("hardhat_setBalance", [USER_ADDRESS, "0x1000000000000000000"]);
    const user = await ethers.getImpersonatedSigner(USER_ADDRESS);

    await expect(
      omniLend.connect(user).borrow(
        AMOUNT,
        ZRC20_WETH_BASE,
        BASE_SEPOLIA,
        receiver,
        500_000,
        false
      )
    ).to.not.be.reverted;
  });

  it("Should repay", async function () {
    await mockDeposit(USER_ADDRESS, AMOUNT, ZRC20_WETH_BASE, BASE_SEPOLIA);

    const user = await ethers.getImpersonatedSigner(USER_ADDRESS);
    await omniLend.connect(user).repay();

    const pos = await omniLend.positions(USER_ADDRESS);
    expect(pos.debt).to.equal(0);
  });

  it("Should liquidate", async function () {
    await mockDeposit(USER_ADDRESS, AMOUNT, ZRC20_WETH_BASE, BASE_SEPOLIA);

    // ✅ Fix: use hex string
    const posKey = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [USER_ADDRESS, 0])
    );
    const debtSlot = ethers.AbiCoder.defaultAbiCoder().encode(
      ["uint256"],
      [BigInt(posKey) + 1n]
    );

    await ethers.provider.send("hardhat_setStorageAt", [
      await omniLend.getAddress(),
      debtSlot,
      ethers.zeroPadValue(ethers.toBeHex(AMOUNT), 32),
    ]);

    await expect(omniLend.connect(owner).liquidate(USER_ADDRESS))
      .to.emit(omniLend, "Liquidated");
  });

  it("Should handle revert", async function () {
    const revertContext = {
      sender: await omniLend.getAddress(),
      destinationChainId: BASE_SEPOLIA,
      sourceChainId: ZETA_TESTNET,
      message: "0x",
      zrc20: ZRC20_WETH_BASE,
      amount: 0,
      success: false,
      callInfo: { isCall: true, isSystem: false },
      revertInfo: { isRevert: true, isAbort: false },
    };

    await ethers.provider.send("hardhat_impersonateAccount", [GATEWAY]);
    const gateway = await ethers.getSigner(GATEWAY);

    await expect(omniLend.connect(gateway).onRevert(revertContext))
      .to.emit(omniLend, "RevertEvent");
  });
});