import { computeDeltas, useSessionStore } from '../store/useSessionStore'

interface Props {
  buildIndex: number
}

export function ResultDisplay({ buildIndex }: Props) {
  const result = useSessionStore((s) => s.builds[buildIndex].result)
  const isComputing = useSessionStore((s) => s.builds[buildIndex].isComputing)
  const delta = useSessionStore((s) => computeDeltas(s.builds)[buildIndex])

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      {/* Primary percent */}
      <div className="relative">
        <p
          className={
            'text-8xl font-black tracking-tight transition-opacity duration-150 ' +
            (isComputing ? 'opacity-40' : 'opacity-100')
          }
        >
          <span className="text-amber-400">
            {result !== null ? result.successPercent.toFixed(1) : '—'}
          </span>
          {result !== null && (
            <span className="text-4xl font-bold text-amber-400/70">%</span>
          )}
        </p>
        {isComputing && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
        )}
      </div>

      {/* Delta vs leader */}
      {delta !== null && (
        <p className="text-sm font-semibold text-slate-500">
          <span className="text-red-400">−{Math.abs(delta).toFixed(1)}</span>
          <span className="text-slate-600"> vs leader</span>
        </p>
      )}

      {/* Secondary stats */}
      {result !== null && (
        <div className="flex items-center gap-5 text-sm text-slate-500">
          <span>
            EV{' '}
            <span className="text-slate-300 font-medium">{result.expectedValue.toFixed(1)}</span>
          </span>
          <span className="w-px h-3 bg-slate-700" />
          <span>
            Range{' '}
            <span className="text-slate-300 font-medium">
              {result.min}–{result.max}
            </span>
          </span>
          <span className="w-px h-3 bg-slate-700" />
          <span className="text-slate-600 text-xs">
            {(result.samples / 1_000_000).toFixed(1)}M rolls
          </span>
        </div>
      )}

      {result === null && !isComputing && (
        <p className="text-slate-600 text-sm">Adjust parameters above</p>
      )}
    </div>
  )
}
