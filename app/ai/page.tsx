"use client";

import { useAccount } from "wagmi";
import { useState } from "react";
import { evmDeposit, zetachainCall } from "@zetachain/toolkit";
import { getWalletClient } from "wagmi/actions";
import { wagmiConfig } from "../providers";
import { sepolia } from "wagmi/chains";

export default function AIPage() {
  const { address, isConnected } = useAccount();
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tx, setTx] = useState<any>(null);

  const askAI = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://zetaai-proxy-xxxx.a.run.app/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setAiResponse(data);
    } catch (err) {
      console.error("AI error:", err);
      alert("Failed to reach AI.");
    } finally {
      setLoading(false);
    }
  };

  const executeBridge = async () => {
    if (!isConnected || !address || !aiResponse) return;
    try {
      // Get a signer (wallet client) from wagmi
      const walletClient = await getWalletClient(wagmiConfig, {
        chainId: sepolia.id,
      });
      if (!walletClient) throw new Error("Wallet client not found");

      // 1️⃣ Deposit to ZetaChain
      const depositTx = await evmDeposit(
        {
          amount: aiResponse.amount,
          token:
            aiResponse.token === "ETH"
              ? "0x0000000000000000000000000000000000000000" // native ETH
              : "0x...", // USDC address if needed
          receiver: address,
        },
        { signer: walletClient }
      );
      console.log(" deposit");
      // await zetachainCall(
      //   {
      //     receiver: "0xYourUniversalContract",
      //     function: "onDeposit(address,uint256)",
      //     types: ["address", "uint256"],
      //     values: [address, BigInt(aiResponse.amount)],
      //     zrc20: "0x57B1ef088334374773128d2879B53911f348B99b", // ZRC20 ETH
      //   },
      //   { signer: walletClient }
      // );

      setTx({ depositHash: depositTx.hash });
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (!isConnected) {
    return <div className="p-6">Connect wallet first.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Zeta AI Assistant</h1>
        <p className="text-gray-600 mb-6">
          Ask me to move tokens between chains.
        </p>

        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Move 0.5 ETH from Ethereum to ZetaChain"
          className="w-full p-3 border rounded-lg mb-4"
        />
        <button
          onClick={askAI}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Asking AI…" : "Ask AI"}
        </button>

        {aiResponse && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold">AI Response:</h3>
            <pre className="text-sm mt-2">{JSON.stringify(aiResponse, null, 2)}</pre>
            <button
              onClick={executeBridge}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              Execute Bridge
            </button>
          </div>
        )}

        {tx && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p>✅ Deposit initiated on ZetaChain!</p>
            <p>
              Tx:{" "}
              <a
                href={`https://athens3.zetachain.com/tx/${tx.depositHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600"
              >
                {tx.depositHash}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}