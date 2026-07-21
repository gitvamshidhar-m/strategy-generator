"use client"

import { useState, useRef, useEffect } from "react"
import { INDUSTRIES } from "@/data/tactics"
import { Channel } from "@/types"
import { generateGrowthStrategy, regenerateStage } from "@/ai/strategy-engine"
import { useLocalStorage, useFormPersist, useStrategyHistory, useBranding, useDarkMode } from "@/lib/hooks"
import { copyStrategyToClipboard, generateShareUrl, parseShareUrl, exportPDF, channelColors, channelTextColors, clampPriority } from "@/lib/utils"
import {
  Loader2, Sparkles, RotateCcw, Download, BarChart3, Calendar, ChevronRight, Target, TrendingUp,
  Users, DollarSign, Smartphone, Moon, Sun, History, Copy, Share2, X, Settings, Eye, GitCompare,
  Trash2, Plus, RefreshCw, ChevronLeft, Save,
} from "lucide-react"

const channels = [
  { value: Channel.SEO, label: "SEO" }, { value: Channel.PPC, label: "PPC" },
  { value: Channel.SOCIAL, label: "Social" }, { value: Channel.EMAIL, label: "Email" },
  { value: Channel.CONTENT, label: "Content" }, { value: Channel.PAID_SOCIAL, label: "Paid Social" },
  { value: Channel.INFLUENCER, label: "Influencer" }, { value: Channel.AFFILIATE, label: "Affiliate" },
  { value: Channel.SMS, label: "SMS" }, { value: Channel.DISPLAY, label: "Display" },
]

const funnelMeta: Record<string, { label: string; icon: string; headBg: string; headBorder: string; stageBg: string; stageBorder: string; desc: string }> = {
  awareness: { label: "Awareness", icon: "🔍", headBg: "bg-blue-50 dark:bg-blue-900/30", headBorder: "border-blue-200 dark:border-blue-700", stageBg: "bg-blue-50 dark:bg-blue-900/20", stageBorder: "border-blue-200 dark:border-blue-800", desc: "Top of funnel" },
  consideration: { label: "Consideration", icon: "⚖️", headBg: "bg-amber-50 dark:bg-amber-900/30", headBorder: "border-amber-200 dark:border-amber-700", stageBg: "bg-amber-50 dark:bg-amber-900/20", stageBorder: "border-amber-200 dark:border-amber-800", desc: "Middle of funnel" },
  conversion: { label: "Conversion", icon: "🎯", headBg: "bg-green-50 dark:bg-green-900/30", headBorder: "border-green-200 dark:border-green-700", stageBg: "bg-green-50 dark:bg-green-900/20", stageBorder: "border-green-200 dark:border-green-800", desc: "Bottom of funnel" },
  loyalty: { label: "Loyalty", icon: "❤️", headBg: "bg-purple-50 dark:bg-purple-900/30", headBorder: "border-purple-200 dark:border-purple-700", stageBg: "bg-purple-50 dark:bg-purple-900/20", stageBorder: "border-purple-200 dark:border-purple-800", desc: "Post-purchase" },
}

const funnelWidths = ["w-full", "w-3/4", "w-1/2", "w-1/3"]

function ImpactBadge({ impact }: { impact: string }) {
  const colors: Record<string, string> = { HIGH: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700", MEDIUM: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700", LOW: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600" }
  return <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[impact] || colors.LOW}`}>{impact}</span>
}
function EffortBadge({ effort }: { effort: string }) {
  const colors: Record<string, string> = { LOW: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700", MEDIUM: "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700", HIGH: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700" }
  return <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[effort] || colors.LOW}`}>{effort}</span>
}

function DrilldownModal({ tactic, onClose }: { tactic: any; onClose: () => void }) {
  if (!tactic) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{tactic.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={20} /></button>
        </div>
        <div className="space-y-3">
          <div><span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Description</span><p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{tactic.description}</p></div>
          <div><span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Channel</span><p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{tactic.channel || "Multi-channel"}</p></div>
          <div><span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Why it works</span><p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{tactic.reasoning}</p></div>
          <div className="flex gap-2"><ImpactBadge impact={tactic.impact} /><EffortBadge effort={tactic.effort} /></div>
          {tactic.estimatedROI && <div><span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Est. ROI</span><p className="text-green-600 dark:text-green-400 font-bold text-lg">{tactic.estimatedROI.toFixed(1)}%</p></div>}
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2"><div className="skeleton h-8 w-64 rounded-lg" /><div className="skeleton h-4 w-48 rounded-lg" /></div>
        <div className="flex gap-2"><div className="skeleton h-10 w-24 rounded-lg" /><div className="skeleton h-10 w-32 rounded-lg" /></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 skeleton h-48 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
      </div>
    </div>
  )
}

