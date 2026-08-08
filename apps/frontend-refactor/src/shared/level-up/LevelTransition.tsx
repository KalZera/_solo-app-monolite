import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Text } from '../components/Text'
import { ChevronsRight } from '../components/icons'
import { colors } from '../theme/colors'

interface LevelTransitionProps {
  from: number
  to: number
}

/** The "LEVEL 23 » 24" block, with the new level emphasized and glowing. */
export function LevelTransition({ from, to }: LevelTransitionProps) {
  const { t } = useTranslation()

  return (
    <View className="flex-row items-center justify-center gap-3 py-3">
      <View className="items-center">
        <Text className="text-[12px] uppercase tracking-[3px] text-primary">
          {t('levelUp.level')}
        </Text>
        <Text weight="bold" className="text-5xl text-primary">
          {from}
        </Text>
      </View>

      <ChevronsRight size={26} color={colors.primary} />

      <Text
        weight="bold"
        className="text-6xl text-primary-hover"
        style={{ textShadowColor: colors.primaryHover, textShadowRadius: 16 }}
      >
        {to}
      </Text>
    </View>
  )
}
