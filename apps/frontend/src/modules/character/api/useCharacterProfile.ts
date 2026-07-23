import { useQuery } from '@tanstack/react-query'
import { mockCharacterProfile } from './character.mock'

async function fetchCharacterProfile() {
  // TODO: swap for `httpClient.get('/characters/me')` once wired to a real session
  return mockCharacterProfile
}

export function useCharacterProfile() {
  return useQuery({
    queryKey: ['character', 'profile'],
    queryFn: fetchCharacterProfile,
  })
}
