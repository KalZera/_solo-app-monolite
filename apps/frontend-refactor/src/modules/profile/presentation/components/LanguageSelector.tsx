import { useTranslation } from 'react-i18next'
import { Panel, Select, Text, type SelectOption } from '@/shared/components'
import { useLanguage } from '@/shared/i18n/useLanguage'
import type { SupportedLanguage } from '@/shared/i18n'

export function LanguageSelector() {
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguage()

  const options: SelectOption<SupportedLanguage>[] = [
    { label: t('profile.languageEnglish'), value: 'en' },
    { label: t('profile.languagePortuguese'), value: 'pt' },
  ]

  return (
    <Panel className="gap-3">
      <Text weight="semibold" className="text-xs uppercase tracking-widest text-content-muted">
        {t('profile.language')}
      </Text>
      <Select options={options} value={language} onChange={(value) => setLanguage(value)} />
    </Panel>
  )
}
