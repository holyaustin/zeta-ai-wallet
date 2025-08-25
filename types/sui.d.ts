/* types/sui.d.ts */
declare module '@mysten/sui.js' {
  // Export the SuiClient type that the real package provides.
  // We use `any` here because we only need the compiler to accept the import.
  // The real runtime implementation is still loaded from node_modules.
  export class SuiClient {
    constructor(options: { url: string });
    // The most‑common method you’ll use – you can add more signatures if you wish.
    getCoins(args: { owner: string }): Promise<any>;
    // Add other methods as needed, e.g. `signAndExecuteTransactionBlock`, etc.
    // All of them can be typed as `any` – the SDK works at runtime.
    [key: string]: any;
  }
}