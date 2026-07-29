import type { CharacterStats } from '../../character/domain/character'

// business_rules.md: "5 pontos de status para distribuir livremente" — granted to CharacterRestPoint on level up.
export const ATTRIBUTE_POINTS_PER_LEVEL = 5

// business_rules.md: "o protagonista também ganha 1 ponto automático em cada atributo base" — applied directly to stats on level up.
export const AUTO_ATTRIBUTE_INCREMENT_PER_LEVEL = 1

export function applyAutoAttributeGains (stats: CharacterStats, levelsGained: number): CharacterStats {
  const increment = levelsGained * AUTO_ATTRIBUTE_INCREMENT_PER_LEVEL

  return {
    strength: stats.strength + increment,
    intelligence: stats.intelligence + increment,
    agility: stats.agility + increment,
    vitality: stats.vitality + increment,
    luck: stats.luck + increment,
  }
}
