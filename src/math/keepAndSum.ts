import { KeepAndSumParams, SimulationResult } from './types'
import { rollDie, round1, round2 } from './utils'

export function simulateKeepAndSum(
  params: KeepAndSumParams,
  samples: number,
): SimulationResult {
  const { dieType, numDice, keepMode, keepCount, modifier, goal } = params

  let successes = 0
  let totalValue = 0
  let minValue = Infinity
  let maxValue = -Infinity

  const rolls: number[] = new Array(numDice)

  for (let i = 0; i < samples; i++) {
    for (let d = 0; d < numDice; d++) {
      rolls[d] = rollDie(dieType)
    }

    // Sort ascending in place
    rolls.sort((a, b) => a - b)

    // Slice the kept dice
    const kept =
      keepMode === 'highest'
        ? rolls.slice(numDice - keepCount)
        : rolls.slice(0, keepCount)

    let sum = modifier
    for (let k = 0; k < kept.length; k++) sum += kept[k]

    totalValue += sum
    if (sum < minValue) minValue = sum
    if (sum > maxValue) maxValue = sum
    if (sum >= goal) successes++
  }

  return {
    successPercent: round1((successes / samples) * 100),
    expectedValue: round2(totalValue / samples),
    min: minValue,
    max: maxValue,
    samples,
  }
}
