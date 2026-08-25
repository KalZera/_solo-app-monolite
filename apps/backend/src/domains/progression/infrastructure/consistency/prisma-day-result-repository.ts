import type { PrismaClient, DayResult as PrismaDayResult } from '@prisma/client'
import type { ID } from '../../../../shared/types/index'
import { DayResultStatus } from '../../domain/consistency/day-result'
import type { CreateDayResultData, DayResult, DayResultRepository } from '../../domain/consistency/day-result'

function toDomain (record: PrismaDayResult): DayResult {
  return {
    id: record.id,
    characterId: record.characterId,
    date: record.date,
    // The Prisma and domain enums share identical string members.
    status: record.status as DayResultStatus,
    streakBefore: record.streakBefore,
    streakAfter: record.streakAfter,
    freezeBefore: record.freezeBefore,
    freezeAfter: record.freezeAfter,
    freezeUsed: record.freezeUsed,
  }
}

// The `date` column is a Prisma @db.Date (day-granular). Normalise any instant to the start
// of its UTC calendar day so the (date, characterId) unique key matches regardless of time.
function toUTCDate (date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export class PrismaDayResultRepository implements DayResultRepository {
  constructor (private readonly prisma: PrismaClient) {}

  async create (data: CreateDayResultData): Promise<DayResult> {
    const record = await this.prisma.dayResult.create({
      data: { ...data, date: toUTCDate(data.date) },
    })
    return toDomain(record)
  }

  async findByCharacterAndDate (characterId: ID, date: Date): Promise<DayResult | null> {
    const record = await this.prisma.dayResult.findUnique({
      where: { date_characterId: { characterId, date: toUTCDate(date) } },
    })
    return record ? toDomain(record) : null
  }
}
