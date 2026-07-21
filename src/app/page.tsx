"use client"

import { useState, useRef } from "react"
import { INDUSTRIES } from "@/data/tactics"
import { Channel } from "@/types"
import { generateGrowthStrategy } from "@/ai/strategy-engine"
import { Loader2, Sparkles, RotateCcw, Download, BarChart3, Calendar, ChevronRight, Target, TrendingUp, Users, DollarSign, Smartphone } from "lucide-react"

const channels = [
  { value: Channel.SEO, label: "SEO" }, { value: Channel.PPC, label: "PPC" },
  { value: Channel.SOCIAL, label: "Social" }, { value: Channel.EMAIL, label: "Email" },
  { value: Channel.CONTENT, label: "Content" }, { value: Channel.PAID_SOCIAL, label: "Paid Social" },
  { value: Channel.INFLUENCER, label: "Influencer" }, { value: Channel.AFFILIATE, label: "Affiliate" },
  { value: Channel.SMS, label: "SMS" }, { value: Channel.DISPLAY, label: "Display" },
]

const funnelMeta: Record<string, { label: string; icon: string; headBg: string; headBorder: string; stageBg: string; stageBorder: string; desc: string }> = {
  awareness: { label: "Awareness", icon: "🔍", headBg: "bg-blue-50", headBorder: "border-blue-200", stageBg: "bg-blue-50", stageBorder: "border-blue-200", desc: "Top of funnel" },
  consideration: { label: "Consideration", icon: "⚖️", headBg: "bg-amber-50", headBorder: "border-amber-200", stageBg: "bg-amber-50", stageBorder: "border-amber-200", desc: "Middle of funnel" },
  conversion: { label: "Conversion", icon: "🎯", headBg: "bg-green-50", headBorder: "border-green-200", stageBg: "bg-green-50", stageBorder: "border-green-200", desc: "Bottom of funnel" },
  loyalty: { label: "Loyalty", icon: "❤️", headBg: "bg-purple-50", headBorder: "border-purple-200", stageBg: "bg-purple-50", stageBorder: "border-purple-200", desc: "Post-purchase" },
}

const funnelWidths = ["w-full", "w-3/4", "w-1/2", "w-1/3"]

