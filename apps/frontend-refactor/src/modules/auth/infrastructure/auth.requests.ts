import { httpClient } from '@/shared/api/http-client'
import type {
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
  RegisteredHunter,
} from '../domain/auth.types'

// Identity endpoints manage auth themselves, so they opt out of the client's
// refresh-and-retry to avoid recursion (a failed login must not trigger refresh).
const AUTH_REQUEST = { skipAuthRefresh: true } as const

export function login(input: LoginCredentials): Promise<AuthTokens> {
  return httpClient.post<AuthTokens>('/identity/login', input, AUTH_REQUEST)
}

export function register(input: RegisterCredentials): Promise<RegisteredHunter> {
  return httpClient.post<RegisteredHunter>('/identity/register', input, AUTH_REQUEST)
}

export function refreshSession(): Promise<AuthTokens> {
  return httpClient.post<AuthTokens>('/identity/refresh', undefined, AUTH_REQUEST)
}

export function logout(): Promise<void> {
  return httpClient.post<void>('/identity/logout', undefined, AUTH_REQUEST)
}
