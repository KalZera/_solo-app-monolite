// Business rule: beyond this level, the curve switches from quadratic to exponential
// growth. Exported so other curves (e.g. ContinuousCurveStrategy) can honour the same
// level-20 boundary and post-20 rate instead of redefining it.
export const MAX_QUADRATIC_CURVE_LEVEL = 20
export const POST_LEVEL_20_BASE_XP = 500
export const POST_LEVEL_20_GROWTH_RATE = 1.15

// XP required to go from `level` to `level + 1`.
// Up to level 20: XP = 500 + 100L + 12.5L². After level 20: XP = 500 * (1.15^L).
export function calculateXpToNextLevel (level: number): number {
  if (level <= MAX_QUADRATIC_CURVE_LEVEL) {
    return Math.round(500 + 100 * level + 12.5 * level ** 2)
  }

  return Math.round(POST_LEVEL_20_BASE_XP * Math.pow(POST_LEVEL_20_GROWTH_RATE, level))
}
