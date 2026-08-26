import type { ID } from '../../../../shared/types/index'
import type { CharacterRepository } from '../../../character/domain/character'
import { NotFoundError } from '../../../../shared/errors/app-error'
import {
  DEFAULT_FREEZE_RECOVERY_DAYS,
  type ProgressionStreakRepository,
} from '../../domain/consistency/progression-streak'

interface GetStreakInput {
  userId: ID
}

// The read-only streak snapshot returned to the client.
export interface StreakInfo {
  currentStreak: number
  bestStreak: number
  freezeBalance: number
  daysUntilFreezeRecovery: number
  lastEvaluatedDate: Date | null
}

// The state a character has before their streak row exists (mirrors the Prisma column defaults),
// so a Hunter who has never been evaluated still gets a sensible snapshot.
const INITIAL_STREAK: StreakInfo = {
  currentStreak: 0,
  bestStreak: 0,
  freezeBalance: 0,
  daysUntilFreezeRecovery: DEFAULT_FREEZE_RECOVERY_DAYS,
  lastEvaluatedDate: null,
}

// Returns the authenticated user's character streak information. Resolves ownership from the
// user, then reads the persisted streak — falling back to the initial state when the daily
// evaluation has not created a row yet.
export class GetStreakUseCase {
  constructor (
    private readonly characterRepository: CharacterRepository,
    private readonly progressionStreakRepository: ProgressionStreakRepository
  ) {}

  async execute (input: GetStreakInput): Promise<StreakInfo> {
    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    const streak = await this.progressionStreakRepository.findByCharacterId(character.id)
    if (!streak) return INITIAL_STREAK

    return {
      currentStreak: streak.currentStreak,
      bestStreak: streak.bestStreak,
      freezeBalance: streak.freezeBalance,
      daysUntilFreezeRecovery: streak.daysUntilFreezeRecovery,
      lastEvaluatedDate: streak.lastEvaluatedDate,
    }
  }
}
