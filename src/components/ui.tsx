"use client"

export const funnelMeta: Record<string, { label: string; icon: string; headBg: string; headBorder: string; stageBg: string; stageBorder: string; desc: string }> = {
  awareness: { label: "Awareness", icon: "🔍", headBg: "bg-blue-50 dark:bg-blue-900/30", headBorder: "border-blue-200 dark:border-blue-700", stageBg: "bg-blue-50 dark:bg-blue-900/20", stageBorder: "border-blue-200 dark:border-blue-800", desc: "Top of funnel" },
  consideration: { label: "Consideration", icon: "⚖️", headBg: "bg-amber-50 dark:bg-amber-900/30", headBorder: "border-amber-200 dark:border-amber-700", stageBg: "bg-amber-50 dark:bg-amber-900/20", stageBorder: "border-amber-200 dark:border-amber-800", desc: "Middle of funnel" },
  conversion: { label: "Conversion", icon: "🎯", headBg: "bg-green-50 dark:bg-green-900/30", headBorder: "border-green-200 dark:border-green-700", stageBg: "bg-green-50 dark:bg-green-900/20", stageBorder: "border-green-200 dark:border-green-800", desc: "Bottom of funnel" },
  loyalty: { label: "Loyalty", icon: "❤️", headBg: "bg-purple-50 dark:bg-purple-900/30", headBorder: "border-purple-200 dark:border-purple-700", stageBg: "bg-purple-50 dark:bg-purple-900/20", stageBorder: "border-purple-200 dark:border-purple-800", desc: "Post-purchase" },
}

export const funnelWidths = ["w-full", "w-3/4", "w-1/2", "w-1/3"]

export function ImpactBadge({ impact }: { impact: string }) {
  const key = (impact || "").toUpperCase()
  const colors: Record<string, string> = { HIGH: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700", MEDIUM: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700", LOW: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600" }
  return <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[key] || colors.LOW}`}>{impact}</span>
}

export function EffortBadge({ effort }: { effort: string }) {
  const key = (effort || "").toUpperCase()
  const colors: Record<string, string> = { LOW: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700", MEDIUM: "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700", HIGH: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700" }
  return <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[key] || colors.LOW}`}>{effort}</span>
}
