import { useSessionStore } from '../../store/useSessionStore'
import { DieSelect, Field, NumberInput, ToggleGroup } from '../ui'

interface Props {
  buildIndex: number
}

const keepModeOptions = [
  { value: 'highest' as const, label: 'Highest' },
  { value: 'lowest' as const, label: 'Lowest' },
]

export function KeepAndSumInputs({ buildIndex }: Props) {
  const p = useSessionStore((s) => s.builds[buildIndex].keepAndSum)
  const patchFn = useSessionStore((s) => s.patchKeepAndSum)
  const patch = (updates: Parameters<typeof patchFn>[1]) => patchFn(buildIndex, updates)

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-5">
      <Field label="Die type">
        <DieSelect value={p.dieType} onChange={(dieType) => patch({ dieType })} />
      </Field>
      <Field label="Dice pool">
        <NumberInput
          value={p.numDice}
          onChange={(numDice) => patch({ numDice })}
          min={1}
          max={30}
        />
      </Field>

      <Field label="Keep">
        <ToggleGroup
          value={p.keepMode}
          onChange={(keepMode) => patch({ keepMode })}
          options={keepModeOptions}
        />
      </Field>
      <Field label="Keep count">
        <NumberInput
          value={p.keepCount}
          onChange={(keepCount) => patch({ keepCount })}
          min={1}
          max={p.numDice}
        />
      </Field>

      <Field label="Goal: sum ≥">
        <NumberInput value={p.goal} onChange={(goal) => patch({ goal })} min={0} />
      </Field>
      <Field label="Modifier (added to sum)">
        <NumberInput value={p.modifier} onChange={(modifier) => patch({ modifier })} />
      </Field>
    </div>
  )
}
