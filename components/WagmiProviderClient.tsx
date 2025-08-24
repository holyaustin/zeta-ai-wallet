use client;

import { QueryClient, QueryClientProvider } from @tanstack/react-query;
import { createConfig, http, WagmiProvider } from wagmi;
import { sepolia, arbitrumSepolia, baseSepolia } from wagmi/chains;
import { getDefaultConfig, RainbowKitProvider } from @rainbow-me/rainbowkit;

export function WagmiProviderClient({ children }: { children: React.ReactNode }) {
  const chains = [sepolia, arbitrumSepolia, baseSepolia] as const;

  const config = createConfig({
    chains,
    transports: Object.fromEntries(chains.map((c) = [c.id, http()])),
    ssr: true,
  });

  const queryClient = new QueryClient();

  return (
    WagmiProvider config={config}
      QueryClientProvider client={queryClient}
        RainbowKitProvider{children}/RainbowKitProvider
      /QueryClientProvider
    /WagmiProvider
  );
}