import type { CharacterClass, CharacterRepository } from '../domain/character'
import { calculatePowerScore } from '../domain/character'
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
  luck: 1,
}

export class CreateCharacterUseCase {
  constructor(private readonly repository: CharacterRepository) {}

  async execute(input: CreateCharacterInput) {
    const existing = await this.repository.findByUserId(input.userId)

    if (existing.length > 0) {
      throw new ConflictError('User already has a character')
    }

    const stats = { ...BASE_STATS }

    return this.repository.create({
      userId: input.userId,
      name: input.name,
      avatar: input.avatar ?? null,
      class: input.class,
      title: input.title,
      level: 1,
      experience: 0,
      powerScore: calculatePowerScore(stats),
      stats,
    })
  }
}
