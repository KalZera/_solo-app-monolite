import type { PrismaClient } from '@prisma/client'
import type { ID } from '../../../../shared/types/index'
import type {
  ProgressionStreak,
  ProgressionStreakRepository,
  UpsertProgressionStreakData,
} from '../../domain/consistency/progression-streak'

type ProgressionStreakRecord = {
  id: number
  characterId: string
  currentStreak: number
  bestStreak: number
  freezeBalance: number
  daysUntilFreezeRecovery: number
  lastEvaluatedDate: Date | null
  createdAt: Date
  updatedAt: Date
}

function toDomain (record: ProgressionStreakRecord): ProgressionStreak {
  return {
    id: record.id,
    characterId: record.characterId,
    currentStreak: record.currentStreak,
    bestStreak: record.bestStreak,
    freezeBalance: record.freezeBalance,
    daysUntilFreezeRecovery: record.daysUntilFreezeRecovery,
    lastEvaluatedDate: record.lastEvaluatedDate,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

export class PrismaProgressionStreakRepository implements ProgressionStreakRepository {
  constructor (private readonly prisma: PrismaClient) {}

  async findByCharacterId (characterId: ID): Promise<ProgressionStreak | null> {
    const record = await this.prisma.progressionStreak.findUnique({ where: { characterId } })
    return record ? toDomain(record) : null
  }

  async upsert (characterId: ID, data: UpsertProgressionStreakData): Promise<ProgressionStreak> {
    const record = await this.prisma.progressionStreak.upsert({
      where: { characterId },
      create: { characterId, ...data },
      update: { ...data },
    })
    return toDomain(record)
  }
}
