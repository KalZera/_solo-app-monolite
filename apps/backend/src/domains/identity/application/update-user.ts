import type { PrismaClient } from '@prisma/client'
import { NotFoundError } from '../../../shared/errors/app-error'
import { hashPassword } from '../../../shared/security/password'

interface UpdateUserInput {
  email: string
  newPassword: string
}

export class UpdateUserUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(input: UpdateUserInput) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } })

    if (!user) {
      throw new NotFoundError('User', input.email)
    }

    const passwordHash = await hashPassword(input.newPassword)

    return this.prisma.user.update({
      where: { email: input.email },
      data: { passwordHash },
      select: { id: true, email: true, username: true, updatedAt: true },
    })
  }
}
