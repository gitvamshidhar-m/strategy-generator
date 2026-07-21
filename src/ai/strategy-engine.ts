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

export interface GeneratedStrategy {
  channels: { channel: string; priority: number; budgetAllocation: number }[]
  tactics: {
    id: string
    title: string
    description: string
    reasoning: string
    effort: string
    impact: string
    estimatedROI: number
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

  const systemPrompt = `You are a growth strategy expert for agencies. Generate a JSON marketing strategy.

Return ONLY valid JSON with this structure:
{
  "channels": [
    {"channel": "STRING", "priority": NUMBER, "budgetAllocation": NUMBER}
  ],
  "tactics": [
    {"id": "STRING", "title": "STRING", "description": "STRING", "reasoning": "STRING", "effort": "STRING", "impact": "STRING", "estimatedROI": NUMBER}
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
- Mix awareness/consideration/conversion tactics
- Include high, medium, and low effort tactics`

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
