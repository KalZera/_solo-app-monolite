import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

// Access token is kept in the platform's secure storage (Keychain / Keystore on
// native, localStorage on web). The long-lived refresh token never touches JS —
// it lives in an httpOnly cookie owned by the backend.
const TOKEN_KEY = 'solo_leveling_access_token'

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(TOKEN_KEY) ?? null
  }
  return SecureStore.getItemAsync(TOKEN_KEY)
}

export async function setToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(TOKEN_KEY, token)
    return
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(TOKEN_KEY)
    return
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}
