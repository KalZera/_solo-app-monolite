import type { AvatarStorage } from '../domain/avatar-storage'
import type { CharacterRepository } from '../domain/character'
import { NotFoundError, ValidationError } from '../../../shared/errors/app-error'

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

interface UploadCharacterAvatarInput {
  userId: string
  fileBuffer: Buffer
  mimeType: string
}

export class UploadCharacterAvatarUseCase {
  constructor (
    private readonly repository: CharacterRepository,
    private readonly storage: AvatarStorage
  ) {}

  async execute (input: UploadCharacterAvatarInput) {
    const extension = ALLOWED_MIME_TYPES[input.mimeType]

    if (!extension) {
      throw new ValidationError('Avatar must be a JPEG, PNG or WEBP image')
    }

    if (input.fileBuffer.byteLength === 0) {
      throw new ValidationError('Avatar file is empty')
    }

    if (input.fileBuffer.byteLength > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError('Avatar must be smaller than 5MB')
    }

    const characters = await this.repository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    const key = `avatars/${character.id}-${Date.now()}.${extension}`
    const avatarUrl = await this.storage.upload(key, input.fileBuffer, input.mimeType)

    return this.repository.save(character.id, { avatar: avatarUrl })
  }
}
