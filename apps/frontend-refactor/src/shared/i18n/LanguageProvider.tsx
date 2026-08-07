import { useEffect } from 'react'
import type { ReactNode } from 'react'
import i18n from './index'
import { getStoredLanguage } from './language-storage'

export function LanguageProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    getStoredLanguage().then((language) => {
      if (language && language !== i18n.language) {
        i18n.changeLanguage(language)
      }
    })
  }, [])

  return <>{children}</>
}
