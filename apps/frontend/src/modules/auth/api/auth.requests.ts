import { httpClient } from '@/shared/api/http-client'
import type { LoginInput, LoginResponse } from '../types'

export async function login(input: LoginInput): Promise<LoginResponse> {
  const { data } = await httpClient.post<LoginResponse>('/identity/login', input)
  return data
}

export async function refreshSession(): Promise<LoginResponse> {
  const { data } = await httpClient.post<LoginResponse>('/identity/refresh')
  return data
}

export async function logout(): Promise<void> {
  await httpClient.post('/identity/logout')
}
