import type { CharacterStats } from '../../character/domain/character'

export function calculatePowerScore (stats: CharacterStats): number {
  return stats.strength + stats.intelligence + stats.agility + stats.vitality + stats.luck
}
