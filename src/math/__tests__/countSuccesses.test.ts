import { describe, it, expect } from 'vitest'
import { simulateCountSuccesses } from '../countSuccesses'
import { CountSuccessesParams } from '../types'

// Monte Carlo tolerance: 100K samples → ~±0.5% std error. Use 2% margin.
const TOLERANCE = 2
const SAMPLES = 100_000

function base(overrides: Partial<CountSuccessesParams> = {}): CountSuccessesParams {
  return {
    rollType: 'countSuccesses',
    dieType: 6,
    numDice: 1,
    threshold: 4,
    modifier: 0,
    rerollOnes: false,
    rerollFailures: false,
    goal: 1,
    ...overrides,
  }
}

function near(actual: number, expected: number, tolerance = TOLERANCE) {
  expect(actual).toBeGreaterThanOrEqual(expected - tolerance)
  expect(actual).toBeLessThanOrEqual(expected + tolerance)
}

describe('simulateCountSuccesses', () => {
  it('1d6 threshold=4, goal=1 → ~50%', () => {
    // P(die >= 4) = 3/6 = 50%
    const result = simulateCountSuccesses(base(), SAMPLES)
    near(result.successPercent, 50)
  })

  it('2d6 threshold=4, goal=1 → ~75%', () => {
    // P(at least one success) = 1 - P(zero) = 1 - 0.5^2 = 75%
    const result = simulateCountSuccesses(base({ numDice: 2, goal: 1 }), SAMPLES)
    near(result.successPercent, 75)
  })

  it('2d6 threshold=4, goal=2 → ~25%', () => {
    // P(both succeed) = 0.5^2 = 25%
    const result = simulateCountSuccesses(base({ numDice: 2, goal: 2 }), SAMPLES)
    near(result.successPercent, 25)
  })

  it('1d6 threshold=4, goal=0 → 100%', () => {
    // Success count + 0 modifier is always >= 0
    const result = simulateCountSuccesses(base({ goal: 0 }), SAMPLES)
    near(result.successPercent, 100)
  })

  it('rerollOnes: 1d6 threshold=4, goal=1 → ~58.3%', () => {
    // P(success) = P(die>=4) + P(die=1)*P(reroll>=4) = 3/6 + 1/6*3/6 = 7/12 ≈ 58.3%
    const result = simulateCountSuccesses(base({ rerollOnes: true }), SAMPLES)
    near(result.successPercent, 58.3)
  })

  it('rerollFailures: 1d6 threshold=4, goal=1 → ~75%', () => {
    // P(success) = P(die>=4) + P(die<4)*P(reroll>=4) = 3/6 + 3/6*3/6 = 3/4 = 75%
    const result = simulateCountSuccesses(base({ rerollFailures: true }), SAMPLES)
    near(result.successPercent, 75)
  })

  it('modifier +1 shifts effective success count → 2d6 threshold=4 goal=3 is impossible without modifier, possible with +1', () => {
    // Max successes on 2d6 is 2, so goal=3 impossible without modifier
    const without = simulateCountSuccesses(base({ numDice: 2, goal: 3 }), SAMPLES)
    expect(without.successPercent).toBe(0)

    // With modifier=1, max is 3, so goal=3 means both dice must succeed: 25%
    const withMod = simulateCountSuccesses(base({ numDice: 2, modifier: 1, goal: 3 }), SAMPLES)
    near(withMod.successPercent, 25)
  })

  it('expected value: 2d6 threshold=4 → EV ≈ 1.0 successes', () => {
    // Each die succeeds 50% → EV per die = 0.5 → total EV = 1.0
    const result = simulateCountSuccesses(base({ numDice: 2 }), SAMPLES)
    near(result.expectedValue, 1.0)
  })

  it('min and max are within valid range: 1d6', () => {
    const result = simulateCountSuccesses(base(), SAMPLES)
    expect(result.min).toBeGreaterThanOrEqual(0)
    expect(result.max).toBeLessThanOrEqual(1)
  })

  it('samples field reflects input', () => {
    const result = simulateCountSuccesses(base(), SAMPLES)
    expect(result.samples).toBe(SAMPLES)
  })
})
