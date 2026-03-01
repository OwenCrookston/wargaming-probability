import { StraightSumParams, SimulationResult } from './types'
import { rollDie, round1, round2 } from './utils'

export function simulateStraightSum(
  params: StraightSumParams,
  samples: number,
): SimulationResult {
  const { dieType, numDice, modifier, goal } = params

  let successes = 0
  let totalValue = 0
  let minValue = Infinity
  let maxValue = -Infinity

  for (let i = 0; i < samples; i++) {
    let sum = modifier
    for (let d = 0; d < numDice; d++) {
      sum += rollDie(dieType)
    }

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
