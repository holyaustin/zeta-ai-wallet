// app/api/ai/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  try {
    const response = await fetch("https://chat-api.akash.network/api/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AKASH_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || "No response";

    return NextResponse.json({ text: aiMessage });
  } catch (err) {
    return NextResponse.json({ text: "AI service temporarily down." }, { status: 500 });
  }
}