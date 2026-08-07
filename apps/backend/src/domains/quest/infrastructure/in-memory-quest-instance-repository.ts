import { randomUUID } from 'crypto'
import type {
  CreateQuestInstanceData,
  QuestFullInstance,
  QuestInstanceObjective,
  QuestInstanceRepository,
} from '../domain/quest-instance'
import type { ID } from '../../../shared/types/index'

type SeedInput = Pick<QuestFullInstance, 'questId'> & Partial<Omit<QuestFullInstance, 'questId'>>

export class InMemoryQuestInstanceRepository implements QuestInstanceRepository {
  private instances: QuestFullInstance[] = []

  seed (data: SeedInput): QuestFullInstance {
    const instance: QuestFullInstance = {
      id: data.id ?? randomUUID(),
      questId: data.questId,
      scheduledDate: data.scheduledDate ?? new Date(),
      deadline: data.deadline ?? null,
      startedAt: data.startedAt ?? null,
      completedAt: data.completedAt ?? null,
      progress: data.progress ?? 0,
      status: data.status ?? 'PENDING',
      rewardGranted: data.rewardGranted ?? false,
      objectives: data.objectives ?? [],
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    }
    this.instances.push(instance)
    return instance
  }

  async findById (id: ID): Promise<QuestFullInstance | null> {
    return this.instances.find((instance) => instance.id === id) ?? null
  }

  async findByQuestAndScheduledDate (questId: ID, scheduledDate: Date): Promise<QuestFullInstance | null> {
    return (
      this.instances.find(
        (instance) => instance.questId === questId && instance.scheduledDate.getTime() === scheduledDate.getTime()
      ) ?? null
    )
  }

  async findByQuestId (questId: ID): Promise<QuestFullInstance[]> {
    return this.instances.filter((instance) => instance.questId === questId)
  }

  async create (data: CreateQuestInstanceData): Promise<QuestFullInstance> {
    const instance: QuestFullInstance = {
      id: randomUUID(),
      questId: data.questId,
      scheduledDate: data.scheduledDate,
      deadline: data.deadline,
      startedAt: null,
      completedAt: null,
      progress: 0,
      status: 'PENDING',
      rewardGranted: false,
      objectives: data.objectives.map((objective) => ({
        id: randomUUID(),
        description: objective.description,
        target: objective.target,
        current: 0,
        completed: false,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.instances.push(instance)
    return instance
  }

  async save (id: ID, data: Partial<Omit<QuestFullInstance, 'objectives'>>): Promise<QuestFullInstance> {
    const index = this.instances.findIndex((instance) => instance.id === id)
    if (index === -1) throw new Error(`QuestInstance ${id} not found`)
    this.instances[index] = { ...this.instances[index], ...data, updatedAt: new Date() }
    return this.instances[index]
  }

  async updateObjective (
    instanceId: ID,
    objectiveId: ID,
    data: Partial<QuestInstanceObjective>
  ): Promise<QuestFullInstance> {
    const index = this.instances.findIndex((instance) => instance.id === instanceId)
    if (index === -1) throw new Error(`QuestInstance ${instanceId} not found`)

    const instance = this.instances[index]
    const objectiveIndex = instance.objectives.findIndex((objective) => objective.id === objectiveId)
    if (objectiveIndex === -1) throw new Error(`Objective ${objectiveId} not found on instance ${instanceId}`)

    const objectives = [...instance.objectives]
    objectives[objectiveIndex] = { ...objectives[objectiveIndex], ...data }
    this.instances[index] = { ...instance, objectives, updatedAt: new Date() }
    return this.instances[index]
  }

  async findDueForExpiration (now: Date): Promise<QuestFullInstance[]> {
    return this.instances.filter(
      (instance) =>
        (instance.status === 'PENDING' || instance.status === 'STARTED') &&
        instance.deadline !== null &&
        instance.deadline < now
    )
  }
}
