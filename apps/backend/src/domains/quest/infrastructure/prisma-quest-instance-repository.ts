import type {
  Prisma,
  PrismaClient,
  QuestInstance as PrismaQuestInstance,
  QuestInstanceObjective as PrismaQuestInstanceObjective,
} from '@prisma/client'
import type {
  CreateQuestInstanceData,
  QuestInstance,
  QuestInstanceObjective,
  QuestInstanceRepository,
} from '../domain/quest-instance'
import type { ID } from '../../../shared/types/index'

type InstanceRecord = PrismaQuestInstance & { objectives: PrismaQuestInstanceObjective[] }

const INCLUDE_OBJECTIVES = { objectives: true } as const

function toDomain (record: InstanceRecord): QuestInstance {
  return {
    id: record.id,
    questId: record.questId,
    scheduledDate: record.scheduledDate,
    deadline: record.deadline,
    startedAt: record.startedAt,
    completedAt: record.completedAt,
    progress: record.progress,
    status: record.status,
    rewardGranted: record.rewardGranted,
    objectives: record.objectives.map((objective) => ({
      id: objective.id,
      description: objective.description,
      target: objective.target,
      current: objective.current,
      completed: objective.completed,
    })),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

export class PrismaQuestInstanceRepository implements QuestInstanceRepository {
  constructor (private readonly prisma: PrismaClient) {}

  async findById (id: ID): Promise<QuestInstance | null> {
    const record = await this.prisma.questInstance.findUnique({ where: { id }, include: INCLUDE_OBJECTIVES })
    return record ? toDomain(record) : null
  }

  async findByQuestAndScheduledDate (questId: ID, scheduledDate: Date): Promise<QuestInstance | null> {
    const record = await this.prisma.questInstance.findUnique({
      where: { questId_scheduledDate: { questId, scheduledDate } },
      include: INCLUDE_OBJECTIVES,
    })
    return record ? toDomain(record) : null
  }

  async findByQuestId (questId: ID): Promise<QuestInstance[]> {
    const records = await this.prisma.questInstance.findMany({ where: { questId }, include: INCLUDE_OBJECTIVES })
    return records.map(toDomain)
  }

  async findByQuestActive(active: boolean): Promise<QuestInstance[]> {
    const records = await this.prisma.questInstance.findMany({ 
      include: INCLUDE_OBJECTIVES,
      where:{
        quest: {
          active: active
        },
        status: {
          in: ['PENDING']
        }
      }
     })
    return records.map(toDomain)
  }

  async create (data: CreateQuestInstanceData): Promise<QuestInstance> {
    const record = await this.prisma.questInstance.create({
      data: {
        questId: data.questId,
        scheduledDate: data.scheduledDate,
        deadline: data.deadline,
        objectives: {
          create: data.objectives.map((objective) => ({
            description: objective.description,
            target: objective.target,
          })),
        },
      },
      include: INCLUDE_OBJECTIVES,
    })
    return toDomain(record)
  }

  async save (id: ID, data: Partial<Omit<QuestInstance, 'objectives'>>): Promise<QuestInstance> {
    const patch: Prisma.QuestInstanceUpdateInput = {
      ...(data.scheduledDate !== undefined && { scheduledDate: data.scheduledDate }),
      ...(data.deadline !== undefined && { deadline: data.deadline }),
      ...(data.startedAt !== undefined && { startedAt: data.startedAt }),
      ...(data.completedAt !== undefined && { completedAt: data.completedAt }),
      ...(data.progress !== undefined && { progress: data.progress }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.rewardGranted !== undefined && { rewardGranted: data.rewardGranted }),
    }

    const record = await this.prisma.questInstance.update({ where: { id }, data: patch, include: INCLUDE_OBJECTIVES })
    return toDomain(record)
  }

  async updateObjective (
    instanceId: ID,
    objectiveId: ID,
    data: Partial<QuestInstanceObjective>
  ): Promise<QuestInstance> {
    await this.prisma.questInstanceObjective.update({
      where: { id: objectiveId },
      data: {
        ...(data.current !== undefined && { current: data.current }),
        ...(data.completed !== undefined && { completed: data.completed }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.target !== undefined && { target: data.target }),
      },
    })

    const record = await this.prisma.questInstance.findUniqueOrThrow({
      where: { id: instanceId },
      include: INCLUDE_OBJECTIVES,
    })
    return toDomain(record)
  }

  async findDueForExpiration (now: Date): Promise<QuestInstance[]> {
    const records = await this.prisma.questInstance.findMany({
      where: { status: { in: ['PENDING', 'STARTED'] }, deadline: { lt: now } },
      include: INCLUDE_OBJECTIVES,
    })
    return records.map(toDomain)
  }
}
