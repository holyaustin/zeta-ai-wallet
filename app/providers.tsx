// app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { sepolia, arbitrumSepolia, optimismSepolia, baseSepolia } from "wagmi/chains";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

// Custom chains
const avalancheFuji = {
  id: 43113,
  name: "Avalanche Fuji",
  nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
  rpcUrls: { default: { http: ["https://api.avax-test.network/ext/bc/C/rpc"] } },
  blockExplorers: { default: { name: "Snowtrace", url: "https://testnet.snowtrace.io" } },
} as const;

const bscTestnet = {
  id: 97,
  name: "BSC Testnet",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: { default: { http: ["https://data-seed-prebsc-1-s3.bnbchain.org:8545"] } },
  blockExplorers: { default: { name: "BscScan", url: "https://testnet.bscscan.com" } },
} as const;

const zetaTestnet = {
  id: 7001,
  name: "ZetaChain Athens-3",
  nativeCurrency: { name: "ZETA", symbol: "ZETA", decimals: 18 },
  rpcUrls: { default: { http: ["https://zetachain-athens-evm.blockpi.network/v1/rpc/public"] } },
  blockExplorers: { default: { name: "ZetaChain Explorer", url: "https://athens3.zetachain.com" } },
} as const;

// Full list of chains
export const chains = [
  sepolia,
  arbitrumSepolia,
  optimismSepolia,
  baseSepolia,
  avalancheFuji,
  bscTestnet,
  zetaTestnet,
] as const;

// Transports
const transports = {
  [sepolia.id]: http(),
  [arbitrumSepolia.id]: http(),
  [optimismSepolia.id]: http(),
  [baseSepolia.id]: http(),
  [avalancheFuji.id]: http(),
  [bscTestnet.id]: http(),
  [zetaTestnet.id]: http(),
} as const;

// Create wagmi config
export const wagmiConfig = createConfig({
  chains,
  transports,
  ssr: true, // Enable SSR
});

// Query Client
const queryClient = new QueryClient();

// Providers wrapper
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