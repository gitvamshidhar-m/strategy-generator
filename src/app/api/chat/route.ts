const GROQ_API_KEY = process.env.GROQ_API_KEY

export async function POST(req: Request) {
  try {
    const { strategy, form, message } = await req.json()
    if (!GROQ_API_KEY) return Response.json({ error: "API key not configured" }, { status: 500 })
    if (!message) return Response.json({ error: "Message is required" }, { status: 400 })

    const details = (strategy?.funnel || []).map((s: any) =>
      `${s.label}: ${(s.tactics || []).map((t: any) => t.title).join(", ")}`
    ).join("\n")

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a strategy consultant. Answer the user's question about their marketing strategy. Be specific and concise (2-3 sentences)." },
          { role: "user", content: `Strategy for ${form?.industry} ($${form?.budget}/mo, ${form?.goal})
Channels: ${(strategy?.channels || []).map((c: any) => `${c.channel} ${c.budgetAllocation}%`).join(", ") || "N/A"}
${details}

Question: ${message}` },
        ],
        temperature: 0.5,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      return Response.json({ error: `Groq API error: ${res.status} ${errText.slice(0, 200)}` }, { status: 502 })
    }

    const data = await res.json()
    return Response.json({ reply: data.choices?.[0]?.message?.content || "No response" })
  } catch (err: any) {
    return Response.json({ error: err.message || "Unknown error" }, { status: 500 })
  }
}
