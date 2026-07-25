import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { getCharacterProfile } from './character.requests'

export function useCharacterProfile() {
  return useQuery({
    queryKey: ['character', 'profile'],
    queryFn: getCharacterProfile,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) return false
      return failureCount < 1
    },
  })
}

export function isCharacterNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404
}
