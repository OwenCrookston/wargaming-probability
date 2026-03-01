import { CountSuccessesParams, SimulationResult } from './types'
import { rollDie, round1, round2 } from './utils'

function rollWithReroll(dieType: number, params: CountSuccessesParams): number {
  const value = rollDie(dieType)

  // rerollFailures subsumes rerollOnes — check failures first (broader condition)
  if (params.rerollFailures && value < params.threshold) {
    return rollDie(dieType)
  }
  if (params.rerollOnes && value === 1) {
    return rollDie(dieType)
  }
  return value
}

export function simulateCountSuccesses(
  params: CountSuccessesParams,
  samples: number,
): SimulationResult {
  const { dieType, numDice, threshold, modifier, goal } = params

  let successes = 0
  let totalValue = 0
  let minValue = Infinity
  let maxValue = -Infinity

  for (let i = 0; i < samples; i++) {
    let count = 0
    for (let d = 0; d < numDice; d++) {
      if (rollWithReroll(dieType, params) >= threshold) count++
    }
    const finalCount = count + modifier

    totalValue += finalCount
    if (finalCount < minValue) minValue = finalCount
    if (finalCount > maxValue) maxValue = finalCount
    if (finalCount >= goal) successes++
  }

  return {
    successPercent: round1((successes / samples) * 100),
    expectedValue: round2(totalValue / samples),
    min: minValue,
    max: maxValue,
    samples,
  }
}
