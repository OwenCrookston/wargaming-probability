import { describe, it, expect, beforeEach } from 'vitest'
import { getOrSimulate, clearCache, getCacheSize } from '../cache'
import { StraightSumParams } from '../types'

const SAMPLES = 10_000

const params: StraightSumParams = {
  rollType: 'straightSum',
  dieType: 6,
  numDice: 2,
  modifier: 0,
  goal: 7,
}

const params2: StraightSumParams = {
  ...params,
  goal: 8,
}

describe('cache', () => {
  beforeEach(() => {
    clearCache()
  })

  it('starts empty after clearCache', () => {
    expect(getCacheSize()).toBe(0)
  })

  it('returns a result on first call', () => {
    const result = getOrSimulate(params, SAMPLES)
    expect(result.successPercent).toBeGreaterThanOrEqual(0)
    expect(result.successPercent).toBeLessThanOrEqual(100)
  })

  it('stores result in cache after first call', () => {
    getOrSimulate(params, SAMPLES)
    expect(getCacheSize()).toBe(1)
  })

  it('returns identical object on second call (cache hit)', () => {
    const first = getOrSimulate(params, SAMPLES)
    const second = getOrSimulate(params, SAMPLES)
    expect(second).toBe(first)
  })

  it('different params produce separate cache entries', () => {
    getOrSimulate(params, SAMPLES)
    getOrSimulate(params2, SAMPLES)
    expect(getCacheSize()).toBe(2)
  })

  it('clearCache resets size to 0', () => {
    getOrSimulate(params, SAMPLES)
    expect(getCacheSize()).toBe(1)
    clearCache()
    expect(getCacheSize()).toBe(0)
  })

  it('after clearing, re-running same params produces a new (not cached) result', () => {
    const first = getOrSimulate(params, SAMPLES)
    clearCache()
    const second = getOrSimulate(params, SAMPLES)
    // Different object reference — re-simulated
    expect(second).not.toBe(first)
  })
})
