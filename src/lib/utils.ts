"use client"

export function copyStrategyToClipboard(result: any, form: { industry: string; budget: number; goal: string }): string {
  const lines = [
    `Growth Strategy for ${form.industry} ($${(form.budget || 0).toLocaleString()}/mo)`,
    `Goal: ${form.goal}`,
    `Est. ROI: ${result.estimatedROI?.toFixed(1)}%`,
    "",
    ...(result.funnel || []).flatMap((stage: any) => [
      `[${stage.stage?.toUpperCase()}] ${stage.label || ""}`,
      ...(stage.tactics || []).map((t: any) => `  - ${t.title}: ${t.description}`),
      "",
    ]),
    `Generated via AI Strategy Generator`,
  ].join("\n")
  navigator.clipboard.writeText(lines).catch(() => {})
  return lines
}

export function generateShareUrl(result: any, form: { industry: string; budget: number; goal: string }): string {
  const payload = { result, form }
  try {
    const encoded = btoa(encodeURIComponent(JSON.stringify(payload)))
    return `${window.location.origin}?share=${encoded}`
  } catch {
    return window.location.href
  }
}

export function parseShareUrl(): { result: any; form: any } | null {
  try {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get("share")
    if (!encoded) return null
    return JSON.parse(decodeURIComponent(atob(encoded)))
  } catch { return null }
}

export function exportPDF() {
  window.print()
}

export const channelColors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500", "bg-pink-500", "bg-cyan-500", "bg-red-500", "bg-indigo-500"]
export const channelTextColors = ["text-blue-600", "text-green-600", "text-purple-600", "text-amber-600", "text-pink-600", "text-cyan-600", "text-red-600", "text-indigo-600"]

export function clampPriority(p: number): number {
  return Math.min(Math.max(p, 0), 5)
}

export function downloadJSON(result: any, form: any) {
  const blob = new Blob([JSON.stringify({ form, result, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = `strategy-${form.industry || "export"}-${Date.now()}.json`
  a.click(); URL.revokeObjectURL(url)
}

export function downloadCSV(result: any, form: any) {
  const rows = [["Stage", "Tactic", "Description", "Channel", "Impact", "Effort", "Est. ROI", "Steps"]]
  ;(result.funnel || []).forEach((stage: any) =>
    (stage.tactics || []).forEach((t: any) =>
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
