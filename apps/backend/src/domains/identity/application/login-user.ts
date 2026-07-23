import type { PrismaClient } from '@prisma/client'
import { UnauthorizedError } from '../../../shared/errors/app-error'
import type { TokenPayload } from '../../../infrastructure/jwt/token-payload'

interface LoginInput {
  email: string
  password: string
}

export class LoginUserUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly signAccessToken: (payload: TokenPayload) => string,
    private readonly signRefreshToken: (payload: TokenPayload) => string,
  ) {}

  async execute(input: LoginInput) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } })

    if (!user || user.passwordHash !== input.password) {
      throw new UnauthorizedError('Invalid credentials')
    }

    const payload: TokenPayload = { sub: user.id, email: user.email, username: user.username }

    return {
      access_token: this.signAccessToken(payload),
      refresh_token: this.signRefreshToken(payload),
    }
  }
}
