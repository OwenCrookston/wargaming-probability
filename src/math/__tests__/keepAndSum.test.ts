import { describe, it, expect } from 'vitest'
import { simulateKeepAndSum } from '../keepAndSum'
import { KeepAndSumParams } from '../types'

const TOLERANCE = 2
const SAMPLES = 100_000

function base(overrides: Partial<KeepAndSumParams> = {}): KeepAndSumParams {
  return {
    rollType: 'keepAndSum',
    dieType: 6,
    numDice: 2,
    keepMode: 'highest',
    keepCount: 1,
    modifier: 0,
    goal: 4,
    ...overrides,
  }
}

function near(actual: number, expected: number, tolerance = TOLERANCE) {
  expect(actual).toBeGreaterThanOrEqual(expected - tolerance)
  expect(actual).toBeLessThanOrEqual(expected + tolerance)
}

describe('simulateKeepAndSum', () => {
  it('2d6 keep highest 1, goal=4 → ~75%', () => {
    // P(max(d1,d2) >= 4) = 1 - P(both < 4) = 1 - (3/6)^2 = 75%
    const result = simulateKeepAndSum(base(), SAMPLES)
    near(result.successPercent, 75)
  })

  it('2d6 keep lowest 1, goal=4 → ~25%', () => {
    // P(min(d1,d2) >= 4) = P(both >= 4) = (3/6)^2 = 25%
    const result = simulateKeepAndSum(base({ keepMode: 'lowest' }), SAMPLES)
    near(result.successPercent, 25)
  })

  it('1d6 keep highest 1, goal=4 → ~50%', () => {
    // Equivalent to 1d6 >= 4 = 3/6 = 50%
    const result = simulateKeepAndSum(base({ numDice: 1, keepCount: 1, goal: 4 }), SAMPLES)
    near(result.successPercent, 50)
  })

  it('2d6 keep highest 1, modifier=1, goal=5 → ~75%', () => {
    // P(max+1 >= 5) = P(max >= 4) = 75%
    const result = simulateKeepAndSum(base({ modifier: 1, goal: 5 }), SAMPLES)
    near(result.successPercent, 75)
  })

  it('2d6 keep highest 2, goal=7 → ~58.3%', () => {
    // Keep all 2 dice, sum both: same as straightSum 2d6 >= 7 = 21/36 ≈ 58.3%
    const result = simulateKeepAndSum(base({ keepCount: 2, goal: 7 }), SAMPLES)
    near(result.successPercent, 58.3)
  })

  it('goal impossible → 0%', () => {
    // 2d6 keep highest 1, max possible is 6 — goal=7 impossible
    const result = simulateKeepAndSum(base({ goal: 7 }), SAMPLES)
    expect(result.successPercent).toBe(0)
  })

  it('min and max within valid bounds: 2d6 keep highest 1', () => {
    const result = simulateKeepAndSum(base(), SAMPLES)
    expect(result.min).toBeGreaterThanOrEqual(1)
    expect(result.max).toBeLessThanOrEqual(6)
  })

  it('samples field reflects input', () => {
    const result = simulateKeepAndSum(base(), SAMPLES)
    expect(result.samples).toBe(SAMPLES)
  })
})
