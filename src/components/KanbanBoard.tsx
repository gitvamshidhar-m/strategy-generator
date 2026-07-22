"use client"

import { funnelMeta, ImpactBadge, EffortBadge } from "./ui"

interface KanbanBoardProps {
  tactics: any[]
  funnel: any[]
  tacticStatus: Record<string, string>
  searchQuery: string
  filterChannel: string
  filterImpact: string
  filterEffort: string
  cycleStatus: (id: string) => void
  countByStatus: (status: string) => number
  totalTactics: number
}

export default function KanbanBoard({ tactics, funnel, tacticStatus, searchQuery, filterChannel, filterImpact, filterEffort, cycleStatus, countByStatus, totalTactics }: KanbanBoardProps) {
  const columns = [
    { status: "todo", label: "To Do", color: "border-t-gray-400", bg: "bg-gray-50 dark:bg-gray-800/50", icon: "○", count: totalTactics - countByStatus("in_progress") - countByStatus("done") },
    { status: "in_progress", label: "In Progress", color: "border-t-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", icon: "◎", count: countByStatus("in_progress") },
    { status: "done", label: "Done", color: "border-t-green-500", bg: "bg-green-50 dark:bg-green-900/20", icon: "●", count: countByStatus("done") },
  ]

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => {
          const columnTactics = (tactics || []).filter((t: any) => {
            const st = tacticStatus[t.id] || "todo"
            if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false
            if (filterChannel && (t.channel || "").toUpperCase() !== filterChannel.toUpperCase()) return false
            if (filterImpact && (t.impact || "").toUpperCase() !== filterImpact.toUpperCase()) return false
            if (filterEffort && (t.effort || "").toUpperCase() !== filterEffort.toUpperCase()) return false
            return st === col.status
          })
          return (
            <div key={col.status} className={`border-t-4 ${col.color} ${col.bg} rounded-xl p-4 min-h-[200px]`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-1.5"><span>{col.icon}</span> {col.label}</h3>
                <span className="text-xs text-gray-400 bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full border dark:border-gray-600">{columnTactics.length}</span>
              </div>
              <div className="space-y-2">
                {columnTactics.length === 0 && <p className="text-xs text-gray-400 text-center py-6">No tactics</p>}
                {columnTactics.map((t: any) => {
                  const stageMeta = funnelMeta[funnel?.find((s: any) => s.tactics?.some((st: any) => st.id === t.id))?.stage || ""] || {}
                  return (
                    <div key={t.id} className="bg-white dark:bg-gray-700 rounded-xl p-3 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => cycleStatus(t.id)}>
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">{t.title}</p>
                        <span className="text-[10px] text-gray-400">{stageMeta.icon || "📌"}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{t.description}</p>
                      <div className="flex flex-wrap items-center gap-1">
                        <ImpactBadge impact={t.impact} />
                        <EffortBadge effort={t.effort} />
                        {t.channel && <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded">{t.channel}</span>}
                        {t.estimatedROI && <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">{t.estimatedROI.toFixed(0)}%</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
