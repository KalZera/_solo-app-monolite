import { useWindowDimensions, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { BottomSheet, Button, HintedScrollView, Text } from '@/shared/components'
import {
  BookOpen,
  CircleUser,
  Flame,
  LayoutDashboard,
  ScrollText,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'

interface TutorialSheetProps {
  visible: boolean
  onClose: () => void
}

// Ordered walkthrough of the core MVP loop. Copy lives in i18n under `tutorial.steps.<key>`.
const STEPS: { key: string; Icon: LucideIcon }[] = [
  { key: 'character', Icon: CircleUser },
  { key: 'quests', Icon: ScrollText },
  { key: 'ranks', Icon: Flame },
  { key: 'complete', Icon: TrendingUp },
  { key: 'attributes', Icon: Sparkles },
  { key: 'track', Icon: LayoutDashboard },
]

// Difficulty ladder, easiest → hardest. Mirrors QUEST_RANKS on the backend (higher rank = more XP).
const RANK_SCALE = ['E', 'D', 'C', 'B', 'A', 'S'] as const

// Fraction of the screen height the scroll area may occupy. Bumped from 0.5 → 0.55 (+10% taller
// sheet) so the pulsing scroll hint has room to breathe below the content.
const CONTENT_MAX_HEIGHT_RATIO = 0.55

/**
 * "How to use this MVP" walkthrough rendered inside the shared BottomSheet. Purely presentational —
 * the caller owns `visible`/`onClose` (auto-shown once by TutorialGate, or re-opened from Profile).
 */
export function TutorialSheet({ visible, onClose }: TutorialSheetProps) {
  const { t } = useTranslation()
  const { height } = useWindowDimensions()

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View className="flex-row items-start gap-3">
        <BookOpen size={22} color={colors.primary} />
        <View className="flex-1 gap-1">
          <Text weight="bold" className="text-base uppercase tracking-[2px] text-content">
            {t('tutorial.title')}
          </Text>
          <Text className="text-sm text-content-muted">{t('tutorial.intro')}</Text>
        </View>
      </View>

      <HintedScrollView style={{ maxHeight: height * CONTENT_MAX_HEIGHT_RATIO }}>
        <View className="gap-3">
          {STEPS.map(({ key, Icon }, index) => (
            <View
              key={key}
              className="flex-row items-start gap-3 rounded-lg border border-line bg-surface-raised/40 p-3"
            >
              <View className="h-9 w-9 items-center justify-center rounded-md border border-primary/40 bg-primary/10">
                <Icon size={18} color={colors.primary} />
              </View>
              <View className="flex-1 gap-1">
                <Text weight="semibold" className="text-sm uppercase tracking-[1px] text-content">
                  {`${index + 1}. ${t(`tutorial.steps.${key}.title`)}`}
                </Text>
                <Text className="text-[13px] leading-5 text-content-muted">
                  {t(`tutorial.steps.${key}.description`)}
                </Text>

                {key === 'ranks' ? (
                  <View className="mt-1.5 gap-1">
                    <View className="flex-row gap-1.5">
                      {RANK_SCALE.map((rank) => (
                        <View
                          key={rank}
                          className="h-7 flex-1 items-center justify-center rounded border border-primary/40 bg-primary/10"
                        >
                          <Text weight="bold" className="text-xs text-primary">
                            {rank}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <View className="flex-row justify-between px-0.5">
                      <Text className="text-[10px] uppercase tracking-[1px] text-content-muted">
                        {t('tutorial.rankScale.easy')}
                      </Text>
                      <Text className="text-[10px] uppercase tracking-[1px] text-content-muted">
                        {t('tutorial.rankScale.hard')}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      </HintedScrollView>

      <Button label={t('tutorial.gotIt')} onPress={onClose} />
    </BottomSheet>
  )
}
