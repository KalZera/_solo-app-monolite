import { randomUUID } from 'crypto'
import type { CreateQuestData, Quest, QuestFilter, QuestObjective, QuestRepository } from '../domain/quest'
import type { ID, Paginated, PaginationParams } from '../../../shared/types/index.js'
import { paginate } from '../../../shared/utils/index.js'

function matchesFilter (quest: Quest, filter: QuestFilter): boolean {
  return (Object.keys(filter) as Array<keyof QuestFilter>).every((key) => {
    const value = filter[key]
    return value === undefined || quest[key] === value
  })
}

type SeedInput = Pick<Quest, 'characterId' | 'title'> & Partial<Omit<Quest, 'characterId' | 'title'>>

export class InMemoryQuestRepository implements QuestRepository {
  private quests: Quest[] = []

  seed (data: SeedInput): Quest {
    const quest: Quest = {
      id: data.id ?? randomUUID(),
      characterId: data.characterId,
      categoryId: data.categoryId ?? null,
      title: data.title,
      description: data.description ?? 'Mock quest description',
      questRank: data.questRank ?? 'E',
      type: data.type ?? 'daily',
      status: data.status ?? 'available',
      objectives: data.objectives ?? [],
      rewardXp: data.rewardXp ?? 10,
      rewardGold: data.rewardGold ?? 0,
      minLevel: data.minLevel ?? 1,
      expiresAt: data.expiresAt ?? null,
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    }
    this.quests.push(quest)
    return quest
  }

  async findById (id: ID): Promise<Quest | null> {
    return this.quests.find((q) => q.id === id) ?? null
  }

  async findByCharacterId (characterId: ID): Promise<Quest[]> {
    return this.quests.filter((q) => q.characterId === characterId)
  }

  async findByData (filter: QuestFilter, pagination: PaginationParams): Promise<Paginated<Quest>> {
    const filtered = this.quests.filter((q) => matchesFilter(q, filter))
    return paginate(filtered, pagination.page, pagination.pageSize)
  }

  async create (data: CreateQuestData): Promise<Quest> {
    const quest: Quest = {
      ...data,
      id: randomUUID(),
      objectives: data.objectives.map((objective) => ({ ...objective, id: randomUUID() })),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.quests.push(quest)
    return quest
  }

  async save (id: ID, data: Partial<Quest>): Promise<Quest> {
    const index = this.quests.findIndex((q) => q.id === id)
    if (index === -1) throw new Error(`Quest ${id} not found`)
    this.quests[index] = { ...this.quests[index], ...data, updatedAt: new Date() }
    return this.quests[index]
  }

  async updateObjective (questId: ID, objectiveId: ID, data: Partial<QuestObjective>): Promise<Quest> {
    const index = this.quests.findIndex((q) => q.id === questId)
    if (index === -1) throw new Error(`Quest ${questId} not found`)
    const quest = this.quests[index]
    const objectiveIndex = quest.objectives.findIndex((o) => o.id === objectiveId)
    if (objectiveIndex === -1) throw new Error(`Objective ${objectiveId} not found on quest ${questId}`)

    const objectives = [...quest.objectives]
    objectives[objectiveIndex] = { ...objectives[objectiveIndex], ...data }
    this.quests[index] = { ...quest, objectives, updatedAt: new Date() }
    return this.quests[index]
  }

  async delete (id: ID): Promise<void> {
    this.quests = this.quests.filter((q) => q.id !== id)
  }
}
