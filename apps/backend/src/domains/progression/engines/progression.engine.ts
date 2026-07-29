import { calculateXpToNextLevel } from './level.engine'

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
