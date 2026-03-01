import { BUILD_LABELS, computeDeltas, useSessionStore } from '../store/useSessionStore'

interface Props {
  /** True → fixed to the bottom of the viewport (mobile). False → inline block (desktop). */
  fixed?: boolean
}

export function ComparisonBar({ fixed = false }: Props) {
  const builds = useSessionStore((s) => s.builds)
  const activeBuildIndex = useSessionStore((s) => s.activeBuildIndex)
  const setActiveBuildIndex = useSessionStore((s) => s.setActiveBuildIndex)

  // Only meaningful with 2+ builds
  if (builds.length < 2) return null

  const deltas = computeDeltas(builds)

  const containerCls = fixed
    ? 'fixed bottom-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur border-t border-slate-800'
    : 'mt-4 bg-slate-900 rounded-2xl border border-slate-800'

  return (
    <div className={containerCls}>
      <div className="flex divide-x divide-slate-800">
        {builds.map((build, i) => {
          const percent = build.result?.successPercent
          const delta = deltas[i]
          const isActive = i === activeBuildIndex
          const isLeader = delta === null && percent !== undefined

          return (
            <button
              key={i}
              type="button"
              onClick={() => setActiveBuildIndex(i)}
              className={
                'flex-1 px-4 py-3 text-center transition-colors ' +
                (fixed && isActive ? 'bg-slate-800' : 'hover:bg-slate-800/60')
              }
            >
              {/* Build label */}
              <p className="text-xs text-slate-500 mb-1">
                Build {BUILD_LABELS[i]}
                {isLeader && builds.length > 1 && (
                  <span className="ml-1 text-amber-500">★</span>
                )}
              </p>

              {/* Percent */}
              <p
                className={
                  'text-lg font-black ' +
                  (build.isComputing || percent === undefined ? 'text-slate-600' : 'text-amber-400')
                }
              >
                {percent !== undefined ? `${percent.toFixed(1)}%` : '—'}
              </p>

              {/* Delta */}
              {delta !== null && (
                <p className="text-xs text-red-400 mt-0.5">
                  −{Math.abs(delta).toFixed(1)}
                </p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
