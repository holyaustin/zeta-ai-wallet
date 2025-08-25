// types/zetachain-toolkit.d.ts
declare module "@zetachain/toolkit" {
  /** -------------------------------------------------
   *  Minimal typings – only the functions you need.
   *  Feel free to extend them later.
   * ------------------------------------------------- */

  /** Parameters for an EVM‑deposit to ZetaChain */
  export interface EvmDepositParams {
    /** Amount expressed in the token’s smallest unit (e.g. wei) */
    amount: string | number;
    /** ZetaChain address that will receive the funds */
    receiver: string;
    /** ERC‑20 token address on the origin chain (omit for native ETH) */
    token?: string;
    /** Optional revert‑options (same shape as the SDK) */
    revertOptions?: {
      abortAddress?: string;
      callOnRevert?: boolean;
      onRevertGasLimit?: string | number | bigint;
      revertMessage?: string;
    };
  }

  /** Parameters for a cross‑chain call from ZetaChain */
  export interface ZetachainCallParams {
    /** Contract address you want to call on the destination chain */
    receiver: string;
    /** Solidity function signature, e.g. `"onDeposit(address,uint256)"` */
    function: string;
    /** Array of Solidity type strings, e.g. `["address","uint256"]` */
    types: string[];
    /** Array of values that correspond to the types above */
    values: (string | number | boolean)[];
    /** ZRC‑20 token address on ZetaChain (the asset you’re paying gas with) */
    zrc20: string;
    /** Optional revert‑options */
    revertOptions?: {
      abortAddress?: string;
      callOnRevert?: boolean;
      onRevertGasLimit?: string | number | bigint;
      revertMessage?: string;
    };
  }

  /** Transaction response returned by the toolkit */
  export interface TxResponse {
    /** Transaction hash */
    hash: string;
    /** Helper that resolves once the transaction is mined */
    wait: () => Promise<any>;
  }

  /** -------------------------------------------------
   *  Exported functions (the ones you use in the UI)
   * ------------------------------------------------- */

  /** Deposit a token (or native ETH) from an EVM chain into ZetaChain */
  export function evmDeposit(
    params: EvmDepositParams,
    options: { signer: any; gateway?: string }
  ): Promise<TxResponse>;

  /** Call a contract on a destination chain from a ZetaChain universal contract */
  export function zetachainCall(
    params: ZetachainCallParams,
    options: { signer: any; gateway?: string }
  ): Promise<{
    /** Total gas fee (in the native token of the source chain) */
    gasFee: bigint;
    /** The ZRC‑20 token used to pay the fee */
    gasZRC20: string;
    /** Transaction object with hash + wait() */
    tx: TxResponse;
  }>;
}