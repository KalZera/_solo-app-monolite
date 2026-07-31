import { describe, it, expect, beforeEach } from 'vitest'
import { UploadCharacterAvatarUseCase } from '../application/upload-character-avatar'
import { NotFoundError, ValidationError } from '../../../shared/errors/app-error'
import { InMemoryCharacterRepository } from '../infrastructure/in-memory-character-repository'
import { InMemoryAvatarStorage } from '../infrastructure/in-memory-avatar-storage'

describe('UploadCharacterAvatarUseCase', () => {
  let repository: InMemoryCharacterRepository
  let storage: InMemoryAvatarStorage

  beforeEach(() => {
    repository = new InMemoryCharacterRepository()
    storage = new InMemoryAvatarStorage()
  })

  it('uploads the avatar and updates the character', async () => {
    const character = repository.seed({ userId: 'user-1', name: 'Sung Jinwoo' })
    const useCase = new UploadCharacterAvatarUseCase(repository, storage)

    const result = await useCase.execute({
      userId: 'user-1',
      fileBuffer: Buffer.from('fake-image-bytes'),
      mimeType: 'image/png',
    })

    expect(storage.uploads).toHaveLength(1)
    expect(storage.uploads[0]).toMatchObject({ contentType: 'image/png' })
    expect(storage.uploads[0]?.key).toMatch(new RegExp(`^avatars/${character.id}-\\d+\\.png$`))
    expect(result.avatar).toBe(`https://fake-bucket.local/${storage.uploads[0]?.key}`)
  })

  it('rejects unsupported mime types', async () => {
    repository.seed({ userId: 'user-1', name: 'Sung Jinwoo' })
    const useCase = new UploadCharacterAvatarUseCase(repository, storage)

    await expect(
      useCase.execute({ userId: 'user-1', fileBuffer: Buffer.from('data'), mimeType: 'image/gif' })
    ).rejects.toThrow(ValidationError)
    expect(storage.uploads).toHaveLength(0)
  })

  it('rejects empty files', async () => {
    repository.seed({ userId: 'user-1', name: 'Sung Jinwoo' })
    const useCase = new UploadCharacterAvatarUseCase(repository, storage)

    await expect(
      useCase.execute({ userId: 'user-1', fileBuffer: Buffer.alloc(0), mimeType: 'image/png' })
    ).rejects.toThrow(ValidationError)
  })

  it('rejects files larger than 5MB', async () => {
    repository.seed({ userId: 'user-1', name: 'Sung Jinwoo' })
    const useCase = new UploadCharacterAvatarUseCase(repository, storage)
    const oversizedBuffer = Buffer.alloc(5 * 1024 * 1024 + 1)

    await expect(
      useCase.execute({ userId: 'user-1', fileBuffer: oversizedBuffer, mimeType: 'image/jpeg' })
    ).rejects.toThrow(ValidationError)
    expect(storage.uploads).toHaveLength(0)
  })

  it('throws NotFoundError when the user has no character', async () => {
    const useCase = new UploadCharacterAvatarUseCase(repository, storage)

    await expect(
      useCase.execute({ userId: 'ghost-user', fileBuffer: Buffer.from('data'), mimeType: 'image/png' })
    ).rejects.toThrow(NotFoundError)
  })
})
