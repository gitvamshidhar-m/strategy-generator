"use client"

import { GeneratedStrategy, FormState, FunnelStage, FunnelTactic, ChannelAllocation, Benchmark, BrandingConfig, SWOTAnalysis } from "@/types"

export function copyStrategyToClipboard(result: GeneratedStrategy, form: FormState): string {
  const lines = [
    `Growth Strategy for ${form.industry} ($${(form.budget || 0).toLocaleString()}/mo)`,
    `Goal: ${form.goal}`,
    `Est. ROI: ${result.estimatedROI?.toFixed(1)}%`,
    "",
    ...result.funnel.flatMap((stage) => [
      `[${stage.stage.toUpperCase()}] ${stage.label}`,
      ...stage.tactics.map((t) => `  - ${t.title}: ${t.description}`),
      "",
    ]),
    `Generated via AI Strategy Generator`,
  ].join("\n")
  navigator.clipboard.writeText(lines).catch(() => {})
  return lines
}

export function generateShareUrl(result: GeneratedStrategy, form: FormState): string {
  const payload = { result, form }
  try {
    const encoded = btoa(encodeURIComponent(JSON.stringify(payload)))
    return `${window.location.origin}?share=${encoded}`
  } catch {
    return window.location.href
  }
}

export function parseShareUrl(): { result: GeneratedStrategy; form: FormState } | null {
  try {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get("share")
    if (!encoded) return null
    return JSON.parse(decodeURIComponent(atob(encoded)))
  } catch { return null }
}

