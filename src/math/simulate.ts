import { RollParams, SimulationResult } from './types'
import { simulateCountSuccesses } from './countSuccesses'
import { simulateKeepAndSum } from './keepAndSum'
import { simulateStraightSum } from './straightSum'

export const DEFAULT_SAMPLES = 1_000_000

export function simulate(
  params: RollParams,
  samples: number = DEFAULT_SAMPLES,
): SimulationResult {
  switch (params.rollType) {
    case 'countSuccesses':
      return simulateCountSuccesses(params, samples)
    case 'keepAndSum':
      return simulateKeepAndSum(params, samples)
    case 'straightSum':
      return simulateStraightSum(params, samples)
  }
}
