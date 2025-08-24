import { ethers } from "hardhat";

async function main() {
  const ZETA_HUB = "0x7F80a7d08e215c9cB5A7d28a5619B1B0dB7f512F"; // ZetaHub on Athens-3

  const CrossChainDeFi = await ethers.getContractFactory("CrossChainDeFi");
  const contract = await CrossChainDeFi.deploy(ZETA_HUB);

  await contract.waitForDeployment();
  console.log("CrossChainDeFi deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});