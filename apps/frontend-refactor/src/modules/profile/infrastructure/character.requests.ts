import { Platform } from 'react-native'
import { httpClient } from '@/shared/api/http-client'
import type {
  CharacterProfile,
  CreateCharacterInput,
  UpdateCharacterInput,
} from '../domain/character.types'

export function getCharacterProfile(): Promise<CharacterProfile> {
  return httpClient.get<CharacterProfile>('/characters/')
}

export function createCharacter(input: CreateCharacterInput): Promise<CharacterProfile> {
  return httpClient.post<CharacterProfile>('/characters/', input)
}

export function updateCharacter(input: UpdateCharacterInput): Promise<CharacterProfile> {
  return httpClient.patch<CharacterProfile>('/characters/', input)
}

/**
 * Uploads the cropped avatar as multipart/form-data. Web needs a real Blob,
 * while native accepts the `{ uri, name, type }` file descriptor.
 */
export async function uploadCharacterAvatar(imageUri: string): Promise<CharacterProfile> {
  const filename = imageUri.split('/').pop()?.split('?')[0] ?? `avatar-${Date.now()}.jpg`
  const formData = new FormData()

  if (Platform.OS === 'web') {
    const blob = await (await fetch(imageUri)).blob()
    formData.append('avatar', blob, filename)
  } else {
    formData.append('avatar', {
      uri: imageUri,
      name: filename,
      type: 'image/jpeg',
    } as unknown as Blob)
  }

  return httpClient.post<CharacterProfile>('/characters/avatar', formData)
}
