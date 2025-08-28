// types/zetachain-toolkit.d.ts
declare module "@zetachain/toolkit" {
  export const evmDeposit: (
    params: {
      amount: string | number;
      receiver: string;
      token?: string;
      revertOptions?: {
        revertMessage: string;
        abortAddress?: string;
        callOnRevert?: boolean;
      };
    },
    options: { signer: any }
  ) => Promise<{
    hash: string;
    wait: () => Promise<any>;
  }>;

  export const zetachainCall: (
    params: {
      receiver: string;
      function: string;
      types: string[];
      values: any[];
      zrc20: string;
      revertOptions?: {
        revertMessage: string;
        abortAddress?: string;
        callOnRevert?: boolean;
      };
    },
    options: { signer: any }
  ) => Promise<{
    gasFee: bigint;
    gasZRC20: string;
    tx: {
      hash: string;
      wait: () => Promise<any>;
    };
  }>;
}