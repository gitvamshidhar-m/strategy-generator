"use client"

import { useState, useRef, useEffect } from "react"
import { INDUSTRIES } from "@/data/tactics"
import { Channel, GeneratedStrategy, FunnelTactic, FunnelStage, SWOTAnalysis, BudgetOptimization, BrandingConfig, FormState } from "@/types"
import { generateGrowthStrategy, regenerateStage, chatWithStrategy, generateSWOT, optimizeBudget } from "@/ai/strategy-engine"
import { useLocalStorage, useFormPersist, useStrategyHistory, useBranding, useDarkMode, SavedStrategy } from "@/lib/hooks"
import { copyStrategyToClipboard, generateShareUrl, parseShareUrl, exportPDF, channelColors, channelTextColors, clampPriority, downloadJSON, downloadCSV } from "@/lib/utils"
import { funnelMeta, funnelWidths, ImpactBadge, EffortBadge } from "@/components/ui"
import KanbanBoard from "@/components/KanbanBoard"
import ExecutiveSummary from "@/components/ExecutiveSummary"
import FormView from "@/components/FormView"
import {
  Loader2, Sparkles, RotateCcw, Download, BarChart3, Calendar, ChevronRight, Target, TrendingUp,
  Users, DollarSign, Smartphone, Moon, Sun, History, Copy, Share2, X, Settings, Eye, GitCompare,
  Trash2, Plus, RefreshCw, ChevronLeft, Save, MessageCircle, CheckSquare, Award,
  LayoutDashboard, List as ListIcon, BrainCircuit,
} from "lucide-react"

const channels = [
  { value: Channel.SEO, label: "SEO" }, { value: Channel.PPC, label: "PPC" },
  { value: Channel.SOCIAL, label: "Social" }, { value: Channel.EMAIL, label: "Email" },
  { value: Channel.CONTENT, label: "Content" }, { value: Channel.PAID_SOCIAL, label: "Paid Social" },
  { value: Channel.INFLUENCER, label: "Influencer" }, { value: Channel.AFFILIATE, label: "Affiliate" },
  { value: Channel.SMS, label: "SMS" }, { value: Channel.DISPLAY, label: "Display" },
]

