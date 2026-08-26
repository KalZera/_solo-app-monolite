import { randomUUID } from 'crypto'
import type { ID } from '../../../../shared/types/index'
import type { CreateDayResultData, DayResult, DayResultRepository } from '../../domain/consistency/day-result'

// The `date` column is day-granular (Prisma @db.Date). Normalise any instant to the start of
// its UTC calendar day so the (date, characterId) uniqueness matches regardless of time.
function toUTCDate (date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export class InMemoryDayResultRepository implements DayResultRepository {
  private results: DayResult[] = []

  async create (data: CreateDayResultData): Promise<DayResult> {
    const result: DayResult = { id: randomUUID(), ...data, date: toUTCDate(data.date) }
    this.results.push(result)
    return result
  }

  async findByCharacterAndDate (characterId: ID, date: Date): Promise<DayResult | null> {
    const day = toUTCDate(date).getTime()
    return (
      this.results.find(
        (result) => result.characterId === characterId && result.date.getTime() === day
      ) ?? null
    )
  }
}
