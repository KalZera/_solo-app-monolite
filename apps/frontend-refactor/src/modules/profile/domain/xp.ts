const MAX_QUADRATIC_CURVE_LEVEL = 20

// Client-side mirror of the backend's per-level XP curve (level.engine.ts): the
// character's `experience` is XP earned inside the current level, and this is the
// amount needed to reach the next one. Used only to render the XP bar — the
// server remains the authority.
export function calculateXpToNextLevel(level: number): number {
  if (level <= MAX_QUADRATIC_CURVE_LEVEL) {
    return Math.round(500 + 100 * level + 12.5 * level ** 2)
  }
  return Math.round(500 * Math.pow(1.15, level))
}
