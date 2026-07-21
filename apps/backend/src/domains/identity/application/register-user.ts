import type { PrismaClient } from '@prisma/client'
import { ConflictError } from '../../../shared/errors/app-error'
import { generateId } from '../../../shared/utils/index'

interface RegisterInput {
  email: string
  username: string
  password: string
}

export class RegisterUserUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(input: RegisterInput) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: input.email }, { username: input.username }] },
    })

    if (existing) {
      throw new ConflictError('Email or username already taken')
    }

    const user = await this.prisma.user.create({
      data: {
        id: generateId(),
        email: input.email,
        username: input.username,
        passwordHash: input.password,
      },
      select: { id: true, email: true, username: true, createdAt: true },
    })

    return user
  }
}
