"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
  const { address, isConnected } = useAccount();

  return (
    <header className="sticky top-0 left-0 right-0 bg-white/20 backdrop-blur-md border-b border-gray-700 z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-semibold text-gray-800">
          Zeta AI Wallet
        </h1>

        {/* Wallet area */}
        {isConnected ? (
          <div className="text-sm text-gray-600 font-mono">
            {address?.slice(0, 6)}…{address?.slice(-4)}
          </div>
        ) : (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                type="button"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-md font-medium transition transform hover:scale-105"
              >
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        )}
      </div>
    </header>
  );
}