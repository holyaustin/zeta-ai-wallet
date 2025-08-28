// app/ai/page.tsx
"use client";

import { useAccount } from "wagmi";
import { useState } from "react";
import { getWalletClient } from "wagmi/actions";
import { wagmiConfig } from "../providers";
import { sepolia } from "wagmi/chains";

// Import your shared Header
import Header from "../components/Header";

export default function AIPage() {
  const { address, isConnected } = useAccount();
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const askAI = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://zetaai-proxy-xxxx.a.run.app/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setAiResponse(data);
    } catch (err) {
      console.error("AI error:", err);
      alert("Failed to reach AI. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const executeBridge = async () => {
    if (!isConnected || !address || !aiResponse) return;

    try {
      const walletClient = await getWalletClient(wagmiConfig, {
        chainId: sepolia.id,
      });

      if (!walletClient) throw new Error("Wallet client not found");

      const { evmDeposit } = await import("@zetachain/toolkit");

      const amount = parseFloat(aiResponse.amount || "0");
      const token = aiResponse.token === "ETH"
        ? "0x0000000000000000000000000000000000000000"
        : aiResponse.tokenAddress || "";

      if (!token) {
        throw new Error("Token address not found in AI response");
      }

      const depositTx = await evmDeposit(
        {
          amount,
          token,
          receiver: address,
        },
        { signer: walletClient }
      );

      console.log("Deposit hash:", depositTx.hash);
      setTxHash(depositTx.hash);
    } catch (err: any) {
      console.error("Bridge execution error:", err);
      alert("Error: " + (err.message || "Unknown error occurred"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
      {/* Background Dots */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: "0s" }} />
        <div className="absolute top-3/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

        {/* Main Content */}
      <main className="relative z-10 px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-cyan-300 to-blue-100 bg-clip-text text-transparent">
            Zeta AI Assistant
          </h1>
          <p className="text-center text-blue-200 mb-8">
            Ask me to move tokens across chains — powered by AI.
          </p>

          {/* Input Box Always Visible */}
          <div className="mb-8">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to do? (e.g., Move 0.1 ETH from Ethereum to Arbitrum)"
              className="w-full p-4 bg-white/10 border border-blue-500 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading && question.trim()) {
                  askAI();
                }
              }}
            />

            <button
              onClick={askAI}
              disabled={loading || !question.trim()}
              className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-medium transition transform disabled:transform-none disabled:cursor-not-allowed"
            >
              {loading ? "🧠 Thinking…" : "💬 Ask AI"}
            </button>
          </div>

          {/* Show message if wallet not connected */}
          {!isConnected && (
            <div className="text-center py-6 mb-6 bg-yellow-900/20 border border-yellow-600 rounded-xl">
              <p className="text-yellow-200">
                🔐 Wallet not connected. You can still ask AI, but actions require a wallet.
              </p>
            </div>
          )}

          {/* AI Response */}
          {aiResponse && (
            <div className="bg-black/20 backdrop-blur-sm border border-blue-600 rounded-2xl p-6 mb-6">
              <h3 className="font-semibold text-lg text-cyan-300 mb-3">AI Suggested Action</h3>
              <div className="bg-black/30 rounded-xl p-4 mb-4 max-h-60 overflow-y-auto font-mono text-sm text-gray-200">
                <pre>{JSON.stringify(aiResponse, null, 2)}</pre>
              </div>

              {/* Execute Bridge Button (only if connected) */}
              {isConnected ? (
                <button
                  onClick={executeBridge}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-medium transition"
                >
                  ✅ Execute Bridge
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-700 text-gray-400 py-3 rounded-xl font-medium cursor-not-allowed"
                >
                  🔒 Connect wallet to execute
                </button>
              )}
            </div>
          )}

          {/* Transaction Success */}
          {txHash && (
            <div className="bg-green-900/40 border border-green-600 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-green-300">Deposit Initiated!</span>
              </div>
              <p className="text-sm text-green-200 break-all">
                <a
                  href={`https://explorer.zetachain.com/address/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 hover:underline"
                >
                  {txHash}
                </a>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}