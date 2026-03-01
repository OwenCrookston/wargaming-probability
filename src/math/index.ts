export type {
  DieType,
  CountSuccessesParams,
  KeepAndSumParams,
  StraightSumParams,
  RollParams,
  SimulationResult,
} from './types'

export { simulate, DEFAULT_SAMPLES } from './simulate'
export { getOrSimulate, clearCache, getCacheSize } from './cache'
