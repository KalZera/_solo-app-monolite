import { randomUUID } from 'crypto'
import type { CreateQuestData, Quest, QuestRepository } from '../domain/quest'
import type { ID } from '../../../shared/types/index'

type SeedInput = Pick<Quest, 'characterId'> & Partial<Omit<Quest, 'characterId'>>

export class InMemoryQuestRepository implements QuestRepository {
  private quests: Quest[] = []

  seed (data: SeedInput): Quest {
    const quest: Quest = {
      id: data.id ?? randomUUID(),
      characterId: data.characterId,
      categoryId: data.categoryId ?? null,
      title: data.title ?? 'Mock quest',
      description: data.description ?? 'Mock quest description',
      recurrence: data.recurrence ?? 'DAILY',
      rank: data.rank ?? 'E',
      rewardXp: data.rewardXp ?? 10,
      active: data.active ?? true,
      deadlineDate: data.deadlineDate ?? null,
      objectiveTemplates: data.objectiveTemplates ?? [],
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    }
    this.quests.push(quest)
    return quest
  }

  async findById (id: ID): Promise<Quest | null> {
    return this.quests.find((quest) => quest.id === id) ?? null
  }

  async findByCharacterId (characterId: ID): Promise<Quest[]> {
    return this.quests.filter((quest) => quest.characterId === characterId)
  }

  async findActiveByCharacterId (characterId: ID): Promise<Quest[]> {
    return this.quests.filter((quest) => quest.characterId === characterId && quest.active)
  }

  async create (data: CreateQuestData): Promise<Quest> {
    const quest: Quest = {
      id: randomUUID(),
      characterId: data.characterId,
      categoryId: data.categoryId,
      title: data.title,
      description: data.description,
      recurrence: data.recurrence,
      rank: data.rank,
      rewardXp: data.rewardXp,
      active: data.active,
      deadlineDate: data.deadlineDate,
      objectiveTemplates: data.objectiveTemplates.map((objective) => ({ ...objective, id: randomUUID() })),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.quests.push(quest)
    return quest
  }

  async save (id: ID, data: Partial<Omit<Quest, 'objectiveTemplates'>>): Promise<Quest> {
    const index = this.quests.findIndex((quest) => quest.id === id)
    if (index === -1) throw new Error(`Quest ${id} not found`)
    this.quests[index] = { ...this.quests[index], ...data, updatedAt: new Date() }
    return this.quests[index]
  }

  async delete (id: ID): Promise<void> {
    this.quests = this.quests.filter((quest) => quest.id !== id)
  }
}
