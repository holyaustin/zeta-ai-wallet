"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { 
  WalletProvider, 
  SuiClientProvider,
  createNetworkConfig 
} from "@mysten/dapp-kit";

// Create Wagmi config
const wagmiConfig = getDefaultConfig({
  appName: "Zeta AI Wallet",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "default-project-id",
  chains: [sepolia],
  ssr: true,
});

const queryClient = new QueryClient();

// For the latest version, use createNetworkConfig
const { networkConfig } = createNetworkConfig({
  testnet: { url: "https://fullnode.testnet.sui.io:443" },
  mainnet: { url: "https://fullnode.mainnet.sui.io:443" },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <SuiClientProvider
            networks={networkConfig}
            defaultNetwork="testnet"
          >
            <WalletProvider>
              {children}
            </WalletProvider>
          </SuiClientProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export { wagmiConfig };