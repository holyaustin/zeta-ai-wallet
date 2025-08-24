// app/providers.tsx
use client;

import { QueryClient, QueryClientProvider } from @tanstack/react-query';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { mainnet, sepolia, arbitrumSepolia, baseSepolia } from 'wagmi/chains';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';

const config = createConfig({
  chains: [sepolia, arbitrumSepolia, baseSepolia] as const,
  transports: {
    [sepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}