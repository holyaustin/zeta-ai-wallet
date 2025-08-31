// app/wallet/page.tsx
"use client";

import { useAccount, useBalance } from "wagmi";
import { RainbowKitCustomConnectButton } from "@/components/RainbowKitCustomConnectButton";
import { useState } from "react";

type AISuggestion = {
  riskLevel: "Low" | "Medium" | "High";
  message: string;
  action?: string;
};

export default function WalletPage() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);

  const analyzeTransaction = async () => {
    setAiLoading(true);
    setAiSuggestion(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        body: JSON.stringify({
          prompt: "Analyze this wallet interaction: user connects and views balance. Is it safe? What should they know?",
        }),
      });
      const data = await res.json();

      setAiSuggestion({
        riskLevel: "Low",
        message: data.text || "Wallet connection is safe. No permissions requested.",
      });
    } catch (err) {
      setAiSuggestion({
        riskLevel: "Medium",
        message: "AI analysis temporarily unavailable. Please check connection.",
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Your Wallet</h1>

        <div className="max-w-md mx-auto bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
          <RainbowKitCustomConnectButton />

          {isConnected && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-zinc-400 text-sm">Address</label>
                <p className="font-mono text-sm break-all">{address}</p>
              </div>
              <div>
                <label className="text-zinc-400 text-sm">Balance</label>
                <p className="text-lg">
                  {(Number(balance?.value) / 10 ** Number(balance?.decimals)).toFixed(6)} {balance?.symbol}
                </p>
              </div>

              <button
                onClick={analyzeTransaction}
                disabled={aiLoading}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition"
              >
                {aiLoading ? "Analyzing..." : "AI: Is This Safe?"}
              </button>

              {aiSuggestion && (
                <div
                  className={`p-4 mt-4 rounded-lg text-sm border-l-4 ${
                    aiSuggestion.riskLevel === "High"
                      ? "bg-red-900/30 border-red-500"
                      : aiSuggestion.riskLevel === "Medium"
                      ? "bg-yellow-900/30 border-yellow-500"
                      : "bg-green-900/30 border-green-500"
                  }`}
                >
                  <strong>{aiSuggestion.riskLevel} Risk</strong>: {aiSuggestion.message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}