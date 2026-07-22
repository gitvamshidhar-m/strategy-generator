"use client"

import { GeneratedStrategy, FormState, FunnelStage, FunnelTactic, ChannelAllocation, Benchmark, BrandingConfig } from "@/types"

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
