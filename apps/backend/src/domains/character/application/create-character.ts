import type { CharacterClass, CharacterRepository } from '../domain/character'
import type { CharacterRestPointRepository } from '../domain/character-rest-point'
import { calculatePowerScore } from '../../progression/engines/power-score.engine'
import { ConflictError } from '../../../shared/errors/app-error'

interface CreateCharacterInput {
  userId: string
  name: string
  class: CharacterClass
  title: string
  avatar?: string | null
}

const BASE_STATS = {
  strength: 1,
  intelligence: 1,
  agility: 1,
  vitality: 1,
  perception: 1,
}

export class CreateCharacterUseCase {
  constructor (
    private readonly repository: CharacterRepository,
    private readonly restPointRepository: CharacterRestPointRepository
  ) {}

  async execute (input: CreateCharacterInput) {
    const existing = await this.repository.findByUserId(input.userId)

    if (existing.length > 0) {
      throw new ConflictError('User already has a character')
    }

    const stats = { ...BASE_STATS }

    const character = await this.repository.create({
      userId: input.userId,
      name: input.name,
      avatar: input.avatar ?? null,
      class: input.class,
      title: input.title,
      level: 0,
      experience: 0,
      powerScore: calculatePowerScore(stats),
      stats,
    })

    await this.restPointRepository.create(character.id)

    return character
  }
}
