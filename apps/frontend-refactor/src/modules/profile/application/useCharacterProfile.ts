import { useQuery } from '@tanstack/react-query'
import { getCharacterProfile } from '../infrastructure/character.requests'
import { characterKeys } from './character.keys'

export function useCharacterProfile() {
  return useQuery({
    queryKey: characterKeys.profile(),
    queryFn: getCharacterProfile,
    retry: false,
  })
}
