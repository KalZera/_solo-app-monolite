import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '../components/Text'
import { colors } from '../theme/colors'
import type { LevelUpEvent } from './level-up.types'
import { LevelTransition } from './LevelTransition'
import { LevelUpStatsTable } from './LevelUpStatsTable'

/** L-shaped accents at each corner — the Solo Leveling "System window" frame. */
function FrameCorners() {
  const base = 'absolute h-4 w-4 border-primary'
  return (
    <>
      <View className={`${base} left-1.5 top-1.5 border-l-2 border-t-2`} />
      <View className={`${base} right-1.5 top-1.5 border-r-2 border-t-2`} />
      <View className={`${base} bottom-1.5 left-1.5 border-b-2 border-l-2`} />
      <View className={`${base} bottom-1.5 right-1.5 border-b-2 border-r-2`} />
    </>
  )
}

interface LevelUpModalProps {
  event: LevelUpEvent
  onConfirm: () => void
}

export function LevelUpModal({ event, onConfirm }: LevelUpModalProps) {
  const { t } = useTranslation()

  return (
    <Modal transparent visible animationType="fade" statusBarTranslucent onRequestClose={onConfirm}>
      <Pressable
        onPress={onConfirm}
        className="flex-1 items-center justify-center bg-black/75 px-6"
      >
        <Pressable
          onPress={() => undefined}
          className="w-full max-w-[340px] overflow-hidden rounded-lgl border border-primary/50"
          style={{
            shadowColor: colors.primary,
            shadowOpacity: 0.5,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 0 },
            elevation: 12,
          }}
        >
          <LinearGradient
            colors={['#16323F', '#0F2634', '#0B1720']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
          <FrameCorners />

          <View className="gap-4 p-5">
            <Text
              weight="bold"
              className="text-center text-lg uppercase tracking-[6px] text-content"
            >
              {t('levelUp.title')}
            </Text>
            <View className="h-px bg-primary/30" />
            <Text
              weight="semibold"
              className="text-center text-sm uppercase tracking-[2px] text-content"
            >
              {t('levelUp.subtitle')}
            </Text>
            <View className="h-px bg-primary/20" />

            <LevelTransition from={event.fromLevel} to={event.toLevel} />
            <LevelUpStatsTable stats={event.stats} />

            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              className="mt-1 items-center rounded-lg border border-primary/60 bg-primary/10 py-3 active:bg-primary/20"
            >
              <Text
                weight="semibold"
                className="text-sm uppercase tracking-[3px] text-primary-hover"
              >
                {t('levelUp.confirm')}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
