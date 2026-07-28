import type { CharacterRepository } from '../domain/character'
import type { CharacterHistoryRepository } from '../domain/character-history'
import { NotFoundError, ValidationError } from '../../../shared/errors/app-error'

interface GetCharacterHistoryInput {
  userId: string
  page?: number
  pageSize?: number
}

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50

export class GetCharacterHistoryUseCase {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly characterHistoryRepository: CharacterHistoryRepository,
  ) {}

  async execute(input: GetCharacterHistoryInput) {
    const page = input.page ?? 1
    const pageSize = input.pageSize ?? DEFAULT_PAGE_SIZE

    if (!Number.isInteger(page) || page < 1) {
      throw new ValidationError('page must be a positive whole number')
    }

    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
      throw new ValidationError(`pageSize must be a whole number between 1 and ${MAX_PAGE_SIZE}`)
    }

    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    return this.characterHistoryRepository.findByCharacterId(character.id, { page, pageSize })
  }
}
