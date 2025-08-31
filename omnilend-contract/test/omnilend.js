const { expect } = require("chai");
const { ethers } = require("hardhat");

// ✅ Use correct chain IDs and ZRC-20 addresses from ZetaChain docs
const ZETA_TESTNET = 7000;
const BASE_SEPOLIA = 84532;
const ARBITRUM_SEPOLIA = 421614;

// ✅ Correct ZRC-20 addresses (checksummed)
const ZRC20_WETH_BASE = "0x5772c0e91daa3aa9739691ccb1631a528957666d";
const ZRC20_USDC_ARB = "0x6569b4776f554d0ee5c9f798e5d29bc7b8311e29";
const ZRC20_ZETA = "0x5Fd55A1B9FC24967C4dB09C513C3BA0aFea6a45b";

const USER_ADDRESS = "0x2c3b2B2325610a6814f2f822D0bF4DAB8CF16e16";
const AMOUNT = ethers.parseEther("0.0001");

describe("OmniLend - Multi-Chain Lending", function () {
  let omniLend, owner;
  console.log("Before contract deployment");

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const OmniLend = await ethers.getContractFactory("OmniLend");
    omniLend = await OmniLend.deploy();
    await omniLend.waitForDeployment();
  });

  console.log("Before On call");

  const callOnCall = async (sourceChainId, zrc20, amount) => {
    const message = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "address", "uint256"],
      [USER_ADDRESS, zrc20, sourceChainId]
    );

    const context = {
      sender: USER_ADDRESS,
      chainID: ZETA_TESTNET,
      isCall: true,
    };

    return omniLend.connect(owner).onCall(context, zrc20, amount, message);
  };
console.log("On call successful");

  it("Should accept WETH deposit from Base Sepolia", async function () {
    await expect(callOnCall(BASE_SEPOLIA, ZRC20_WETH_BASE, AMOUNT))

      .to.emit(omniLend, "Deposited")
      console.log("2234")
      .withArgs(USER_ADDRESS, AMOUNT, ZRC20_WETH_BASE, BASE_SEPOLIA);
      console.log("345")
  });

    console.log("Accept WETH successful from base");

  it("Should accept USDC deposit from Arbitrum Sepolia", async function () {
    const amount = ethers.parseUnits("100", 6);
    const message = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "address", "uint256"],
      [USER_ADDRESS, ZRC20_USDC_ARB, ARBITRUM_SEPOLIA]
    );

    const context = {
      sender: USER_ADDRESS,
      chainID: ZETA_TESTNET,
      isCall: true,
    };

    await expect(
      omniLend.connect(owner).onCall(context, ZRC20_USDC_ARB, amount, message)
    )
      .to.emit(omniLend, "Deposited")
      .withArgs(USER_ADDRESS, amount, ZRC20_USDC_ARB, ARBITRUM_SEPOLIA);
  });

  it("Should accept ZETA deposit (simulated)", async function () {
    await expect(callOnCall(ZETA_TESTNET, ZRC20_ZETA, AMOUNT))
      .to.emit(omniLend, "Deposited")
      .withArgs(USER_ADDRESS, AMOUNT, ZRC20_ZETA, ZETA_TESTNET);
  });

  it("Should borrow WETH on Base Sepolia", async function () {
    await callOnCall(BASE_SEPOLIA, ZRC20_WETH_BASE, AMOUNT);

    const receiver = ethers.zeroPadValue(USER_ADDRESS, 32);
    const callOptions = { gasLimit: 500_000, isArbitraryCall: false };
    const revertOptions = {
      revertAddress: await omniLend.getAddress(),
      callOnRevert: true,
      abortAddress: ethers.ZeroAddress,
      revertMessage: "0x",
      onRevertGasLimit: 100_000,
    };

    await ethers.provider.send("hardhat_setBalance", [USER_ADDRESS, "0x1000000000000000000"]);
    const user = await ethers.getImpersonatedSigner(USER_ADDRESS);

    await expect(
      omniLend.connect(user).borrow(
        AMOUNT,
        ZRC20_WETH_BASE,
        BASE_SEPOLIA,
        receiver,
        callOptions,
        revertOptions
      )
    ).to.not.be.reverted;
  });

  it("Should repay debt", async function () {
    await callOnCall(BASE_SEPOLIA, ZRC20_WETH_BASE, AMOUNT);
    const user = await ethers.getImpersonatedSigner(USER_ADDRESS);
    await omniLend.connect(user).repay();
    const pos = await omniLend.positions(USER_ADDRESS);
    expect(pos.debt).to.equal(0);
  });

  it("Should allow owner to liquidate", async function () {
    await callOnCall(BASE_SEPOLIA, ZRC20_WETH_BASE, AMOUNT);

    const posKey = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [USER_ADDRESS, 0])
    );
    const debtSlot = ethers.AbiCoder.defaultAbiCoder().encode(
      ["uint256"],
      [ethers.BigNumber.from(posKey).add(1)]
    );

    await ethers.provider.send("hardhat_setStorageAt", [
      await omniLend.getAddress(),
      debtSlot,
      ethers.zeroPadValue(AMOUNT, 32),
    ]);

    await expect(omniLend.connect(owner).liquidate(USER_ADDRESS))
      .to.emit(omniLend, "Liquidated");
  });

  it("Should handle onRevert", async function () {
    const revertContext = {
      sender: await omniLend.getAddress(),
      destinationChainId: BASE_SEPOLIA,
      sourceChainId: ZETA_TESTNET,
      message: "0x",
      zrc20: ZRC20_WETH_BASE, // ✅ Fixed: was "asset"
      amount: 0,
      success: false,
      callInfo: { isCall: true, isSystem: false },
      revertInfo: { isRevert: true, isAbort: false },
    };

    await expect(omniLend.connect(owner).onRevert(revertContext))
      .to.emit(omniLend, "RevertEvent");
  });
});