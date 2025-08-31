// scripts/deploy-connected.js
const hre = require("hardhat");

// 🌐 Chain IDs
const ZETA_TESTNET = 7000;
const BASE_SEPOLIA = 84532;
const ARBITRUM_SEPOLIA = 421614;
const OPTIMISM_SEPOLIA = 11155420;

// 🚨 Replace with your OmniLend address after deploying
const OMNI_LEND_ADDRESS = "0xYourOmniLendAddressOnZeta";

async function main() {
  const networkName = hre.network.name;
  let chainId, networkDisplayName;

  switch (networkName) {
    case "baseSepolia":
      chainId = BASE_SEPOLIA;
      networkDisplayName = "Base Sepolia";
      break;
    case "arbitrumSepolia":
      chainId = ARBITRUM_SEPOLIA;
      networkDisplayName = "Arbitrum Sepolia";
      break;
    case "optimismSepolia":
      chainId = OPTIMISM_SEPOLIA;
      networkDisplayName = "Optimism Sepolia";
      break;
    default:
      throw new Error("Unsupported network. Use baseSepolia, arbitrumSepolia, or optimismSepolia");
  }

  console.log(`Deploying ConnectedContract to ${networkDisplayName}...`);

  const ConnectedContract = await hre.ethers.getContractFactory("ConnectedContract");
  const connected = await ConnectedContract.deploy();

  await connected.waitForDeployment();
  const address = await connected.getAddress();

  console.log(`✅ ConnectedContract deployed to ${networkDisplayName}:`, address);

  // Optional: verify
  await hre.run("verify:verify", {
    address,
    constructorArguments: [],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying connected contract:", error);
    process.exit(1);
  });