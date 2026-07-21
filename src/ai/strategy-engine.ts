"use server"

const GROQ_API_KEY = process.env.GROQ_API_KEY

export interface StrategyInput {
  industry: string
  currentChannels: string[]
  monthlyBudget: number
  primaryGoal: string
  targetAudience?: string
  businessStage?: string
  teamSize?: string
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
  }[]
  timeline: { phases: { name: string; duration: number; tactics: string[] }[] }
  reasoning: string
  estimatedROI: number
}

export async function generateGrowthStrategy(
  input: StrategyInput
): Promise<GeneratedStrategy> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is not set")
  }

  const systemPrompt = `You are a growth strategy expert for agencies. Generate a JSON marketing strategy organized by marketing funnel stages.

Return ONLY valid JSON with this structure:
{
  "channels": [
    {"channel": "STRING", "priority": NUMBER, "budgetAllocation": NUMBER}
  ],
  "funnel": [
    {
      "stage": "awareness",
      "label": "Awareness",
      "goal": "string describing what this stage aims to achieve for this client",
      "tactics": [
        {"id": "STRING", "title": "STRING", "description": "STRING", "reasoning": "STRING", "effort": "LOW|MEDIUM|HIGH", "impact": "LOW|MEDIUM|HIGH", "estimatedROI": NUMBER, "channel": "STRING"}
      ]
    },
    {
      "stage": "consideration",
      "label": "Consideration",
      "goal": "string",
      "tactics": [...]
    },
    {
      "stage": "conversion",
      "label": "Conversion",
      "goal": "string",
      "tactics": [...]
    },
    {
      "stage": "loyalty",
      "label": "Loyalty",
      "goal": "string",
      "tactics": [...]
    }
  ],
  "tactics": [
    {"id": "STRING", "title": "STRING", "description": "STRING", "reasoning": "STRING", "effort": "STRING", "impact": "STRING", "estimatedROI": NUMBER, "channel": "STRING"}
  ],
  "timeline": {
    "phases": [
      {"name": "STRING", "duration": NUMBER, "tactics": ["STRING"]}
    ]
  },
  "reasoning": "STRING",
  "estimatedROI": NUMBER
}

Constraints:
- Allocate 100% budget across at least 3 channels
- Include at least 1-2 tactics per funnel stage (4 stages total)
- Include high, medium, and low effort tactics
- Each tactic must have a "channel" field specifying which channel it belongs to`

  const userPrompt = `Client Profile:
Industry: ${input.industry}
Current Channels: ${input.currentChannels.join(", ") || "None"}
Monthly Budget: $${input.monthlyBudget}
Primary Goal: ${input.primaryGoal}
Target Audience: ${input.targetAudience || "Not specified"}
Business Stage: ${input.businessStage || "Not specified"}
Team Size: ${input.teamSize || "Not specified"}

Generate a comprehensive growth strategy as JSON.`

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Groq API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    return JSON.parse(data.choices[0].message.content)
  } catch (error) {
    console.error("Error generating strategy:", error)
    throw new Error("Failed to generate growth strategy")
  }
}
