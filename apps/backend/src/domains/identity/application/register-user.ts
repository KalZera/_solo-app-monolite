import type { PrismaClient } from '@prisma/client'
import { ConflictError } from '../../../shared/errors/app-error'
import { generateId } from '../../../shared/utils/index'
import { hashPassword } from '../../../shared/security/password'

interface RegisterInput {
  email: string
  username: string
  password: string
}

export class RegisterUserUseCase {
  constructor (private readonly prisma: PrismaClient) {}

  async execute (input: RegisterInput) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: input.email }, { username: input.username }] },
    })

    if (existing) {
      throw new ConflictError('Email or username already taken')
    }

    const passwordHash = await hashPassword(input.password)

    const user = await this.prisma.user.create({
      data: {
        id: generateId(),
        email: input.email,
        username: input.username,
        passwordHash,
      },
      select: { id: true, email: true, username: true, createdAt: true },
    })

    return user
  }
}
