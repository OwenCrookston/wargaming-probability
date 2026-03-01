import { useSessionStore } from '../../store/useSessionStore'
import { DieSelect, Field, NumberInput } from '../ui'

interface Props {
  buildIndex: number
}

export function StraightSumInputs({ buildIndex }: Props) {
  const p = useSessionStore((s) => s.builds[buildIndex].straightSum)
  const patchFn = useSessionStore((s) => s.patchStraightSum)
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

      <Field label="Goal: sum ≥">
        <NumberInput value={p.goal} onChange={(goal) => patch({ goal })} min={0} />
      </Field>
      <Field label="Modifier (added to sum)">
        <NumberInput value={p.modifier} onChange={(modifier) => patch({ modifier })} />
      </Field>
    </div>
  )
}
