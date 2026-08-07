import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from './index'
import { setStoredLanguage } from './language-storage'

export function useLanguage() {
  const { i18n } = useTranslation()

  async function setLanguage(language: SupportedLanguage) {
    await i18n.changeLanguage(language)
    await setStoredLanguage(language)
  }

  return {
    language: i18n.language as SupportedLanguage,
    setLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  }
}
