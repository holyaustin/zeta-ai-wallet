const hre = require("hardhat");

// 🔧 Replace with your OmniLend address on ZetaChain
const OMNI_LEND_ADDRESS = "0x589C1494089889C077d7AbBA17B40575E961cC8c";

// ✅ Gateway addresses
const GATEWAY_BASE_SEPOLIA = "0x0c487a766110c85d301d96e33579c5b317fa4995";
const GATEWAY_BASE_MAINNET = "0xe57bc19a7236771c879033036515312b9353797b";

async function main() {
  const networkName = hre.network.name;

  let gatewayAddress;
  if (networkName === "baseSepolia") {
    gatewayAddress = GATEWAY_BASE_SEPOLIA;
  } else if (networkName === "baseMainnet") {
    gatewayAddress = GATEWAY_BASE_MAINNET;
  } else if (networkName === "etherlink") {
    gatewayAddress = GATEWAY_BASE_MAINNET;  
  } else {
    throw new Error("Unsupported network. Use baseSepolia or baseMainnet");
  }

  console.log(`Deploying ConnectedContract to ${networkName}...`);

  const ConnectedContract = await hre.ethers.getContractFactory("ConnectedContract");
  const connected = await ConnectedContract.deploy(gatewayAddress, OMNI_LEND_ADDRESS);

  await connected.waitForDeployment();
  const address = await connected.getAddress();

  console.log(`✅ ConnectedContract deployed to ${networkName}:`, address);

    console.log("\n📝 To verify on Base Explorer:");
  console.log(`npx hardhat verify --network ${networkName} ${address}`);
  
  /** Verify */
  await hre.run("verify:verify", {
    address: address,
    constructorArguments: [gatewayAddress, OMNI_LEND_ADDRESS],
  });
   console.log("Verification successful")
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});