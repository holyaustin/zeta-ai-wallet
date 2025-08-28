// app/page.tsx
"use client";

import { useAccount, useBalance as useEvmBalance } from "wagmi";
import { sepolia, arbitrumSepolia, optimismSepolia, baseSepolia } from "wagmi/chains";
import Link from "next/link";
import { useEffect, useState } from "react";
import { WalletButton } from "./components/WalletButton";

// ✅ Verified & Active Logo URLs (tested, no 404s)
const LOGOS = {
  eth: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
  arb: "https://docs.arbitrum.io/img/logo.svg",
  op: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png?1687502062",
  base: "https://basescan.org/assets/base/images/svg/logos/chain-light.svg?v=25.8.3.0",
  avax: "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
  bnb: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png?1696501850",
  zeta: "https://s2.coinmarketcap.com/static/img/coins/64x64/21259.png", // Official ZetaChain logo
};

// Approximate USD prices
const USD_PRICES = {
  ETH: 3000,
  BNB: 300,
  AVAX: 30,
  ZETA: 2,
};

export default function Dashboard() {
  const { address, isConnected } = useAccount();

  // EVM Balances
  const { data: ethBalance } = useEvmBalance({ address, chainId: sepolia.id });
  const { data: arbBalance } = useEvmBalance({ address, chainId: arbitrumSepolia.id });
  const { data: opBalance } = useEvmBalance({ address, chainId: optimismSepolia.id });
  const { data: baseBalance } = useEvmBalance({ address, chainId: baseSepolia.id });
  const { data: avaxBalance } = useEvmBalance({ address, chainId: 43113 });
  const { data: bscBalance } = useEvmBalance({ address, chainId: 97 });
  const { data: zetaBalance } = useEvmBalance({ address, chainId: 7001 });

  // Portfolio total in USD
  const [totalValue, setTotalValue] = useState<number>(0);

  useEffect(() => {
    if (!isConnected) {
      setTotalValue(0);
      return;
    }

    const balancesInUsd = [
      parseFloat(ethBalance?.formatted || "0") * USD_PRICES.ETH,
      parseFloat(arbBalance?.formatted || "0") * USD_PRICES.ETH,
      parseFloat(opBalance?.formatted || "0") * USD_PRICES.ETH,
      parseFloat(baseBalance?.formatted || "0") * USD_PRICES.ETH,
      parseFloat(avaxBalance?.formatted || "0") * USD_PRICES.AVAX,
      parseFloat(bscBalance?.formatted || "0") * USD_PRICES.BNB,
      parseFloat(zetaBalance?.formatted || "0") * USD_PRICES.ZETA,
    ];

    const total = balancesInUsd.reduce((sum, val) => sum + val, 0);
    setTotalValue(total);
  }, [
    ethBalance, arbBalance, opBalance, baseBalance,
    avaxBalance, bscBalance, zetaBalance, isConnected,
  ]);

  const balances = [
    { chain: "Sepolia", symbol: "ETH", balance: ethBalance?.formatted || "0.000000", logo: LOGOS.eth },
    { chain: "Arbitrum Sepolia", symbol: "ETH", balance: arbBalance?.formatted || "0.000000", logo: LOGOS.arb },
    { chain: "Optimism Sepolia", symbol: "ETH", balance: opBalance?.formatted || "0.000000", logo: LOGOS.op },
    { chain: "Base Sepolia", symbol: "ETH", balance: baseBalance?.formatted || "0.000000", logo: LOGOS.base },
    { chain: "Avalanche Fuji", symbol: "AVAX", balance: avaxBalance?.formatted || "0.000000", logo: LOGOS.avax },
    { chain: "BSC Testnet", symbol: "BNB", balance: bscBalance?.formatted || "0.000000", logo: LOGOS.bnb },
    { chain: "ZetaChain Athens‑3", symbol: "ZETA", balance: zetaBalance?.formatted || "0.000000", logo: LOGOS.zeta },
  ];

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* ✅ Full-coverage background dots (no margin/padding) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: "0s" }} />
        <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col min-h-screen w-full">
        {/* Header Section */}
        <div className="text-center pt-8 pb-4 px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Zeta AI Wallet</h1>
          <p className="text-lg md:text-xl text-gray-200 mb-4">
            Universal access to Blockchains — powered by Zetachain + Google AI.
          </p>

          {/* Wallet Button (Centered when not connected) */}
          {!isConnected && (
            <div className="flex justify-center mb-10">
              <WalletButton />
            </div>
          )}

          {/* Action Buttons (Only when connected) */}
          {isConnected && (
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 px-4">
              <Link
                href="/ai"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg transition transform hover:scale-105 text-base md:text-lg"
              >
                💬 Chat with AI Assistant
              </Link>
              <button
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg transition transform hover:scale-105 text-base md:text-lg"
              >
                🔄 Cross-Chain Swap
              </button>
              <button
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg transition transform hover:scale-105 text-base md:text-lg"
              >
                💰 Cross-Chain Lend
              </button>
            </div>
          )}

          {/* Total Portfolio Value */}
          {isConnected && (
            <div className="inline-block bg-green-800 bg-opacity-90 backdrop-blur-sm border border-gray-700 rounded-2xl px-8 py-4">
              <p className="text-sm text-gray-300 uppercase tracking-wider">Total Portfolio Value</p>
              <p className="text-3xl font-bold font-mono mt-1">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          )}
        </div>

        {/* Balance Grid */}
          <p className="text-center text-lg md:text-xl text-gray-200 mb-4 font-bold">
            Multi-Chain Wallet Balance
          </p>
        {isConnected && (
          <div className="flex-1 px-4 pb-12">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {balances.map((b, i) => (
                  <div
                    key={i}
                    className="bg-black bg-opacity-30 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 text-center hover:bg-opacity-40 transition transform hover:scale-105"
                  >
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className="w-10 h-10 flex-shrink-0">
                        <img
                          src={b.logo}
                          alt={b.chain}
                          className="w-full h-full rounded-full object-contain"
                          onError={(e) => {
                            // Fallback if logo fails
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/40/1f2937/FFFFFF?text=?";
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-100">{b.chain}</h3>
                        <p className="text-sm text-gray-300">{b.symbol}</p>
                      </div>
                    </div>
                    <p className="text-xl font-mono font-bold">
                      {b.balance} {b.symbol}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}