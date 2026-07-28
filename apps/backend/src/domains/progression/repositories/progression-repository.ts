import type { ID } from '../../../shared/types/index'
import type { CharacterProgression } from '../entities/character-progression'

export interface ProgressionRepository {
  findByCharacterId(characterId: ID): Promise<CharacterProgression | null>
  save(
    characterId: ID,
    data: Partial<Pick<CharacterProgression, 'level' | 'experience' | 'stats' | 'powerScore'>>,
  ): Promise<CharacterProgression>
  addRestPoints(characterId: ID, amount: number): Promise<void>
}
