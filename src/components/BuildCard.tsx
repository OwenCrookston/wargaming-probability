import { useEffect } from 'react'
import { getOrSimulate } from '../math/cache'
import type { RollParams } from '../math/types'
import {
  BUILD_LABELS,
  selectBuildParams,
  useSessionStore,
} from '../store/useSessionStore'
import { CountSuccessesInputs } from './inputs/CountSuccessesInputs'
import { KeepAndSumInputs } from './inputs/KeepAndSumInputs'
import { StraightSumInputs } from './inputs/StraightSumInputs'
import { ResultDisplay } from './ResultDisplay'

interface Props {
  buildIndex: number
}

export function BuildCard({ buildIndex }: Props) {
  const rollType = useSessionStore((s) => s.rollType)
  const totalBuilds = useSessionStore((s) => s.builds.length)
  const duplicateBuild = useSessionStore((s) => s.duplicateBuild)
  const removeBuild = useSessionStore((s) => s.removeBuild)
  const setResult = useSessionStore((s) => s.setResult)
  const setIsComputing = useSessionStore((s) => s.setIsComputing)

  // Stable string key: recompute only when active params or roll type change
  const paramsKey = useSessionStore((s) =>
    JSON.stringify(selectBuildParams(s.builds[buildIndex], s.rollType)),
  )

  // Debounced compute wired to M1 cache
  useEffect(() => {
    setIsComputing(buildIndex, true)
    const params = JSON.parse(paramsKey) as RollParams
    const timer = setTimeout(() => {
      const result = getOrSimulate(params)
      setResult(buildIndex, result)
      setIsComputing(buildIndex, false)
    }, 250)
    return () => clearTimeout(timer)
  }, [paramsKey, buildIndex, setResult, setIsComputing])

  const canDuplicate = totalBuilds < 3
  const canRemove = totalBuilds > 1

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full">
      {/* Build label + controls */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-widest">Build</span>
          <span className="text-xl font-black text-amber-400">{BUILD_LABELS[buildIndex]}</span>
        </div>
        <div className="flex items-center gap-0.5">
          {canDuplicate && (
            <button
              type="button"
              onClick={() => duplicateBuild(buildIndex)}
              title="Duplicate this build"
              className="px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Copy
            </button>
          )}
          {canRemove && (
            <button
              type="button"
              onClick={() => removeBuild(buildIndex)}
              title="Remove this build"
              className="px-2.5 py-1.5 rounded-lg text-base leading-none text-slate-600 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Parameters */}
      <div className="px-5 py-5 flex-1">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Parameters</p>
        {rollType === 'countSuccesses' && <CountSuccessesInputs buildIndex={buildIndex} />}
        {rollType === 'keepAndSum' && <KeepAndSumInputs buildIndex={buildIndex} />}
        {rollType === 'straightSum' && <StraightSumInputs buildIndex={buildIndex} />}
      </div>

      {/* Result */}
      <div className="border-t border-slate-800 bg-slate-950/50 px-5">
        <ResultDisplay buildIndex={buildIndex} />
      </div>
    </div>
  )
}
