// app/components/Header.tsx
"use client";

export default function Header() {
  return (
    <header className="sticky top-0 left-0 right-0 bg-white/20 backdrop-blur-md border-b border-gray-700 z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-semibold text-gray-800">
          Zeta AI Wallet
        </h1>

        {/* Wallet Button */}
        <div className="flex items-center gap-4">
          <WalletButton />
        </div>
      </div>
    </header>
  );
}

// Import the shared WalletButton
import { WalletButton } from "./WalletButton";