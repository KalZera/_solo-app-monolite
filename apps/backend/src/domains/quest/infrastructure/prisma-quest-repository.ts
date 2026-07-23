import type { PrismaClient, Quest as PrismaQuest, QuestObjective as PrismaQuestObjective } from '@prisma/client'
import type { CreateQuestData, Quest, QuestRepository, QuestStatus, QuestType } from '../domain/quest'
import type { ID } from '../../../shared/types/index.js'
import { generateId } from '../../../shared/utils/index.js'

type PrismaQuestWithObjectives = PrismaQuest & { objectives: PrismaQuestObjective[] }

function toDomain(record: PrismaQuestWithObjectives): Quest {
  return {
    id: record.id,
    characterId: record.characterId,
    title: record.title,
    description: record.description,
    questRank: record.questRank,
    type: record.type as QuestType,
    status: record.status as QuestStatus,
    objectives: record.objectives.map((objective) => ({
      id: objective.id,
      description: objective.description,
      target: objective.target,
      current: objective.current,
      completed: objective.completed,
    })),
    rewardXp: record.rewardXp,
    rewardGold: record.rewardGold,
    minLevel: record.minLevel,
    expiresAt: record.expiresAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

export class PrismaQuestRepository implements QuestRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: ID): Promise<Quest | null> {
    const record = await this.prisma.quest.findUnique({ where: { id }, include: { objectives: true } })
    return record ? toDomain(record) : null
  }

  async findByCharacterId(characterId: ID): Promise<Quest[]> {
    const records = await this.prisma.quest.findMany({
      where: { characterId },
      include: { objectives: true },
    })
    return records.map(toDomain)
  }

  async create(data: CreateQuestData): Promise<Quest> {
    const record = await this.prisma.quest.create({
      data: {
        id: generateId(),
        characterId: data.characterId,
        title: data.title,
        description: data.description,
        questRank: data.questRank,
        type: data.type,
        status: data.status,
        rewardXp: data.rewardXp,
        rewardGold: data.rewardGold,
        minLevel: data.minLevel,
        expiresAt: data.expiresAt,
        objectives: {
          create: data.objectives.map((objective) => ({
            id: generateId(),
            description: objective.description,
            target: objective.target,
            current: objective.current,
            completed: objective.completed,
          })),
        },
      },
      include: { objectives: true },
    })
    return toDomain(record)
  }

  async update(id: ID, data: Partial<Quest>): Promise<Quest> {
    const record = await this.prisma.quest.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.questRank !== undefined && { questRank: data.questRank }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.rewardXp !== undefined && { rewardXp: data.rewardXp }),
        ...(data.rewardGold !== undefined && { rewardGold: data.rewardGold }),
        ...(data.minLevel !== undefined && { minLevel: data.minLevel }),
        ...(data.expiresAt !== undefined && { expiresAt: data.expiresAt }),
      },
      include: { objectives: true },
    })
    return toDomain(record)
  }

  async delete(id: ID): Promise<void> {
    await this.prisma.quest.delete({ where: { id } })
  }
}
