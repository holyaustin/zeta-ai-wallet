// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

if (!process.env.AKASH_API_KEY) {
  console.error('❌ Missing AKASH_API_KEY in .env');
  process.exit(1);
}

const akashClient = axios.create({
  baseURL: 'https://chatapi.akash.network/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.AKASH_API_KEY}`
  }
});

// Manual retry
async function postWithRetry(client, url, data, config, maxRetries = 2) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await client.post(url, data, config);
    } catch (error) {
      if (i === maxRetries) throw error;
      console.log(`Attempt ${i + 1} failed:`, error.code || error.message);
      await new Promise(resolve => setTimeout(resolve, 1500 * (i + 1)));
    }
  }
}

const VALID_CHAINS = ['ethereum', 'arbitrum', 'optimism', 'base', 'bsc', 'avalanche'];
const VALID_TOKENS = ['ETH', 'WETH', 'USDC', 'USDT', 'DAI'];

const normalizeChain = (chain) => {
  const map = { eth: 'ethereum', arb: 'arbitrum', op: 'optimism', avax: 'avalanche' };
  const normalized = (map[chain.toLowerCase()] || chain).toLowerCase();
  return VALID_CHAINS.includes(normalized) ? normalized : null;
};

app.post('/ask', async (req, res) => {
  const { question, context } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length < 1) {
    return res.json({ message: 'Please ask a question.' });
  }

  const wallet = context?.wallet || null;

  try {
    const systemPrompt = `
You are ZetaAI, a cross-chain assistant powered by ZetaChain.
When user wants to bridge, respond ONLY with this JSON:

\`\`\`json
{
  "action": "bridge",
  "fromChain": "ethereum" | "arbitrum" | "optimism" | "base" | "bsc" | "avalanche",
  "toChain": "arbitrum" | "ethereum" | "optimism" | "base" | "bsc" | "avalanche",
  "token": "ETH" | "WETH" | "USDC" | "USDT" | "DAI",
  "amount": "0.0001"
}
\`\`\`

Rules:
- Only include this JSON if ALL fields are clearly specified.
- If any field is missing, respond with a message asking for it.
- NEVER add explanations or markdown.
- Return ONLY the JSON object.
- For all other questions, respond with { "message": "..." }.
    `;

    const messages = [{ role: 'system', content: systemPrompt }];

    if (wallet) {
      const balanceSummary = wallet.balances
        .map(b => `${parseFloat(b.amount).toFixed(6)} ${b.token} on ${b.chain}`)
        .join(', ');
      messages.push({
        role: 'system',
        content: `User wallet: ${wallet.address} on ${wallet.chain}. Balances: ${balanceSummary}.`
      });
    }

    messages.push({ role: 'user', content: question });

    const response = await postWithRetry(akashClient, '/chat/completions', {
      model: 'Qwen3-235B-A22B-Instruct-2507-FP8',
      messages,
      temperature: 0.4,
      max_tokens: 512
    }, { timeout: 10000 });

    const rawText = response.data.choices?.[0]?.message?.content?.trim();
    if (!rawText) return res.json({ message: "No AI response." });

    // Try to parse JSON
    let parsed;
    try {
      const jsonStr = rawText.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      return res.json({ message: rawText }); // Fallback to message
    }

    // Validate bridge
    if (parsed.action === 'bridge') {
      const { fromChain, toChain, token, amount } = parsed;
      if (
        VALID_CHAINS.includes(fromChain?.toLowerCase()) &&
        VALID_CHAINS.includes(toChain?.toLowerCase()) &&
        VALID_TOKENS.includes(token) &&
        amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0
      ) {
        return res.json({
          action: 'bridge',
          fromChain: fromChain.toLowerCase(),
          toChain: toChain.toLowerCase(),
          token,
          amount: String(amount)
        });
      }
    }

    res.json({ message: rawText });

  } catch (err) {
    console.error('AI Error:', err.message);
    res.json({ message: 'Failed to process request.' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ ZetaAI Backend running on http://localhost:${PORT}`);
});