function SettingsPanel({ branding, setBranding, apiKey, setApiKey, onClose }: { branding: any; setBranding: any; apiKey: string; setApiKey: (v: string) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white"><Settings size={20} className="inline mr-2" />Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Company Name (white-label)</label>
            <input type="text" value={branding.companyName} onChange={(e) => setBranding({ ...branding, companyName: e.target.value })} placeholder="Your Agency Name" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Accent Color</label>
            <input type="color" value={branding.accentColor} onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })} className="w-full h-10 rounded-lg cursor-pointer" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="showBranding" checked={branding.showBranding} onChange={(e) => setBranding({ ...branding, showBranding: e.target.checked })} className="rounded" />
            <label htmlFor="showBranding" className="text-sm text-gray-700 dark:text-gray-300">Enable white-label branding</label>
          </div>
          <hr className="border-gray-200 dark:border-gray-700" />
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Groq API Key (override)</label>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="gsk_..." className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm font-mono" />
            <p className="text-xs text-gray-400 mt-1">Leave empty to use the server-side key</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function HistoryPanel({ history, onLoad, onCompare, onRemove, onClose }: { history: any[]; onLoad: (s: any) => void; onCompare: (s: any) => void; onRemove: (id: string) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white"><History size={20} className="inline mr-2" />Strategy History</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {history.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">No saved strategies yet</p>}
          {history.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group border border-gray-100 dark:border-gray-700">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{s.name}</p>
                <p className="text-xs text-gray-400">{new Date(s.date).toLocaleString()} &middot; ${s.form?.budget?.toLocaleString()}/mo</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                <button onClick={() => { onLoad(s); onClose() }} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600" title="Load"><Eye size={14} /></button>
                <button onClick={() => { onCompare(s); onClose() }} className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 text-green-600" title="Compare"><GitCompare size={14} /></button>
                <button onClick={() => onRemove(s.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600" title="Delete"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CompareView({ strategyA, strategyB, onClose }: { strategyA: any; strategyB: any; onClose: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white"><GitCompare size={24} className="inline mr-2" />Strategy Comparison</h1>
          <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"><ChevronLeft size={16} /> Back</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[strategyA, strategyB].map((s, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Strategy {i + 1}</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{s.result?.tactics?.length || 0}</p><p className="text-xs text-blue-600 dark:text-blue-400">Tactics</p></div>
                <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-green-700 dark:text-green-300">{s.result?.estimatedROI?.toFixed(1)}%</p><p className="text-xs text-green-600 dark:text-green-400">Est. ROI</p></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{s.result?.reasoning?.slice(0, 200)}...</p>
              <div className="space-y-2">
                {s.result?.channels?.map((c: any, j: number) => (
                  <div key={j} className="flex justify-between text-sm"><span className="text-gray-700 dark:text-gray-300">{c.channel}</span><span className="font-semibold">{c.budgetAllocation}%</span></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Header({ title, subtitle, branding }: { title: string; subtitle?: string; branding: any }) {
  const accentStyle = branding.showBranding && branding.accentColor ? { color: branding.accentColor } : {}
  return (
    <div>
      {branding.showBranding && branding.companyName && <p className="text-xs text-gray-400 mb-1" style={branding.accentColor ? { color: branding.accentColor } : {}}>{branding.companyName}</p>}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white" style={accentStyle}>{title}</h1>
      {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
  )
}

export default function Home() {
  const [form, updateForm] = useFormPersist()
  const { history, save: saveHistory, remove: removeHistory } = useStrategyHistory()
  const [branding, setBranding] = useBranding()
  const [isDark, toggleDark] = useDarkMode()
  const [apiKey, setApiKey] = useLocalStorage<string>("strategy-api-key", "")
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [drilldown, setDrilldown] = useState<any>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [compareTarget, setCompareTarget] = useState<any>(null)
  const [showCompare, setShowCompare] = useState(false)
  const [copyMsg, setCopyMsg] = useState("")
  const [regenStage, setRegenStage] = useState<string | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const shared = parseShareUrl()
    if (shared) { setResult(shared.result); updateForm(shared.form) }
  }, [])

  const industryName = INDUSTRIES.find((i) => i.id === form.industry)?.name || form.industry

  const toggleChannel = (value: string) => {
    updateForm({
      selectedChannels: form.selectedChannels.includes(value)
        ? form.selectedChannels.filter((c) => c !== value)
        : [...form.selectedChannels, value],
    })
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.selectedChannels.length === 0) { setError("Select at least one channel"); return }
    setError("")
    setIsLoading(true)
    setResult(null)
    try {
      const res = await generateGrowthStrategy({
        industry: form.industry, currentChannels: form.selectedChannels, monthlyBudget: form.budget, primaryGoal: form.goal,
      })
      setResult(res)
      saveHistory(form, res)
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    } catch (err: any) {
      setError(err.message || "Failed to generate strategy")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenStage = async (stage: string) => {
    setRegenStage(stage)
    try {
      const updated = await regenerateStage(
        { industry: form.industry, currentChannels: form.selectedChannels, monthlyBudget: form.budget, primaryGoal: form.goal },
        result,
        stage
      )
      setResult((prev: any) => ({
        ...prev,
        funnel: (prev.funnel || []).map((s: any) => s.stage === stage ? updated : s),
        tactics: [...(prev.tactics || []).filter((t: any) => !updated.tactics.some((ut: any) => ut.id === t.id)), ...updated.tactics],
      }))
    } catch {
      setError("Failed to regenerate stage")
    } finally {
      setRegenStage(null)
    }
  }

  const handleCopy = () => {
    copyStrategyToClipboard(result, form)
    setCopyMsg("Copied!")
    setTimeout(() => setCopyMsg(""), 2000)
  }

  const handleShare = () => {
    const url = generateShareUrl(result, form)
    navigator.clipboard.writeText(url).then(() => {
      setCopyMsg("Share link copied!")
      setTimeout(() => setCopyMsg(""), 2000)
    }).catch(() => {})
  }

  const loadFromHistory = (entry: any) => {
    const { form: f, result: r } = entry
    updateForm(f)
    setResult(r)
  }

  const startCompare = (entry: any) => {
    if (!compareTarget) {
      setCompareTarget(entry)
      setCopyMsg("Select another strategy to compare")
      setTimeout(() => setCopyMsg(""), 3000)
    } else {
      if (compareTarget.id === entry.id) { setCompareTarget(null); return }
      setShowCompare(true)
    }
  }

  // ── RESULTS VIEW ──
  if (result && !showCompare) {
    return (
      <>
        <div ref={resultsRef} className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <Header title="Your Growth Strategy" subtitle={`Generated for ${industryName} — $${form.budget.toLocaleString()}/mo budget`} branding={branding} />
              <div className="flex flex-wrap gap-2">
                {copyMsg && <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full flex items-center">{copyMsg}</span>}
                <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-medium text-gray-700 dark:text-gray-300"><Copy size={14} /> Copy</button>
                <button onClick={handleShare} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-medium text-gray-700 dark:text-gray-300"><Share2 size={14} /> Share</button>
                <button onClick={exportPDF} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-medium text-gray-700 dark:text-gray-300"><Download size={14} /> PDF</button>
                <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-medium text-gray-700 dark:text-gray-300"><History size={14} /></button>
                <button onClick={() => { setResult(null); setError("") }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm text-sm font-medium"><RotateCcw size={14} /> New</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white"><BarChart3 size={18} className="text-blue-600" /> Strategic Overview</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{result.reasoning}</p>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{result.tactics?.length || 0}</p><p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Total Tactics</p></div>
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-green-700 dark:text-green-300">{result.estimatedROI?.toFixed(1)}%</p><p className="text-xs text-green-600 dark:text-green-400 mt-1">Est. ROI</p></div>
                  <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{result.funnel?.length || 0}</p><p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Funnel Stages</p></div>
                  <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{result.channels?.length || 0}</p><p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Channels</p></div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white"><Target size={18} className="text-blue-600" /> Budget Allocation</h2>
                <div className="space-y-3">
                  {result.channels?.map((c: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-700 dark:text-gray-300">{c.channel}</span><span className="text-gray-500 dark:text-gray-400">{c.budgetAllocation}%</span></div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div className={`${channelColors[i % channelColors.length]} h-2.5 rounded-full transition-all duration-1000`} style={{ width: `${c.budgetAllocation}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white"><TrendingUp size={18} className="text-blue-600" /> Marketing Funnel</h2>
              <div className="flex flex-col items-center space-y-1">
                {result.funnel?.map((stage: any, idx: number) => {
                  const meta = funnelMeta[stage.stage as keyof typeof funnelMeta] || { label: stage.stage, icon: "📌", stageBg: "bg-gray-50 dark:bg-gray-700", stageBorder: "border-gray-200 dark:border-gray-600", headBg: "bg-gray-50 dark:bg-gray-700", headBorder: "border-gray-200 dark:border-gray-600", desc: "" }
                  return (
                    <div key={stage.stage} className={`${funnelWidths[idx]} transition-all duration-500`}>
                      <div className={`${meta.stageBg} border ${meta.stageBorder} rounded-xl p-4 hover:shadow-md transition-shadow`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{meta.icon}</span>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{meta.label}</h3>
                            <span className="text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full border dark:border-gray-600">{stage.tactics?.length || 0} tactics</span>
                          </div>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-2">{stage.goal}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {stage.tactics?.map((t: any) => (
                            <span key={t.id} className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded-full border dark:border-gray-600 text-gray-700 dark:text-gray-300">{t.title}</span>
                          ))}
                        </div>
                      </div>
                      {idx < (result.funnel?.length || 0) - 1 && (
                        <div className="flex justify-center py-0.5"><ChevronRight size={14} className="text-gray-300 dark:text-gray-600 rotate-90" /></div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white"><Calendar size={18} className="text-blue-600" /> Timeline</h2>
                <div className="space-y-4">
                  {result.timeline?.phases?.map((phase: any, idx: number) => {
                    const c = ["border-l-blue-500 bg-blue-50 dark:bg-blue-900/20", "border-l-green-500 bg-green-50 dark:bg-green-900/20", "border-l-purple-500 bg-purple-50 dark:bg-purple-900/20", "border-l-amber-500 bg-amber-50 dark:bg-amber-900/20"]
                    return (
                      <div key={idx} className={`border-l-4 ${c[idx % c.length]} rounded-r-xl p-4`}>
                        <div className="flex justify-between items-start">
                          <div><h3 className="font-semibold text-gray-900 dark:text-white">{phase.name}</h3><p className="text-sm text-gray-500 dark:text-gray-400">{phase.duration} weeks</p></div>
                          <span className="text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-700 px-2 py-1 rounded-full border dark:border-gray-600">{phase.tactics?.length || 0} tactics</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {phase.tactics?.map((tid: string) => {
                            const found = result.tactics?.find((t: any) => t.id === tid)
                            return found ? <span key={tid} className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded-full border dark:border-gray-600 text-gray-600 dark:text-gray-400">{found.title}</span> : null
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white"><BarChart3 size={18} className="text-blue-600" /> Channel Priority</h2>
                <div className="space-y-3">
                  {result.channels?.slice().sort((a: any, b: any) => b.priority - a.priority).map((c: any, i: number) => {
                    const p = clampPriority(c.priority)
                    const stars = "★".repeat(p) + "☆".repeat(5 - p)
                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                        <div className="flex items-center gap-3">
                          <span className={`text-lg ${channelTextColors[i % channelTextColors.length]}`}>{stars}</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{c.channel}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{c.budgetAllocation}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {result.funnel?.map((stage: any) => {
              const meta = funnelMeta[stage.stage as keyof typeof funnelMeta] || { label: stage.stage, icon: "📌", headBg: "bg-gray-50 dark:bg-gray-700", headBorder: "border-gray-200 dark:border-gray-600", stageBg: "bg-gray-50 dark:bg-gray-700", stageBorder: "border-gray-200 dark:border-gray-600", desc: "" }
              return (
                <div key={stage.stage} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mb-6 overflow-hidden">
                  <div className={`${meta.headBg} px-6 py-4 border-b ${meta.headBorder}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{meta.icon}</span>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{meta.label}</h2>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full border dark:border-gray-600 ml-2">{stage.tactics?.length || 0} tactics</span>
                      </div>
                      <button onClick={() => handleRegenStage(stage.stage)} disabled={regenStage === stage.stage} className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50">
                        <RefreshCw size={12} className={regenStage === stage.stage ? "animate-spin" : ""} /> {regenStage === stage.stage ? "Regenerating..." : "Regenerate"}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-1">{stage.goal}</p>
                  </div>
                  <div className="divide-y dark:divide-gray-700">
                    {stage.tactics?.map((t: any) => (
                      <div key={t.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer" onClick={() => setDrilldown(t)}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{t.title}</h3>
                              {t.channel && <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{t.channel}</span>}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t.description}</p>
                          </div>
                          <div className="flex gap-2 shrink-0 ml-4">
                            <ImpactBadge impact={t.impact} />
                            <EffortBadge effort={t.effort} />
                          </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 mt-2">
                          <p className="text-xs text-blue-700 dark:text-blue-300"><span className="font-semibold">Why it works:</span> {t.reasoning}</p>
                        </div>
                        {t.estimatedROI && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500"><TrendingUp size={12} /><span>Est. ROI: {t.estimatedROI.toFixed(1)}%</span></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-xs">
              <p>Strategy generated by AI &middot; Review before implementing</p>
            </div>
          </div>
        </div>
        {drilldown && <DrilldownModal tactic={drilldown} onClose={() => setDrilldown(null)} />}
        {showHistory && <HistoryPanel history={history} onLoad={loadFromHistory} onCompare={startCompare} onRemove={removeHistory} onClose={() => setShowHistory(false)} />}
        {showSettings && <SettingsPanel branding={branding} setBranding={setBranding} apiKey={apiKey} setApiKey={setApiKey} onClose={() => setShowSettings(false)} />}
      </>
    )
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (showCompare && compareTarget) {
    return (
      <>
        <CompareView strategyA={{ form, result }} strategyB={compareTarget} onClose={() => { setShowCompare(false); setCompareTarget(null) }} />
        {showSettings && <SettingsPanel branding={branding} setBranding={setBranding} apiKey={apiKey} setApiKey={setApiKey} onClose={() => setShowSettings(false)} />}
      </>
    )
  }

  // ── FORM VIEW ──
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
          <div className="flex justify-end gap-2 mb-4">
            <button onClick={toggleDark} className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              {isDark ? <Sun size={16} className="text-gray-600 dark:text-gray-300" /> : <Moon size={16} className="text-gray-600" />}
            </button>
            <button onClick={() => setShowSettings(true)} className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <Settings size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button onClick={() => setShowHistory(true)} className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <History size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="text-center mb-10">
            {branding.showBranding && branding.companyName && <p className="text-sm text-gray-400 dark:text-gray-500 mb-2" style={branding.accentColor ? { color: branding.accentColor } : {}}>{branding.companyName}</p>}
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4"><Sparkles size={14} /> AI-Powered Strategy Generator</div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Growth Strategy<br /><span className="text-blue-600 dark:text-blue-400">Generator</span></h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-lg mx-auto">Get a personalized, funnel-based marketing strategy for your industry, budget, and goals</p>
          </div>

          <form onSubmit={onSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Industry</label>
                <select value={form.industry} onChange={(e) => updateForm({ industry: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm">
                  {INDUSTRIES.map((ind) => (<option key={ind.id} value={ind.id}>{ind.icon} {ind.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Monthly Budget</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium">$</span>
                  <input type="number" value={form.budget} onChange={(e) => updateForm({ budget: Number(e.target.value) })} min={1000} step={1000} className="w-full pl-8 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Primary Goal</label>
                <select value={form.goal} onChange={(e) => updateForm({ goal: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm">
                  <option value="awareness">🔍 Brand Awareness</option>
                  <option value="leads">📋 Generate Leads</option>
                  <option value="sales">💰 Drive Sales</option>
                  <option value="retention">❤️ Customer Retention</option>
                  <option value="growth">📈 Overall Growth</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Channels</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {channels.slice(0, 6).map((ch) => {
                    const isSelected = form.selectedChannels.includes(ch.value)
                    return (
                      <button key={ch.value} type="button" onClick={() => toggleChannel(ch.value)}
                        className={`p-2 rounded-lg border text-xs font-medium transition ${isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-300 text-blue-700" : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400"}`}>
                        {ch.label}
                      </button>
                    )
                  })}
                </div>
                <button type="button" onClick={() => {
                  if (form.selectedChannels.length === channels.length) updateForm({ selectedChannels: [] })
                  else updateForm({ selectedChannels: channels.map((c) => c.value) })
                }} className="text-xs text-blue-600 dark:text-blue-400 mt-1 hover:underline">
                  {form.selectedChannels.length === channels.length ? "Clear all" : "Select all"}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {form.selectedChannels.map((v) => {
                const ch = channels.find((c) => c.value === v)
                return ch ? <span key={v} className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">{ch.label} ✕</span> : null
              })}
            </div>
            {error && <p className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 p-3 rounded-xl">{error}</p>}
            <button type="submit" disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-blue-900/50 text-sm">
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
              <div key={f.label} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-xl p-4 text-center border border-white/80 dark:border-gray-700/80">
                <div className="text-2xl mb-1">{f.icon}</div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{f.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 dark:text-gray-600 text-xs mt-8">Built with Next.js</p>
        </div>
      </div>
      {showHistory && <HistoryPanel history={history} onLoad={loadFromHistory} onCompare={startCompare} onRemove={removeHistory} onClose={() => setShowHistory(false)} />}
      {showSettings && <SettingsPanel branding={branding} setBranding={setBranding} apiKey={apiKey} setApiKey={setApiKey} onClose={() => setShowSettings(false)} />}
    </>
  )
}
