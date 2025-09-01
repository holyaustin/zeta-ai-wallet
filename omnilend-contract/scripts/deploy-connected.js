// scripts/deploy-connected.js
const hre = require("hardhat");

// 🚨 Replace with your OmniLend address on ZetaChain
const OMNI_LEND_ADDRESS = "0x589C1494089889C077d7AbBA17B40575E961cC8c";

// Base Gateway addresses
const GATEWAY_BASE_SEPOLIA = "0x0c487a766110c85d301d96e33579c5b317fa4995";
const GATEWAY_BASE_MAINNET = "0xe57Bc19a7236771C879033036515312B9353797b";

async function main() {
  const networkName = hre.network.name;

  let gatewayAddress;
  if (networkName === "baseSepolia") {
    gatewayAddress = GATEWAY_BASE_SEPOLIA;
  } else if (networkName === "baseMainnet") {
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

  // Verify
  await hre.run("verify:verify", {
    address,
    constructorArguments: [gatewayAddress, OMNI_LEND_ADDRESS],
    contract: "contracts/ConnectedContract.sol:ConnectedContract",
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contract:", error);
    process.exit(1);
  });