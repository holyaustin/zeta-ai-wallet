// app/ai/page.tsx
"use client";

import { useAccount, useBalance } from "wagmi";
import { useState, useEffect } from "react";
import { getWalletClient } from "@wagmi/core";
import { wagmiConfig } from "../providers";
import { sepolia } from "wagmi/chains";
import { formatUnits, encodeFunctionData, parseEther } from "viem";

// ✅ ZetaChain TSS Address
const TSS_ADDRESS = "0x35A9Ab58013732d5D7b414039309599192f70565";

// ✅ ZetaEth ABI
const ZETA_ETH_ABI = [
  {
    inputs: [
      { name: "destinationAddress", type: "bytes" },
      { name: "destinationChainId", type: "uint256" },
      { name: "zetaValueAndGas", type: "uint256" },
      { name: "message", type: "bytes" }
    ],
    name: "send",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  }
] as const;

// ✅ Chain ID Map
const CHAIN_ID_MAP: Record<string, bigint> = {
  ethereum: BigInt(11155111),
  arbitrum: BigInt(421614),
  optimism: BigInt(11155420),
  base: BigInt(84532),
  bsc: BigInt(97),
  avalanche: BigInt(11112),
  zeta: BigInt(333888)
};

// Types
type BaseResponse = { message: string };
type BridgeAction = { action: "bridge"; fromChain: string; toChain: string; token: string; amount: string };
type AIResponse = BaseResponse & Partial<BridgeAction>;
type ChatMessage =
  | { role: "user"; content: { message: string } }
  | { role: "ai"; content: AIResponse };

export default function AIPage() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Load chat from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('zetaai-chat');
    if (saved) {
      try {
        setChat(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load chat');
      }
    }
  }, []);

  const saveChat = (newChat: ChatMessage[]) => {
    setChat(newChat);
    localStorage.setItem('zetaai-chat', JSON.stringify(newChat));
  };

  const getWalletContext = () => {
    // ✅ Guard: only return if address and balance exist
    if (!isConnected || !address || !balance) return null;
    return {
      wallet: {
        address,
        chain: chain?.name || "unknown",
        balances: [
          { token: "ETH", amount: parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(6) }
        ]
      }
    };
  };

  const askAI = async () => {
    if (!question.trim()) return;

    const userMsg: ChatMessage = { role: "user", content: { message: question } };
    saveChat([...chat, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const context = getWalletContext();
      const res = await fetch("http://localhost:3001/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, ...context }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AIResponse = await res.json();
      saveChat([...chat, { role: "ai", content: data }]);
    } catch (err: any) {
      console.error("AI Error:", err);
      saveChat([...chat, { role: "ai", content: { message: "Failed to reach AI." } }]);
    } finally {
      setLoading(false);
    }
  };

  const executeBridge = async (content: AIResponse) => {
    // ✅ Guard: ensure all required fields exist
    if (
      !content.action ||
      content.action !== "bridge" ||
      !content.fromChain ||
      !content.toChain ||
      !content.token ||
      !content.amount
    ) {
      alert("Incomplete bridge data.");
      return;
    }

    if (!isConnected || !address || !chain) {
      alert("Connect your wallet first.");
      return;
    }

    if (chain.id !== sepolia.id) {
      alert("Please switch to Sepolia network.");
      return;
    }

    try {
      // ✅ Safe: use wagmiConfig with type assertion (from previous fix)
      const config = wagmiConfig as any;
      const walletClient = await getWalletClient(config, { chainId: sepolia.id });
      if (!walletClient) throw new Error("Wallet client not found.");

      const destChainId = CHAIN_ID_MAP[content.toChain.toLowerCase()];
      if (!destChainId) {
        alert("Destination chain not supported.");
        return;
      }

      const amount = parseFloat(content.amount);
      if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount.");
        return;
      }

      const value = parseEther(content.amount);

      // ✅ Encode address safely
      const destinationAddress = `0x${address.slice(2).padStart(64, '0')}` as `0x${string}`;

      const data = encodeFunctionData({
        abi: ZETA_ETH_ABI,
        functionName: "send",
        args: [destinationAddress, destChainId, value, '0x']
      });

      // ✅ Send transaction
      const hash = await walletClient.sendTransaction({
        account: address, // ✅ Now safe: we checked above
        to: TSS_ADDRESS,
        data,
        value,
        chain: sepolia,
        gas: 500_000n
      });

      setTxHash(hash);
    } catch (err: any) {
      console.error("Bridge Error:", err);
      alert(err.shortMessage || err.message || "Transaction failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
      <main className="relative z-10 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-cyan-300 to-blue-100 bg-clip-text text-transparent">
            Zeta AI Advisor
          </h1>
          <p className="text-center text-blue-200 mb-6 text-sm">
            Ask about DeFi or bridge tokens across chains.
          </p>

          <div className="bg-black/20 backdrop-blur-sm border border-blue-600 rounded-xl p-3 mb-4 h-64 overflow-y-auto font-sans text-xs space-y-2">
            {chat.length === 0 && (
              <p className="text-center text-blue-300 mt-4">
                Try: "Bridge 0.0001 ETH from Ethereum to Arbitrum"
              </p>
            )}
            {chat.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-lg ${msg.role === "user" ? "bg-cyan-600 text-white" : "bg-white/10 text-gray-100"}`}>
                  {"action" in msg.content && msg.content.action === "bridge" ? (
                    <div>
                      <div>{msg.content.message}</div>
                      <div className="mt-1 text-xs">
                        <strong>🚀 {msg.content.token} {msg.content.amount}</strong>
                        <div className="text-gray-300">{msg.content.fromChain} → {msg.content.toChain}</div>
                      </div>
                      {isConnected ? (
                        <button onClick={() => executeBridge(msg.content)} className="mt-1 text-xs bg-green-600 hover:bg-green-700 px-2 py-0.5 rounded">
                          ✅ Send
                        </button>
                      ) : (
                        <button disabled className="mt-1 text-xs bg-gray-600 px-2 py-0.5 rounded">🔒 Connect</button>
                      )}
                    </div>
                  ) : (
                    <div>{msg.content.message}</div>
                  )}
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="px-3 py-2 bg-white/10 rounded text-xs">🧠 Thinking...</div></div>}
          </div>

          <div className="flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Bridge 0.0001 ETH from Ethereum to Arbitrum"
              className="flex-1 p-3 bg-white/10 border border-blue-500 rounded text-white placeholder-blue-300 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-sm"
              onKeyPress={(e) => e.key === "Enter" && question.trim() && askAI()}
            />
            <button onClick={askAI} disabled={loading || !question.trim()} className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 px-4 rounded font-medium text-sm">
              💬
            </button>
          </div>

          {isConnected && address ? (
            <p className="text-green-300 text-xs text-center mt-3">
              ✅ {address.slice(0,6)}...{address.slice(-4)}
            </p>
          ) : (
            <p className="text-yellow-300 text-xs text-center mt-3">
              🔐 Connect wallet
            </p>
          )}

          {txHash && (
            <div className="mt-4 bg-green-900/40 border border-green-600 rounded p-3 text-center">
              <strong className="text-green-300 text-xs">🚀 Sent!</strong>
              <a href={`https://explorer.zetachain.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-cyan-300 block text-xs mt-1">
                View on Explorer
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}