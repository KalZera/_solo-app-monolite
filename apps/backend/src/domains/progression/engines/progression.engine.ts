import { calculateXpToNextLevel } from './level.engine'
import { ATTRIBUTE_POINTS_PER_LEVEL } from './attribute.engine'
import {
  ContinuousCurveStrategy,
  type ProgressionStrategy,
} from './progression.strategy'

// Full analytical snapshot of a character's standing on the curve. Everything a
// UI needs to render a level/progress panel — no calculation is left for callers.
export interface LevelProgress {
  level: number
  totalXp: number
  currentLevelXp: number
  nextLevelXp: number
  xpIntoCurrentLevel: number
  xpRemaining: number
  progress: number
  attributePointsAvailable: number
}

const PERCENT = 100
const PROGRESS_DECIMALS = 2

// Pure progression logic for the accumulated-XP model. This class is the single
// source of truth for "given a total XP, what is the character's standing?". It
// has no knowledge of persistence, HTTP or any framework — every method is a
// deterministic pure function of its inputs, which makes it trivially testable
// and safe to reuse across use-cases, jobs and read models.
//
// Extensibility is provided through constructor injection:
//   - `strategy` swaps the whole XP curve (seasons, prestige, alternative pacing);
//   - `attributePointsPerLevel` tunes the reward rule.
// Prestige/rebirth/double-XP therefore become new strategies or a different
// config rather than edits to this class (Open/Closed Principle).
export class ProgressionEngine {
  constructor (
    private readonly strategy: ProgressionStrategy = new ContinuousCurveStrategy(),
    private readonly attributePointsPerLevel: number = ATTRIBUTE_POINTS_PER_LEVEL
  ) {}

  // Accumulated XP required to be at `level` (level 0 → 0, level 1 → baseXp).
  // Delegates to the strategy's closed-form curve (a direct formula — see
  // ContinuousCurveStrategy.totalXpForLevel) rather than summing per-level costs in a
  // loop/recursion, so it stays O(1) regardless of how high `level` is.
  calculateTotalXpForLevel (level: number): number {
    return this.strategy.totalXpForLevel(level)
  }

  // Level for a given accumulated XP. Uses exponential bracketing + binary search
  // (O(log level)) instead of a per-level loop, so even absurd XP totals resolve
  // in a handful of curve evaluations.
  calculateLevel (totalXp: number): number {
    const xp = this.normalizeXp(totalXp)
    if (xp < this.strategy.totalXpForLevel(1)) return 0

    // Grow an upper bound until it overshoots, then binary-search the last level
    // whose cost is still affordable.
    let low = 1
    let high = 2
    while (this.strategy.totalXpForLevel(high) <= xp) {
      high *= 2
    }

    while (low < high) {
      const mid = Math.ceil((low + high) / 2)
      if (this.strategy.totalXpForLevel(mid) <= xp) {
        low = mid
      } else {
        high = mid - 1
      }
    }

    return low
  }

  // Minimum accumulated XP to be at `level`.
  getCurrentLevelXp (level: number): number {
    return this.calculateTotalXpForLevel(level)
  }

  // Accumulated XP needed to reach the next level.
  getNextLevelXp (level: number): number {
    return this.calculateTotalXpForLevel(level + 1)
  }

  // XP earned inside the current level (750 total at level 1 → 250).
  getXpIntoCurrentLevel (totalXp: number): number {
    const xp = this.normalizeXp(totalXp)
    return xp - this.getCurrentLevelXp(this.calculateLevel(xp))
  }

  // XP still needed to reach the next level (750 total, next at 1161 → 411).
  getRemainingXp (totalXp: number): number {
    const xp = this.normalizeXp(totalXp)
    return this.getNextLevelXp(this.calculateLevel(xp)) - xp
  }

  // Attribute points unlocked so far: `level * attributePointsPerLevel`.
  getAvailableAttributePoints (level: number): number {
    return Math.max(0, Math.floor(level)) * this.attributePointsPerLevel
  }

  // Complete analytical snapshot, ready to serialise straight to a client.
  getProgress (totalXp: number, restPoints : number): LevelProgress {
    const xp = this.normalizeXp(totalXp)
    const level = this.calculateLevel(xp)
    const currentLevelXp = this.getCurrentLevelXp(level)
    const nextLevelXp = this.getNextLevelXp(level)
    const levelSpan = nextLevelXp - currentLevelXp
    const xpIntoCurrentLevel = xp - currentLevelXp

    return {
      level,
      totalXp: xp,
      currentLevelXp,
      nextLevelXp,
      xpIntoCurrentLevel,
      xpRemaining: nextLevelXp - xp,
      progress: levelSpan === 0 ? 0 : this.roundPercent((xpIntoCurrentLevel / levelSpan) * PERCENT),
      attributePointsAvailable: restPoints
    }
  }

  // Negative XP is meaningless for progression, so it is treated as a fresh
  // level-0 character. Clamping here keeps every derived field internally
  // consistent (xpIntoCurrentLevel/remaining/progress never go negative).
  private normalizeXp (totalXp: number): number {
    return Math.max(0, totalXp)
  }

  private roundPercent (value: number): number {
    const factor = Math.pow(10, PROGRESS_DECIMALS)
    return Math.round(value * factor) / factor
  }
}

export interface ExperienceGainResult {
  level: number
  experience: number
  levelsGained: number[]
}

// Applies an XP gain to a character's current level/experience, resolving every level-up along the way.
export function applyExperienceGain (
  currentLevel: number,
  currentExperience: number,
  xpGained: number
): ExperienceGainResult {
  let level = currentLevel
  let experience = currentExperience + xpGained
  const levelsGained: number[] = []

  while (experience >= calculateXpToNextLevel(level)) {
    experience -= calculateXpToNextLevel(level)
    level += 1
    levelsGained.push(level)
  }

  return { level, experience, levelsGained }
}
