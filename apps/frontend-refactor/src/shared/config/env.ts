/**
 * Centralised, validated access to runtime environment variables.
 * Only `EXPO_PUBLIC_*` variables are available on the client (Expo inlines them).
 */
const DEFAULT_API_URL = 'http://192.168.15.3:3333/api/v1'

export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL,
} as const
