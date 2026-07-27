import type { ProgressionRepository } from '../repositories/progression-repository'
import type { CharacterProgression } from '../entities/character-progression'
import type { ID } from '../../../shared/types/index'
import type { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'

// Reads/writes through the same in-memory character store used by CharacterRepository,
// mirroring how the Prisma implementation shares the `characters` table.
export class InMemoryProgressionRepository implements ProgressionRepository {
  constructor(private readonly characterRepository: InMemoryCharacterRepository) {}

  async findByCharacterId(characterId: ID): Promise<CharacterProgression | null> {
    const character = await this.characterRepository.findById(characterId)
    if (!character) return null
    return { characterId: character.id, level: character.level, experience: character.experience }
  }

  async save(
    characterId: ID,
    data: Partial<Pick<CharacterProgression, 'level' | 'experience'>>,
  ): Promise<CharacterProgression> {
    const character = await this.characterRepository.save(characterId, data)
    return { characterId: character.id, level: character.level, experience: character.experience }
  }
}
