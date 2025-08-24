// app/page.tsx
'use client';

import { useAccount, useBalance, useNetwork } from 'wagmi';
import { sepolia, arbitrumSepolia, baseSepolia } from 'wagmi/chains';
import Link from 'next/link';

const CHAINS = [
  { id: sepolia.id, name: 'Sepolia', rpc: 'https://ethereum-sepolia-rpc.publicnode.com' },
  { id: arbitrumSepolia.id, name: 'Arbitrum Sepolia', rpc: 'https://arbitrum-sepolia-rpc.publicnode.com' },
  { id: baseSepolia.id, name: 'Base Sepolia', rpc: 'https://base-sepolia-rpc.publicnode.com' },
];

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  // Balances
  const { data: ethBalance } = useBalance({ address, chainId: sepolia.id });
  const { data: arbBalance } = useBalance({ address, chainId: arbitrumSepolia.id });
  const { data: baseBalance } = useBalance({ address, chainId: baseSepolia.id });

  const balances = [
    { chain: 'Sepolia', symbol: 'ETH', balance: ethBalance?.formatted, logo: '🟢' },
    { chain: 'Arbitrum Sepolia', symbol: 'ETH', balance: arbBalance?.formatted, logo: '🔵' },
    { chain: 'Base Sepolia', symbol: 'ETH', balance: baseBalance?.formatted, logo: '⚫' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Zeta AI Wallet</h1>
        <p className="text-gray-600 mb-8">Your universal cross-chain wallet powered by AI.</p>

        {!isConnected ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">Connect your wallet to view balances</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {balances.map((b, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{b.logo}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">{b.chain}</h3>
                      <p className="text-sm text-gray-500">{b.symbol}</p>
                    </div>
                  </div>
                  <p className="text-xl font-mono">{Number(b.balance).toFixed(6)} {b.symbol}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/ai"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Open AI Assistant
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}