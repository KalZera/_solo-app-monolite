import { describe, it, expect } from 'vitest'
import { ProgressionEngine, type LevelProgress } from '../engines/progression.engine'
import {
  ContinuousCurveStrategy,
  DEFAULT_PROGRESSION_CONFIG,
  type ProgressionStrategy,
} from '../engines/progression.strategy'

describe('ProgressionEngine', () => {
  const engine = new ProgressionEngine()

  describe('calculateTotalXpForLevel', () => {
    it('returns 0 accumulated XP for level 0', () => {
      expect(engine.calculateTotalXpForLevel(0)).toBe(0)
    })

    it('requires exactly 500 accumulated XP for level 1', () => {
      expect(engine.calculateTotalXpForLevel(1)).toBe(DEFAULT_PROGRESSION_CONFIG.baseXp)
      expect(engine.calculateTotalXpForLevel(1)).toBe(500)
    })

    it('reproduces the spec example for level 2 (1161)', () => {
      expect(engine.calculateTotalXpForLevel(2)).toBe(1161)
    })

    it('treats negative levels as level 0', () => {
      expect(engine.calculateTotalXpForLevel(-5)).toBe(0)
    })

    it('is strictly increasing across the whole curve', () => {
      for (let level = 0; level < 200; level++) {
        expect(engine.calculateTotalXpForLevel(level + 1)).toBeGreaterThan(
          engine.calculateTotalXpForLevel(level)
        )
      }
    })
  })

  describe('calculateLevel', () => {
    it('clamps negative XP to level 0', () => {
      expect(engine.calculateLevel(-100)).toBe(0)
    })

    it('returns level 0 while below the level-1 threshold', () => {
      expect(engine.calculateLevel(0)).toBe(0)
      expect(engine.calculateLevel(499)).toBe(0)
    })

    it('returns level 1 exactly at the threshold (first XP after level up)', () => {
      expect(engine.calculateLevel(500)).toBe(1)
    })

    it('stays at level 1 on the last XP before the next level up', () => {
      const nextThreshold = engine.calculateTotalXpForLevel(2) // 1161
      expect(engine.calculateLevel(nextThreshold - 1)).toBe(1)
      expect(engine.calculateLevel(nextThreshold)).toBe(2)
    })

    it('resolves the spec example calculateLevel(12500) === 12', () => {
      expect(engine.calculateLevel(12500)).toBe(12)
    })

    it('handles very high XP without a large loop (binary search)', () => {
      const level = engine.calculateLevel(10_000_000)
      // Round-trips: the resolved level is affordable and the next one is not.
      expect(engine.calculateTotalXpForLevel(level)).toBeLessThanOrEqual(10_000_000)
      expect(engine.calculateTotalXpForLevel(level + 1)).toBeGreaterThan(10_000_000)
    })

    it('round-trips every threshold back to its level', () => {
      for (let level = 1; level <= 100; level++) {
        const threshold = engine.calculateTotalXpForLevel(level)
        expect(engine.calculateLevel(threshold)).toBe(level)
        expect(engine.calculateLevel(threshold - 1)).toBe(level - 1)
      }
    })
  })

  describe('getCurrentLevelXp / getNextLevelXp', () => {
    it('returns the accumulated XP floor of the given level', () => {
      expect(engine.getCurrentLevelXp(1)).toBe(500)
      expect(engine.getCurrentLevelXp(4)).toBe(engine.calculateTotalXpForLevel(4))
    })

    it('returns the accumulated XP required to reach the next level', () => {
      expect(engine.getNextLevelXp(1)).toBe(1161)
      expect(engine.getNextLevelXp(4)).toBe(engine.calculateTotalXpForLevel(5))
    })
  })

  describe('getXpIntoCurrentLevel', () => {
    it('returns XP earned inside the current level (750 → 250)', () => {
      expect(engine.getXpIntoCurrentLevel(750)).toBe(250)
    })

    it('is 0 exactly on a level threshold', () => {
      expect(engine.getXpIntoCurrentLevel(500)).toBe(0)
    })

    it('is 0 for negative XP', () => {
      expect(engine.getXpIntoCurrentLevel(-50)).toBe(0)
    })
  })

  describe('getRemainingXp', () => {
    it('returns XP left until the next level (750 → 411)', () => {
      expect(engine.getRemainingXp(750)).toBe(411)
    })

    it('equals a full level span for a fresh character', () => {
      expect(engine.getRemainingXp(0)).toBe(500)
    })
  })

  describe('getAvailableAttributePoints', () => {
    it('grants 5 points per level', () => {
      expect(engine.getAvailableAttributePoints(0)).toBe(0)
      expect(engine.getAvailableAttributePoints(1)).toBe(5)
      expect(engine.getAvailableAttributePoints(2)).toBe(10)
      expect(engine.getAvailableAttributePoints(12)).toBe(60)
    })

    it('never returns negative points', () => {
      expect(engine.getAvailableAttributePoints(-3)).toBe(0)
    })
  })

  describe('getProgress', () => {
    it('matches the authoritative spec example for 750 XP', () => {
      expect(engine.getProgress(750)).toEqual<LevelProgress>({
        level: 1,
        totalXp: 750,
        currentLevelXp: 500,
        nextLevelXp: 1161,
        xpIntoCurrentLevel: 250,
        xpRemaining: 411,
        progress: 37.82,
        attributePointsAvailable: 5,
      })
    })

    it('reports a fresh level-0 character for negative XP', () => {
      expect(engine.getProgress(-100)).toEqual<LevelProgress>({
        level: 0,
        totalXp: 0,
        currentLevelXp: 0,
        nextLevelXp: 500,
        xpIntoCurrentLevel: 0,
        xpRemaining: 500,
        progress: 0,
        attributePointsAvailable: 0,
      })
    })

    it('reports 0% progress right after a level up', () => {
      const snapshot = engine.getProgress(500)
      expect(snapshot.level).toBe(1)
      expect(snapshot.progress).toBe(0)
      expect(snapshot.xpIntoCurrentLevel).toBe(0)
    })

    it('reports near-full progress on the last XP before a level up', () => {
      const snapshot = engine.getProgress(engine.calculateTotalXpForLevel(2) - 1)
      expect(snapshot.level).toBe(1)
      expect(snapshot.xpRemaining).toBe(1)
      expect(snapshot.progress).toBeGreaterThan(99)
      expect(snapshot.progress).toBeLessThan(100)
    })

    it('keeps every derived field internally consistent', () => {
      for (const totalXp of [0, 250, 500, 750, 1161, 5000, 12500, 250_000]) {
        const s = engine.getProgress(totalXp)
        expect(s.xpIntoCurrentLevel).toBe(s.totalXp - s.currentLevelXp)
        expect(s.xpRemaining).toBe(s.nextLevelXp - s.totalXp)
        expect(s.progress).toBeGreaterThanOrEqual(0)
        expect(s.progress).toBeLessThanOrEqual(100)
        expect(s.attributePointsAvailable).toBe(s.level * 5)
      }
    })
  })

  describe('extensibility (Strategy Pattern & configuration)', () => {
    it('accepts a custom curve configuration without code changes', () => {
      const hardcore = new ProgressionEngine(
        new ContinuousCurveStrategy({ baseXp: 1000, exponent: 2, multiplier: 300 })
      )
      // The f(1) === baseXp invariant holds for any config.
      expect(hardcore.calculateTotalXpForLevel(1)).toBe(1000)
      expect(hardcore.calculateLevel(1000)).toBe(1)
      expect(hardcore.calculateLevel(999)).toBe(0)
    })

    it('accepts an entirely different progression strategy', () => {
      // A flat "500 XP per level" strategy — the kind of thing a season/event could
      // introduce — plugged in with zero changes to the engine.
      const flatStrategy: ProgressionStrategy = {
        totalXpForLevel: (level) => Math.max(0, Math.floor(level)) * 500,
      }
      const flatEngine = new ProgressionEngine(flatStrategy)

      expect(flatEngine.calculateTotalXpForLevel(3)).toBe(1500)
      expect(flatEngine.calculateLevel(1500)).toBe(3)
      expect(flatEngine.getProgress(750).progress).toBe(50)
    })

    it('allows tuning the attribute-point reward (e.g. prestige multipliers)', () => {
      const prestigeEngine = new ProgressionEngine(new ContinuousCurveStrategy(), 10)
      expect(prestigeEngine.getAvailableAttributePoints(3)).toBe(30)
    })
  })
})
