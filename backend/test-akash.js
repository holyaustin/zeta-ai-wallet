// test-akash.js
require('dotenv').config();
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://chatapi.akash.network/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.AKASH_API_KEY}`
  }
});

async function test() {
  try {
    const res = await client.post('/chat/completions', {
      model: "Qwen3-235B-A22B-Instruct-2507-FP8",
      messages: [{ role: 'user', content: 'Who are you?' }]
    });

    console.log(res.data.choices[0].message.content);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

test();