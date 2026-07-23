import { randomUUID } from 'crypto'
import type { CreateQuestData, Quest, QuestRepository } from '../domain/quest'
import type { ID } from '../../../shared/types/index.js'

type SeedInput = Pick<Quest, 'characterId' | 'title'> & Partial<Omit<Quest, 'characterId' | 'title'>>

export class InMemoryQuestRepository implements QuestRepository {
  private quests: Quest[] = []

  seed(data: SeedInput): Quest {
    const quest: Quest = {
      id: data.id ?? randomUUID(),
      characterId: data.characterId,
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

  async findById(id: ID): Promise<Quest | null> {
    return this.quests.find((q) => q.id === id) ?? null
  }

  async findByCharacterId(characterId: ID): Promise<Quest[]> {
    return this.quests.filter((q) => q.characterId === characterId)
  }

  async create(data: CreateQuestData): Promise<Quest> {
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

  async update(id: ID, data: Partial<Quest>): Promise<Quest> {
    const index = this.quests.findIndex((q) => q.id === id)
    if (index === -1) throw new Error(`Quest ${id} not found`)
    this.quests[index] = { ...this.quests[index], ...data, updatedAt: new Date() }
    return this.quests[index]
  }

  async delete(id: ID): Promise<void> {
    this.quests = this.quests.filter((q) => q.id !== id)
  }
}
