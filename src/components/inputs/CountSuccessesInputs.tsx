import { useSessionStore } from '../../store/useSessionStore'
import { Checkbox, DieSelect, Field, NumberInput } from '../ui'

interface Props {
  buildIndex: number
}

export function CountSuccessesInputs({ buildIndex }: Props) {
  const p = useSessionStore((s) => s.builds[buildIndex].countSuccesses)
  const patchFn = useSessionStore((s) => s.patchCountSuccesses)
  const patch = (updates: Parameters<typeof patchFn>[1]) => patchFn(buildIndex, updates)

  const rerollOnesDisabled = p.rerollFailures

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

      <Field label="Success on ≥">
        <NumberInput
          value={p.threshold}
          onChange={(threshold) => patch({ threshold })}
          min={1}
          max={p.dieType}
        />
      </Field>
      <Field label="Goal: at least X hits">
        <NumberInput
          value={p.goal}
          onChange={(goal) => patch({ goal })}
          min={0}
          max={p.numDice + Math.max(0, p.modifier)}
        />
      </Field>

      <Field label="Modifier (added to hit count)">
        <NumberInput value={p.modifier} onChange={(modifier) => patch({ modifier })} />
      </Field>

      <div className="col-span-2 space-y-2.5 pt-1">
        <Checkbox
          checked={p.rerollOnes || p.rerollFailures}
          disabled={rerollOnesDisabled}
          onChange={(v) => patch({ rerollOnes: v })}
          label="Reroll 1s"
        />
        <Checkbox
          checked={p.rerollFailures}
          onChange={(v) => patch({ rerollFailures: v })}
          label="Reroll failures (reroll any die below threshold)"
        />
      </div>
    </div>
  )
}
