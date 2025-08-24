import {
  evmDeposit,
  zetachainWithdraw,
  solanaDeposit,
  suiDeposit,
} from @zetachain/toolkit;
import { ethers } from ethers;

export const getSigner = (provider: any) = {
  return provider ? new ethers.BrowserProvider(provider).getSigner() : null;
};

// Bridge USDC from Ethereum → Arbitrum
export const bridgeEvmToEvm = async (
  amount: string,
  token: string,
  fromSigner: any,
  receiver: string
) = {
  // Step 1: Deposit to ZetaChain
  const depositTx = await evmDeposit(
    {
      amount,
      token,
      receiver, // your universal address
    },
    { signer: fromSigner }
  );

  console.log(Deposited to ZetaChain:, depositTx.hash);

  // Step 2: Withdraw to Arbitrum
  const withdrawTx = await zetachainWithdraw(
    {
      amount,
      zrc20: 0x57B1ef088334374773128d2879B53911f348B99b, // ZRC20 USDC
      receiver,
    },
    { signer: fromSigner }
  );

  return { depositTx, withdrawTx };
};