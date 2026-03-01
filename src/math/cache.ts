import { RollParams, SimulationResult } from './types'
import { simulate, DEFAULT_SAMPLES } from './simulate'

const cache = new Map<string, SimulationResult>()

function hashParams(params: RollParams): string {
  return JSON.stringify(params)
}

export function getOrSimulate(
  params: RollParams,
  samples: number = DEFAULT_SAMPLES,
): SimulationResult {
  const key = hashParams(params)
  const cached = cache.get(key)
  if (cached) return cached

  const result = simulate(params, samples)
  cache.set(key, result)
  return result
}

export function clearCache(): void {
  cache.clear()
}

export function getCacheSize(): number {
  return cache.size
}
