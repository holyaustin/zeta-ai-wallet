# 🚀 Zeta-AI Wallet

> A smart, cross-chain wallet powered by **ZetaChain** and **AI** — enabling seamless interactions across any blockchain with intelligent transaction suggestions, risk analysis, and universal contract access.

---

## 🌐 Overview

**Zeta-AI Wallet** is a next-generation crypto wallet that combines:
- 🔗 **ZetaChain’s Universal Interoperability** – interact with any chain and any Dapp
- 🤖 **AI-Powered Insights** – powered by decentralized AI (Akash Network)
- 💡 **Smart Transaction Assistance** – auto-suggest gas, detect risks, explain transactions
- 🔐 **Non-Custodial & Secure** – your keys, your assets

Built for the **ZetaChain X Google Cloud Buildathon**, this wallet empowers users to **interact with cross-chain applications** like **OmniLend** with confidence and ease.

---

## 🧩 Features

✅ **Universal Cross-Chain Access**  
   - Interact with Dapps on Ethereum, Base, Arbitrum, Optimism, and more — all from one wallet

✅ **AI-Powered Transaction Insights**  
   - Get real-time suggestions using **Akash Chat API**  
   - Understand risks before signing (e.g., "This contract can drain your tokens")  
   - Auto-suggest safe borrowing limits based on collateral

✅ **ZetaChain Integration**  
   - Full support for `depositAndCall`, `onCall`, and `withdrawAndCall`  
   - Handle cross-chain messages seamlessly

✅ **Smart Contract Interaction**  
   - Deploy and interact with Universal Contracts on ZetaChain  
   - Example: Use **OmniLend** to deposit on Base and borrow on Arbitrum

✅ **Google Cloud Backend**  
   - Hosted on **Google Cloud Run**  
   - AI inference via **Akash Chat API**  
   - Fast, scalable, and secure

✅ **Open & Extensible**  
   - Built with **React, Wagmi, RainbowKit, Hardhat**  
   - Easy to fork and enhance

---

## 📸 Screenshots

> *Coming soon – add screenshots of your UI here*

---

## 🛠️ Tech Stack

| Layer | Technology |
|------|------------|
| **Frontend** | React, Next.js, Tailwind CSS |
| **Wallet** | Wagmi, RainbowKit, MetaMask SDK |
| **Blockchain** | ZetaChain, EVM Chains (Base, Arbitrum, Optimism) |
| **AI** | Akash Network (decentralized AI) |
| **Backend** | Node.js, Google Cloud Run |
| **Smart Contracts** | Solidity, Hardhat, ZetaChain SDK |
| **Deployment** | Google Cloud, Firebase, GitHub Actions |

---

## 🚀 Quick Start

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/zeta-ai-wallet.git
cd zeta-ai-wallet
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Environment Variables

Create `.env.local`:

```env
# WalletConnect / Alchemy
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id

# Akash AI API Key
NEXT_PUBLIC_AKASH_API_KEY=your_akash_api_key

# Google Cloud (optional)
GOOGLE_CLOUD_PROJECT=your-gcp-project
```

> Get Akash API Key: [https://cloud.akash.network](https://cloud.akash.network)

### 4. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🧪 Test Smart Contracts

```bash
npx hardhat test
```

Deploy to ZetaChain Testnet:

```bash
npx hardhat run scripts/deploy.js --network zetaTestnet

Deploying OmniLend to ZetaChain Testnet...
✅ OmniLend deployed to: 0x589C1494089889C077d7AbBA17B40575E961cC8c

```

---

## ☁️ Deploy to Google Cloud Run

```bash
gcloud run deploy zeta-ai-wallet \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

> ✅ Live at: `https://zeta-ai-wallet.a.run.app`

---

## 🔗 Try It Live

🌐 **[https://zeta-ai-wallet.a.run.app](https://zeta-ai-wallet.a.run.app)**

---

## 🧠 AI Features

| Feature | How It Works |
|-------|--------------|
| **Transaction Risk Analysis** | Sends calldata to Akash AI → returns "High risk: contract can transfer your ERC-20s" |
| **Borrow Limit Suggestion** | Analyzes collateral → suggests max safe borrow |
| **Gas Optimization** | Recommends low/medium/high gas based on network |
| **Dapp Explanation** | "This contract deposits ETH and borrows USDC on another chain" |

---

## 🏗️ Project Structure

```
zeta-ai-wallet/
├── frontend/          # Next.js dApp
├── contracts/         # Hardhat contracts (OmniLend, etc.)
├── scripts/           # Deploy & utils
├── backend/           # AI middleware (Node.js)
├── public/
├── .env.local.example
├── README.md
└── hardhat.config.js
```

---

## 🏆 Buildathon Submission

- **Track**: Web3 Applications & Cross-Chain Lending
- **Prize Focus**: AI + ZetaChain integration
- **Demo**: [YouTube Demo Link](#)
- **Contract**: `0x...` on ZetaChain Testnet
- **GitHub**: [github.com/your-username/zeta-ai-wallet](https://github.com/your-username/zeta-ai-wallet)

---

## 🤝 Contributing

Contributions welcome! Open an issue or PR for:
- New AI features
- More chain integrations
- UI/UX improvements
- Security audits

---

## 📄 License

MIT © [Your Name]

---

## 🧡 Support

Built with ❤️ for the **ZetaChain community**.

Have questions?  
👉 [Open an Issue](https://github.com/your-username/zeta-ai-wallet/issues)

---

> **Zeta-AI Wallet** — Where cross-chain meets intelligent interaction.  
> **Smart. Universal. Yours.**