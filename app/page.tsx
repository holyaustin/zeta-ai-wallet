"use client";

import { useAccount } from "wagmi";
import { useBalance as useEvmBalance } from "wagmi";
import {
  sepolia,
  arbitrumSepolia,
  optimismSepolia,
  baseSepolia,
} from "wagmi/chains";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWalletKit } from "@mysten/wallet-kit";
import { useQuery } from "@tanstack/react-query";
import { SuiClient } from "@mysten/sui.js/client";

/* ---------- Sui client (testnet) ---------- */
const suiClient = new SuiClient({ url: "https://fullnode.testnet.sui.io" });

export default function Dashboard() {
  const { address, isConnected } = useAccount();

  /* ----------  EVM balances ---------- */
  const { data: ethBalance } = useEvmBalance({
    address,
    chainId: sepolia.id,
  });
  const { data: arbBalance } = useEvmBalance({
    address,
    chainId: arbitrumSepolia.id,
  });
  const { data: opBalance } = useEvmBalance({
    address,
    chainId: optimismSepolia.id,
  });
  const { data: baseBalance } = useEvmBalance({
    address,
    chainId: baseSepolia.id,
  });
  const { data: avaxBalance } = useEvmBalance({
    address,
    chainId: 43113, // Avalanche Fuji
  });
  const { data: bscBalance } = useEvmBalance({
    address,
    chainId: 97, // BSC Testnet
  });
  const { data: zetaBalance } = useEvmBalance({
    address,
    chainId: 7001, // ZetaChain Athens‑3
  });

  /* ----------  Sui balance (via WalletKit) ---------- */
  const { currentAccount } = useWalletKit();

  const { data: suiBalance } = useQuery({
    queryKey: ["suiBalance", currentAccount?.address],
    queryFn: async () => {
      if (!currentAccount?.address) return null;
      const coins = await suiClient.getCoins({
        owner: currentAccount.address,
      });
      const total = coins.data.reduce(
        (sum: bigint, coin: any) => sum + BigInt(coin.balance),
        BigInt(0)
      );
      // SUI has 9 decimal places
      return (Number(total) / 1_000_000_000).toFixed(6);
    },
    enabled: !!currentAccount?.address,
  });

  /* ----------  Card data ---------- */
  const balances = [
    {
      chain: "Sepolia",
      symbol: "ETH",
      balance: ethBalance?.formatted || "0.000000",
      logo: "/logos/ethereum.svg",
    },
    {
      chain: "Arbitrum Sepolia",
      symbol: "ETH",
      balance: arbBalance?.formatted || "0.000000",
      logo: "/logos/arbitrum.svg",
    },
    {
      chain: "Optimism Sepolia",
      symbol: "ETH",
      balance: opBalance?.formatted || "0.000000",
      logo: "/logos/optimism.svg",
    },
    {
      chain: "Base Sepolia",
      symbol: "ETH",
      balance: baseBalance?.formatted || "0.000000",
      logo: "/logos/base.svg",
    },
    {
      chain: "Avalanche Fuji",
      symbol: "AVAX",
      balance: avaxBalance?.formatted || "0.000000",
      logo: "/logos/avalanche.svg",
    },
    {
      chain: "BSC Testnet",
      symbol: "BNB",
      balance: bscBalance?.formatted || "0.000000",
      logo: "/logos/bnb.svg",
    },
    {
      chain: "ZetaChain Athens‑3",
      symbol: "ZETA",
      balance: zetaBalance?.formatted || "0.000000",
      logo: "/logos/zeta.svg",
    },
    {
      chain: "Sui Testnet",
      symbol: "SUI",
      balance: currentAccount ? suiBalance ?? "Loading…" : "Not Connected",
      logo: "/logos/sui.svg",
    },
  ];

  return (
    <div
      className="relative min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 20%,rgba(14,165,233,0.1) 0%,transparent 20%),
          radial-gradient(circle at 90% 80%,rgba(168,85,247,0.1) 0%,transparent 20%),
          linear-gradient(135deg,transparent 0%,rgba(255,255,255,0.03) 50%,transparent 100%)
        `,
      }}
    >
      {/* ----- floating decorative dots ----- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute top-3/4 left-1/4 w-1 h-1 bg-purple-400 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/4 right-1/4 w-2 h-2 bg-indigo-400 rounded-full animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-pink-400 rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      {/* ----- main container ----- */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-2">
          Zeta AI Wallet
        </h1>
        <p className="text-xl text-center text-gray-200 mb-12">
          Universal access to EVM and Sui testnets — powered by AI.
        </p>

        {/* ----- connect buttons ----- */}
        {(!isConnected && !currentAccount) && (
          <div className="text-center space-y-6 py-16">
            <h2 className="text-2xl font-semibold">Connect Your Wallets</h2>

            {/* EVM (RainbowKit) */}
            <ConnectButton.Custom>
              {({ account, openConnectModal }) =>
                !account ? (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition transform hover:scale-105"
                  >
                    🔌 Connect EVM Wallet
                  </button>
                ) : null
              }
            </ConnectButton.Custom>

            {/* Sui */}
            {!currentAccount && (
              <button
                onClick={() =>
                  alert("Please use the Sui Wallet UI to connect.")
                }
                className="block mx-auto mt-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl"
              >
                🔐 Connect Sui Testnet
              </button>
            )}
          </div>
        )}

        {/* ----- balances grid ----- */}
        {(isConnected || currentAccount) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {balances.map((b, i) => (
              <div
                key={i}
                className="bg-black bg-opacity-30 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 text-center hover:bg-opacity-40 transition"
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-8 h-8 flex-shrink-0">
                    <img
                      src={b.logo}
                      alt={b.chain}
                      className="w-full h-full rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100">
                      {b.chain}
                    </h3>
                    <p className="text-sm text-gray-300">{b.symbol}</p>
                  </div>
                </div>
                <p className="text-xl font-mono font-bold">
                  {b.balance} {b.symbol}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ----- AI Assistant CTA ----- */}
        {(isConnected || currentAccount) && (
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