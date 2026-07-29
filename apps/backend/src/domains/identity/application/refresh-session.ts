import type { PrismaClient } from '@prisma/client'
import { UnauthorizedError } from '../../../shared/errors/app-error'
import type { TokenPayload } from '../../../infrastructure/jwt/token-payload'

type RefreshTokenPayload = TokenPayload & { type: string }

export class RefreshSessionUseCase {
  constructor (
    private readonly prisma: PrismaClient,
    private readonly verifyRefreshToken: (token: string) => RefreshTokenPayload,
    private readonly signAccessToken: (payload: TokenPayload) => string,
    private readonly signRefreshToken: (payload: TokenPayload) => string
  ) {}

  async execute (refreshToken: string | undefined) {
    if (!refreshToken) {
      throw new UnauthorizedError('Missing refresh token')
    }

    let decoded: RefreshTokenPayload

    try {
      decoded = this.verifyRefreshToken(refreshToken)
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token')
    }

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedError('Invalid or expired refresh token')
    }

    const user = await this.prisma.user.findUnique({ where: { id: decoded.sub } })

    if (!user) {
      throw new UnauthorizedError('Invalid or expired refresh token')
    }

    const payload: TokenPayload = { sub: user.id, email: user.email, username: user.username }

    return {
      access_token: this.signAccessToken(payload),
      refresh_token: this.signRefreshToken(payload),
    }
  }
}
