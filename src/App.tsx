import { useEffect, useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { BuildCard } from './components/BuildCard'
import { ComparisonBar } from './components/ComparisonBar'
import { RollTypeSelector } from './components/RollTypeSelector'
import { useSessionStore } from './store/useSessionStore'
import { decodeSession, encodeSession, snapshotFromStore } from './utils/urlState'

// ─── Responsive hook ──────────────────────────────────────────────────────────

function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [breakpoint])
  return isMobile
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const builds = useSessionStore((s) => s.builds)
  const activeBuildIndex = useSessionStore((s) => s.activeBuildIndex)
  const addBuild = useSessionStore((s) => s.addBuild)
  const setActiveBuildIndex = useSessionStore((s) => s.setActiveBuildIndex)
  const loadSession = useSessionStore((s) => s.loadSession)

  const isMobile = useIsMobile()
  const canAdd = builds.length < 3

  // ── URL hydration on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const snapshot = decodeSession()
    if (snapshot) loadSession(snapshot)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally run once on mount only

  // ── Copy link ─────────────────────────────────────────────────────────────
  const [copied, setCopied] = useState(false)

  function handleCopyLink() {
    const snapshot = snapshotFromStore(useSessionStore.getState())
    window.location.hash = encodeSession(snapshot)
    navigator.clipboard.writeText(window.location.href).catch(() => {
      // Clipboard API may fail in non-secure contexts — the hash is still set.
    })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Swipe handlers ────────────────────────────────────────────────────────
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setActiveBuildIndex(Math.min(activeBuildIndex + 1, builds.length - 1)),
    onSwipedRight: () => setActiveBuildIndex(Math.max(activeBuildIndex - 1, 0)),
    preventScrollOnSwipe: true,
    trackMouse: false,
    delta: 40,
  })

  return (
    <div className={'min-h-screen bg-slate-950 text-slate-100 ' + (isMobile && builds.length > 1 ? 'pb-20' : '')}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="border-b border-slate-800 px-5 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-slate-200 tracking-wide">
              Wargaming Probability
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">Tactical dice calculator</p>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Copy link — always visible */}
            <button
              type="button"
              onClick={handleCopyLink}
              className={
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ' +
                (copied
                  ? 'border-green-700 text-green-400 bg-green-950/40'
                  : 'border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500')
              }
            >
              {copied ? '✓ Copied' : 'Copy link'}
            </button>

            {/* Add build — desktop only */}
            {!isMobile && canAdd && (
              <button
                type="button"
                onClick={addBuild}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors text-sm"
              >
                + Add build
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* ── Shared roll type selector ─────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Roll type</p>
          <RollTypeSelector />
        </div>

        {isMobile ? (
          /* ── Mobile: swipeable carousel ─────────────────────────────── */
          <>
            <div {...swipeHandlers} className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${activeBuildIndex * 100}%)` }}
              >
                {builds.map((_, i) => (
                  <div key={i} className="min-w-full">
                    <BuildCard buildIndex={i} />
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination dots + add button */}
            <div className="flex items-center justify-center gap-3 mt-5">
              {canAdd && (
                <button
                  type="button"
                  onClick={addBuild}
                  className="text-slate-500 hover:text-amber-400 transition-colors text-xl leading-none w-5 h-5 flex items-center justify-center"
                  title="Add build"
                >
                  +
                </button>
              )}
              {builds.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveBuildIndex(i)}
                  aria-label={`Go to Build ${['A', 'B', 'C'][i]}`}
                  className={
                    'rounded-full transition-all duration-200 ' +
                    (i === activeBuildIndex
                      ? 'w-4 h-2 bg-amber-400'
                      : 'w-2 h-2 bg-slate-600 hover:bg-slate-400')
                  }
                />
              ))}
            </div>
          </>
        ) : (
          /* ── Desktop: side-by-side grid ─────────────────────────────── */
          <>
            <div
              className="grid gap-4 items-start"
              style={{ gridTemplateColumns: `repeat(${builds.length}, minmax(0, 1fr))` }}
            >
              {builds.map((_, i) => (
                <BuildCard key={i} buildIndex={i} />
              ))}
            </div>

            {/* Desktop comparison bar — inline below cards */}
            <ComparisonBar />
          </>
        )}
      </main>

      {/* ── Mobile fixed comparison bar ──────────────────────────────── */}
      {isMobile && <ComparisonBar fixed />}
    </div>
  )
}
