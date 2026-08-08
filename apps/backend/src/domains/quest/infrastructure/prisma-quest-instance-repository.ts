import type {
  Prisma,
  PrismaClient,
  Quest as PrismaQuest,
  QuestInstance as PrismaQuestInstance,
  QuestInstanceObjective as PrismaQuestInstanceObjective,
} from '@prisma/client'
import type {
  CreateQuestInstanceData,
  QuestFullInstance,
  QuestInstanceObjective,
  QuestInstanceRepository,
} from '../domain/quest-instance'
import type { ID } from '../../../shared/types/index'
import type { Quest } from '../domain/quest'

type InstanceRecord = PrismaQuestInstance & { objectives: PrismaQuestInstanceObjective[], quest?: PrismaQuest }

const INCLUDE_OBJECTIVES = { objectives: true } as const

function toDomain (record: InstanceRecord): QuestFullInstance {
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
    quest: record.quest ? record.quest as Quest : undefined,
  }
}

export class PrismaQuestInstanceRepository implements QuestInstanceRepository {
  constructor (private readonly prisma: PrismaClient) {}

  async findById (id: ID): Promise<QuestFullInstance | null> {
    const record = await this.prisma.questInstance.findUnique({ where: { id }, 
      include: {...INCLUDE_OBJECTIVES, quest:true} 
    })
    return record ? toDomain(record) : null
  }
   
  async findByCharacterId (characterId: ID): Promise<QuestFullInstance[]> {
    const record = await this.prisma.questInstance.findMany({ 
    where:{
      quest:{
        characterId: characterId
      },
    }, include:{...INCLUDE_OBJECTIVES, quest:true},
    orderBy:{
      status:'asc'
    }
    })

    return record.map(toDomain)
  }

  async findByQuestAndScheduledDate (questId: ID, scheduledDate: Date): Promise<QuestFullInstance | null> {
    const record = await this.prisma.questInstance.findUnique({
      where: { questId_scheduledDate: { questId, scheduledDate } },
      include: INCLUDE_OBJECTIVES,
    })
    return record ? toDomain(record) : null
  }

  async findByQuestId (questId: ID): Promise<QuestFullInstance[]> {
    const records = await this.prisma.questInstance.findMany({ where: { questId }, include: INCLUDE_OBJECTIVES })
    return records.map(toDomain)
  }

  async findByQuestActive(active: boolean): Promise<QuestFullInstance[]> {
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

  async create (data: CreateQuestInstanceData): Promise<QuestFullInstance> {
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

  async save (id: ID, data: Partial<Omit<QuestFullInstance, 'objectives'>>): Promise<QuestFullInstance> {
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
  ): Promise<QuestFullInstance> {
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

  async findDueForExpiration (now: Date): Promise<QuestFullInstance[]> {
    const records = await this.prisma.questInstance.findMany({
      where: { status: { in: ['PENDING', 'STARTED'] }, deadline: { lt: now } },
      include: INCLUDE_OBJECTIVES,
    })
    return records.map(toDomain)
  }
}