function DrilldownModal({ tactic, onClose }: { tactic: FunnelTactic; onClose: () => void }) {
  if (!tactic) return null
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{tactic.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div><span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Description</span><p className="text-gray-700 dark:text-gray-300 text-sm mt-1 leading-relaxed">{tactic.description}</p></div>
          <div className="flex flex-wrap gap-2"><ImpactBadge impact={tactic.impact} /><EffortBadge effort={tactic.effort} /><span className="px-2 py-0.5 rounded text-xs font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400">{tactic.channel || "Multi"}</span>{tactic.estimatedROI && <span className="px-2 py-0.5 rounded text-xs font-medium border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400">{tactic.estimatedROI.toFixed(1)}% ROI</span>}</div>
          <div><span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Why it works</span><p className="text-gray-700 dark:text-gray-300 text-sm mt-1 leading-relaxed">{tactic.reasoning}</p></div>
          {tactic.steps && tactic.steps.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1 mb-2"><CheckSquare size={12} /> Execution Checklist</span>
              <div className="space-y-1.5">
                {tactic.steps.map((step: string, i: number) => (
                  <label key={i} className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition ${checked[`${tactic.id}-${i}`] ? "bg-green-50 dark:bg-green-900/20 line-through opacity-60" : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"}`}>
                    <input type="checkbox" checked={checked[`${tactic.id}-${i}`] || false} onChange={() => setChecked((p) => ({ ...p, [`${tactic.id}-${i}`]: !p[`${tactic.id}-${i}`] }))} className="mt-0.5 rounded" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{step}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
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

function SettingsPanel({ branding, setBranding, apiKey, setApiKey, onClose }: { branding: BrandingConfig; setBranding: (b: BrandingConfig) => void; apiKey: string; setApiKey: (v: string) => void; onClose: () => void }) {
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

function HistoryPanel({ history, onLoad, onCompare, onRemove, onRename, onClose }: { history: SavedStrategy[]; onLoad: (s: SavedStrategy) => void; onCompare: (s: SavedStrategy) => void; onRemove: (id: string) => void; onRename: (id: string, name: string) => void; onClose: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white"><History size={20} className="inline mr-2" />Strategy History</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {history.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">No saved strategies yet</p>}
          {history.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group border border-gray-100 dark:border-gray-700">
              <div className="flex-1 min-w-0">
                {editingId === s.id ? (
                  <form onSubmit={(e) => { e.preventDefault(); if (editName.trim()) { onRename(s.id, editName.trim()); setEditingId(null) } }}>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-600 dark:text-white outline-none" autoFocus onBlur={() => setEditingId(null)} />
                  </form>
                ) : (
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{s.name}</p>
                )}
                <p className="text-xs text-gray-400">{new Date(s.date).toLocaleString()} &middot; ${s.form?.budget?.toLocaleString()}/mo</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                <button onClick={() => { onLoad(s); onClose() }} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600" title="Load"><Eye size={14} /></button>
                <button onClick={() => { onCompare(s); onClose() }} className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 text-green-600" title="Compare"><GitCompare size={14} /></button>
                <button onClick={() => { setEditingId(s.id); setEditName(s.name) }} className="p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-600" title="Rename"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                <button onClick={() => onRemove(s.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600" title="Delete"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CompareView({ strategyA, strategyB, onClose }: { strategyA: SavedStrategy; strategyB: SavedStrategy; onClose: () => void }) {
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
                {s.result?.channels?.map((c, j: number) => (
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

function Header({ title, subtitle, branding }: { title: string; subtitle?: string; branding: BrandingConfig }) {
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
  const { history, save: saveHistory, remove: removeHistory, rename: renameHistory } = useStrategyHistory()
  const [branding, setBranding] = useBranding()
  const [isDark, toggleDark] = useDarkMode()
  const [apiKey, setApiKey] = useLocalStorage<string>("strategy-api-key", "")
  const [result, setResult] = useState<GeneratedStrategy | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [drilldown, setDrilldown] = useState<FunnelTactic | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [compareTarget, setCompareTarget] = useState<SavedStrategy | null>(null)
  const [showCompare, setShowCompare] = useState(false)
  const [copyMsg, setCopyMsg] = useState("")
  const [regenStage, setRegenStage] = useState<string | null>(null)
  const [swot, setSwot] = useState<SWOTAnalysis | null>(null)
  const [swotLoading, setSwotLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatMsg, setChatMsg] = useState("")
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [filterChannel, setFilterChannel] = useState("")
  const [filterImpact, setFilterImpact] = useState("")
  const [filterEffort, setFilterEffort] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [strategyNotes, setStrategyNotes] = useState("")
  const [editingBudget, setEditingBudget] = useState(false)
  const [editAllocations, setEditAllocations] = useState<Record<string, number>>({})
  const resultsRef = useRef<HTMLDivElement>(null)
  const [strategySessionId, setStrategySessionId] = useLocalStorage<string>("strategy-session-id", "")
  const [tacticStatus, setTacticStatus] = useState<Record<string, string>>({})
  const [showBoard, setShowBoard] = useState(false)
  const [optimizedBudget, setOptimizedBudget] = useState<BudgetOptimization[] | null>(null)
  const [optimizingBudget, setOptimizingBudget] = useState(false)

  useEffect(() => {
    const shared = parseShareUrl()
    if (shared) { setResult(shared.result); updateForm(shared.form) }
  }, [])



  const notesKey = strategySessionId ? `strategy-notes-${strategySessionId}` : ""

  useEffect(() => {
    if (result && notesKey) {
      try { const saved = localStorage.getItem(notesKey); if (saved) { setStrategyNotes(saved) } else { setStrategyNotes("") } } catch {}
    }
  }, [result, notesKey])

  useEffect(() => {
    if (!result || !notesKey) return
    const timer = setTimeout(() => {
      try { localStorage.setItem(notesKey, strategyNotes) } catch {}
    }, 800)
    return () => clearTimeout(timer)
  }, [strategyNotes, result, notesKey])

  useEffect(() => {
    if (result && strategySessionId) {
      const key = `strategy-progress-${strategySessionId}`
      try { const saved = localStorage.getItem(key); if (saved) setTacticStatus(JSON.parse(saved)); else setTacticStatus({}) } catch {}
    }
  }, [result, strategySessionId])

  const industryName = INDUSTRIES.find((i) => i.id === form.industry)?.name || form.industry

  const validate = (): string | null => {
    if (form.selectedChannels.length === 0) return "Select at least one channel"
    const chCount = form.selectedChannels.length
    if (form.budget < 1000) return "Minimum budget is $1,000/mo"
    if (chCount >= 6 && form.budget < 5000) return `$${form.budget.toLocaleString()}/mo is too low for ${chCount} channels — try 2-3 channels or increase your budget`
    if (chCount >= 4 && form.budget < 3000) return `Consider fewer channels (2-3) with a $${form.budget.toLocaleString()} budget for better impact`
    if (form.strategyStyle === "aggressive" && form.budget < 5000) return "Aggressive strategy works best with $5,000+/mo budget for sufficient ad spend"
    if (form.strategyStyle === "aggressive" && form.targetCPA && form.targetCPA < 10) return "Aggressive CPA target under $10 is unrealistic for most industries"
    if (form.strategyStyle === "conservative" && form.targetROAS && form.targetROAS > 8) return "Conservative strategy with 8x+ ROAS target may be too ambitious"
    if (form.goal === "sales" && form.budget < 3000) return "Drive Sales typically needs $3,000+/mo for meaningful ad spend"
    if (form.goal === "awareness" && form.budget < 2000) return "Brand Awareness campaigns usually start at $2,000+/mo for reach"
    return null
  }

  const [validationWarnings, setValidationWarnings] = useState<string[]>([])
  const [wizardStep, setWizardStep] = useState(0)
  const [wizardMode, setWizardMode] = useState(false)

  const toggleChannel = (value: string) => {
    updateForm({
      selectedChannels: form.selectedChannels.includes(value)
        ? form.selectedChannels.filter((c) => c !== value)
        : [...form.selectedChannels, value],
    })
  }

  useEffect(() => {
    const warnings: string[] = []
    if (form.budget >= 1000 && form.selectedChannels.length >= 6 && form.budget < 5000) warnings.push(`${form.selectedChannels.length} channels with $${form.budget.toLocaleString()}/mo may spread budget too thin`)
    if (form.strategyStyle === "aggressive" && form.budget < 5000) warnings.push("Aggressive style pairs better with $5,000+/mo")
    if (form.targetCPA && form.targetROAS && form.targetCPA > 0 && form.targetROAS > 0 && (form.budget / form.targetCPA) * form.targetROAS < form.budget * 1.5) warnings.push("CPA and ROAS targets may not align with available budget")
    setValidationWarnings(warnings)
  }, [form.budget, form.selectedChannels.length, form.strategyStyle, form.targetCPA, form.targetROAS])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setError("")
    setIsLoading(true)
    setResult(null)
    try {
      const res = await generateGrowthStrategy({
        industry: form.industry, currentChannels: form.selectedChannels, monthlyBudget: form.budget, primaryGoal: form.goal,
        targetCPA: form.targetCPA, targetROAS: form.targetROAS, targetConversionRate: form.targetConversionRate,
        strategyStyle: form.strategyStyle, competitors: form.competitors,
      })
      setResult(res)
      setStrategySessionId(Date.now().toString(36))
      saveHistory(form, res)
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate strategy")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenStage = async (stage: string) => {
    setRegenStage(stage)
    try {
      const updated = await regenerateStage(
        { industry: form.industry, currentChannels: form.selectedChannels, monthlyBudget: form.budget, primaryGoal: form.goal, targetCPA: form.targetCPA, targetROAS: form.targetROAS, targetConversionRate: form.targetConversionRate, strategyStyle: form.strategyStyle, competitors: form.competitors },
        result,
        stage
      )
      setResult((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          funnel: prev.funnel.map((s) => s.stage === stage ? updated : s),
          tactics: [...prev.tactics.filter((t) => !updated.tactics.some((ut) => ut.id === t.id)), ...updated.tactics],
        }
      })
    } catch {
      setError("Failed to regenerate stage")
    } finally {
      setRegenStage(null)
    }
  }

  const handleChat = async () => {
    if (!chatMsg.trim()) return
    const userMsg = chatMsg.trim()
    setChatMsg("")
    setChatHistory((p) => [...p, { role: "user", text: userMsg }])
    setChatLoading(true)
    try {
      const reply = await chatWithStrategy(result, form, userMsg)
      setChatHistory((p) => [...p, { role: "ai", text: reply }])
    } catch (e) {
      setChatHistory((p) => [...p, { role: "ai", text: `Error: ${e instanceof Error ? e.message : "Could not process request"}` }])
    } finally { setChatLoading(false) }
  }

  const handleSWOT = async () => {
    setSwotLoading(true)
    try {
      const data = await generateSWOT(form.industry, form.competitors || "", result)
      setSwot(data)
    } catch { setError("Failed to generate SWOT") }
    finally { setSwotLoading(false) }
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

  const loadFromHistory = (entry: SavedStrategy) => {
    const { form: f, result: r } = entry
    updateForm(f)
    setResult(r)
    setStrategySessionId(`hist-${Date.now().toString(36)}`)
  }

  const startCompare = (entry: SavedStrategy) => {
    if (!compareTarget) {
      setCompareTarget(entry)
      setCopyMsg("Select another strategy to compare")
      setTimeout(() => setCopyMsg(""), 3000)
    } else {
      if (compareTarget.id === entry.id) { setCompareTarget(null); return }
      setShowCompare(true)
    }
  }

  const cycleStatus = (id: string) => {
    setTacticStatus((prev) => {
      const cur = prev[id] || "todo"
      const next = cur === "todo" ? "in_progress" : cur === "in_progress" ? "done" : "todo"
      const updated = { ...prev, [id]: next }
      try { if (strategySessionId) localStorage.setItem(`strategy-progress-${strategySessionId}`, JSON.stringify(updated)) } catch {}
      return updated
    })
  }

  const setStatus = (id: string, status: string) => {
    setTacticStatus((prev) => {
      const updated = { ...prev, [id]: status }
      try { if (strategySessionId) localStorage.setItem(`strategy-progress-${strategySessionId}`, JSON.stringify(updated)) } catch {}
      return updated
    })
  }

  const countByStatus = (status: string) => Object.values(tacticStatus).filter((v) => v === status).length
  const totalTactics = result?.tactics?.length || 0

  const handleOptimizeBudget = async () => {
    setOptimizingBudget(true)
    try {
      const res = await optimizeBudget(result, form)
      setOptimizedBudget(res)
    } catch { setError("Failed to optimize budget") }
    finally { setOptimizingBudget(false) }
  }

  const applyOptimizedBudget = () => {
    if (!optimizedBudget) return
    setResult((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        channels: prev.channels.map((c) => {
          const opt = optimizedBudget.find((o) => o.channel === c.channel)
          return opt ? { ...c, budgetAllocation: opt.budgetAllocation } : c
        })
      }
    })
    setOptimizedBudget(null)
  }

  // ── RESULTS VIEW ──
  if (result && !showCompare) {
    return (
      <>
        <div ref={resultsRef} className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <Header title={form.clientName ? `${form.clientName} — Growth Strategy` : "Your Growth Strategy"} subtitle={`${form.strategyStyle === "aggressive" ? "🚀 Aggressive" : form.strategyStyle === "conservative" ? "🛡️ Conservative" : "⚖️ Balanced"} · ${industryName} · $${form.budget.toLocaleString()}/mo`} branding={branding} />
              <div className="flex flex-wrap gap-2">
                {copyMsg && <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full flex items-center">{copyMsg}</span>}
                <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-medium text-gray-700 dark:text-gray-300 min-h-[44px]"><Copy size={14} /> Copy</button>
                <button onClick={handleShare} className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-medium text-gray-700 dark:text-gray-300 min-h-[44px]"><Share2 size={14} /> Share</button>
                <button onClick={() => exportPDF(result, form, branding)} className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-medium text-gray-700 dark:text-gray-300 min-h-[44px]"><Download size={14} /> PDF</button>
                <button onClick={() => downloadJSON(result, form)} className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-medium text-gray-700 dark:text-gray-300 min-h-[44px]">JSON</button>
                <button onClick={() => downloadCSV(result, form)} className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-medium text-gray-700 dark:text-gray-300 min-h-[44px]">CSV</button>
                <button onClick={() => setShowBoard(!showBoard)} className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg transition text-sm font-medium min-h-[44px] ${showBoard ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>{showBoard ? <ListIcon size={14} /> : <LayoutDashboard size={14} />} {showBoard ? "List" : "Board"}</button>
                <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-medium text-gray-700 dark:text-gray-300"><History size={14} /></button>
                <button onClick={() => { setResult(null); setError("") }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm text-sm font-medium"><RotateCcw size={14} /> New</button>
              </div>
            </div>

            <ExecutiveSummary result={result} form={form} countByStatus={countByStatus} totalTactics={totalTactics} />

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
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white"><Target size={18} className="text-blue-600" /> Budget Allocation</h2>
                    <div className="flex items-center gap-2">
                      {!editingBudget && !optimizedBudget && (
                        <button onClick={handleOptimizeBudget} disabled={optimizingBudget} className="text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 px-2 py-1 rounded-lg transition flex items-center gap-1 disabled:opacity-50">
                          <BrainCircuit size={12} /> {optimizingBudget ? "Optimizing..." : "Optimize AI"}
                        </button>
                      )}
                      {optimizedBudget && (
                        <button onClick={applyOptimizedBudget} className="text-xs font-medium text-white bg-green-600 hover:bg-green-700 px-2 py-1 rounded-lg transition flex items-center gap-1"><BrainCircuit size={12} /> Apply AI</button>
                      )}
                      <button onClick={() => { if (!editingBudget) { const alloc: Record<string, number> = {}; result.channels?.forEach((ch) => { alloc[ch.channel] = ch.budgetAllocation }); setEditAllocations(alloc) }; setEditingBudget(!editingBudget); if (editingBudget) setOptimizedBudget(null) }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">{editingBudget ? "Done" : "Adjust"}</button>
                    </div>
                </div>
                <div className="space-y-3">
                  {(editingBudget ? Object.entries(editAllocations) : result.channels?.map((c) => [c.channel, c.budgetAllocation] as [string, number]))?.map(([channel, alloc]: [string, number], i: number) => (
                    <div key={channel}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{channel}</span>
                        <div className="flex items-center gap-2">
                          {editingBudget && (
                            <button onClick={() => setEditAllocations((p) => ({ ...p, [channel]: Math.max(0, alloc - 5) }))} className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300 flex items-center justify-center text-sm hover:bg-gray-200 dark:hover:bg-gray-500">−</button>
                          )}
                          <span className="text-gray-500 dark:text-gray-400 w-8 text-right">{alloc}%</span>
                          {editingBudget && (
                            <button onClick={() => setEditAllocations((p) => ({ ...p, [channel]: Math.min(100, alloc + 5) }))} className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300 flex items-center justify-center text-sm hover:bg-gray-200 dark:hover:bg-gray-500">+</button>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div className={`${channelColors[i % channelColors.length]} h-2.5 rounded-full transition-all duration-1000`} style={{ width: `${alloc}%` }}></div>
                      </div>
                    </div>
                  ))}
                  {editingBudget && (
                    <div className="flex justify-between text-xs text-gray-400 pt-1">
                      <span>Total: {Object.values(editAllocations).reduce((s, v) => s + v, 0)}%</span>
                      {Object.values(editAllocations).reduce((s, v) => s + v, 0) !== 100 && <span className="text-amber-500">Should add up to 100%</span>}
                    </div>
                  )}
                  {optimizedBudget && !editingBudget && (
                    <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800 space-y-2">
                      <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1"><BrainCircuit size={12} /> AI Suggested Allocation</p>
                      {optimizedBudget.map((o, i: number) => {
                        const current = result.channels?.find((c) => c.channel === o.channel)
                        const diff = current ? o.budgetAllocation - current.budgetAllocation : 0
                        return (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">{o.channel}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-800 dark:text-gray-200 font-medium">{o.budgetAllocation}%</span>
                              {diff !== 0 && (
                                <span className={`${diff > 0 ? "text-green-500" : "text-red-500"}`}>
                                  {diff > 0 ? "+" : ""}{diff}%
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white"><TrendingUp size={18} className="text-blue-600" /> Marketing Funnel</h2>
              <div className="flex flex-col items-center space-y-1">
                {result.funnel?.map((stage, idx: number) => {
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
                          <button type="button" onClick={() => document.getElementById(`stage-${stage.stage}`)?.scrollIntoView({ behavior: "smooth", block: "start" })} className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"><ChevronRight size={16} className="text-gray-400" /></button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-2">{stage.goal}</p>
                        <div className="flex flex-wrap gap-2">
                          {stage.tactics?.map((t) => (
                            <div key={t.id} onClick={() => setDrilldown(t)} className="bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-700 transition flex-1 min-w-[180px] max-w-full">
                              <div className="text-xs font-medium text-gray-800 dark:text-gray-200">{t.title}</div>
                              <div className="flex items-center gap-1.5 mt-1">
                                {t.channel && <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded">{t.channel}</span>}
                                <ImpactBadge impact={t.impact} />
                                <EffortBadge effort={t.effort} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {idx < (result.funnel?.length || 0) - 1 && (
                        <button type="button" onClick={() => document.getElementById(`stage-${result.funnel[idx + 1]?.stage}`)?.scrollIntoView({ behavior: "smooth", block: "start" })} className="flex justify-center py-0.5 w-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition rounded-lg"><ChevronRight size={14} className="text-gray-300 dark:text-gray-600 rotate-90" /></button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* SWOT Analysis */}
            {form.competitors && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white"><Target size={18} className="text-blue-600" /> Competitor SWOT</h2>
                  {!swot && <button onClick={handleSWOT} disabled={swotLoading} className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50">{swotLoading ? "Analyzing..." : "Generate SWOT"}</button>}
                </div>
                {swotLoading && <div className="skeleton h-32 rounded-xl" />}
                {swot && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                      <h3 className="text-sm font-bold text-green-800 dark:text-green-300 mb-2">Strengths</h3>
                      <ul className="space-y-1">{swot.strengths?.map((s: string, i: number) => <li key={i} className="text-xs text-green-700 dark:text-green-400 flex items-start gap-1.5"><span className="text-green-500 mt-0.5">+</span>{s}</li>)}</ul>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                      <h3 className="text-sm font-bold text-red-800 dark:text-red-300 mb-2">Weaknesses</h3>
                      <ul className="space-y-1">{swot.weaknesses?.map((s: string, i: number) => <li key={i} className="text-xs text-red-700 dark:text-red-400 flex items-start gap-1.5"><span className="text-red-500 mt-0.5">−</span>{s}</li>)}</ul>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                      <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">Opportunities</h3>
                      <ul className="space-y-1">{swot.opportunities?.map((s: string, i: number) => <li key={i} className="text-xs text-blue-700 dark:text-blue-400 flex items-start gap-1.5"><span className="text-blue-500 mt-0.5">→</span>{s}</li>)}</ul>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                      <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300 mb-2">Threats</h3>
                      <ul className="space-y-1">{swot.threats?.map((s: string, i: number) => <li key={i} className="text-xs text-orange-700 dark:text-orange-400 flex items-start gap-1.5"><span className="text-orange-500 mt-0.5">!</span>{s}</li>)}</ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Search & Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-gray-700 mb-8">
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
                <div className="relative flex-1 min-w-[160px]">
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search tactics..." className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <select value={filterChannel} onChange={(e) => setFilterChannel(e.target.value)} className="px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white min-h-[44px]">
                  <option value="">All channels</option>
                  {result.channels?.map((c) => <option key={c.channel} value={c.channel}>{c.channel}</option>)}
                </select>
                <select value={filterImpact} onChange={(e) => setFilterImpact(e.target.value)} className="px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white min-h-[44px]">
                  <option value="">All impact</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
                <select value={filterEffort} onChange={(e) => setFilterEffort(e.target.value)} className="px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white min-h-[44px]">
                  <option value="">All effort</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                {(searchQuery || filterChannel || filterImpact || filterEffort) && (
                  <button onClick={() => { setSearchQuery(""); setFilterChannel(""); setFilterImpact(""); setFilterEffort("") }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline min-h-[44px] flex items-center">Clear</button>
                )}
              </div>
            </div>

            {/* Industry Benchmarks */}
            {result.benchmarks && result.benchmarks.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white"><Award size={18} className="text-blue-600" /> Industry Benchmarks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.benchmarks.map((b, i: number) => {
                    const fmt = (v: string) => {
                      const clean = v.replace(/[$%]/g, "")
                      const u = (b.unit || "").replace(/[$%]/g, "")
                      const hasSymbol = v.includes("$") || v.includes("%")
                      return hasSymbol ? v : b.unit === "$" ? `$${clean}${u}` : `${clean}${b.unit || u}`
                    }
                    const yourVal = parseFloat(b.yourValue?.replace(/[$%]/g, "") || "0")
                    const avgVal = parseFloat(b.industryAvg?.replace(/[$%]/g, "") || "0")
                    const isBetter = !isNaN(yourVal) && !isNaN(avgVal) && yourVal > avgVal
                    const ratio = !isNaN(yourVal) && !isNaN(avgVal) && avgVal > 0 ? Math.min((yourVal / avgVal) * 100, 150) : 50
                    return (
                      <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{b.metric}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-center flex-1">
                            <p className="text-xs text-gray-400 dark:text-gray-500">You</p>
                            <p className={`text-lg font-bold ${isBetter ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>{fmt(b.yourValue)}</p>
                          </div>
                          <div className="text-center flex-1">
                            <p className="text-xs text-gray-400 dark:text-gray-500">Industry Avg</p>
                            <p className="text-lg font-bold text-gray-500 dark:text-gray-400">{fmt(b.industryAvg)}</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2 overflow-hidden">
                          <div className={`h-2 rounded-full ${isBetter ? "bg-green-500" : "bg-amber-500"}`} style={{ width: `${ratio}%` }}></div>
                        </div>
                        <p className={`text-[10px] mt-1 text-center ${isBetter ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>{isBetter ? "Above average" : "Below average"}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quick Wins */}
            {(() => {
              const quickWins = result.tactics?.filter((t) => (t.impact || "").toUpperCase() === "HIGH" && (t.effort || "").toUpperCase() === "LOW") || []
              if (quickWins.length === 0) return null
              return (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-lg p-6 border border-green-200 dark:border-green-800 mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🚀</span>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quick Wins</h2>
                    <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded-full">{quickWins.length} tactic{quickWins.length > 1 ? "s" : ""}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {quickWins.map((t) => (
                      <div key={t.id} onClick={() => setDrilldown(t)} className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-green-200 dark:border-green-700 cursor-pointer hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{t.title}</h3>
                          <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded font-medium">HIGH</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{t.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {t.channel && <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded">{t.channel}</span>}
                          {t.estimatedROI && <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">{t.estimatedROI.toFixed(1)}% ROI</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white"><Calendar size={18} className="text-blue-600" /> Timeline</h2>
                <div className="space-y-4">
                  {result.timeline?.phases?.map((phase, idx: number) => {
                    const c = ["border-l-blue-500 bg-blue-50 dark:bg-blue-900/20", "border-l-green-500 bg-green-50 dark:bg-green-900/20", "border-l-purple-500 bg-purple-50 dark:bg-purple-900/20", "border-l-amber-500 bg-amber-50 dark:bg-amber-900/20"]
                    return (
                      <div key={idx} className={`border-l-4 ${c[idx % c.length]} rounded-r-xl p-4`}>
                        <div className="flex justify-between items-start">
                          <div><h3 className="font-semibold text-gray-900 dark:text-white">{phase.name}</h3><p className="text-sm text-gray-500 dark:text-gray-400">{phase.duration} weeks</p></div>
                          <span className="text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-700 px-2 py-1 rounded-full border dark:border-gray-600">{phase.tactics?.length || 0} tactics</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {phase.tactics?.map((tid: string) => {
                            const found = result.tactics?.find((t) => t.id === tid)
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
                  {result.channels?.slice().sort((a, b) => b.priority - a.priority).map((c, i: number) => {
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

            {/* ── TOGGLE: LIST VIEW vs KANBAN BOARD ── */}
            {showBoard ? (
              <KanbanBoard
                tactics={result.tactics}
                funnel={result.funnel}
                tacticStatus={tacticStatus}
                searchQuery={searchQuery}
                filterChannel={filterChannel}
                filterImpact={filterImpact}
                filterEffort={filterEffort}
                cycleStatus={cycleStatus}
                setStatus={setStatus}
                countByStatus={countByStatus}
                totalTactics={totalTactics}
              />
            ) : (
              result.funnel?.map((stage) => {
              const meta = funnelMeta[stage.stage as keyof typeof funnelMeta] || { label: stage.stage, icon: "📌", headBg: "bg-gray-50 dark:bg-gray-700", headBorder: "border-gray-200 dark:border-gray-600", stageBg: "bg-gray-50 dark:bg-gray-700", stageBorder: "border-gray-200 dark:border-gray-600", desc: "" }
              const filteredTactics = (stage.tactics || []).filter((t) => {
                if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false
                if (filterChannel && (t.channel || "").toUpperCase() !== filterChannel.toUpperCase()) return false
                if (filterImpact && (t.impact || "").toUpperCase() !== filterImpact.toUpperCase()) return false
                if (filterEffort && (t.effort || "").toUpperCase() !== filterEffort.toUpperCase()) return false
                return true
              })
              if (filteredTactics.length === 0 && (searchQuery || filterChannel || filterImpact || filterEffort)) return null
              return (
                <div id={`stage-${stage.stage}`} key={stage.stage} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mb-6 overflow-hidden">
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
                    {filteredTactics.map((t) => {
                      const imp = (t.impact || "").toUpperCase()
                      const impactColor = imp === "HIGH" ? "border-l-green-500" : imp === "MEDIUM" ? "border-l-amber-500" : "border-l-gray-400"
                      const st = tacticStatus[t.id] || "todo"
                      const statusDots: Record<string, string> = { todo: "text-gray-300 dark:text-gray-600", in_progress: "text-blue-500", done: "text-green-500" }
                      return (
                        <div key={t.id} className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer border-l-4 ${impactColor}`} onClick={() => setDrilldown(t)}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <button onClick={(e) => { e.stopPropagation(); cycleStatus(t.id) }} className={`text-xs ${statusDots[st]} hover:scale-125 transition`} title={`Status: ${st}. Click to cycle.`}>
                                  {st === "todo" ? "○" : st === "in_progress" ? "◐" : "●"}
                                </button>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{t.title}</h3>
                                {(t.impact || "").toUpperCase() === "LOW" && <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700 px-1.5 py-0.5 rounded font-medium">⚠️ Review</span>}
                                {t.channel && <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{t.channel}</span>}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t.description}</p>
                            </div>
                            <div className="flex gap-2 shrink-0 ml-4">
                              <ImpactBadge impact={t.impact} />
                              <EffortBadge effort={t.effort} />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                            <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3">
                              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed"><span className="font-semibold">Why it works:</span> {t.reasoning}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg p-3 flex flex-col justify-center">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs text-gray-400 dark:text-gray-500">Est. ROI</span>
                                <span className="text-sm font-bold text-green-600 dark:text-green-400">{t.estimatedROI?.toFixed(1)}%</span>
                              </div>
                              <div className="flex items-center justify-between gap-1 mt-1">
                                <span className="text-xs text-gray-400 dark:text-gray-500">Channel</span>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t.channel || "Multi"}</span>
                              </div>
                            </div>
                          </div>
                          {t.steps && t.steps.length > 0 && (
                            <details className="mt-2 group">
                              <summary className="text-xs text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition flex items-center gap-1"><CheckSquare size={12} /> {t.steps.length} execution steps</summary>
                              <div className="mt-2 space-y-1">
                                {t.steps.map((step: string, si: number) => (
                                  <div key={si} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{si + 1}</span>
                                    <span>{step}</span>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
            )}

            {/* Channel Maturity Roadmap */}
            {result.channelRoadmap && result.channelRoadmap.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white"><TrendingUp size={18} className="text-blue-600" /> Channel Maturity Roadmap</h2>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600"></div>
                  <div className="space-y-6">
                    {result.channelRoadmap.map((month, idx: number) => (
                      <div key={idx} className="relative pl-10">
                        <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800"></div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Month {month.month}</h3>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-600 px-2 py-0.5 rounded border dark:border-gray-500">{month.channels?.length || 0} channels</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {month.channels?.map((ch, ci: number) => {
                              const actionColors: Record<string, string> = { start: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700", scale: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700", optimize: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700" }
                              return <span key={ci} className={`text-xs px-2 py-1 rounded-full border font-medium ${actionColors[ch.action] || "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400"}`}>{ch.action} {ch.name}</span>
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Content Calendar */}
            {(() => {
              const phases = result.timeline?.phases || []
              if (phases.length === 0) return null
              let currentMonth = new Date()
              return (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-8">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white"><Calendar size={18} className="text-blue-600" /> Content Calendar</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {phases.map((phase, idx: number) => {
                      const start = new Date(currentMonth)
                      currentMonth.setMonth(currentMonth.getMonth() + Math.max(phase.duration || 1, 1))
                      const end = new Date(currentMonth)
                      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                      const phaseMonths: string[] = []
                      const m = new Date(start)
                      while (m <= end) { phaseMonths.push(`${monthNames[m.getMonth()]} ${m.getFullYear()}`); m.setMonth(m.getMonth() + 1) }
                      const phaseColors = ["border-t-blue-500 bg-blue-50 dark:bg-blue-900/20", "border-t-green-500 bg-green-50 dark:bg-green-900/20", "border-t-purple-500 bg-purple-50 dark:bg-purple-900/20", "border-t-amber-500 bg-amber-50 dark:bg-amber-900/20"]
                      return (
                        <div key={idx} className={`border-t-4 ${phaseColors[idx % phaseColors.length]} rounded-xl p-4`}>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{phase.name}</h3>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-700 px-2 py-0.5 rounded border dark:border-gray-600">{phase.duration}w</span>
                          </div>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2">{phaseMonths.join(" – ")}</p>
                          <div className="space-y-1">
                            {phase.tactics?.slice(0, 3).map((tid: string) => {
                              const found = result.tactics?.find((t) => t.id === tid)
                              return found ? <div key={tid} className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span><span className="text-[11px] text-gray-600 dark:text-gray-400 truncate">{found.title}</span></div> : null
                            })}
                            {(phase.tactics?.length || 0) > 3 && <p className="text-[10px] text-gray-400 pl-3">+{(phase.tactics?.length || 0) - 3} more</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            {/* Strategy Notes */}
            {(() => {
              return (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> Strategy Notes</h2>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">Auto-saved</span>
                  </div>
                  <textarea value={strategyNotes} onChange={(e) => setStrategyNotes(e.target.value)} placeholder="Add your notes, observations, or action items for this strategy..." rows={4} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-y" />
                </div>
              )
            })()}

            <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-xs">
              <p>Strategy generated by AI &middot; Review before implementing</p>
            </div>
          </div>
        </div>
        {drilldown && <DrilldownModal tactic={drilldown} onClose={() => setDrilldown(null)} />}
        {showHistory && <HistoryPanel history={history} onLoad={loadFromHistory} onCompare={startCompare} onRemove={removeHistory} onRename={renameHistory} onClose={() => setShowHistory(false)} />}
        {showSettings && <SettingsPanel branding={branding} setBranding={setBranding} apiKey={apiKey} setApiKey={setApiKey} onClose={() => setShowSettings(false)} />}
        {/* AI Strategy Chat */}
        {!showChat ? (
          <button onClick={() => setShowChat(true)} className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition flex items-center justify-center">
            <MessageCircle size={24} />
          </button>
        ) : (
          <div className="fixed bottom-6 right-6 z-40 w-[380px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col" style={{ height: "500px", maxHeight: "calc(100vh - 120px)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2"><MessageCircle size={16} className="text-blue-600" /> Strategy Chat</h3>
              <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatHistory.length === 0 && <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">Ask anything about your strategy — "How do I execute tactic X?" or "What happens if I increase my budget?"</p>}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}`}>
                    {msg.role === "ai" && <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1 font-medium">AI</p>}
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              {chatLoading && <div className="flex justify-start"><div className="bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2 text-sm text-gray-500 dark:text-gray-400"><Loader2 size={14} className="animate-spin inline mr-1" /> Thinking...</div></div>}
            </div>
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={(e) => { e.preventDefault(); handleChat() }} className="flex gap-2">
                <input type="text" value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} placeholder="Ask about your strategy..." className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" disabled={chatLoading} />
                <button type="submit" disabled={chatLoading || !chatMsg.trim()} className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"><MessageCircle size={16} /></button>
              </form>
            </div>
          </div>
        )}
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
          <FormView
            form={form}
            updateForm={updateForm}
            wizardMode={wizardMode}
            setWizardMode={setWizardMode}
            wizardStep={wizardStep}
            setWizardStep={setWizardStep}
            isLoading={isLoading}
            error={error}
            validationWarnings={validationWarnings}
            isDark={isDark}
            toggleDark={toggleDark}
            branding={branding}
            setShowSettings={setShowSettings}
            setShowHistory={setShowHistory}
            onSubmit={onSubmit}
            toggleChannel={toggleChannel}
          />
        </div>
      </div>
      {showHistory && <HistoryPanel history={history} onLoad={loadFromHistory} onCompare={startCompare} onRemove={removeHistory} onRename={renameHistory} onClose={() => setShowHistory(false)} />}
      {showSettings && <SettingsPanel branding={branding} setBranding={setBranding} apiKey={apiKey} setApiKey={setApiKey} onClose={() => setShowSettings(false)} />}
    </>
  )
}
