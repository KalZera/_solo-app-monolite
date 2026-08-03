import type { ID } from '../../../shared/types/index'
import type { CharacterProgression } from '../entities/character-progression'

export interface ProgressionRepository {
  findByCharacterId(characterId: ID): Promise<CharacterProgression | null>
  save(
    characterId: ID,
    data: Partial<Pick<CharacterProgression, 'level' | 'experience' | 'stats' | 'powerScore'>>,
  ): Promise<CharacterProgression>
  addRestPoints(characterId: ID, amount: number): Promise<void>
  // Atomically persists the progression update AND credits rest points, so a level-up can
  // never save the new level/XP without also crediting its rest points (or vice versa).
  saveWithRestPoints(
    characterId: ID,
    data: Partial<Pick<CharacterProgression, 'level' | 'experience' | 'stats' | 'powerScore'>>,
    restPointsToAdd: number,
  ): Promise<CharacterProgression>
}
