"use client"

import { Channel, FormState, BrandingConfig } from "@/types"
import { INDUSTRIES } from "@/data/tactics"
import { Loader2, Sparkles, Moon, Sun, Settings, History } from "lucide-react"

const channels = [
  { value: Channel.SEO, label: "SEO" }, { value: Channel.PPC, label: "PPC" },
  { value: Channel.SOCIAL, label: "Social" }, { value: Channel.EMAIL, label: "Email" },
  { value: Channel.CONTENT, label: "Content" }, { value: Channel.PAID_SOCIAL, label: "Paid Social" },
  { value: Channel.INFLUENCER, label: "Influencer" }, { value: Channel.AFFILIATE, label: "Affiliate" },
  { value: Channel.SMS, label: "SMS" }, { value: Channel.DISPLAY, label: "Display" },
]

interface FormViewProps {
  form: FormState
  updateForm: (updates: Partial<FormState>) => void
  wizardMode: boolean
  setWizardMode: (v: boolean) => void
  wizardStep: number
  setWizardStep: (v: number) => void
  isLoading: boolean
  error: string
  validationWarnings: string[]
  isDark: boolean
  toggleDark: () => void
  branding: BrandingConfig
  setShowSettings: (v: boolean) => void
  setShowHistory: (v: boolean) => void
  onSubmit: (e: React.FormEvent) => void
  toggleChannel: (value: string) => void
}

