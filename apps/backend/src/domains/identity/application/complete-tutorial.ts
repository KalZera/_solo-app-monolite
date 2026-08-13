import type { PrismaClient } from '@prisma/client'
import { NotFoundError } from '../../../shared/errors/app-error'

interface CompleteTutorialInput {
  // Scoped to the authenticated user (req.user.sub).
  userId: string
  isCompleteTutorial: boolean
}

/**
 * Flips the Hunter's onboarding-tutorial flag. The intro sheet is shown automatically while this
 * is false and marked complete once the Hunter dismisses/finishes it, so it never auto-opens again.
 * Kept toggle-able (not a one-way "complete") so the flag could be reset in the future if needed.
 */
export class CompleteTutorialUseCase {
  constructor (private readonly prisma: PrismaClient) {}

  async execute (input: CompleteTutorialInput) {
    const user = await this.prisma.user.findUnique({ where: { id: input.userId } })

    if (!user) {
      throw new NotFoundError('User', input.userId)
    }

    return this.prisma.user.update({
      where: { id: input.userId },
      data: { isCompleteTutorial: input.isCompleteTutorial },
      select: { id: true, email: true, username: true, isCompleteTutorial: true },
    })
  }
}
