import type { CharacterRepository } from '../../character/domain/character'
import type { QuestParsed } from '../domain/quest'
import type { QuestInstanceRepository } from '../domain/quest-instance'
import { NotFoundError, ValidationError } from '../../../shared/errors/app-error'
import type { Paginated } from '../../../shared/types/index'

interface ListQuestsInput {
  userId: string
  page?: number
  pageSize?: number
}

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50

// Lists the character's quest instances (with their template), paginated.
export class ListQuestsUseCase {
  constructor (
    private readonly questRepository: QuestInstanceRepository,
    private readonly characterRepository: CharacterRepository
  ) {}

  async execute (input: ListQuestsInput): Promise<Paginated<QuestParsed>> {
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

    const result = await this.questRepository.findByCharacterId(character.id, { page, pageSize })
    const data = result.data
      .filter((quest) => quest.id !== undefined)
      .map((quest) => {
        const { quest: questTemplate, ...questInstance } = quest
        return {
          ...questTemplate,
          instance: {
            ...questInstance,
          },
        }
      }) as QuestParsed[]

    return { data, total: result.total, page: result.page, pageSize: result.pageSize }
  }
}
