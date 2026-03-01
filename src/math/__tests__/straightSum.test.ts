import { describe, it, expect } from 'vitest'
import { simulateStraightSum } from '../straightSum'
import { StraightSumParams } from '../types'

const TOLERANCE = 2
const SAMPLES = 100_000

function base(overrides: Partial<StraightSumParams> = {}): StraightSumParams {
  return {
    rollType: 'straightSum',
    dieType: 6,
    numDice: 2,
    modifier: 0,
    goal: 7,
    ...overrides,
  }
}

function near(actual: number, expected: number, tolerance = TOLERANCE) {
  expect(actual).toBeGreaterThanOrEqual(expected - tolerance)
  expect(actual).toBeLessThanOrEqual(expected + tolerance)
}

describe('simulateStraightSum', () => {
  it('1d6 goal=4 → ~50%', () => {
    // P(d6 >= 4) = 3/6 = 50%
    const result = simulateStraightSum(base({ numDice: 1, goal: 4 }), SAMPLES)
    near(result.successPercent, 50)
  })

  it('2d6 goal=7 → ~58.3%', () => {
    // 21 out of 36 combinations sum to >= 7
    const result = simulateStraightSum(base(), SAMPLES)
    near(result.successPercent, 58.3)
  })

  it('2d6 goal=2 → ~100%', () => {
    // Minimum sum is 2, so goal=2 should always succeed
    const result = simulateStraightSum(base({ goal: 2 }), SAMPLES)
    near(result.successPercent, 100)
  })

  it('2d6 goal=13 → 0%', () => {
    // Maximum sum of 2d6 is 12
    const result = simulateStraightSum(base({ goal: 13 }), SAMPLES)
    expect(result.successPercent).toBe(0)
  })

  it('2d6 modifier=1, goal=7 → ~72.2%', () => {
    // P(sum+1 >= 7) = P(sum >= 6) = 26/36 ≈ 72.2%
    const result = simulateStraightSum(base({ modifier: 1, goal: 7 }), SAMPLES)
    near(result.successPercent, 72.2)
  })

  it('2d6 modifier=-1, goal=7 → ~41.7%', () => {
    // P(sum-1 >= 7) = P(sum >= 8) = 15/36 ≈ 41.7%
    const result = simulateStraightSum(base({ modifier: -1, goal: 7 }), SAMPLES)
    near(result.successPercent, 41.7)
  })

  it('expected value: 2d6 → EV ≈ 7.0', () => {
    // EV of 1d6 = 3.5, EV of 2d6 = 7.0
    const result = simulateStraightSum(base(), SAMPLES)
    near(result.expectedValue, 7.0)
  })

  it('min and max within valid bounds: 2d6', () => {
    const result = simulateStraightSum(base(), SAMPLES)
    expect(result.min).toBeGreaterThanOrEqual(2)
    expect(result.max).toBeLessThanOrEqual(12)
  })

  it('modifier shifts EV: 2d6 modifier=3 → EV ≈ 10.0', () => {
    const result = simulateStraightSum(base({ modifier: 3 }), SAMPLES)
    near(result.expectedValue, 10.0)
  })

  it('samples field reflects input', () => {
    const result = simulateStraightSum(base(), SAMPLES)
    expect(result.samples).toBe(SAMPLES)
  })
})