export default function FormView({
  form, updateForm, wizardMode, setWizardMode, wizardStep, setWizardStep,
  isLoading, error, validationWarnings, isDark, toggleDark,
  branding, setShowSettings, setShowHistory, onSubmit, toggleChannel,
}: FormViewProps) {
  return (
    <>
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

      <div className="flex justify-end mb-2">
        <button type="button" onClick={() => setWizardMode(!wizardMode)} className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition flex items-center gap-1">
          {wizardMode ? "Show full form" : "Guided wizard"}
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </button>
      </div>

      <form onSubmit={onSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 md:p-8 space-y-6">
        {wizardMode ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className={`flex-1 h-1.5 rounded-full transition ${s <= wizardStep + 1 ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-600"}`} />
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center -mt-2 mb-4">Step {wizardStep + 1} of 4</p>

            {wizardStep === 0 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Who is this for?</label>
                  <input type="text" value={form.clientName || ""} onChange={(e) => updateForm({ clientName: e.target.value })} placeholder="Your name or client name (optional)" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">What industry?</label>
                  <select value={form.industry} onChange={(e) => updateForm({ industry: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm">
                    {INDUSTRIES.map((ind) => (<option key={ind.id} value={ind.id}>{ind.icon} {ind.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">What&apos;s the primary goal?</label>
                  <select value={form.goal} onChange={(e) => updateForm({ goal: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm">
                    <option value="awareness">🔍 Brand Awareness — Get people to know us</option>
                    <option value="leads">📋 Generate Leads — Get sign-ups and inquiries</option>
                    <option value="sales">💰 Drive Sales — Sell more products/services</option>
                    <option value="retention">❤️ Customer Retention — Keep existing customers</option>
                    <option value="growth">📈 Overall Growth — A bit of everything</option>
                  </select>
                </div>
              </div>
            )}

            {wizardStep === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">What&apos;s your monthly budget?</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium">$</span>
                    <input type="number" inputMode="numeric" value={form.budget} onChange={(e) => updateForm({ budget: Number(e.target.value) })} min={1000} step={1000} className="w-full pl-8 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Recommended: $2,000 – $10,000/mo for meaningful results</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">What&apos;s your strategy style?</label>
                  <div className="grid grid-cols-1 gap-2">
                    {["balanced", "aggressive", "conservative"].map((style) => (
                      <button key={style} type="button" onClick={() => updateForm({ strategyStyle: style })}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition min-h-[52px] ${form.strategyStyle === style ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50" : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"}`}>
                        <span className="text-lg">{style === "balanced" ? "⚖️" : style === "aggressive" ? "🚀" : "🛡️"}</span>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white capitalize">{style}</p>
                          <p className="text-xs text-gray-400">{style === "balanced" ? "Mix of paid and organic" : style === "aggressive" ? "Higher risk, higher reward" : "Steady, low-risk growth"}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Which channels do you use?</label>
                <p className="text-xs text-gray-400 -mt-3 mb-1">Select at least one channel</p>
                <div className="grid grid-cols-2 gap-2">
                  {channels.map((ch) => {
                    const isSelected = form.selectedChannels.includes(ch.value)
                    return (
                      <button key={ch.value} type="button" onClick={() => toggleChannel(ch.value)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition min-h-[48px] ${isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium" : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400"}`}>
                        {isSelected ? <span className="text-blue-500">✓</span> : <span className="w-4" />}
                        {ch.label}
                      </button>
                    )
                  })}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.selectedChannels.map((v) => {
                    const ch = channels.find((c) => c.value === v)
                    return ch ? <button key={v} type="button" onClick={() => toggleChannel(v)} className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 transition">{ch.label} ✕</button> : null
                  })}
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Competitors (optional — for SWOT analysis)</label>
                  <input type="text" value={form.competitors || ""} onChange={(e) => updateForm({ competitors: e.target.value })} placeholder="e.g. Competitor A, Competitor B" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm" />
                </div>
                <details className="group">
                  <summary className="text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition">⚡ Set KPI targets (optional)</summary>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Target CPA <span className="text-[10px] text-gray-300 dark:text-gray-600 cursor-help" title="Cost Per Acquisition — how much you&apos;re willing to spend to get one customer. Lower is better.">ⓘ</span></label>
                      <input type="number" inputMode="numeric" value={form.targetCPA || ""} onChange={(e) => updateForm({ targetCPA: e.target.value ? Number(e.target.value) : undefined })} min={0} step={1} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm" placeholder="$25" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Target ROAS <span className="text-[10px] text-gray-300 dark:text-gray-600 cursor-help" title="Return On Ad Spend — dollars earned per $1 spent. Higher is better.">ⓘ</span></label>
                      <input type="number" inputMode="decimal" value={form.targetROAS || ""} onChange={(e) => updateForm({ targetROAS: e.target.value ? Number(e.target.value) : undefined })} min={0} step={0.1} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm" placeholder="4x" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Target Conv. Rate <span className="text-[10px] text-gray-300 dark:text-gray-600 cursor-help" title="Conversion Rate — % of visitors who take action. Higher is better.">ⓘ</span></label>
                      <input type="number" inputMode="decimal" value={form.targetConversionRate || ""} onChange={(e) => updateForm({ targetConversionRate: e.target.value ? Number(e.target.value) : undefined })} min={0} step={0.1} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm" placeholder="3.5%" />
                    </div>
                  </div>
                </details>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Ready to generate</h4>
                  <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                    <p>{form.clientName ? `Client: ${form.clientName}` : "Individual"}{form.strategyStyle === "aggressive" ? " · Aggressive" : form.strategyStyle === "conservative" ? " · Conservative" : " · Balanced"} · {form.goal}</p>
                    <p>{form.industry} · ${form.budget.toLocaleString()}/mo · {form.selectedChannels.length} channel{form.selectedChannels.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setWizardStep(Math.max(0, wizardStep - 1))} disabled={wizardStep === 0} className="px-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] text-gray-700 dark:text-gray-300">Back</button>
              {wizardStep < 3 ? (
                <button type="button" onClick={() => setWizardStep(Math.min(3, wizardStep + 1))} className="px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition min-h-[44px]">Next</button>
              ) : (
                <button type="submit" disabled={isLoading} className="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 flex items-center gap-2 min-h-[44px]">
                  {isLoading ? <><Loader2 className="animate-spin" size={16} /> Generating...</> : <><Sparkles size={16} /> Generate Strategy</>}
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Client Name (optional)</label>
                <input type="text" value={form.clientName || ""} onChange={(e) => updateForm({ clientName: e.target.value })} placeholder="e.g. Acme Corp" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm" />
              </div>
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
                  <input type="number" inputMode="numeric" value={form.budget} onChange={(e) => updateForm({ budget: Number(e.target.value) })} min={1000} step={1000} className="w-full pl-8 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm" />
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Strategy Style</label>
                <select value={form.strategyStyle || "balanced"} onChange={(e) => updateForm({ strategyStyle: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm">
                  <option value="balanced">⚖️ Balanced</option>
                  <option value="aggressive">🚀 Aggressive (high growth)</option>
                  <option value="conservative">🛡️ Conservative (low risk)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Competitors (for SWOT)</label>
                <input type="text" value={form.competitors || ""} onChange={(e) => updateForm({ competitors: e.target.value })} placeholder="e.g. Competitor A, Competitor B" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm" />
              </div>
              <div className="md:col-span-2">
                <details className="group">
                  <summary className="text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition">⚡ KPI Targets (optional)</summary>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Target CPA <span className="text-[10px] text-gray-300 dark:text-gray-600 cursor-help" title="Cost Per Acquisition — how much you&apos;re willing to spend to get one customer.">ⓘ</span></label>
                      <input type="number" inputMode="numeric" value={form.targetCPA || ""} onChange={(e) => updateForm({ targetCPA: e.target.value ? Number(e.target.value) : undefined })} min={0} step={1} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm" placeholder="$25" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Target ROAS <span className="text-[10px] text-gray-300 dark:text-gray-600 cursor-help" title="Return On Ad Spend — dollars earned per $1 spent.">ⓘ</span></label>
                      <input type="number" inputMode="decimal" value={form.targetROAS || ""} onChange={(e) => updateForm({ targetROAS: e.target.value ? Number(e.target.value) : undefined })} min={0} step={0.1} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm" placeholder="4x" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Target Conv. Rate <span className="text-[10px] text-gray-300 dark:text-gray-600 cursor-help" title="Conversion Rate — % of visitors who take action.">ⓘ</span></label>
                      <input type="number" inputMode="decimal" value={form.targetConversionRate || ""} onChange={(e) => updateForm({ targetConversionRate: e.target.value ? Number(e.target.value) : undefined })} min={0} step={0.1} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm" placeholder="3.5%" />
                    </div>
                  </div>
                </details>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Channels</label>
                <div className="grid grid-cols-3 gap-2">
                  {channels.slice(0, 6).map((ch) => {
                    const isSelected = form.selectedChannels.includes(ch.value)
                    return (
                      <button key={ch.value} type="button" onClick={() => toggleChannel(ch.value)}
                        className={`py-2.5 px-2 rounded-lg border text-xs font-medium transition min-h-[44px] ${isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-300 text-blue-700" : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400"}`}>
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
                return ch ? <button key={v} type="button" onClick={() => toggleChannel(v)} className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 transition">{ch.label} ✕</button> : null
              })}
            </div>
            {validationWarnings.length > 0 && !error && (
              <div className="space-y-1">
                {validationWarnings.map((w, i) => <p key={i} className="text-amber-600 dark:text-amber-400 text-xs bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">{w}</p>)}
              </div>
            )}
            {error && <p className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 p-3 rounded-xl">{error}</p>}
            <button type="submit" disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-blue-900/50 text-sm">
              {isLoading ? <><Loader2 className="animate-spin" size={20} /> Generating Strategy...</> : <><Sparkles size={20} /> Generate Strategy</>}
            </button>
          </>
        )}
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
    </>
  )
}
