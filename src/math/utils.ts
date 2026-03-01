// Returns a random integer in [1, sides]
export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

// Round to one decimal place
export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

// Round to two decimal places
export function round2(n: number): number {
  return Math.round(n * 100) / 100
}
