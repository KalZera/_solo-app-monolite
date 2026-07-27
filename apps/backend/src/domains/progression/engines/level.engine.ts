const MAX_QUADRATIC_CURVE_LEVEL = 20

// XP required to go from `level` to `level + 1`.
// Up to level 20: XP = 500 + 100L + 12.5L². After level 20: XP = 500 * (1.15^L).
export function calculateXpToNextLevel(level: number): number {
  if (level <= MAX_QUADRATIC_CURVE_LEVEL) {
    return Math.round(500 + 100 * level + 12.5 * level ** 2)
  }

  return Math.round(500 * Math.pow(1.15, level))
}
