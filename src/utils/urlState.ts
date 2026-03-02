import type {
  CountSuccessesParams,
  KeepAndSumParams,
  RollParams,
  StraightSumParams,
} from '../math/types'

// ─── Snapshot types ───────────────────────────────────────────────────────────
// Serializable subset of the store — params only, no computed/transient fields.

export interface BuildSnapshot {
  countSuccesses: CountSuccessesParams
  keepAndSum: KeepAndSumParams
  straightSum: StraightSumParams
}

export interface SessionSnapshot {
  /** Format version — allows future migrations. */
  v: 1
  rollType: RollParams['rollType']
  activeBuildIndex: number
  builds: BuildSnapshot[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HASH_PREFIX = 's='
const VALID_ROLL_TYPES: RollParams['rollType'][] = [
  'countSuccesses',
  'keepAndSum',
  'straightSum',
]
const VALID_DIE_TYPES = new Set([2, 3, 4, 6, 8, 10, 12, 20])

// ─── Encode ───────────────────────────────────────────────────────────────────

/**
 * Serialise a snapshot to a base64 string and write it to window.location.hash.
 * Returns the encoded string (without the `#s=` prefix) for use in clipboard copy.
 */
export function encodeSession(snapshot: SessionSnapshot): string {
  const json = JSON.stringify(snapshot)
  const encoded = btoa(json)
  return `${HASH_PREFIX}${encoded}`
}

// ─── Decode ───────────────────────────────────────────────────────────────────

/**
 * Read window.location.hash, decode, validate, and return a SessionSnapshot.
 * Returns null on any error — the caller should silently fall back to defaults.
 */
export function decodeSession(): SessionSnapshot | null {
  try {
    const hash = window.location.hash.slice(1) // remove leading '#'
    if (!hash.startsWith(HASH_PREFIX)) return null

    const encoded = hash.slice(HASH_PREFIX.length)
    const json = atob(encoded)
    const raw = JSON.parse(json) as unknown

    return validate(raw)
  } catch {
    return null
  }
}

// ─── Store → snapshot ─────────────────────────────────────────────────────────

/**
 * Pluck only the serialisable fields from the store state.
 * Deliberately omits result, isComputing, and store methods.
 */
export function snapshotFromStore(state: {
  rollType: RollParams['rollType']
  activeBuildIndex: number
  builds: Array<{
    countSuccesses: CountSuccessesParams
    keepAndSum: KeepAndSumParams
    straightSum: StraightSumParams
  }>
}): SessionSnapshot {
  return {
    v: 1,
    rollType: state.rollType,
    activeBuildIndex: state.activeBuildIndex,
    builds: state.builds.map((b) => ({
      countSuccesses: { ...b.countSuccesses },
      keepAndSum: { ...b.keepAndSum },
      straightSum: { ...b.straightSum },
    })),
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

function isNumber(x: unknown): x is number {
  return typeof x === 'number' && isFinite(x)
}

function isBoolean(x: unknown): x is boolean {
  return typeof x === 'boolean'
}

function validateCountSuccesses(x: unknown): x is CountSuccessesParams {
  if (!isObject(x)) return false
  return (
    x['rollType'] === 'countSuccesses' &&
    VALID_DIE_TYPES.has(x['dieType'] as number) &&
    isNumber(x['numDice']) && x['numDice'] >= 1 && x['numDice'] <= 100 &&
    isNumber(x['threshold']) && x['threshold'] >= 1 &&
    isNumber(x['modifier']) &&
    isBoolean(x['rerollOnes']) &&
    isBoolean(x['rerollFailures']) &&
    isNumber(x['goal']) && x['goal'] >= 0
  )
}

function validateKeepAndSum(x: unknown): x is KeepAndSumParams {
  if (!isObject(x)) return false
  return (
    x['rollType'] === 'keepAndSum' &&
    VALID_DIE_TYPES.has(x['dieType'] as number) &&
    isNumber(x['numDice']) && x['numDice'] >= 1 && x['numDice'] <= 100 &&
    (x['keepMode'] === 'highest' || x['keepMode'] === 'lowest') &&
    isNumber(x['keepCount']) && x['keepCount'] >= 1 &&
    isNumber(x['modifier']) &&
    isNumber(x['goal']) && x['goal'] >= 0
  )
}

function validateStraightSum(x: unknown): x is StraightSumParams {
  if (!isObject(x)) return false
  return (
    x['rollType'] === 'straightSum' &&
    VALID_DIE_TYPES.has(x['dieType'] as number) &&
    isNumber(x['numDice']) && x['numDice'] >= 1 && x['numDice'] <= 100 &&
    isNumber(x['modifier']) &&
    isNumber(x['goal']) && x['goal'] >= 0
  )
}

function validateBuild(x: unknown): x is BuildSnapshot {
  if (!isObject(x)) return false
  return (
    validateCountSuccesses(x['countSuccesses']) &&
    validateKeepAndSum(x['keepAndSum']) &&
    validateStraightSum(x['straightSum'])
  )
}

function validate(raw: unknown): SessionSnapshot | null {
  if (!isObject(raw)) return null
  if (raw['v'] !== 1) return null
  if (!VALID_ROLL_TYPES.includes(raw['rollType'] as RollParams['rollType'])) return null
  if (!isNumber(raw['activeBuildIndex'])) return null

  const builds = raw['builds']
  if (!Array.isArray(builds)) return null
  if (builds.length < 1 || builds.length > 3) return null
  if (!builds.every(validateBuild)) return null

  // activeBuildIndex must be in range
  if (raw['activeBuildIndex'] < 0 || raw['activeBuildIndex'] >= builds.length) return null

  return {
    v: 1,
    rollType: raw['rollType'] as RollParams['rollType'],
    activeBuildIndex: raw['activeBuildIndex'],
    builds: builds as BuildSnapshot[],
  }
}
