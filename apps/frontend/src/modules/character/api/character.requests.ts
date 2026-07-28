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
