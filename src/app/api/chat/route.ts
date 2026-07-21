import { NextResponse } from "next/server"

const GROQ_API_KEY = process.env.GROQ_API_KEY

export async function POST(req: Request) {
  try {
    const { strategy, form, message } = await req.json()
    if (!GROQ_API_KEY) return NextResponse.json({ error: "API key not configured" }, { status: 500 })

    const q = message.toLowerCase()

    // RAG: search relevant data from strategy
    const matchedTactics = (strategy?.funnel || []).flatMap((s: any) =>
      (s.tactics || []).filter((t: any) =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.channel?.toLowerCase().includes(q) ||
        t.impact?.toLowerCase() === q ||
        t.effort?.toLowerCase() === q ||
        s.stage === q
      )
    )

    const relevantChannels = (strategy?.channels || []).filter((c: any) =>
      c.channel?.toLowerCase().includes(q) || q.includes(c.channel?.toLowerCase() || "")
    )

    // Build context
    const context = [
      `Industry: ${form?.industry} | Budget: $${form?.budget}/mo | Goal: ${form?.goal} | Style: ${form?.strategyStyle || "balanced"}`,
      `Est. ROI: ${strategy?.estimatedROI || "N/A"}%`,
      `\nChannels:`,
      ...(relevantChannels.length > 0 ? relevantChannels : strategy?.channels || []).map((c: any) =>
        `  ${c.channel}: ${c.budgetAllocation}% budget (priority ${c.priority}/5)`
      ),
      matchedTactics.length > 0 ? `\nRelevant tactics found:` : "",
      ...matchedTactics.slice(0, 5).map((t: any) =>
        `  - ${t.title} (${t.channel || "multi"}): ${t.description} | Impact: ${t.impact} | Effort: ${t.effort} | ROI: ${t.estimatedROI || "N/A"}%`
      ),
    ].filter(Boolean).join("\n")

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a strategy consultant. Use the context provided to answer the user's question. If the context lacks relevant data, say so. Keep answers to 2-3 sentences. Be specific and reference actual numbers." },
          { role: "user", content: `${context}\n\nUser question: ${message}\n\nAnswer based on the context above:` },
        ],
        temperature: 0.3,
      }),
    })

    if (!res.ok) return NextResponse.json({ error: `API error: ${res.status}` }, { status: 502 })

    const data = await res.json()
    return NextResponse.json({ reply: data.choices?.[0]?.message?.content || "No response" })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
