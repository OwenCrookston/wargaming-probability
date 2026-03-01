# Wargaming Probability Calculator — Spec

## Product Goal

A fast, tabletop-friendly probability calculator for wargamers.

1. Designed for quick decisions during play
2. Percent-focused (no graphs by default)
3. Compare up to 3 builds at once
4. Minimal UI friction
5. No saved sessions
6. No naming clutter

Think: tactical calculator, not statistical analysis tool.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 | Component model fits build cards |
| Language | TypeScript | Catches bugs in probability math |
| Build tool | Vite | Fast, zero-config |
| Styling | Tailwind CSS | Utility-first, great for bold number UI |
| State | Zustand | ComparisonSession model maps directly to code |
| Swipe | react-swipeable | Lightweight, well-maintained |
| Math | Custom TS module | Pure functions, easy to test |
| Simulation | Monte Carlo (~1M samples) | Handles rerolls and edge cases simply |
| Caching | Parameter-hash cache | Skip re-simulation when build params unchanged |
| URL state | URLSearchParams | Optional, no extra library |
| Deployment | GitHub Pages or Netlify | Free, static, no backend |

---

## Confirmed Design Decisions

1. **Probability method** — Monte Carlo (~1M samples) with parameter-hash caching. Skip re-running simulation when parameters haven't changed. Post-v1 candidate: hybrid exact/Monte Carlo based on dice pool size.
2. **Exploding dice** — Scoped out of v1.
3. **Reroll 1s** — UI shortcut that sets the reroll-failures threshold to 1. Not a separate mechanic.
4. **Delta display** — Always current build vs. the highest-probability build in the active comparison set. Hidden when the current build is already the highest.
5. **"At most K successes" goal** — Scoped out of v1.
6. **Roll modifier** — Added to the final sum, not per-die.

---

## Supported Roll Types (v1)

### 1. Count Successes
Roll N dice, count results ≥ X.

Parameters:
- Dice type (d2–d20)
- Number of dice (N)
- Threshold (≥ X)
- Optional modifier to final sum
- Reroll 1s (shortcut for reroll failures where threshold = 1)
- Reroll failures (reroll any die that doesn't meet threshold)

Goal: "At least K successes"

Output: P(≥ K successes) as a percent

### 2. Keep & Sum
Roll N dice, keep highest or lowest M, sum them.

Parameters:
- Dice type (d2–d20)
- Number of dice (N)
- Keep highest M or keep lowest M
- Optional modifier to sum

Goal: "Sum ≥ X"

Output: P(sum ≥ X) as a percent

### 3. Straight Sum
Roll N dice, sum all. Simplified Keep & Sum where M = N.

Use cases: damage rolls, charges, morale tests.

Goal: "Sum ≥ X"

Output: P(sum ≥ X) as a percent

---

## Comparison Model

- Up to 3 builds (A, B, C)
- No custom naming
- Each build has independent parameters and an independent success goal
- Comparison output:
  1. Each build's percent
  2. Δ vs. highest-probability build (hidden for the highest build)
  3. Optional raw roll comparison (advanced toggle, post-v1 candidate)

---

## Layout

### Desktop
- Side-by-side build cards (A | B | C)
- Large centered percent in each card
- Comparison section below cards

### Mobile
- Swipe between builds
- Pagination dots
- Fixed comparison summary visible below swipe area
- Δ bar updates live as user swipes

---

## Build Behavior

- No custom naming
- Duplicate/copy build supported
- Max 3 builds
- No automatic session saving
- URL state encoding (optional, future refinement)

---

## Output Format

- Large bold percent (e.g., `72.8%`)
- Default: 1 decimal place
- Secondary info (small): expected value, range
- No charts or histograms

---

## Internal Architecture

```
ComparisonSession (Zustand store)
  rollType
  builds[]

Build
  parameters
  goal
  computed distribution (internal)
  computed successPercent

Comparison layer
  reads each build's successPercent
  calculates Δ vs. highest build
```

---

## Explicit Non-Goals (v1)

1. No user accounts
2. No saving sessions
3. No build naming
4. No charts or histograms
5. No exploding dice
6. No "at most K successes" goal
7. No multi-stage combat simulation
8. No per-die modifiers (modifier applies to final sum only)

---

## Milestones

### Milestone 1 — Core Math Engine
- Monte Carlo simulation module (pure TypeScript, no UI)
- Count Successes implementation with reroll support
- Keep & Sum implementation
- Straight Sum implementation
- Parameter-hash caching layer
- Unit tests for all roll types

### Milestone 2 — Single Build UI
- Vite + React + Tailwind + Zustand scaffold
- Single build card UI (desktop)
- Roll type selector
- Parameter inputs per roll type
- Large bold percent output with EV and range
- Zustand store wired to simulation

### Milestone 3 — Comparison & Mobile
- Multi-build support (A, B, C)
- Desktop side-by-side layout
- Delta display logic (vs. highest build)
- Mobile swipe layout (react-swipeable)
- Fixed comparison summary bar on mobile
- Duplicate build functionality
