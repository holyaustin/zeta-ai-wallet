const hre = require("hardhat");

async function main() {
  const ZETA_CONNECTOR = "0x5F3b5DfEb7B28CDbD7FAba78963EE202a494e2A2"; // ZetaChain Testnet

  const OmniLend = await hre.ethers.getContractFactory("OmniLend");
  const omniLend = await OmniLend.deploy(ZETA_CONNECTOR);

  await omniLend.waitForDeployment();
  console.log("OmniLend deployed to:", await omniLend.getAddress());

  // Verify on Etherscan
  await hre.run("verify:verify", {
    address: await omniLend.getAddress(),
    constructorArguments: [ZETA_CONNECTOR],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});