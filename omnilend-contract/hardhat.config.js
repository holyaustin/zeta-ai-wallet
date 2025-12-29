require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify"); 
require("dotenv").config();


const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");
//console.log("ETHERSCAN_API_KEY = ", ETHERSCAN_API_KEY);

module.exports = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    hardhat: {
      chainId: 7000,
      allowUnlimitedContractSize: true,
    },
    // ZetaChain Testnet (Athens)
    zetaTestnet: {
      url: "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 7001,
    },
    // Etherlink Mainnet
    etherlink: {
      url: "https://rpc.ankr.com/etherlink_mainnet",
      accounts: [process.env.PRIVATE_KEY || ""],
      chainId: 42793,
      timeout: 100000, // 100 seconds
      httpHeaders: { "User-Agent": "Hardhat/1.0" },
      // Add retry logic
      gasPrice: "auto",
      gasMultiplier: 1.2,
    },
    // Optimism Sepolia
    optimismSepolia: {
      url: "https://sepolia.optimism.io",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155420,
    },

    // Base Sepolia
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 84532,
    },

    // 🔹 Base Mainnet
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 8453,
    },

    // Arbitrum Sepolia
    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 421614,
    },
  },

  verify: {
    blockscout: {
      enabled: false,
    },
  },

  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
    sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true
  }
};