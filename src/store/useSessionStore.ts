import { create } from 'zustand'
import type {
  CountSuccessesParams,
  KeepAndSumParams,
  RollParams,
  SimulationResult,
  StraightSumParams,
} from '../math/types'

// ─── Build shape ──────────────────────────────────────────────────────────────
// Each build persists params per roll type so switching roll type doesn't reset.

export interface Build {
  rollType: RollParams['rollType']
  countSuccesses: CountSuccessesParams
  keepAndSum: KeepAndSumParams
  straightSum: StraightSumParams
  result: SimulationResult | null
  isComputing: boolean
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultCountSuccesses: CountSuccessesParams = {
  rollType: 'countSuccesses',
  dieType: 6,
  numDice: 3,
  threshold: 4,
  modifier: 0,
  rerollOnes: false,
  rerollFailures: false,
  goal: 1,
}

const defaultKeepAndSum: KeepAndSumParams = {
  rollType: 'keepAndSum',
  dieType: 6,
  numDice: 4,
  keepMode: 'highest',
  keepCount: 3,
  modifier: 0,
  goal: 10,
}

const defaultStraightSum: StraightSumParams = {
  rollType: 'straightSum',
  dieType: 6,
  numDice: 2,
  modifier: 0,
  goal: 7,
}

export function makeBuild(): Build {
  return {
    rollType: 'countSuccesses',
    countSuccesses: { ...defaultCountSuccesses },
    keepAndSum: { ...defaultKeepAndSum },
    straightSum: { ...defaultStraightSum },
    result: null,
    isComputing: false,
  }
}

// ─── Immutable array updater ──────────────────────────────────────────────────

function updateAt<T>(arr: T[], index: number, updater: (item: T) => T): T[] {
  return arr.map((item, i) => (i === index ? updater(item) : item))
}

// ─── Store shape ──────────────────────────────────────────────────────────────

interface SessionStore {
  builds: Build[]
  activeBuildIndex: number

  // Build management
  addBuild: () => void
  removeBuild: (index: number) => void
  duplicateBuild: (index: number) => void
  setActiveBuildIndex: (index: number) => void

  // Per-build updates
  setRollType: (index: number, type: RollParams['rollType']) => void
  patchCountSuccesses: (index: number, patch: Partial<Omit<CountSuccessesParams, 'rollType'>>) => void
  patchKeepAndSum: (index: number, patch: Partial<Omit<KeepAndSumParams, 'rollType'>>) => void
  patchStraightSum: (index: number, patch: Partial<Omit<StraightSumParams, 'rollType'>>) => void
  setResult: (index: number, result: SimulationResult | null) => void
  setIsComputing: (index: number, value: boolean) => void
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useSessionStore = create<SessionStore>((set) => ({
  builds: [makeBuild()],
  activeBuildIndex: 0,

  addBuild: () =>
    set((state) => {
      if (state.builds.length >= 3) return state
      return {
        builds: [...state.builds, makeBuild()],
        activeBuildIndex: state.builds.length, // jump to the new build
      }
    }),

  removeBuild: (index) =>
    set((state) => {
      if (state.builds.length <= 1) return state
      const builds = state.builds.filter((_, i) => i !== index)
      return {
        builds,
        activeBuildIndex: Math.min(state.activeBuildIndex, builds.length - 1),
      }
    }),

  duplicateBuild: (index) =>
    set((state) => {
      if (state.builds.length >= 3) return state
      const src = state.builds[index]
      const copy: Build = {
        ...src,
        countSuccesses: { ...src.countSuccesses },
        keepAndSum: { ...src.keepAndSum },
        straightSum: { ...src.straightSum },
        result: null,
        isComputing: false,
      }
      const builds = [
        ...state.builds.slice(0, index + 1),
        copy,
        ...state.builds.slice(index + 1),
      ]
      return { builds, activeBuildIndex: index + 1 }
    }),

  setActiveBuildIndex: (index) => set({ activeBuildIndex: index }),

  setRollType: (index, type) =>
    set((state) => ({
      builds: updateAt(state.builds, index, (b) => ({ ...b, rollType: type })),
    })),

  patchCountSuccesses: (index, patch) =>
    set((state) => ({
      builds: updateAt(state.builds, index, (b) => {
        const next = { ...b.countSuccesses, ...patch }
        if (next.threshold > next.dieType) next.threshold = next.dieType
        return { ...b, countSuccesses: next }
      }),
    })),

  patchKeepAndSum: (index, patch) =>
    set((state) => ({
      builds: updateAt(state.builds, index, (b) => {
        const next = { ...b.keepAndSum, ...patch }
        if (next.keepCount > next.numDice) next.keepCount = next.numDice
        if (next.keepCount < 1) next.keepCount = 1
        return { ...b, keepAndSum: next }
      }),
    })),

  patchStraightSum: (index, patch) =>
    set((state) => ({
      builds: updateAt(state.builds, index, (b) => ({
        ...b,
        straightSum: { ...b.straightSum, ...patch },
      })),
    })),

  setResult: (index, result) =>
    set((state) => ({
      builds: updateAt(state.builds, index, (b) => ({ ...b, result })),
    })),

  setIsComputing: (index, value) =>
    set((state) => ({
      builds: updateAt(state.builds, index, (b) => ({ ...b, isComputing: value })),
    })),
}))

// ─── Selectors / pure helpers ─────────────────────────────────────────────────

export function selectBuildParams(build: Build): RollParams {
  switch (build.rollType) {
    case 'countSuccesses':
      return build.countSuccesses
    case 'keepAndSum':
      return build.keepAndSum
    case 'straightSum':
      return build.straightSum
  }
}

// Returns delta for each build vs. the highest-percent build.
// null = leader (hidden) or insufficient data.
export function computeDeltas(builds: Build[]): (number | null)[] {
  const percents = builds.map((b) => b.result?.successPercent ?? null)
  const valid = percents.filter((p): p is number => p !== null)
  if (valid.length < 2) return builds.map(() => null)

  const max = Math.max(...valid)
  return percents.map((p) => {
    if (p === null || p >= max) return null
    return p - max // always negative
  })
}

export const BUILD_LABELS = ['A', 'B', 'C'] as const
