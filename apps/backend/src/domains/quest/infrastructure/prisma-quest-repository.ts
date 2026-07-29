import type { PrismaClient, Quest as PrismaQuest, QuestObjective as PrismaQuestObjective } from '@prisma/client'
import type {
  CreateQuestData,
  Quest,
  QuestFilter,
  QuestObjective,
  QuestRepository,
  QuestStatus,
  QuestType,
} from '../domain/quest'
import type { ID, Paginated, PaginationParams } from '../../../shared/types/index.js'
import { generateId } from '../../../shared/utils/index.js'
import { getDateFilter } from '@shared/utils/date-filter'

type PrismaQuestWithObjectives = PrismaQuest & { objectives: PrismaQuestObjective[] }

function toDomain(record: PrismaQuestWithObjectives): Quest {
  return {
    id: record.id,
    characterId: record.characterId,
    categoryId: record.categoryId,
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

  async findByData(filter: QuestFilter, pagination: PaginationParams): Promise<Paginated<Quest>> {

    const dateInterval = getDateFilter(filter.expiresAt ?? new Date())
    const expiresAtDate = filter.expiresAt ? { gte: dateInterval.start, lte: dateInterval.end } : undefined

    const where = {
      ...(filter.id !== undefined && { id: filter.id }),
      ...(filter.characterId !== undefined && { characterId: filter.characterId }),
      ...(filter.categoryId !== undefined && { categoryId: filter.categoryId }),
      ...(filter.title !== undefined && { title: filter.title }),
      ...(filter.description !== undefined && { description: filter.description }),
      ...(filter.questRank !== undefined && { questRank: filter.questRank }),
      ...(filter.type !== undefined && { type: filter.type }),
      ...(filter.status !== undefined && { status: filter.status }),
      ...(filter.rewardXp !== undefined && { rewardXp: filter.rewardXp }),
      ...(filter.rewardGold !== undefined && { rewardGold: filter.rewardGold }),
      ...(filter.minLevel !== undefined && { minLevel: filter.minLevel }),
      ...(filter.expiresAt !== undefined && { expiresAt: expiresAtDate }),
    }

    const [records, total] = await Promise.all([
      this.prisma.quest.findMany({
        where,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
        include: { objectives: true },
      }),
      this.prisma.quest.count({ where }),
    ])

    return { data: records.map(toDomain), total, page: pagination.page, pageSize: pagination.pageSize }
  }

  async create(data: CreateQuestData): Promise<Quest> {
    const record = await this.prisma.quest.create({
      data: {
        id: generateId(),
        characterId: data.characterId,
        categoryId: data.categoryId,
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

  async save(id: ID, data: Partial<Quest>): Promise<Quest> {
    const record = await this.prisma.quest.update({
      where: { id },
      data: {
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
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

  async updateObjective(questId: ID, objectiveId: ID, data: Partial<QuestObjective>): Promise<Quest> {
    await this.prisma.questObjective.update({
      where: { id: objectiveId },
      data: {
        ...(data.description !== undefined && { description: data.description }),
        ...(data.target !== undefined && { target: data.target }),
        ...(data.current !== undefined && { current: data.current }),
        ...(data.completed !== undefined && { completed: data.completed }),
      },
    })

    const record = await this.prisma.quest.findUniqueOrThrow({
      where: { id: questId },
      include: { objectives: true },
    })
    return toDomain(record)
  }

  async delete(id: ID): Promise<void> {
    await this.prisma.quest.delete({ where: { id } })
  }
}
