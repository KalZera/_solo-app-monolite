import type { ID } from '../../../shared/types/index'
import type { CharacterStats } from '../../character/domain/character'

export interface CharacterProgression {
  characterId: ID
  level: number
  experience: number
  stats: CharacterStats
  powerScore: number
}
