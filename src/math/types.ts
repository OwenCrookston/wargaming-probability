export type DieType = 2 | 3 | 4 | 6 | 8 | 10 | 12 | 20

export interface CountSuccessesParams {
  rollType: 'countSuccesses'
  dieType: DieType
  numDice: number
  // A die counts as a success if its value >= threshold
  threshold: number
  // Flat bonus added to the success count after rolling
  modifier: number
  // Reroll any die showing 1 (shortcut: sets effective reroll threshold to 1)
  rerollOnes: boolean
  // Reroll any die that fails the threshold check
  rerollFailures: boolean
  // At least this many successes needed
  goal: number
}

export interface KeepAndSumParams {
  rollType: 'keepAndSum'
  dieType: DieType
  numDice: number
  keepMode: 'highest' | 'lowest'
  keepCount: number
  // Added to the sum of kept dice
  modifier: number
  // Sum >= goal to succeed
  goal: number
}

export interface StraightSumParams {
  rollType: 'straightSum'
  dieType: DieType
  numDice: number
  // Added to the total sum
  modifier: number
  // Sum >= goal to succeed
  goal: number
}

export type RollParams = CountSuccessesParams | KeepAndSumParams | StraightSumParams

export interface SimulationResult {
  // 0–100, one decimal place
  successPercent: number
  // Average outcome value (success count for countSuccesses, sum for others)
  expectedValue: number
  // Minimum observed value across all samples
  min: number
  // Maximum observed value across all samples
  max: number
  // Number of samples used
  samples: number
}
