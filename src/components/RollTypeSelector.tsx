import { useSessionStore } from '../store/useSessionStore'
import type { RollParams } from '../math/types'

type RollType = RollParams['rollType']

const ROLL_TYPES: { value: RollType; label: string; sub: string }[] = [
  { value: 'countSuccesses', label: 'Count Hits', sub: 'Roll N dice, count ≥ X' },
  { value: 'keepAndSum', label: 'Keep & Sum', sub: 'Roll N, keep M, sum' },
  { value: 'straightSum', label: 'Straight Sum', sub: 'Roll N dice, sum all' },
]

interface Props {
  buildIndex: number
}

export function RollTypeSelector({ buildIndex }: Props) {
  const rollType = useSessionStore((s) => s.builds[buildIndex].rollType)
  const setRollType = useSessionStore((s) => s.setRollType)

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {ROLL_TYPES.map((rt) => {
        const active = rollType === rt.value
        return (
          <button
            key={rt.value}
            type="button"
            onClick={() => setRollType(buildIndex, rt.value)}
            className={
              'flex-1 text-left px-4 py-3 rounded-xl border transition-colors ' +
              (active
                ? 'bg-amber-500/10 border-amber-500'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200')
            }
          >
            <p className={'text-sm font-semibold ' + (active ? 'text-amber-400' : 'text-slate-200')}>
              {rt.label}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{rt.sub}</p>
          </button>
        )
      })}
    </div>
  )
}
