import { httpClient } from '@/shared/api/http-client'
import type { Character, CharacterProfile, CreateCharacterInput } from '../types'

export async function getCharacterProfile(): Promise<CharacterProfile> {
  const { data } = await httpClient.get<CharacterProfile>('/characters/')
  return data
}

export async function createCharacter(input: CreateCharacterInput): Promise<Character> {
  const { data } = await httpClient.post<Character>('/characters/', input)
  return data
}
