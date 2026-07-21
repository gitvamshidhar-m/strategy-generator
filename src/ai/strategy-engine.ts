"use server"

const GROQ_API_KEY = process.env.GROQ_API_KEY

async function groqChat(system: string, user: string, temp = 0.7, jsonMode = true): Promise<string> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY environment variable is not set")
  const body: any = { model: "llama-3.3-70b-versatile", messages: [{ role: "system", content: system }, { role: "user", content: user }], temperature: temp }
  if (jsonMode) body.response_format = { type: "json_object" }
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Groq API error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.choices[0].message.content
}

export interface StrategyInput {
  industry: string
  currentChannels: string[]
  monthlyBudget: number
  primaryGoal: string
  targetAudience?: string
  businessStage?: string
  teamSize?: string
  targetCPA?: number
  targetROAS?: number
  targetConversionRate?: number
  strategyStyle?: string
  competitors?: string
}

export interface FunnelTactic {
  id: string
  title: string
  description: string
  reasoning: string
  effort: string
  impact: string
  estimatedROI: number
  channel: string
  steps?: string[]
}

export interface FunnelStage {
  stage: "awareness" | "consideration" | "conversion" | "loyalty"
  label: string
  goal: string
  tactics: FunnelTactic[]
}

export interface GeneratedStrategy {
  channels: { channel: string; priority: number; budgetAllocation: number }[]
  funnel: FunnelStage[]
  tactics: {
    id: string
    title: string
    description: string
    reasoning: string
    effort: string
    impact: string
    estimatedROI: number
    channel: string
    steps?: string[]
  }[]
  timeline: { phases: { name: string; duration: number; tactics: string[] }[] }
  reasoning: string
  estimatedROI: number
  benchmarks?: { metric: string; yourValue: string; industryAvg: string; unit: string }[]
  channelRoadmap?: { month: number; channels: { name: string; action: string }[] }[]
}

const tacticFields = `{"id": "STRING", "title": "STRING", "description": "STRING (2-3 sentences)", "reasoning": "STRING", "effort": "LOW|MEDIUM|HIGH", "impact": "LOW|MEDIUM|HIGH", "estimatedROI": NUMBER, "channel": "STRING", "steps": ["Step 1...", "Step 2...", "Step 3..."]}`

export async function generateGrowthStrategy(input: StrategyInput): Promise<GeneratedStrategy> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY environment variable is not set")

  const styleGuide: Record<string, string> = {
    aggressive: "Recommend bolder moves: higher budgets on PPC/Paid Social, faster scaling, 3-4 tactics per stage. Higher risk but higher potential return.",
    conservative: "Recommend safer moves: focus on organic channels (SEO/Content/Email), lower ad spend, 1-2 tactics per stage. Lower risk, steady growth.",
    balanced: "Mix of paid and organic channels, moderate scaling, 2-3 tactics per stage. Balanced risk and return.",
  }

  const systemPrompt = `You are a growth strategy expert for agencies. Generate a JSON marketing strategy.

Strategy style: ${input.strategyStyle || "balanced"}
${styleGuide[input.strategyStyle || "balanced"]}

Return ONLY valid JSON with this structure:
{
  "channels": [ {"channel": "STRING", "priority": NUMBER (1-5), "budgetAllocation": NUMBER (percentage)} ],
  "funnel": [
    {"stage": "awareness", "label": "Awareness", "goal": "STRING", "tactics": [${tacticFields}]},
    {"stage": "consideration", "label": "Consideration", "goal": "STRING", "tactics": [${tacticFields}]},
    {"stage": "conversion", "label": "Conversion", "goal": "STRING", "tactics": [${tacticFields}]},
    {"stage": "loyalty", "label": "Loyalty", "goal": "STRING", "tactics": [${tacticFields}]}
  ],
  "tactics": [${tacticFields}],
  "timeline": {"phases": [{"name": "STRING", "duration": NUMBER (weeks), "tactics": ["tactic_id"]}]},
  "reasoning": "STRING",
  "estimatedROI": NUMBER,
  "benchmarks": [{"metric": "STRING", "yourValue": "STRING (number only, no symbols like $ or %) ", "industryAvg": "STRING (number only, no symbols)", "unit": "STRING ($ or % or x)"}],
  "channelRoadmap": [{"month": NUMBER, "channels": [{"name": "STRING", "action": "start|scale|optimize"}]}]
}

Constraints:
- Allocate 100% budget across channels
- Each tactic MUST have "steps" array with 3-5 actionable execution steps
- Include benchmarks comparing this strategy's expected performance to industry averages
- Include a 6-month channel roadmap showing when to start/scale/optimize each channel`

  const kpiSection = [
    input.targetCPA ? `Target CPA: $${input.targetCPA}` : "",
    input.targetROAS ? `Target ROAS: ${input.targetROAS}x` : "",
    input.targetConversionRate ? `Target Conversion Rate: ${input.targetConversionRate}%` : "",
  ].filter(Boolean).join("\n")

  const userPrompt = `Client Profile:
Industry: ${input.industry}
Current Channels: ${input.currentChannels.join(", ") || "None"}
Monthly Budget: $${input.monthlyBudget}
Primary Goal: ${input.primaryGoal}
Target Audience: ${input.targetAudience || "Not specified"}
Business Stage: ${input.businessStage || "Not specified"}
Team Size: ${input.teamSize || "Not specified"}
Strategy Style: ${input.strategyStyle || "balanced"}
${input.competitors ? `Competitors to analyze: ${input.competitors}` : ""}
${kpiSection ? `\nKPI Targets:\n${kpiSection}` : ""}

Generate a comprehensive growth strategy as JSON.`

  try {
    const content = await groqChat(systemPrompt, userPrompt)
    return JSON.parse(content)
  } catch (error) {
    console.error("Error generating strategy:", error)
    throw new Error("Failed to generate growth strategy")
  }
}

