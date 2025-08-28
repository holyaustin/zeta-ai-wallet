"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { sepolia, arbitrumSepolia, optimismSepolia, baseSepolia } from "wagmi/chains";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";

// Avalanche Fuji
const avalancheFuji = {
  id: 43113,
  name: "Avalanche Fuji",
  network: "avalanche-fuji",
  nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
  rpcUrls: { default: { http: ["https://api.avax-test.network/ext/bc/C/rpc"] } },
  blockExplorers: {
    default: { name: "Snowtrace", url: "https://testnet.snowtrace.io" },
  },
} as const;

// BSC Testnet
const bscTestnet = {
  id: 97,
  name: "BSC Testnet",
  network: "bsc-testnet",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://data-seed-prebsc-1-s1.binance.org:8545"] },
  },
  blockExplorers: {
    default: { name: "BscScan", url: "https://testnet.bscscan.com" },
  },
} as const;

// ZetaChain Athens-3
const zetaTestnet = {
  id: 7001,
  name: "ZetaChain Athens-3",
  network: "zeta-testnet",
  nativeCurrency: { name: "ZETA", symbol: "ZETA", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://api.zetachain.com/endpoints/v1/crosschain/testnet"],
    },
  },
  blockExplorers: {
    default: { name: "ZetaChain Explorer", url: "https://athens3.zetachain.com" },
  },
} as const;

// Full list of chains
const chains = [
  sepolia,
  arbitrumSepolia,
  optimismSepolia,
  baseSepolia,
  avalancheFuji,
  bscTestnet,
  zetaTestnet,
] as const;

// Transports for each chain
const transports = {
  [sepolia.id]: http(),
  [arbitrumSepolia.id]: http(),
  [optimismSepolia.id]: http(),
  [baseSepolia.id]: http(),
  [avalancheFuji.id]: http(),
  [bscTestnet.id]: http(),
  [zetaTestnet.id]: http(),
} as const;

// Create Wagmi config
const wagmiConfig = createConfig({
  chains,
  transports,
  ssr: true,
});

// Create query client
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export { wagmiConfig };