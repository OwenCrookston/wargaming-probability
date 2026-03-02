import { computeDeltas, useSessionStore } from '../store/useSessionStore'

interface Props {
  buildIndex: number
}

export function ResultDisplay({ buildIndex }: Props) {
  const result = useSessionStore((s) => s.builds[buildIndex].result)
  const isComputing = useSessionStore((s) => s.builds[buildIndex].isComputing)
  const delta = useSessionStore((s) => computeDeltas(s.builds)[buildIndex])

  // Three explicit display states for the primary number:
  //   computing      → '--.-' (placeholder, full opacity — no stale data shown)
  //   result ready   → actual percent (e.g. '73.4')
  //   no result yet  → '—'
  const displayPercent = isComputing
    ? '--.-'
    : result !== null
      ? result.successPercent.toFixed(1)
      : '—'

  const showPercentSign = !isComputing && result !== null

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      {/* Primary percent — fixed layout, no conditional mounts */}
      <div className="relative">
        <p className="text-8xl font-black tracking-tight">
          <span className="text-amber-400">{displayPercent}</span>
          {/* Always rendered; invisible when there's no result — keeps width stable */}
          <span
            className={
              'text-4xl font-bold text-amber-400/70 ' +
              (showPercentSign ? 'visible' : 'invisible')
            }
          >
            %
          </span>
        </p>
      </div>

      {/* Delta vs leader — always occupies space; hidden when not applicable */}
      <p
        className={
          'text-sm font-semibold ' + (delta !== null ? 'visible' : 'invisible')
        }
      >
        <span className="text-red-400">
          −{delta !== null ? Math.abs(delta).toFixed(1) : '0.0'}
        </span>
        <span className="text-slate-600"> vs leader</span>
      </p>

      {/* Secondary stats — always rendered; show placeholders when result is absent */}
      <div className="flex items-center gap-5 text-sm text-slate-500">
        <span>
          EV{' '}
          <span className="text-slate-300 font-medium">
            {result !== null ? result.expectedValue.toFixed(1) : '—'}
          </span>
        </span>
        <span className="w-px h-3 bg-slate-700" />
        <span>
          Range{' '}
          <span className="text-slate-300 font-medium">
            {result !== null ? `${result.min}–${result.max}` : '—'}
          </span>
        </span>
        <span className="w-px h-3 bg-slate-700" />
        <span className="text-slate-600 text-xs">
          {result !== null
            ? `${(result.samples / 1_000_000).toFixed(1)}M rolls`
            : '—'}
        </span>
      </div>
    </div>
  )
}
