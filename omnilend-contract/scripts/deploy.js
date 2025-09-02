// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("Deploying OmniLend to ZetaChain Testnet...");

  const OmniLend = await hre.ethers.getContractFactory("OmniLend");
  const omniLend = await OmniLend.deploy();

  await omniLend.waitForDeployment();
  const address = await omniLend.getAddress();

  console.log("✅ OmniLend deployed to:", address);

  // Verify on baseScan
  await hre.run("verify:verify", {
    address,
    constructorArguments: [],
    contract: "contracts/OmniLend.sol:OmniLend",
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contract:", error);
    process.exit(1);
  });