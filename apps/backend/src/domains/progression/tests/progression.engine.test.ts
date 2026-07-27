import { describe, it, expect } from 'vitest'
import { applyExperienceGain } from '../engines/progression.engine'
import { calculateXpToNextLevel } from '../engines/level.engine'

describe('applyExperienceGain', () => {
  it('accumulates XP without leveling up when below the threshold', () => {
    const result = applyExperienceGain(1, 0, 10)

    expect(result).toEqual({ level: 1, experience: 10, levelsGained: [] })
  })

  it('levels up once and carries over the remaining XP', () => {
    const xpForLevel1 = calculateXpToNextLevel(1)
    const result = applyExperienceGain(1, xpForLevel1 - 5, 10)

    expect(result.level).toBe(2)
    expect(result.experience).toBe(5)
    expect(result.levelsGained).toEqual([2])
  })

  it('gains multiple levels in a single application when XP overflows more than one threshold', () => {
    const hugeGain = calculateXpToNextLevel(1) + calculateXpToNextLevel(2) + 5
    const result = applyExperienceGain(1, 0, hugeGain)

    expect(result.level).toBe(3)
    expect(result.experience).toBe(5)
    expect(result.levelsGained).toEqual([2, 3])
  })
})
