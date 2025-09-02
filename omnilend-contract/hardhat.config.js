require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify"); 
require("dotenv").config();

// console.log("Base AP key = ", process.env.BASE_API_KEY)

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
    baseMainnet: {
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
    apiKey: {
      zetaTestnet: process.env.ETHERSCAN_API_KEY,
      optimisticSepolia: process.env.ETHERSCAN_API_KEY,
      baseSepolia: process.env.ETHERSCAN_API_KEY,
      baseMainnet: process.env.ETHERSCAN_API_KEY,
      arbitrumSepolia: process.env.ETHERSCAN_API_KEY,
      etherlink: process.env.ETHERSCAN_API_KEY,
    },
    customChains: [
            {
        network: "etherlink",
        chainId: 42793,
        urls: {
          apiURL: "https://explorer.etherlink.com/api",
          browserURL: "https://explorer.etherlink.com",
        },
      },
      {
        network: "zetaTestnet",
        chainId: 7001,
        urls: {
          apiURL: "https://api.zetachain.com/api",
          browserURL: "https://zetachain.com/explorer",
        },
      },
      {
        network: "optimisticSepolia",
        chainId: 11155420,
        urls: {
          apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
          browserURL: "https://sepolia-optimism.etherscan.io",
        },
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
            {
        network: "baseMainnet",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io",
        },
      },
    ],
  },
    sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true
  }
};