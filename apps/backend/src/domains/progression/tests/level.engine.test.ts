import { describe, it, expect } from 'vitest'
import { calculateXpToNextLevel } from '../engines/level.engine'

describe('calculateXpToNextLevel', () => {
  it('requires exactly 500 xp to go from level 0 to level 1', () => {
    expect(calculateXpToNextLevel(0)).toBe(500)
  })

  it('uses the quadratic curve (500 + 100L + 12.5L²) up to level 20', () => {
    expect(calculateXpToNextLevel(1)).toBe(Math.round(500 + 100 * 1 + 12.5 * 1 ** 2))
    expect(calculateXpToNextLevel(10)).toBe(Math.round(500 + 100 * 10 + 12.5 * 10 ** 2))
    expect(calculateXpToNextLevel(20)).toBe(Math.round(500 + 100 * 20 + 12.5 * 20 ** 2))
  })

  it('uses the exponential curve (500 * 1.15^L) after level 20', () => {
    expect(calculateXpToNextLevel(21)).toBe(Math.round(500 * Math.pow(1.15, 21)))
    expect(calculateXpToNextLevel(30)).toBe(Math.round(500 * Math.pow(1.15, 30)))
  })

  it('produces a strictly increasing XP requirement across the level-20 boundary', () => {
    expect(calculateXpToNextLevel(21)).toBeGreaterThan(calculateXpToNextLevel(20))
  })
})
