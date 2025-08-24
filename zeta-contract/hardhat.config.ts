import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    zetaTestnet: {
      url: "https://api.zetachain.com/endpoints/v1/crosschain/testnet",
      accounts: [process.env.PRIVATE_KEY!],
    } as any
  },
};

export default config;