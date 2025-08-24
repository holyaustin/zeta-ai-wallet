use client;

import { useAccount, useProvider } from wagmi;
import { useState } from react;
import { askGemini } from ../lib/gemini;
import { bridgeEvmToEvm } from ../lib/zeta;

export default function Home() {
  const { address, isConnected } = useAccount();
  const provider = useProvider();
  const [question, setQuestion] = useState();
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tx, setTx] = useState<any>(null);

  const handleAsk = async () = {
    setLoading(true);
    try {
      const response = await askGemini(question);
      setAiResponse(response);
    } catch (err) {
      alert("AI parsing failed");
    }
    setLoading(false);
  };

  const handleBridge = async () = {
    if (!provider || !address) return;

    const signer = await provider.getSigner();

    try {
      const result = await bridgeEvmToEvm(
        aiResponse.amount,
        aiResponse.token,
        signer,
        address
      );
      setTx(result);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">ZetaAI Bridge</h1>
      <p className="text-gray-600 mb-8">
        Ask AI to move tokens between any chain.
      </p>

      {isConnected && <p className="mb-4">Wallet: {address}</p>}

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder='Move 100 USDC from Ethereum to Arbitrum'
        className="w-full p-3 border rounded-lg mb-4"
      />
      <button
        onClick={handleAsk}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Asking AI...' : 'Ask AI'}
      </button>

      {aiResponse && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold">AI Response:</h3>
          <pre className="text-sm mt-2">{JSON.stringify(aiResponse, null, 2)}</pre>
          <button
            onClick={handleBridge}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg text-sm"
          >
            Execute Bridge
          </button>
        </div>
      )}

      {tx && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p>✅ Bridge initiated!</p>
          <p>Deposit: <a href={`https://athens3.zetachain.com/tx/${tx.depositTx.hash}`} target="_blank" className="text-blue-600">{tx.depositTx.hash}</a></p>
          <p>Withdraw: <a href={`https://arb-sepolia.blockscout.com/tx/${tx.withdrawTx.tx.hash}`} target="_blank" className="text-blue-600">{tx.withdrawTx.tx.hash}</a></p>
        </div>
      )}
    </div>
  );
}