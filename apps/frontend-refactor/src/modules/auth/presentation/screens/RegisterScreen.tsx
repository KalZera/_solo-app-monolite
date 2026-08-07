import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { Panel, Screen, Text } from '@/shared/components'
import { RegisterForm } from '../components/RegisterForm'
import { AuthLink } from '../components/AuthLink'

export function RegisterScreen() {
  const { t } = useTranslation()

  return (
    <Screen scroll center>
      <View className="mx-auto w-full max-w-md gap-8">
        <View className="items-center gap-2">
          <Text weight="semibold" className="text-xs uppercase tracking-[6px] text-primary">
            {t('common.systemLabel')}
          </Text>
          <Text weight="bold" className="text-center text-4xl text-content">
            {t('auth.register.title')}
          </Text>
          <Text className="max-w-xs text-center text-sm text-content-muted">
            {t('auth.register.subtitle')}
          </Text>
        </View>

        <Panel>
          <RegisterForm />
        </Panel>

        <AuthLink href="/login" label={t('auth.register.loginLink')} />
      </View>
    </Screen>
  )
}
