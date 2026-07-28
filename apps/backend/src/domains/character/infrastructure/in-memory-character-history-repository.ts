import { randomUUID } from 'crypto'
import type { CharacterHistory, CharacterHistoryRepository } from '../domain/character-history'
import type { ID, Paginated, PaginationParams } from '../../../shared/types/index'
import { paginate } from '../../../shared/utils/index'

export class InMemoryCharacterHistoryRepository implements CharacterHistoryRepository {
  private entries: CharacterHistory[] = []

  async create(characterId: ID, description: string): Promise<CharacterHistory> {
    const entry: CharacterHistory = {
      id: randomUUID(),
      characterId,
      description,
      createdAt: new Date(),
    }
    this.entries.push(entry)
    return entry
  }

  async findByCharacterId(characterId: ID, pagination: PaginationParams): Promise<Paginated<CharacterHistory>> {
    // Reversed insertion order rather than a timestamp sort: entries created in the same
    // millisecond would otherwise tie and fall back to an unstable ordering.
    const entries = this.entries.filter((entry) => entry.characterId === characterId).reverse()
    return paginate(entries, pagination.page, pagination.pageSize)
  }
}
