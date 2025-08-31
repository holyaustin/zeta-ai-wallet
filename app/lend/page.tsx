// app/lend/page.tsx
"use client";

import { useAccount, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { WalletButton } from "../components/WalletButton";
import { useState } from "react";
import { baseSepolia } from "wagmi/chains";

// 🔧 Replace with your deployed contract address
const OMNI_LEND_ADDRESS = "0x589C1494089889C077d7AbBA17B40575E961cC8c";
const OMNI_LEND_ABI = [
  {
    name: "borrow",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "zrc20Asset", type: "address" },
      { name: "destChainId", type: "uint256" },
      { name: "receiver", type: "bytes" },
      { name: "gasLimit", type: "uint256" },
      { name: "isArbitraryCall", type: "bool" },
    ],
    outputs: [],
  },
] as const;

// 🔗 Chain IDs
const BASE_SEPOLIA = 84532n;
const ZRC20_WETH = "0x5772c0e91daa3aa9739691ccb1631a528957666d";

export default function LendPage() {

  const { switchChain } = useSwitchChain();
  const BASE_SEPOLIA_ID = baseSepolia;
  const [isSwitching, setIsSwitching] = useState(false);

  const { chain, address, isConnected } = useAccount();
  const { writeContract, data: hash, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [borrowAmount, setBorrowAmount] = useState<string>("0.00001");
/**    if (chain && chain.id !== BASE_SEPOLIA_ID.id) {
    return (
      <div className="text-center p-8">
        <p className="text-yellow-400 mb-4">
          Please switch to Base Sepolia
        </p>
        <button
          onClick={() => switchChain({ chainId: BASE_SEPOLIA_ID.id })}
          className="bg-purple-600 px-6 py-2 rounded-lg"
        >
          Switch to Base Sepolia
        </button>
      </div>
    );
  }
 */

  const borrow = () => {
    if (!address) return;

    const receiver = `0x${address.slice(2).padStart(64, "0")}`; // bytes32

    writeContract({
      address: OMNI_LEND_ADDRESS,
      abi: OMNI_LEND_ABI,
      functionName: "borrow",
      args: [
        BigInt(Math.floor(Number(borrowAmount) * 1e18)), // amount
        ZRC20_WETH,
        BASE_SEPOLIA,
        `0x${receiver}`, // receiver
        BigInt(500000), // gasLimit
        false, // isArbitraryCall
      ],
    });
  };

   // 🔁 If connected but wrong chain → show switch prompt
  if (isConnected && chain && chain.id !== BASE_SEPOLIA_ID.id) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-center">OmniLend – Cross-Chain Lending</h1>

          <div className="max-w-md mx-auto bg-zinc-900 p-8 rounded-2xl border border-zinc-800 text-center">
            <h3 className="text-lg font-medium text-yellow-400 mb-4">Wrong Network</h3>
            <p className="text-zinc-300 mb-6">
              Please switch to <strong>Base Sepolia</strong> to use OmniLend.
              </p>
            <button
              onClick={async () => {
                setIsSwitching(true);
                try {
                  await switchChain({ chainId: BASE_SEPOLIA_ID.id });
                } finally {
                  setIsSwitching(false);
                }
              }}
              disabled={isSwitching}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-70 px-4 py-2 rounded-lg font-medium transition"
            >
              {isSwitching ? "Switching..." : "Switch to Base Sepolia"}
            </button>
           
          </div>
        </div>
      </div>
    );
  }

  // ✅ If connected and on correct chain → show borrow form
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">OmniLend – Cross-Chain Lending</h1>

        <div className="max-w-md mx-auto bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
          <WalletButton/>

          {isConnected && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-zinc-400 text-sm mb-1">Borrow ETH on Base Sepolia</label>
                <input
                  type="number"
                  step="0.00001"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500"
                  placeholder="0.00005"
                />
              </div>

              <button
                onClick={borrow}
                disabled={!writeContract || isConfirming}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition"
              >
                {isConfirming ? "Confirming..." : "Borrow on Base"}
              </button>

              {hash && (
                <div className="text-sm text-zinc-400 mt-2 break-all">
                  Tx: <a href={`https://sepolia.basescan.org/tx/${hash}`} target="_blank" className="text-purple-400 hover:underline">
                    {hash.slice(0, 6)}...{hash.slice(-4)}
                  </a>
                </div>
              )}
              {isConfirmed && <div className="text-green-400 mt-2">✅ Borrow successful!</div>}
              {error && <div className="text-red-400 mt-2">Error: {(error as Error).message}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}