"use client";

import { useAccount } from "wagmi";
import { useState } from "react";
import { getWalletClient } from "wagmi/actions";
import { wagmiConfig } from "../providers";
import { sepolia } from "wagmi/chains";

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
      // For EVM to ZetaChain bridge
      const walletClient = await getWalletClient(wagmiConfig, {
        chainId: sepolia.id,
      });
      
      if (!walletClient) throw new Error("Wallet client not found");

      // Dynamically import the real @zetachain/toolkit at runtime
      const { evmDeposit } = await import("@zetachain/toolkit");

      // Add type checking for aiResponse properties
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

  if (!isConnected) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Connect your wallet first</h2>
        <p className="text-gray-600">Please connect your wallet to use the AI assistant.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Zeta AI Assistant</h1>
        <p className="text-gray-600 mb-4">
          Ask me to move tokens between chains (e.g., Move 0.1 ETH from Ethereum to Arbitrum).
        </p>

        <div className="mb-6">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Your request…"
            className="w-full p-3 border rounded-lg mb-4"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !loading) {
                askAI();
              }
            }}
          />

          <button
            onClick={askAI}
            disabled={loading || !question.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Thinking…" : "Ask AI"}
          </button>
        </div>

        {aiResponse && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">AI Response</h3>
            <div className="bg-white p-4 rounded-md mb-4">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(aiResponse, null, 2)}
              </pre>
            </div>
            <button
              onClick={executeBridge}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Execute Bridge
            </button>
          </div>
        )}

        {txHash && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Deposit initiated on ZetaChain!</span>
            </div>
            <p className="text-sm">
              Transaction:{" "}
              <a
                href={`https://explorer.zetachain.com/address/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {txHash}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}