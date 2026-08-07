import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { Panel, Screen, Text } from '@/shared/components'
import { LoginForm } from '../components/LoginForm'
import { AuthLink } from '../components/AuthLink'

export function LoginScreen() {
  const { t } = useTranslation()

  return (
    <Screen scroll center>
      <View className="mx-auto w-full max-w-md gap-8">
        <View className="items-center gap-2">
          <Text weight="semibold" className="text-xs uppercase tracking-[6px] text-primary">
            {t('common.systemLabel')}
          </Text>
          <Text weight="bold" className="text-center text-4xl text-content">
            {t('auth.login.title')}
          </Text>
          <Text className="max-w-xs text-center text-sm text-content-muted">
            {t('auth.login.subtitle')}
          </Text>
        </View>

        <Panel>
          <LoginForm />
        </Panel>

        <AuthLink href="/register" label={t('auth.login.registerLink')} />
      </View>
    </Screen>
  )
}
