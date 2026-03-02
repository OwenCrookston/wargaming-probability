import type { RollParams, SimulationResult } from './types'
import { getOrSimulate } from './cache'

// ─── Message protocol ─────────────────────────────────────────────────────────

interface WorkerRequest {
  id: number
  params: RollParams
}

interface WorkerResponse {
  id: number
  result: SimulationResult
}

// ─── Handler ──────────────────────────────────────────────────────────────────
// Cache lives here in the worker context — each BuildCard gets its own
// independent cache, which is fine for the max-3-builds use case.

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, params } = e.data
  const result = getOrSimulate(params)
  self.postMessage({ id, result } satisfies WorkerResponse)
}
