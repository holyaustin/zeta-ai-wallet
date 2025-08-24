// app/ai/page.tsx
'use client';

import { useAccount, useProvider } from 'wagmi';
import { useState } from 'react';
import { evmDeposit, zetachainWithdraw } from '@zetachain/toolkit';
import { ethers } from 'ethers';

export default function AIPage() {
  const { address, isConnected } = useAccount();
  const provider = useProvider();
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tx, setTx] = useState(null);

  const askAI = async () => {
    setLoading(true);
    const res = await fetch('https://zetaai-proxy-xxxx.a.run.app/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    setAiResponse(data);
    setLoading(false);
  };

  const executeBridge = async () => {
    if (!provider || !address) return;
    const signer = await provider.getSigner();

    try {
      // Step 1: Deposit to ZetaChain
      const depositTx = await evmDeposit(
        {
          amount: aiResponse.amount,
          token: aiResponse.token === 'ETH' ? ethers.constants.AddressZero : '0x...', // Simplified
          receiver: address,
        },
        { signer }
      );

      console.log('Deposit:', depositTx.hash);

      // Step 2: Withdraw to target chain
      const withdrawTx = await zetachainWithdraw(
        {
          amount: aiResponse.amount,
          zrc20: '0x57B1ef088334374773128d2879B53911f348B99b', // ZRC20 ETH
          receiver: address,
        },
        { signer }
      );

      setTx({ deposit: depositTx.hash, withdraw: withdrawTx.tx.hash });
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (!isConnected) {
    return <div className="p-6">Connect wallet first.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Zeta AI Assistant</h1>
        <p className="text-gray-600 mb-6">Ask me to move tokens between chains.</p>

        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Move 0.5 ETH from Ethereum to Arbitrum"
          className="w-full p-3 border rounded-lg mb-4"
        />
        <button
          onClick={askAI}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Asking AI...' : 'Ask AI'}
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
            <p>✅ Bridge initiated!</p>
            <p>Deposit: <a href={`https://athens3.zetachain.com/tx/${tx.deposit}`} target="_blank" className="text-blue-600">{tx.deposit}</a></p>
            <p>Withdraw: <a href={`https://arb-sepolia.blockscout.com/tx/${tx.withdraw}`} target="_blank" className="text-blue-600">{tx.withdraw}</a></p>
          </div>
        )}
      </div>
    </div>
  );
}