export async function regenerateStage(input: StrategyInput, existingStrategy: GeneratedStrategy, stageToRegen: string): Promise<FunnelStage> {
  const systemPrompt = `You are a growth strategy expert. Given an existing strategy, regenerate ONLY the "${stageToRegen}" funnel stage.

Return ONLY valid JSON with this structure:
{
  "stage": "${stageToRegen}",
  "label": "STRING",
  "goal": "STRING",
  "tactics": [${tacticFields}]
}

Provide 1-3 new tactics for this stage. Do NOT repeat the existing tactic IDs. Each tactic must have 3-5 execution steps.`

  const userPrompt = `Industry: ${input.industry}, Budget: $${input.monthlyBudget}, Goal: ${input.primaryGoal}
Existing channels: ${input.currentChannels.join(", ") || "None"}
Regenerate stage: ${stageToRegen}`

  const content = await groqChat(systemPrompt, userPrompt)
  return JSON.parse(content)
}

export async function chatWithStrategy(strategy: GeneratedStrategy, form: any, message: string): Promise<string> {
  try {
    const details = (strategy.funnel || []).map((s: any) =>
      `${s.label}: ${(s.tactics || []).map((t: any) => t.title).join(", ")}`
    ).join("\n")

    const system = `You are a strategy consultant. The user has a marketing strategy and is asking about it.
  Return ONLY valid JSON with one field "reply" containing your answer (2-3 sentences).`

    const user = `Strategy for ${form.industry} ($${form.budget}/mo, ${form.goal})
  Channels: ${(strategy.channels || []).map((c: any) => `${c.channel} ${c.budgetAllocation}%`).join(", ")}
  ${details}

  User question: ${message}`

    const content = await groqChat(system, user, 0.5)
    const parsed = JSON.parse(content)
    return parsed.reply || parsed.response || content
  } catch (err: any) {
    return `⚠️ ${err.message || "Request failed"}. Please try a simpler question.`
  }
}

export async function generateSWOT(industry: string, competitors: string, strategy: GeneratedStrategy): Promise<{ strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] }> {
  const system = `You are a strategy analyst. Given a strategy and competitor info, generate a SWOT analysis. Return ONLY valid JSON:
{
  "strengths": ["STRING", ...],
  "weaknesses": ["STRING", ...],
  "opportunities": ["STRING", ...],
  "threats": ["STRING", ...]
}`
  const user = `Industry: ${industry}
Competitors: ${competitors}
Strategy channels: ${strategy.channels?.map((c: any) => c.channel).join(", ") || "N/A"}
Total budget allocation tactics.`
  const content = await groqChat(system, user, 0.5)
  return JSON.parse(content)
}