export function exportPDF(result: GeneratedStrategy, form: FormState, branding?: BrandingConfig) {
  const win = window.open("", "_blank")
  if (!win) { window.print(); return }
  const fmt = (v: string, u: string) => {
    const has = v?.includes("$") || v?.includes("%"); const clean = (v || "").replace(/[$%]/g, "")
    return has ? v : u === "$" ? `$${clean}` : `${clean}${u}`
  }
  const channelRow = (ch: ChannelAllocation, i: number) =>
    `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px">${ch.channel}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right">${ch.priority}/5</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right"><div style="background:#e5e7eb;border-radius:4px;height:16px;overflow:hidden"><div style="background:#2563eb;height:16px;width:${ch.budgetAllocation}%;border-radius:4px"></div></div><span style="font-size:11px;color:#6b7280">${ch.budgetAllocation}%</span></td></tr>`
  const stageSection = (stage: FunnelStage) => `
    <div style="margin-bottom:24px">
      <h3 style="font-size:16px;font-weight:700;margin:0 0 4px;color:#1f2937">${stage.label}</h3>
      <p style="font-size:12px;color:#6b7280;margin:0 0 12px;font-style:italic">${stage.goal}</p>
      ${stage.tactics.map((t, i) => {
        const imp = (t.impact || "").toUpperCase()
        const borderColor = imp === "HIGH" ? "#22c55e" : imp === "MEDIUM" ? "#f59e0b" : "#9ca3af"
        return `<div style="border-left:4px solid ${borderColor};padding:12px 16px;margin-bottom:8px;background:#f9fafb;border-radius:4px">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:4px">
            <strong style="font-size:14px;color:#1f2937">${i+1}. ${t.title}</strong>
            <span style="font-size:11px;padding:2px 6px;background:${imp === "HIGH" ? "#dcfce7" : imp === "MEDIUM" ? "#fef3c7" : "#f3f4f6"};border-radius:4px;color:${imp === "HIGH" ? "#16a34a" : imp === "MEDIUM" ? "#d97706" : "#6b7280"};font-weight:600">${t.impact}</span>
          </div>
          <p style="font-size:12px;color:#6b7280;margin:0 0 4px;line-height:1.5">${t.description}</p>
          <p style="font-size:11px;color:#2563eb;margin:0;font-style:italic">Why it works: ${t.reasoning}</p>
          ${t.channel ? `<p style="font-size:11px;color:#6b7280;margin:4px 0 0">Channel: ${t.channel}${t.estimatedROI ? ` | Est. ROI: ${t.estimatedROI.toFixed(1)}%` : ""}</p>` : ""}
          ${t.steps?.length ? `<ol style="font-size:11px;color:#6b7280;margin:4px 0 0;padding-left:16px">${t.steps.map((s) => `<li style="margin:2px 0">${s}</li>`).join("")}</ol>` : ""}
        </div>`
      }).join("")}
    </div>`
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Growth Strategy - ${form.industry}</title>
<style>
  @page { margin: 20mm 15mm; }
  body { font-family: 'Segoe UI', -apple-system, sans-serif; color: #374151; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px; }
  table { width: 100%; border-collapse: collapse; }
  @media print { body { padding: 0; } .no-print { display: none !important; } }
</style></head><body>
  <div style="text-align:center;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #2563eb">
    ${branding?.showBranding && branding?.companyName ? `<p style="font-size:13px;color:${branding.accentColor || '#2563eb'};margin:0 0 4px;font-weight:600">${branding.companyName}</p>` : ""}
    <h1 style="font-size:28px;font-weight:800;margin:0 0 4px;color:#1f2937">Growth Strategy</h1>
    <p style="font-size:14px;color:#6b7280;margin:0">${form.clientName || form.industry} · ${form.strategyStyle || "Balanced"} · $${(form.budget || 0).toLocaleString()}/mo · ${form.goal}</p>
  </div>
  <div style="margin-bottom:24px">
    <h2 style="font-size:18px;font-weight:700;margin:0 0 8px;color:#1f2937">Executive Summary</h2>
    <p style="font-size:13px;color:#6b7280;line-height:1.6">${result.reasoning || ""}</p>
    <div style="display:flex;gap:16px;margin-top:12px;flex-wrap:wrap">
      ${[["Total Tactics", (result.tactics?.length || 0).toString()], ["Est. ROI", `${result.estimatedROI?.toFixed(1)}%`], ["Channels", (result.channels?.length || 0).toString()], ["Budget", `$${(form.budget || 0).toLocaleString()}/mo`]].map(([l, v]) => `<div style="flex:1;min-width:100px;text-align:center;padding:12px;background:#f3f4f6;border-radius:8px"><p style="font-size:11px;color:#6b7280;margin:0 0 4px;text-transform:uppercase">${l}</p><p style="font-size:20px;font-weight:700;margin:0;color:#1f2937">${v}</p></div>`).join("")}
    </div>
  </div>
  <div style="margin-bottom:24px">
    <h2 style="font-size:18px;font-weight:700;margin:0 0 12px;color:#1f2937">Channel Budget Allocation</h2>
    <table>${["<thead><tr><th style='text-align:left;padding:6px 8px;font-size:12px;color:#6b7280;border-bottom:2px solid #e5e7eb'>Channel</th><th style='text-align:right;padding:6px 8px;font-size:12px;color:#6b7280;border-bottom:2px solid #e5e7eb'>Priority</th><th style='text-align:right;padding:6px 8px;font-size:12px;color:#6b7280;border-bottom:2px solid #e5e7eb'>Allocation</th></tr></thead>", "<tbody>", ...result.channels.map((c, i) => channelRow(c, i)), "</tbody>"].filter(Boolean).join("")}</table>
  </div>
  ${result.funnel.map(stageSection).join("<hr style='border:none;border-top:1px solid #e5e7eb;margin:16px 0'>")}
  ${result.benchmarks?.length ? `<div style="margin-bottom:24px"><h2 style="font-size:18px;font-weight:700;margin:0 0 12px;color:#1f2937">Benchmarks</h2><table>${["<thead><tr><th style='text-align:left;padding:6px 8px;font-size:12px;color:#6b7280;border-bottom:2px solid #e5e7eb'>Metric</th><th style='text-align:right;padding:6px 8px;font-size:12px;color:#6b7280;border-bottom:2px solid #e5e7eb'>Your Value</th><th style='text-align:right;padding:6px 8px;font-size:12px;color:#6b7280;border-bottom:2px solid #e5e7eb'>Industry Avg</th></tr></thead>", "<tbody>", ...result.benchmarks.map((b) => `<tr><td style='padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px'>${b.metric}</td><td style='padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;font-weight:600;color:#16a34a'>${fmt(b.yourValue, b.unit)}</td><td style='padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;color:#6b7280'>${fmt(b.industryAvg, b.unit)}</td></tr>`), "</tbody>"].filter(Boolean).join("")}</table></div>` : ""}
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#9ca3af">
    <p style="margin:0">Generated with AI Strategy Generator</p>
  </div>
  <button class="no-print" onclick="window.print()" style="position:fixed;bottom:24px;right:24px;padding:10px 20px;background:#2563eb;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.15)">Print / Save as PDF</button>
</body></html>`
  win.document.write(html)
  win.document.close()
}

export const channelColors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500", "bg-pink-500", "bg-cyan-500", "bg-red-500", "bg-indigo-500"]
export const channelTextColors = ["text-blue-600", "text-green-600", "text-purple-600", "text-amber-600", "text-pink-600", "text-cyan-600", "text-red-600", "text-indigo-600"]

export function clampPriority(p: number): number {
  return Math.min(Math.max(p, 0), 5)
}

export function downloadJSON(result: GeneratedStrategy, form: FormState) {
  const blob = new Blob([JSON.stringify({ form, result, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = `strategy-${form.industry || "export"}-${Date.now()}.json`
  a.click(); URL.revokeObjectURL(url)
}

export function downloadCSV(result: GeneratedStrategy, form: FormState) {
  const rows = [["Stage", "Tactic", "Description", "Channel", "Impact", "Effort", "Est. ROI", "Steps"]]
  result.funnel.forEach((stage) =>
    stage.tactics.forEach((t) =>
      rows.push([stage.label, t.title, `"${(t.description || "").replace(/"/g, '""')}"`, t.channel || "", t.impact || "", t.effort || "", t.estimatedROI?.toString() || "", `"${(t.steps || []).join("; ").replace(/"/g, '""')}"`])
    )
  )
  const csv = rows.map((r) => r.join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = `strategy-${form.industry || "export"}-${Date.now()}.csv`
  a.click(); URL.revokeObjectURL(url)
}

export function exportSlides(result: GeneratedStrategy, form: FormState, swot?: SWOTAnalysis, branding?: BrandingConfig) {
  const win = window.open("", "_blank")
  if (!win) return

  const accent = branding?.accentColor || "#2563eb"
  const barColors = ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#ec4899", "#06b6d4", "#ef4444", "#6366f1"]

  const channelSlide = () => {
    if (!result.channels?.length) return ""
    return `<div class="slide"><h2>Channel Budget Allocation</h2><p class="subtitle">$${form.budget.toLocaleString()}/mo total</p><div class="bars">${result.channels.map((c, i) => `
      <div class="bar-row"><div class="bar-label">${c.channel}</div><div class="bar-track"><div class="bar-fill" style="width:${c.budgetAllocation}%;background:${barColors[i % barColors.length]}"></div></div><div class="bar-value">${c.budgetAllocation}%</div></div>
    `).join("")}</div></div>`
  }

  const funnelSlides = () => result.funnel.map((stage) => `
    <div class="slide">
      <div class="stage-badge">${stage.stage.toUpperCase()}</div>
      <h2>${stage.label}</h2>
      <p class="subtitle">${stage.goal}</p>
      <div class="tactics">${stage.tactics.slice(0, 4).map((t) => `
        <div class="tactic-card"><div class="tactic-title">${t.title}</div><div class="tactic-desc">${t.description}</div><div class="tactic-meta"><span class="impact-${(t.impact || "").toLowerCase()}">${t.impact}</span><span class="effort-${(t.effort || "").toLowerCase()}">${t.effort} effort</span>${t.estimatedROI ? `<span>${t.estimatedROI.toFixed(0)}% ROI</span>` : ""}</div></div>
      `).join("")}</div>
      ${stage.tactics.length > 4 ? `<p class="more">+${stage.tactics.length - 4} more tactics</p>` : ""}
    </div>
  `).join("")

  const quickWinSlide = () => {
    const qw = result.tactics.filter((t) => (t.impact || "").toUpperCase() === "HIGH" && (t.effort || "").toUpperCase() === "LOW")
    if (!qw.length) return ""
    return `<div class="slide quick-win-slide"><div class="qw-badge">🚀</div><h2>Quick Wins</h2><p class="subtitle">High impact, low effort — execute these first</p><div class="qw-grid">${qw.slice(0, 6).map((t) => `
      <div class="qw-card"><div class="qw-title">${t.title}</div><div class="qw-desc">${t.description}</div></div>
    `).join("")}</div></div>`
  }

  const benchmarkSlide = () => {
    if (!result.benchmarks?.length) return ""
    return `<div class="slide"><h2>Industry Benchmarks</h2><div class="benchmarks">${result.benchmarks.map((b) => {
      const yourVal = parseFloat(String(b.yourValue).replace(/[$%]/g, "") || "0")
      const avgVal = parseFloat(String(b.industryAvg).replace(/[$%]/g, "") || "0")
      const better = yourVal > avgVal
      return `<div class="bm-item"><div class="bm-metric">${b.metric}</div><div class="bm-compare"><div class="bm-val ${better ? "better" : "worse"}"><span class="bm-label">You</span><span class="bm-number">${b.yourValue}${b.unit === "%" ? "%" : b.unit === "$" ? "" : ""}</span></div><div class="bm-vs">vs</div><div class="bm-val"><span class="bm-label">Avg</span><span class="bm-number">${b.industryAvg}${b.unit === "%" ? "%" : b.unit === "$" ? "" : ""}</span></div></div></div>`
    }).join("")}</div></div>`
  }

  const timelineSlide = () => {
    if (!result.timeline?.phases?.length) return ""
    return `<div class="slide"><h2>Timeline</h2><div class="timeline">${result.timeline.phases.map((p, i) => {
      const colors = ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b"]
      return `<div class="tl-phase"><div class="tl-dot" style="background:${colors[i % colors.length]}"></div><div class="tl-content"><div class="tl-name">${p.name}</div><div class="tl-duration">${p.duration} weeks</div><div class="tl-tactics">${(p.tactics || []).slice(0, 3).map((tid) => { const f = result.tactics.find((t) => t.id === tid); return f ? `<span>${f.title}</span>` : "" }).filter(Boolean).join("")}</div></div></div>`
    }).join("")}</div></div>`
  }

  const swotSlide = () => {
    if (!swot) return ""
    return `<div class="slide"><h2>SWOT Analysis</h2><div class="swot-grid">${[
      { title: "Strengths", items: swot.strengths, color: "#22c55e" },
      { title: "Weaknesses", items: swot.weaknesses, color: "#ef4444" },
      { title: "Opportunities", items: swot.opportunities, color: "#3b82f6" },
      { title: "Threats", items: swot.threats, color: "#f59e0b" },
    ].map((q) => `<div class="swot-q"><div class="swot-title" style="color:${q.color}">${q.title}</div><ul>${(q.items || []).slice(0, 4).map((s) => `<li>${s}</li>`).join("")}</ul></div>`).join("")}</div></div>`
  }

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Growth Strategy - ${form.industry}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; overflow: hidden; }
  .slide { display: none; width: 100vw; height: 100vh; padding: 60px 80px; flex-direction: column; justify-content: center; align-items: center; text-align: center; position: relative; }
  .slide.active { display: flex; }
  h1 { font-size: 64px; font-weight: 800; line-height: 1.1; margin-bottom: 16px; }
  h1 span { color: ${accent}; }
  h2 { font-size: 36px; font-weight: 700; margin-bottom: 12px; }
  .subtitle { font-size: 18px; color: #94a3b8; margin-bottom: 32px; }
  .accent { color: ${accent}; }
  .nav { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 16px; z-index: 10; }
  .nav button { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #e2e8f0; width: 40px; height: 40px; border-radius: 50%; font-size: 18px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
  .nav button:hover { background: rgba(255,255,255,0.2); }
  .nav .counter { font-size: 14px; color: #64748b; min-width: 60px; text-align: center; }
  .bars { width: 100%; max-width: 600px; }
  .bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .bar-label { width: 120px; text-align: right; font-size: 14px; font-weight: 600; }
  .bar-track { flex: 1; height: 24px; background: rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 12px; transition: width 1s ease; }
  .bar-value { width: 48px; text-align: left; font-size: 14px; font-weight: 600; color: ${accent}; }
  .tactics { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; max-width: 900px; }
  .tactic-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; width: 260px; text-align: left; }
  .tactic-title { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
  .tactic-desc { font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 10px; }
  .tactic-meta { display: flex; gap: 8px; flex-wrap: wrap; font-size: 11px; }
  .tactic-meta span { padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.08); }
  .impact-high { color: #22c55e; }
  .impact-medium { color: #f59e0b; }
  .impact-low { color: #94a3b8; }
  .stage-badge { font-size: 11px; letter-spacing: 2px; color: ${accent}; background: rgba(59,130,246,0.15); padding: 4px 12px; border-radius: 20px; margin-bottom: 12px; font-weight: 600; }
  .quick-win-slide { background: linear-gradient(135deg, #064e3b, #0f172a); }
  .qw-badge { font-size: 48px; margin-bottom: 8px; }
  .qw-grid { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; max-width: 800px; }
  .qw-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(34,197,94,0.3); border-radius: 12px; padding: 16px; width: 240px; text-align: left; }
  .qw-title { font-size: 14px; font-weight: 600; color: #22c55e; margin-bottom: 4px; }
  .qw-desc { font-size: 12px; color: #94a3b8; }
  .benchmarks { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; max-width: 800px; }
  .bm-item { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; width: 240px; }
  .bm-metric { font-size: 14px; font-weight: 600; margin-bottom: 12px; }
  .bm-compare { display: flex; align-items: center; justify-content: center; gap: 12px; }
  .bm-val { text-align: center; }
  .bm-label { font-size: 10px; color: #64748b; text-transform: uppercase; display: block; }
  .bm-number { font-size: 22px; font-weight: 700; }
  .bm-val.better .bm-number { color: #22c55e; }
  .bm-val.worse .bm-number { color: #f59e0b; }
  .bm-vs { font-size: 12px; color: #475569; }
  .timeline { position: relative; padding-left: 32px; max-width: 500px; text-align: left; }
  .tl-phase { position: relative; padding-bottom: 24px; padding-left: 20px; border-left: 2px solid rgba(255,255,255,0.1); }
  .tl-dot { position: absolute; left: -9px; top: 4px; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #0f172a; }
  .tl-name { font-size: 16px; font-weight: 600; }
  .tl-duration { font-size: 12px; color: #64748b; }
  .tl-tactics { margin-top: 6px; display: flex; flex-wrap: wrap; gap: 4px; }
  .tl-tactics span { font-size: 11px; padding: 2px 8px; background: rgba(255,255,255,0.08); border-radius: 4px; color: #94a3b8; }
  .swot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 700px; }
  .swot-q { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; text-align: left; }
  .swot-title { font-size: 16px; font-weight: 700; margin-bottom: 10px; }
  .swot-q ul { list-style: none; padding: 0; }
  .swot-q li { font-size: 13px; color: #94a3b8; padding: 4px 0; line-height: 1.4; }
  .swot-q li::before { content: "•"; margin-right: 6px; }
  .more { font-size: 13px; color: #64748b; margin-top: 12px; }
  .title-client { font-size: 20px; color: ${accent}; margin-bottom: 8px; font-weight: 500; }
  .title-meta { display: flex; gap: 24px; justify-content: center; margin-top: 24px; }
  .title-meta-item { text-align: center; }
  .title-meta-item .val { font-size: 28px; font-weight: 700; }
  .title-meta-item .lbl { font-size: 12px; color: #64748b; text-transform: uppercase; margin-top: 2px; }
  .thank-you { font-size: 48px; margin-bottom: 16px; }
  @media print { .nav { display: none; } .slide { display: flex !important; page-break-after: always; height: 100vh; } }
</style></head><body>
  <div class="slide active" data-index="0">
    ${branding?.showBranding && branding?.companyName ? `<div class="title-client">${branding.companyName}</div>` : ""}
    <h1>Growth Strategy<br><span>Generator</span></h1>
    <p class="subtitle">${form.clientName || form.industry} · ${form.strategyStyle === "aggressive" ? "Aggressive" : form.strategyStyle === "conservative" ? "Conservative" : "Balanced"} · $${form.budget.toLocaleString()}/mo</p>
    <div class="title-meta">
      <div class="title-meta-item"><div class="val">${result.tactics?.length || 0}</div><div class="lbl">Tactics</div></div>
      <div class="title-meta-item"><div class="val">${result.estimatedROI?.toFixed(1)}%</div><div class="lbl">Est. ROI</div></div>
      <div class="title-meta-item"><div class="val">${result.channels?.length || 0}</div><div class="lbl">Channels</div></div>
      <div class="title-meta-item"><div class="val">${result.funnel?.length || 0}</div><div class="lbl">Stages</div></div>
    </div>
  </div>

  <div class="slide" data-index="1"><h2>Executive Summary</h2><p class="subtitle" style="max-width:700px;line-height:1.7">${result.reasoning}</p></div>

  ${channelSlide()}
  ${funnelSlides()}
  ${quickWinSlide()}
  ${benchmarkSlide()}
  ${timelineSlide()}
  ${swotSlide()}

  <div class="slide" data-index="-1"><div class="thank-you">🚀</div><h1>Ready to <span>Execute</span></h1><p class="subtitle">Strategy generated with AI · Review before implementing</p></div>

  <div class="nav">
    <button onclick="prevSlide()">‹</button>
    <span class="counter" id="counter">1 / 1</span>
    <button onclick="nextSlide()">›</button>
  </div>

  <script>
    let current = 0
    const slides = document.querySelectorAll('.slide')
    const counter = document.getElementById('counter')
    function showSlide(i) {
      slides.forEach((s) => s.classList.remove('active'))
      current = (i + slides.length) % slides.length
      slides[current].classList.add('active')
      counter.textContent = (current + 1) + ' / ' + slides.length
    }
    function nextSlide() { showSlide(current + 1) }
    function prevSlide() { showSlide(current - 1) }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); nextSlide() }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prevSlide() }
    })
    showSlide(0)
  </script>
</body></html>`

  win.document.write(html)
  win.document.close()
}
