import type {
  Prisma,
  PrismaClient,
  Quest as PrismaQuest,
  QuestObjectiveTemplate as PrismaObjectiveTemplate,
} from '@prisma/client'
import type { CreateQuestData, Quest, QuestRepository } from '../domain/quest'
import type { ID } from '../../../shared/types/index'

type QuestRecord = PrismaQuest & { objectiveTemplates: PrismaObjectiveTemplate[] }

const INCLUDE_TEMPLATES = { objectiveTemplates: true } as const

function toDomain (record: QuestRecord): Quest {
  return {
    id: record.id,
    characterId: record.characterId,
    categoryId: record.categoryId,
    title: record.title,
    description: record.description,
    recurrence: record.recurrence,
    rank: record.rank,
    rewardXp: record.rewardXp,
    active: record.active,
    deadlineDate: record.deadlineDate,
    objectiveTemplates: record.objectiveTemplates.map((template) => ({
      id: template.id,
      description: template.description,
      target: template.target,
    })),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

export class PrismaQuestRepository implements QuestRepository {
  constructor (private readonly prisma: PrismaClient) {}

  async findById (id: ID): Promise<Quest | null> {
    const record = await this.prisma.quest.findUnique({ where: { id }, include: INCLUDE_TEMPLATES })
    return record ? toDomain(record) : null
  }

  async findByCharacterId (characterId: ID): Promise<Quest[]> {
    const records = await this.prisma.quest.findMany({ where: { characterId }, include: INCLUDE_TEMPLATES })
    return records.map(toDomain)
  }

  async findActiveByCharacterId (characterId: ID): Promise<Quest[]> {
    const records = await this.prisma.quest.findMany({
      where: { characterId, active: true },
      include: INCLUDE_TEMPLATES,
    })
    return records.map(toDomain)
  }

  async findManyByActive(active: boolean): Promise<Quest[]> {
    const records = await this.prisma.quest.findMany({
      where: { active },
      include: INCLUDE_TEMPLATES,
    })
    return records.map(toDomain)
  }

  async create (data: CreateQuestData): Promise<Quest> {
    const record = await this.prisma.quest.create({
      data: {
        characterId: data.characterId,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        recurrence: data.recurrence,
        rank: data.rank,
        rewardXp: data.rewardXp,
        active: data.active,
        deadlineDate: data.deadlineDate,
        objectiveTemplates: {
          create: data.objectiveTemplates.map((objective) => ({
            description: objective.description,
            target: objective.target,
          })),
        },
      },
      include: INCLUDE_TEMPLATES,
    })
    return toDomain(record)
  }

  async save (id: ID, data: Partial<Omit<Quest, 'objectiveTemplates'>>): Promise<Quest> {
    const patch: Prisma.QuestUpdateInput = {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.recurrence !== undefined && { recurrence: data.recurrence }),
      ...(data.rank !== undefined && { rank: data.rank }),
      ...(data.rewardXp !== undefined && { rewardXp: data.rewardXp }),
      ...(data.active !== undefined && { active: data.active }),
      ...(data.deadlineDate !== undefined && { deadlineDate: data.deadlineDate }),
      ...(data.categoryId !== undefined && {
        category: data.categoryId ? { connect: { id: data.categoryId } } : { disconnect: true },
      }),
    }

    const record = await this.prisma.quest.update({ where: { id }, data: patch, include: INCLUDE_TEMPLATES })
    return toDomain(record)
  }

  async delete (id: ID): Promise<void> {
    await this.prisma.quest.delete({ where: { id } })
  }
}
