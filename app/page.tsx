"use client";

import { useAccount, useBalance as useEvmBalance } from "wagmi";
import { sepolia, arbitrumSepolia, optimismSepolia, baseSepolia } from "wagmi/chains";
import Link from "next/link";
import { useCurrentWallet } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";

// Sui client
const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { currentWallet, connectionStatus, connect, disconnect } = useCurrentWallet();
  const isSuiConnected = connectionStatus === "connected";

  // EVM Balances
  const { data: ethBalance } = useEvmBalance({ address, chainId: sepolia.id });
  const { data: arbBalance } = useEvmBalance({ address, chainId: arbitrumSepolia.id });
  const { data: opBalance } = useEvmBalance({ address, chainId: optimismSepolia.id });
  const { data: baseBalance } = useEvmBalance({ address, chainId: baseSepolia.id });
  const { data: avaxBalance } = useEvmBalance({ address, chainId: 43113 });
  const { data: bscBalance } = useEvmBalance({ address, chainId: 97 });
  const { data: zetaBalance } = useEvmBalance({ address, chainId: 7001 });

  // Sui Balance
  const { data: suiBalance } = useQuery({
    queryKey: ["suiBalance", currentWallet?.accounts[0]?.address],
    queryFn: async () => {
      if (!currentWallet?.accounts[0]?.address) return null;
      const coins = await suiClient.getCoins({ owner: currentWallet.accounts[0].address });
      const total = coins.data.reduce(
        (sum: bigint, coin: any) => sum + BigInt(coin.balance),
        BigInt(0)
      );
      return (Number(total) / 1_000_000_000).toFixed(6);
    },
    enabled: !!currentWallet?.accounts[0]?.address,
  });

  const connectToSuiWallet = async () => {
    try {
      // This will open the wallet connection modal with all available wallets
      // Slush Wallet will appear if installed or available
      connect();
    } catch (error) {
      console.error("Failed to connect to Sui wallet:", error);
      alert("Failed to connect to Sui wallet. Please make sure you have a Sui wallet installed.");
    }
  };

  const disconnectSuiWallet = async () => {
    try {
      disconnect();
    } catch (error) {
      console.error("Failed to disconnect from Sui wallet:", error);
    }
  };

  const balances = [
    { chain: "Sepolia", symbol: "ETH", balance: ethBalance?.formatted || "0.000000", logo: "https://raw.githubusercontent.com/cryptocurrencies/cryptocurrency-icons/master/32/color/eth.png" },
    { chain: "Arbitrum Sepolia", symbol: "ETH", balance: arbBalance?.formatted || "0.000000", logo: "https://raw.githubusercontent.com/cryptocurrencies/cryptocurrency-icons/master/32/color/arb.png" },
    { chain: "Optimism Sepolia", symbol: "ETH", balance: opBalance?.formatted || "0.000000", logo: "https://raw.githubusercontent.com/cryptocurrencies/cryptocurrency-icons/master/32/color/op.png" },
    { chain: "Base Sepolia", symbol: "ETH", balance: baseBalance?.formatted || "0.000000", logo: "https://raw.githubusercontent.com/cryptocurrencies/cryptocurrency-icons/master/32/color/base.png" },
    { chain: "Avalanche Fuji", symbol: "AVAX", balance: avaxBalance?.formatted || "0.000000", logo: "https://raw.githubusercontent.com/cryptocurrencies/cryptocurrency-icons/master/32/color/avax.png" },
    { chain: "BSC Testnet", symbol: "BNB", balance: bscBalance?.formatted || "0.000000", logo: "https://raw.githubusercontent.com/cryptocurrencies/cryptocurrency-icons/master/32/color/bnb.png" },
    { chain: "ZetaChain Athens‑3", symbol: "ZETA", balance: zetaBalance?.formatted || "0.000000", logo: "https://raw.githubusercontent.com/zeta-chain/assets/main/blockchains/zetachain/asset.png" },
    { chain: "Sui Testnet", symbol: "SUI", balance: isSuiConnected ? suiBalance ?? "Loading…" : "Not Connected", logo: "https://raw.githubusercontent.com/mystenlabs/sui-icons/main/icons/sui.png" },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Background Dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: "0s" }} />
        <div className="absolute top-3/4 left-1/4 w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-2">Zeta AI Wallet</h1>
        <p className="text-xl text-center text-gray-200 mb-12">
          Universal access to EVM and Sui testnets — powered by AI.
        </p>

        {/* Sui Wallet Connection */}
        {!isSuiConnected && (
          <div className="text-center mb-8">
            <p className="text-lg mb-4">Connect your Sui wallet to view your balance</p>
            <button
              onClick={connectToSuiWallet}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-medium transition transform hover:scale-105"
            >
              Connect Sui Wallet
            </button>
          </div>
        )}

        {isSuiConnected && (
          <div className="text-center mb-8">
            <p className="text-lg mb-4">
              Connected to Sui Wallet: {currentWallet?.name}
              {currentWallet?.accounts[0]?.address && (
                <span className="ml-2 text-sm">
                  ({currentWallet.accounts[0].address.slice(0, 8)}...)
                </span>
              )}
            </p>
            <button
              onClick={disconnectSuiWallet}
              className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              Disconnect
            </button>
          </div>
        )}

        {/* Balance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {balances.map((b, i) => (
            <div
              key={i}
              className="bg-black bg-opacity-30 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 text-center hover:bg-opacity-40 transition"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-8 h-8 flex-shrink-0">
                  <img src={b.logo} alt={b.chain} className="w-full h-full rounded-full" />
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

        {/* AI Assistant Button */}
        {(isConnected || isSuiConnected) && (
          <div className="text-center">
            <Link
              href="/ai"
              className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-xl transition transform hover:scale-105"
            >
              💬 Chat with AI Assistant
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}