require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_KEY = process.env.GEMINI_KEY;

app.post('/ask', async (req, res) => {
  const { question } = req.body;

  const prompt = `
You are ZetaAI, a cross-chain bridge assistant.
User says: ${question}
Respond ONLY with a JSON:
{
  "action": "bridge",
  "fromChain": "ethereum" | "arbitrum" | "base",
  "toChain": "arbitrum" | "ethereum" | "base",
  "token": "ETH" | "USDC",
  "amount": "0.5"
}
Do not add any other text. Only JSON.
  `;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );
    const text = response.data.candidates[0].content.parts[0].text.trim();
    const json = JSON.parse(text.replace(/`/g, '').replace('json', ''));
    res.json(json);
  } catch (err) {
    res.status(500).json({ error: 'AI failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));