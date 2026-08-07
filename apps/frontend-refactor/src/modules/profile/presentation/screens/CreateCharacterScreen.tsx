import { Pressable, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Panel, Screen, Text } from '@/shared/components'
import { useSession } from '@/modules/auth/application/useSession'
import { CreateCharacterForm } from '../components/CreateCharacterForm'

export function CreateCharacterScreen() {
  const { t } = useTranslation()
  const { signOut } = useSession()

  return (
    <Screen scroll center>
      <View className="mx-auto w-full max-w-md gap-8">
        <View className="items-center gap-2">
          <Text weight="semibold" className="text-xs uppercase tracking-[6px] text-primary">
            {t('common.systemLabel')}
          </Text>
          <Text weight="bold" className="text-center text-4xl text-content">
            {t('character.create.heading')}
          </Text>
          <Text className="max-w-xs text-center text-sm text-content-muted">
            {t('character.create.subtitle')}
          </Text>
        </View>

        <Panel>
          <CreateCharacterForm />
        </Panel>

        <Pressable
          accessibilityRole="button"
          onPress={() => signOut()}
          className="items-center py-2"
        >
          <Text weight="semibold" className="text-sm text-primary">
            {t('profile.logOff')}
          </Text>
        </Pressable>
      </View>
    </Screen>
  )
}
