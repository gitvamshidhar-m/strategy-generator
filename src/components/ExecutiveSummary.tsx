"use client"

interface ExecutiveSummaryProps {
  result: any
  form: any
  countByStatus: (status: string) => number
  totalTactics: number
}

export default function ExecutiveSummary({ result, form, countByStatus, totalTactics }: ExecutiveSummaryProps) {
  const topChannel = result.channels?.slice().sort((a: any, b: any) => b.priority - a.priority)[0]
  const topTactic = result.tactics?.slice().sort((a: any, b: any) => (b.estimatedROI || 0) - (a.estimatedROI || 0))[0]
  const quickWins = result.tactics?.filter((t: any) => (t.impact || "").toUpperCase() === "HIGH" && (t.effort || "").toUpperCase() === "LOW") || []
  const avgROI = result.tactics?.length ? result.tactics.reduce((s: number, t: any) => s + (t.estimatedROI || 0), 0) / result.tactics.length : 0
  const channelScore = Math.min((result.channels?.length || 0) * 6, 25)
  const highImpactRatio = result.tactics?.length ? result.tactics.filter((t: any) => (t.impact || "").toUpperCase() === "HIGH").length / result.tactics.length : 0
  const impactScore = highImpactRatio * 25
  const roiScore = Math.min((result.estimatedROI || 0) / 20, 25)
  const quickWinBonus = Math.min(quickWins.length * 3, 25)
  const totalScore = Math.min(Math.round(channelScore + impactScore + roiScore + quickWinBonus), 100)
  const scoreColor = totalScore >= 80 ? "text-green-600" : totalScore >= 60 ? "text-amber-600" : "text-red-600"
  const scoreBar = totalScore >= 80 ? "bg-green-500" : totalScore >= 60 ? "bg-amber-500" : "bg-red-500"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
      <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Total Budget</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${(form.budget || 0).toLocaleString()}<span className="text-sm font-normal text-gray-400">/mo</span></p>
          {topChannel && <p className="text-xs text-gray-400 mt-1">Top: <span className="font-medium text-gray-600 dark:text-gray-300">{topChannel.channel}</span></p>}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Total Tactics</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{result.tactics?.length || 0}</p>
          {(() => {
            const done = countByStatus("done")
            const inProg = countByStatus("in_progress")
            if (totalTactics === 0) return null
            return (
              <div className="mt-2">
                <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                  <span>{done}/{totalTactics} done · {inProg} in progress</span>
                  <span>{Math.round((done / totalTactics) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(done / totalTactics) * 100}%` }}></div>
                </div>
              </div>
            )
          })()}
          {quickWins.length > 0 && <p className="text-xs text-green-600 dark:text-green-400 mt-1">{quickWins.length} quick win{quickWins.length > 1 ? "s" : ""} 🚀</p>}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Avg. ROI</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{avgROI.toFixed(1)}%</p>
          {topTactic && <p className="text-xs text-gray-400 mt-1">Best: <span className="font-medium text-gray-600 dark:text-gray-300">{topTactic.title}</span></p>}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Channels</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{result.channels?.length || 0}</p>
          <p className="text-xs text-gray-400 mt-1">{result.funnel?.length || 0} funnel stages</p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide text-center">Strategy Score</p>
        <p className={`text-4xl font-bold text-center mt-1 ${scoreColor}`}>{totalScore}<span className="text-lg font-normal text-gray-400">/100</span></p>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-2 overflow-hidden">
          <div className={`${scoreBar} h-2 rounded-full transition-all duration-1000`} style={{ width: `${totalScore}%` }}></div>
        </div>
        <p className="text-xs text-gray-400 text-center mt-1">{totalScore >= 80 ? "Excellent" : totalScore >= 60 ? "Good" : "Needs Work"}</p>
      </div>
    </div>
  )
}
