import { httpClient } from '@/shared/api/http-client'
import type { LoginInput, LoginResponse } from '../types'

export async function login(input: LoginInput): Promise<LoginResponse> {
  const { data } = await httpClient.post<LoginResponse>('/identity/login', input)
  return data
}
