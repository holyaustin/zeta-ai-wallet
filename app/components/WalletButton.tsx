// app/components/WalletButton.tsx
"use client";

import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <button
            onClick={openConnectModal}
            className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white font-medium rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none"
          >
            {/* Animated Gradient Background */}
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-sm"></span>
            <span className="relative flex items-center gap-2">
              🔐 Connect Wallet
            </span>
          </button>
        )}
      </ConnectButton.Custom>
    );
  }

  return (
    <div className="relative group">
      {/* Connected Wallet Button */}
      <button className="relative px-4 py-2 bg-blue-700 backdrop-blur-md border border-green-300 text-green-50 font-medium rounded-lg transition-all duration-700 hover:bg-green-500 hover:scale-105 hover:shadow-lg">
        <span className="text-sm font-mono">
          {address?.slice(0, 6)}…{address?.slice(-4)}
        </span>
      </button>

      {/* Fancy Dropdown (on hover) */}
      <div className="absolute right-0 top-full mt-3 w-64 bg-black/80 backdrop-blur-lg border border-gray-600 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 scale-95 group-hover:scale-100 z-50">
        {/* Header: Address Preview */}
        <div className="px-5 py-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-2xl">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Connected Address</h4>
          <p className="text-sm font-mono text-green-400 truncate break-all bg-gray-900 px-3 py-2 rounded border border-gray-700">
            {address}
          </p>
        </div>

        {/* Actions */}
        <div className="p-1">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`w-full text-left px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
              copied
                ? "bg-green-500 text-white shadow-lg"
                : "text-gray-200 hover:bg-white/10 hover:text-white"
            }`}
          >
            {copied ? (
              <>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                  ✅
                </span>
                <span>Copied to clipboard!</span>
              </>
            ) : (
              <>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-700">
                  📋
                </span>
                <span>Copy Address</span>
              </>
            )}
          </button>

          {/* Disconnect Button */}
          <button
            onClick={() => disconnect()}
            className="w-full text-left px-5 py-3 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200 flex items-center gap-3"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-900/50">
              🔌
            </span>
            <span>Disconnect Wallet</span>
          </button>
        </div>
      </div>
    </div>
  );
}