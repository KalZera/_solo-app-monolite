import { useTranslation } from 'react-i18next'
import { Panel, ProgressBar, Text, SquareBox } from '@/shared/components'
import { colors } from '@/shared/theme/colors'
import type { CharacterProfile } from '../../domain/character.types'
import { Flame, HeartPulse, ShieldPlus, Zap } from 'lucide-react-native'
import { cn } from '@/shared/utils/cn'

export function StatusBar() {
  const { t } = useTranslation()
  const healthy = true
  return (
    <Panel className="mt-2 flex flex-row gap-2">
      <SquareBox>
        <HeartPulse color={colors.danger} size={24} />
        <Text className="text-xs uppercase tracking-wide text-primary-hover font-bold pb-2 pt-2">
          {t(`character.screen.HP`)}
        </Text>
        <ProgressBar value={100} max={100} tone="danger" />
      </SquareBox>
      <SquareBox>
        <Flame color={colors.epic} size={24} />
        <Text className="text-xs uppercase tracking-wide text-primary-hover font-bold pb-2 pt-2">
          {t(`character.screen.MP`)}
        </Text>
        <ProgressBar value={100} max={100} tone="epic" />
      </SquareBox>
      <SquareBox>
        <Zap color={colors.legendary} size={24} />
        <Text className="text-xs uppercase tracking-wide text-primary-hover font-bold pb-2 pt-2">
          {t(`character.screen.fatigue`)}
        </Text>
        <ProgressBar value={100} max={100} tone="legendary" />
      </SquareBox>
      <SquareBox>
        <ShieldPlus color={colors.success} size={24} />
        <Text className="text-xs uppercase tracking-wide text-primary-hover font-bold pb-2 pt-2">
          {t(`character.screen.condition`)}
        </Text>
        <Text
          className={cn(
            'text-xs uppercase tracking-wide font-bold ',
            healthy ? 'text-success' : 'text-danger',
          )}
        >
          {healthy ? t(`character.screen.healthy`) : t(`character.screen.poisoned`)}
        </Text>
      </SquareBox>
    </Panel>
  )
}
