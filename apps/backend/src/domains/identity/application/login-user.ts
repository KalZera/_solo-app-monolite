import type { PrismaClient } from '@prisma/client'
import { UnauthorizedError } from '../../../shared/errors/app-error.js'

interface LoginInput {
  email: string
  password: string
}

interface TokenPayload {
  sub: string
  email: string
  username: string
}

export class LoginUserUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly sign: (payload: TokenPayload) => string,
  ) {}

  async execute(input: LoginInput) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } })

    if (!user || user.passwordHash !== input.password) {
      throw new UnauthorizedError('Invalid credentials')
    }

    const token = this.sign({ sub: user.id, email: user.email, username: user.username })

    return { access_token: token }
  }
}
