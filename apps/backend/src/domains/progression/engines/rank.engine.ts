export type CharacterRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'Monarch'

export function calculateRank (powerScore: number): CharacterRank {
  if (powerScore < 500) return 'E'
  if (powerScore < 1500) return 'D'
  if (powerScore < 3500) return 'C'
  if (powerScore < 7000) return 'B'
  if (powerScore < 12000) return 'A'
  if (powerScore < 18000) return 'S'
  if (powerScore < 26000) return 'SS'
  return 'Monarch'
}
