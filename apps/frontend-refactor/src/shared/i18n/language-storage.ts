import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { isSupportedLanguage, type SupportedLanguage } from './index'

const LANGUAGE_KEY = 'solo_leveling_language'

export async function getStoredLanguage(): Promise<SupportedLanguage | null> {
  const value =
    Platform.OS === 'web'
      ? (globalThis.localStorage?.getItem(LANGUAGE_KEY) ?? null)
      : await SecureStore.getItemAsync(LANGUAGE_KEY)

  return value && isSupportedLanguage(value) ? value : null
}

export async function setStoredLanguage(language: SupportedLanguage): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(LANGUAGE_KEY, language)
    return
  }
  await SecureStore.setItemAsync(LANGUAGE_KEY, language)
}
