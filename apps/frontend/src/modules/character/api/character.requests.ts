import { httpClient } from '@/shared/api/http-client'
import type {
  AllocateAttributePointInput,
  AllocateAttributePointResult,
  Character,
  CharacterHistoryEntry,
  CharacterProfile,
  CreateCharacterInput,
  Paginated,
} from '../types'

export async function getCharacterProfile(): Promise<CharacterProfile> {
  const { data } = await httpClient.get<CharacterProfile>('/characters/')
  return data
}

export async function createCharacter(input: CreateCharacterInput): Promise<Character> {
  const { data } = await httpClient.post<Character>('/characters/', input)
  return data
}

export async function allocateAttributePoint(
  input: AllocateAttributePointInput,
): Promise<AllocateAttributePointResult> {
  const { data } = await httpClient.post<AllocateAttributePointResult>('/characters/attributes/allocate', input)
  return data
}

interface GetCharacterHistoryParams {
  page: number
  pageSize: number
}

export async function getCharacterHistory(
  params: GetCharacterHistoryParams,
): Promise<Paginated<CharacterHistoryEntry>> {
  const { data } = await httpClient.get<Paginated<CharacterHistoryEntry>>('/characters/history', { params })
  return data
}

export async function uploadCharacterAvatar(croppedImageUri: string): Promise<Character> {
  const filename = croppedImageUri.split('/').pop() ?? `avatar-${Date.now()}.jpg`

  const formData = new FormData()
  formData.append('avatar', {
    uri: croppedImageUri,
    name: filename,
    type: 'image/jpeg',
  } as unknown as Blob)

  const { data } = await httpClient.post<Character>('/characters/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
