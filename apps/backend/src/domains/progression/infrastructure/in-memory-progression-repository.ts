import type { ProgressionRepository } from '../repositories/progression-repository'
import type { CharacterProgression } from '../entities/character-progression'
import type { ID } from '../../../shared/types/index'
import type { InMemoryCharacterRepository } from '../../character/infrastructure/in-memory-character-repository'
import type { InMemoryCharacterRestPointRepository } from '../../character/infrastructure/in-memory-character-rest-point-repository'

// Reads/writes through the same in-memory stores used by CharacterRepository and
// CharacterRestPointRepository, mirroring how the Prisma implementation shares
// the `characters` and `characters_rest_points` tables.
export class InMemoryProgressionRepository implements ProgressionRepository {
  constructor(
    private readonly characterRepository: InMemoryCharacterRepository,
    private readonly restPointRepository: InMemoryCharacterRestPointRepository,
  ) {}

  async findByCharacterId(characterId: ID): Promise<CharacterProgression | null> {
    const character = await this.characterRepository.findById(characterId)
    if (!character) return null
    return {
      characterId: character.id,
      level: character.level,
      experience: character.experience,
      stats: character.stats,
      powerScore: character.powerScore,
    }
  }

  async save(
    characterId: ID,
    data: Partial<Pick<CharacterProgression, 'level' | 'experience' | 'stats' | 'powerScore'>>,
  ): Promise<CharacterProgression> {
    const character = await this.characterRepository.save(characterId, data)
    return {
      characterId: character.id,
      level: character.level,
      experience: character.experience,
      stats: character.stats,
      powerScore: character.powerScore,
    }
  }

  async addRestPoints(characterId: ID, amount: number): Promise<void> {
    await this.restPointRepository.incrementRestPoints(characterId, amount)
  }
}
