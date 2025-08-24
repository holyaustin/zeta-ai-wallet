require(dotenv).config();
const express = require(express);
const cors = require(cors);
const axios = require(axios);

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_KEY = process.env.GEMINI_KEY;

app.post(/ask, async (req, res) = {
  const { question } = req.body;

  const prompt = `
You are ZetaAI, a cross-chain bridge assistant.
User says: "${question}"
Respond ONLY with a JSON:
{
  "fromChain": "ethereum" | "solana" | "sui",
  "toChain": "arbitrum" | "polygon" | "base" | "solana" | "sui",
  "token": "USDC" | "ETH" | "SOL" | "SUI",
  "amount": "100",
  "receiver": "0x... or solana address"
}
Do not explain. Do not add text. Only JSON.
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );
    const text = response.data.candidates[0].content.parts[0].text.trim();
    const json = JSON.parse(text);
    res.json(json);
  } catch (err) {
    res.status(500).json({ error: Failed to parse AI response });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () = console.log(`Server running on ${PORT}`));