import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { RefreshSessionUseCase } from '../application/refresh-session'
import { UnauthorizedError } from '../../../shared/errors/app-error'
import { InMemoryPrisma } from '../infrastructure/in-memory-prisma'

const USER_ID = randomUUID()

const SEEDED_USER = {
  id: USER_ID,
  email: 'jinwoo@solo.com',
  username: 'jinwoo',
  passwordHash: 'correct-hash',
}

describe('RefreshSessionUseCase', () => {
  let prisma: InMemoryPrisma
  let verifyRefreshToken: ReturnType<typeof vi.fn>
  let signAccessToken: ReturnType<typeof vi.fn>
  let signRefreshToken: ReturnType<typeof vi.fn>

  beforeEach(() => {
    prisma = new InMemoryPrisma()
    verifyRefreshToken = vi.fn()
    signAccessToken = vi.fn().mockReturnValue('fake-access-token')
    signRefreshToken = vi.fn().mockReturnValue('fake-rotated-refresh-token')
  })

  function buildUseCase() {
    return new RefreshSessionUseCase(
      prisma as unknown as PrismaClient,
      verifyRefreshToken,
      signAccessToken,
      signRefreshToken,
    )
  }

  it('rotates the access and refresh tokens for a valid refresh token', async () => {
    prisma.seed(SEEDED_USER)
    verifyRefreshToken.mockReturnValue({
      sub: USER_ID,
      email: SEEDED_USER.email,
      username: SEEDED_USER.username,
      type: 'refresh',
    })

    const result = await buildUseCase().execute('valid-refresh-token')

    expect(result).toEqual({
      access_token: 'fake-access-token',
      refresh_token: 'fake-rotated-refresh-token',
    })
    expect(signAccessToken).toHaveBeenCalledWith({
      sub: USER_ID,
      email: SEEDED_USER.email,
      username: SEEDED_USER.username,
    })
  })

  it('throws UnauthorizedError when no refresh token is provided', async () => {
    await expect(buildUseCase().execute(undefined)).rejects.toThrow(UnauthorizedError)
    expect(verifyRefreshToken).not.toHaveBeenCalled()
  })

  it('throws UnauthorizedError when the refresh token fails verification', async () => {
    verifyRefreshToken.mockImplementation(() => {
      throw new Error('jwt expired')
    })

    await expect(buildUseCase().execute('expired-token')).rejects.toThrow(UnauthorizedError)
  })

  it('throws UnauthorizedError when the token type is not "refresh"', async () => {
    prisma.seed(SEEDED_USER)
    verifyRefreshToken.mockReturnValue({
      sub: USER_ID,
      email: SEEDED_USER.email,
      username: SEEDED_USER.username,
      type: 'access',
    })

    await expect(buildUseCase().execute('an-access-token')).rejects.toThrow(UnauthorizedError)
  })

  it('throws UnauthorizedError when the user no longer exists', async () => {
    verifyRefreshToken.mockReturnValue({
      sub: USER_ID,
      email: SEEDED_USER.email,
      username: SEEDED_USER.username,
      type: 'refresh',
    })

    await expect(buildUseCase().execute('valid-refresh-token')).rejects.toThrow(UnauthorizedError)
  })
})
