import type { PrismaClient } from '@prisma/client'
import { NotFoundError, UnauthorizedError, ValidationError } from '../../../shared/errors/app-error'
import { hashPassword, verifyPassword } from '../../../shared/security/password'

const MIN_PASSWORD_LENGTH = 6

interface UpdateUserInput {
  // Scoped to the authenticated user (req.user.sub) — never trust an email from the body.
  userId: string
  currentPassword: string
  newPassword: string
}

export class UpdateUserUseCase {
  constructor (private readonly prisma: PrismaClient) {}

  async execute (input: UpdateUserInput) {
    if (typeof input.currentPassword !== 'string' || typeof input.newPassword !== 'string') {
      throw new ValidationError('currentPassword and newPassword are required')
    }

    if (input.newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new ValidationError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`)
    }

    const user = await this.prisma.user.findUnique({ where: { id: input.userId } })

    if (!user) {
      throw new NotFoundError('User', input.userId)
    }

    const isCurrentPasswordValid = await verifyPassword(input.currentPassword, user.passwordHash)

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect')
    }

    const passwordHash = await hashPassword(input.newPassword)

    return this.prisma.user.update({
      where: { id: input.userId },
      data: { passwordHash },
      select: { id: true, email: true, username: true, updatedAt: true },
    })
  }
}