export default function Home() {
  const [industry, setIndustry] = useState("saas")
  const [budget, setBudget] = useState(10000)
  const [goal, setGoal] = useState("growth")
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const resultsRef = useRef<HTMLDivElement>(null)

  const toggleChannel = (value: string) => {
    setSelectedChannels((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    )
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedChannels.length === 0) { setError("Select at least one channel"); return }
    setError("")
    setIsLoading(true)
    try {
      const res = await generateGrowthStrategy({
        industry, currentChannels: selectedChannels, monthlyBudget: budget, primaryGoal: goal,
      })
      setResult(res)
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    } catch (err: any) {
      setError(err.message || "Failed to generate strategy")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => window.print()

  const ImpactBadge = ({ impact }: { impact: string }) => {
    const colors: Record<string, string> = { HIGH: "bg-green-100 text-green-800 border-green-200", MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200", LOW: "bg-gray-100 text-gray-800 border-gray-200" }
    return <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[impact] || colors.LOW}`}>{impact}</span>
  }
  const EffortBadge = ({ effort }: { effort: string }) => {
    const colors: Record<string, string> = { LOW: "bg-blue-100 text-blue-800 border-blue-200", MEDIUM: "bg-orange-100 text-orange-800 border-orange-200", HIGH: "bg-red-100 text-red-800 border-red-200" }
    return <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[effort] || colors.LOW}`}>{effort}</span>
  }

  if (result) {
    return (
      <div ref={resultsRef} className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 print:bg-white print:p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 print:hidden">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Your Growth Strategy</h1>
              <p className="text-gray-500 mt-1">Generated for {INDUSTRIES.find(i => i.id === industry)?.name || industry} &mdash; ${budget.toLocaleString()}/mo budget</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-white border rounded-lg hover:bg-gray-50 transition shadow-sm text-sm font-medium">
                <Download size={16} /> Export PDF
              </button>
              <button onClick={() => { setResult(null); setError("") }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm text-sm font-medium">
                <RotateCcw size={16} /> New Strategy
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><BarChart3 size={18} className="text-blue-600" /> Strategic Overview</h2>
              <p className="text-gray-700 leading-relaxed">{result.reasoning}</p>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700">{result.tactics?.length || 0}</p>
                  <p className="text-xs text-blue-600 mt-1">Total Tactics</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-700">{result.estimatedROI?.toFixed(1)}%</p>
                  <p className="text-xs text-green-600 mt-1">Est. ROI</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-purple-700">{result.funnel?.length || 0}</p>
                  <p className="text-xs text-purple-600 mt-1">Funnel Stages</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-amber-700">{result.channels?.length || 0}</p>
                  <p className="text-xs text-amber-600 mt-1">Channels</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Target size={18} className="text-blue-600" /> Budget Allocation</h2>
              <div className="space-y-3">
                {result.channels?.map((c: any, i: number) => {
                  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500", "bg-pink-500", "bg-cyan-500", "bg-red-500", "bg-indigo-500"]
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{c.channel}</span>
                        <span className="text-gray-600">{c.budgetAllocation}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div className={`${colors[i % colors.length]} h-2.5 rounded-full transition-all duration-1000`} style={{ width: `${c.budgetAllocation}%` }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-blue-600" /> Marketing Funnel</h2>
            <div className="flex flex-col items-center space-y-1">
              {result.funnel?.map((stage: any, idx: number) => {
                const meta = funnelMeta[stage.stage as keyof typeof funnelMeta] || { label: stage.stage, icon: "📌", stageBg: "bg-gray-50", stageBorder: "border-gray-200", headBg: "bg-gray-50", headBorder: "border-gray-200", desc: "" }
                return (
                  <div key={stage.stage} className={`${funnelWidths[idx]} transition-all duration-500`}>
                    <div className={`${meta.stageBg} border ${meta.stageBorder} rounded-xl p-4 hover:shadow-md transition-shadow`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{meta.icon}</span>
                          <h3 className="font-semibold text-gray-900">{meta.label}</h3>
                          <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border">{stage.tactics?.length || 0} tactics</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 italic mb-2">{stage.goal}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {stage.tactics?.map((t: any) => (
                          <span key={t.id} className="text-xs bg-white px-2 py-1 rounded-full border text-gray-700">{t.title}</span>
                        ))}
                      </div>
                    </div>
                    {idx < (result.funnel?.length || 0) - 1 && (
                      <div className="flex justify-center py-0.5">
                        <ChevronRight size={14} className="text-gray-300 rotate-90" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Calendar size={18} className="text-blue-600" /> Timeline</h2>
              <div className="space-y-4">
                {result.timeline?.phases?.map((phase: any, idx: number) => {
                  const colors = ["border-l-blue-500 bg-blue-50", "border-l-green-500 bg-green-50", "border-l-purple-500 bg-purple-50", "border-l-amber-500 bg-amber-50"]
                  return (
                    <div key={idx} className={`border-l-4 ${colors[idx % colors.length]} rounded-r-xl p-4`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{phase.name}</h3>
                          <p className="text-sm text-gray-500">{phase.duration} weeks</p>
                        </div>
                        <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-full border">{phase.tactics?.length || 0} tactics</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {phase.tactics?.map((tid: string) => {
                          const found = result.tactics?.find((t: any) => t.id === tid)
                          return found ? <span key={tid} className="text-xs bg-white px-2 py-1 rounded-full border text-gray-600">{found.title}</span> : null
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-blue-600" /> Channel Priority</h2>
              <div className="space-y-3">
                {result.channels?.slice().sort((a: any, b: any) => b.priority - a.priority).map((c: any, i: number) => {
                  const stars = "★".repeat(c.priority) + "☆".repeat(5 - c.priority)
                  const colors = ["text-blue-600", "text-green-600", "text-purple-600", "text-amber-600", "text-pink-600", "text-cyan-600", "text-red-600", "text-indigo-600"]
                  return (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <span className={`text-lg ${colors[i % colors.length]}`}>{stars}</span>
                        <span className="font-medium">{c.channel}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{c.budgetAllocation}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {result.funnel?.map((stage: any) => {
            const meta = funnelMeta[stage.stage as keyof typeof funnelMeta] || { label: stage.stage, icon: "📌", headBg: "bg-gray-50", headBorder: "border-gray-200", stageBg: "bg-gray-50", stageBorder: "border-gray-200", desc: "" }
            return (
              <div key={stage.stage} className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
                <div className={`${meta.headBg} px-6 py-4 border-b`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta.icon}</span>
                    <h2 className="text-xl font-bold">{meta.label}</h2>
                    <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border ml-2">{stage.tactics?.length || 0} tactics</span>
                  </div>
                  <p className="text-sm text-gray-500 italic mt-1">{stage.goal}</p>
                </div>
                <div className="divide-y">
                  {stage.tactics?.map((t: any) => (
                    <div key={t.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{t.title}</h3>
                            {t.channel && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{t.channel}</span>}
                          </div>
                          <p className="text-sm text-gray-600">{t.description}</p>
                        </div>
                        <div className="flex gap-2 shrink-0 ml-4">
                          <ImpactBadge impact={t.impact} />
                          <EffortBadge effort={t.effort} />
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-2">
                        <p className="text-xs text-blue-700"><span className="font-semibold">Why it works:</span> {t.reasoning}</p>
                      </div>
                      {t.estimatedROI && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                          <TrendingUp size={12} />
                          <span>Est. ROI: {t.estimatedROI.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          <div className="text-center py-8 text-gray-400 text-xs print:hidden">
            <p>Strategy generated by AI using Groq Llama 3.3 70B &middot; Review before implementing</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Sparkles size={14} /> AI-Powered Strategy Generator
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            Growth Strategy<br /><span className="text-blue-600">Generator</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            Get a personalized, funnel-based marketing strategy for your industry, budget, and goals — powered by Groq AI.
          </p>
        </div>

        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Industry</label>
              <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm">
                {INDUSTRIES.map((ind) => (
                  <option key={ind.id} value={ind.id}>{ind.icon} {ind.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Budget</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} min={1000} step={1000} className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Goal</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm">
                <option value="awareness">🔍 Brand Awareness</option>
                <option value="leads">📋 Generate Leads</option>
                <option value="sales">💰 Drive Sales</option>
                <option value="retention">❤️ Customer Retention</option>
                <option value="growth">📈 Overall Growth</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Channels</label>
              <div className="grid grid-cols-3 gap-1.5">
                {channels.slice(0, 6).map((ch) => {
                  const isSelected = selectedChannels.includes(ch.value)
                  return (
                    <button key={ch.value} type="button" onClick={() => toggleChannel(ch.value)}
                      className={`p-2 rounded-lg border text-xs font-medium transition ${isSelected ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}>
                      {ch.label}
                    </button>
                  )
                })}
              </div>
              <button type="button" onClick={() => {
                if (selectedChannels.length === channels.length) setSelectedChannels([])
                else setSelectedChannels(channels.map(c => c.value))
              }} className="text-xs text-blue-600 mt-1 hover:underline">
                {selectedChannels.length === channels.length ? "Clear all" : "Select all"}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {selectedChannels.map(v => {
              const ch = channels.find(c => c.value === v)
              return ch ? <span key={v} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{ch.label} ✕</span> : null
            })}
          </div>
          {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}
          <button type="submit" disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 text-sm">
            {isLoading ? <><Loader2 className="animate-spin" size={20} /> Generating Strategy...</> : <><Sparkles size={20} /> Generate Strategy</>}
          </button>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { icon: "🔍", label: "Funnel-Based", desc: "Awareness to loyalty" },
            { icon: "💰", label: "Budget Optimized", desc: "Smart allocation" },
            { icon: "📊", label: "Impact Scored", desc: "Effort vs impact" },
            { icon: "🚀", label: "Actionable", desc: "Ready to execute" },
          ].map((f) => (
            <div key={f.label} className="bg-white/60 backdrop-blur rounded-xl p-4 text-center border border-white/80">
              <div className="text-2xl mb-1">{f.icon}</div>
              <p className="text-sm font-semibold text-gray-800">{f.label}</p>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-400 text-xs mt-8">Powered by Groq Llama 3.3 70B &middot; Built with Next.js</p>
      </div>
    </div>
  )
}
