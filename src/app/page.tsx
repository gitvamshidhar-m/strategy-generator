"use client"

import { useState } from "react"
import { INDUSTRIES } from "@/data/tactics"
import { Channel } from "@/types"
import { generateGrowthStrategy } from "@/ai/strategy-engine"
import { Loader2, Sparkles, RotateCcw } from "lucide-react"

const channels = [
  { value: Channel.SEO, label: "SEO" },
  { value: Channel.PPC, label: "PPC" },
  { value: Channel.SOCIAL, label: "Social" },
  { value: Channel.EMAIL, label: "Email" },
  { value: Channel.CONTENT, label: "Content" },
  { value: Channel.PAID_SOCIAL, label: "Paid Social" },
  { value: Channel.INFLUENCER, label: "Influencer" },
  { value: Channel.AFFILIATE, label: "Affiliate" },
  { value: Channel.SMS, label: "SMS" },
  { value: Channel.DISPLAY, label: "Display" },
]

export default function Home() {
  const [industry, setIndustry] = useState("saas")
  const [budget, setBudget] = useState(10000)
  const [goal, setGoal] = useState("growth")
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const toggleChannel = (value: string) => {
    setSelectedChannels((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    )
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedChannels.length === 0) {
      setError("Select at least one channel")
      return
    }
    setError("")
    setIsLoading(true)
    try {
      const res = await generateGrowthStrategy({
        industry,
        currentChannels: selectedChannels,
        monthlyBudget: budget,
        primaryGoal: goal,
      })
      setResult(res)
    } catch (err: any) {
      setError(err.message || "Failed to generate strategy")
    } finally {
      setIsLoading(false)
    }
  }

  const funnelIcons: Record<string, string> = {
    awareness: "🔍",
    consideration: "⚖️",
    conversion: "🎯",
    loyalty: "❤️",
  }

  const funnelColors: Record<string, string> = {
    awareness: "border-t-blue-400",
    consideration: "border-t-amber-400",
    conversion: "border-t-green-400",
    loyalty: "border-t-purple-400",
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Your Growth Strategy</h1>
            <button onClick={() => { setResult(null); setError("") }} className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition">
              <RotateCcw size={16} /> New Strategy
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <p className="text-gray-700 mb-4">{result.reasoning}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Budget Allocation</h3>
                {result.channels?.map((c: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm mb-1">
                    <span>{c.channel}</span><span className="font-medium">{c.budgetAllocation}%</span>
                  </div>
                ))}
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Metrics</h3>
                <p className="text-sm">Total Tactics: <span className="font-medium">{result.tactics?.length || 0}</span></p>
                <p className="text-sm">Est. ROI: <span className="font-medium text-green-600">{result.estimatedROI?.toFixed(1)}%</span></p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Funnel Coverage</h3>
                {result.funnel?.map((fs: any) => (
                  <p key={fs.stage} className="text-sm">{funnelIcons[fs.stage]} {fs.label}: {fs.tactics?.length || 0} tactics</p>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {result.funnel?.map((stage: any) => (
              <div key={stage.stage} className={`bg-white rounded-xl shadow-lg border-t-4 ${funnelColors[stage.stage]} overflow-hidden`}>
                <div className="p-6 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{funnelIcons[stage.stage]}</span>
                    <h2 className="text-xl font-bold">{stage.label}</h2>
                  </div>
                  <p className="text-sm text-gray-500 italic">{stage.goal}</p>
                </div>
                {stage.tactics?.map((t: any) => {
                  const impactColor = t.impact === "HIGH" ? "bg-green-100 text-green-800" : t.impact === "MEDIUM" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                  const effortColor = t.effort === "LOW" ? "bg-blue-100 text-blue-800" : t.effort === "MEDIUM" ? "bg-orange-100 text-orange-800" : "bg-red-100 text-red-800"
                  return (
                    <div key={t.id} className="mx-6 mb-4 p-4 border rounded-lg hover:shadow transition">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="font-semibold">{t.title}</h3>
                          {t.channel && <span className="text-xs text-gray-400">{t.channel}</span>}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${impactColor}`}>{t.impact}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${effortColor}`}>{t.effort}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{t.description}</p>
                      <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded mt-2">{t.reasoning}</p>
                      <p className="text-xs text-gray-400 mt-1">ROI: {t.estimatedROI?.toFixed(1)}%</p>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Growth Strategy Generator</h1>
          <p className="text-gray-600">Personalized marketing strategies powered by Groq AI</p>
        </div>
        <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              {INDUSTRIES.map((ind) => (
                <option key={ind.id} value={ind.id}>{ind.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget ($)</label>
            <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} min={1000} step={1000} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Goal</label>
            <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="awareness">Brand Awareness</option>
              <option value="leads">Generate Leads</option>
              <option value="sales">Drive Sales</option>
              <option value="retention">Customer Retention</option>
              <option value="growth">Overall Growth</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Channels</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {channels.map((ch) => {
                const isSelected = selectedChannels.includes(ch.value)
                return (
                  <button key={ch.value} type="button" onClick={() => toggleChannel(ch.value)}
                    className={`p-2 rounded-lg border-2 text-sm font-medium transition ${isSelected ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"}`}>
                    {ch.label}
                  </button>
                )
              })}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {isLoading ? <><Loader2 className="animate-spin" size={20} /> Generating...</> : <><Sparkles size={20} /> Generate Strategy</>}
          </button>
        </form>
        <p className="text-center text-gray-400 text-sm mt-6">Powered by Groq Llama 3.3 70B</p>
      </div>
    </div>
  )
}
