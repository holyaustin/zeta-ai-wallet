import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, arbitrumSepolia } from 'wagmi/chains';
import { http } from 'wagmi';

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID!;

export const config = getDefaultConfig({
  appName: 'Zeta AI Wallet',
  projectId,
  chains: [sepolia, arbitrumSepolia],
  ssr: true,
  transports: {
    [sepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});