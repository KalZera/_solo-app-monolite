import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { LoginUserUseCase } from '../application/login-user'
import { UnauthorizedError } from '../../../shared/errors/app-error'
import { InMemoryPrisma } from '../infrastructure/in-memory-prisma'
import { hashPassword } from '../../../shared/security/password'

const PLAIN_PASSWORD = 'correct-password'

const SEEDED_USER = {
  email: 'jinwoo@solo.com',
  username: 'jinwoo',
  passwordHash: await hashPassword(PLAIN_PASSWORD),
}

describe('LoginUserUseCase', () => {
  let prisma: InMemoryPrisma
  let signAccessToken: ReturnType<typeof vi.fn>
  let signRefreshToken: ReturnType<typeof vi.fn>

  beforeEach(() => {
    prisma = new InMemoryPrisma()
    signAccessToken = vi.fn().mockReturnValue('fake-access-token')
    signRefreshToken = vi.fn().mockReturnValue('fake-refresh-token')
  })

  it('returns access_token and refresh_token for valid credentials', async () => {
    prisma.seed(SEEDED_USER)
    const useCase = new LoginUserUseCase(prisma as unknown as PrismaClient, signAccessToken, signRefreshToken)

    const result = await useCase.execute({
      email: SEEDED_USER.email,
      password: PLAIN_PASSWORD,
    })

    expect(result).toEqual({ access_token: 'fake-access-token', refresh_token: 'fake-refresh-token' })
    const expectedPayload = {
      sub: expect.any(String),
      email: SEEDED_USER.email,
      username: SEEDED_USER.username,
    }
    expect(signAccessToken).toHaveBeenCalledWith(expectedPayload)
    expect(signRefreshToken).toHaveBeenCalledWith(expectedPayload)
  })

  it('throws UnauthorizedError when the user does not exist', async () => {
    const useCase = new LoginUserUseCase(prisma as unknown as PrismaClient, signAccessToken, signRefreshToken)

    await expect(
      useCase.execute({ email: 'ghost@solo.com', password: 'any-password' }),
    ).rejects.toThrow(UnauthorizedError)
  })

  it('throws UnauthorizedError when the password is wrong', async () => {
    prisma.seed(SEEDED_USER)
    const useCase = new LoginUserUseCase(prisma as unknown as PrismaClient, signAccessToken, signRefreshToken)

    await expect(
      useCase.execute({ email: SEEDED_USER.email, password: 'wrong-password' }),
    ).rejects.toThrow(UnauthorizedError)
  })

  it('propagates errors thrown by the access token signer', async () => {
    prisma.seed(SEEDED_USER)
    signAccessToken.mockImplementation(() => {
      throw new Error('jwt signing failed')
    })
    const useCase = new LoginUserUseCase(prisma as unknown as PrismaClient, signAccessToken, signRefreshToken)

    await expect(
      useCase.execute({ email: SEEDED_USER.email, password: PLAIN_PASSWORD }),
    ).rejects.toThrow('jwt signing failed')
  })
})
