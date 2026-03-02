import { computeDeltas, useSessionStore } from '../store/useSessionStore'

// ─── Color helpers ─────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/**
 * Maps a success percent (0–100) to an HSL color string:
 *   0%  → reddish   hsl(0,   90%, 65%)
 *  75%  → yellowish hsl(45,  95%, 60%)
 * 100%  → greenish  hsl(145, 70%, 55%)
 */
function percentToColor(pct: number): string {
  const p = Math.max(0, Math.min(100, pct))
  if (p <= 75) {
    const t = p / 75
    return `hsl(${lerp(0, 45, t).toFixed(1)}, ${lerp(90, 95, t).toFixed(1)}%, ${lerp(65, 60, t).toFixed(1)}%)`
  }
  const t = (p - 75) / 25
  return `hsl(${lerp(45, 145, t).toFixed(1)}, ${lerp(95, 70, t).toFixed(1)}%, ${lerp(60, 55, t).toFixed(1)}%)`
}

// ─── Component ─────────────────────────────────────────────────────────────────

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

  // Computed color when we have a real result; undefined → fall back to muted slate.
  const accentColor = result !== null ? percentToColor(result.successPercent) : undefined

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      {/* Primary percent — fixed layout, no conditional mounts */}
      <div className="relative">
        <p className="text-8xl font-black tracking-tight">
          {/* Digit span: gradient color when result present, muted when computing/empty */}
          <span
            className={accentColor ? '' : 'text-slate-500'}
            style={accentColor ? { color: accentColor } : undefined}
          >
            {displayPercent}
          </span>
          {/* % sign: always rendered for stable layout; same accent color at 70% opacity */}
          <span
            className={
              'text-4xl font-bold ' +
              (showPercentSign ? 'visible' : 'invisible') +
              (accentColor ? '' : ' text-slate-500')
            }
            style={accentColor ? { color: accentColor, opacity: 0.7 } : undefined}
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
