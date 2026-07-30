import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Plus } from '@tamagui/lucide-icons-2'
import { Button, ScrollView, Text, XStack, YStack } from 'tamagui'
import { LoadingIndicator } from '@/shared/components/LoadingIndicator'
import { SystemPanel } from '@/shared/components/SystemPanel'
import { useQuests } from '../api/useQuests'
import { QuestCard } from '../components/QuestCard'
import type { QuestView } from '../types'

const QUEST_VIEWS: QuestView[] = ['available', 'completed_or_expired']

export function QuestListScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const [view, setView] = useState<QuestView>('available')
  const { data: quests, isPending, isError } = useQuests(view)

  return (
    <YStack flex={1} backgroundColor="$soloBg">
      <XStack width="100%" justifyContent="space-between" alignItems="center" padding="$4" paddingTop="$7">
        <Text color="$soloCyan" fontSize="$3" letterSpacing={4} textTransform="uppercase">
          {t('quest.list.title')}
        </Text>
        <Button
          circular
          size="$3"
          backgroundColor="$soloBlue"
          icon={<Plus color="$soloBg" size={18} />}
          onPress={() => router.push('/quests/new')}
        />
      </XStack>

      <XStack width="100%" gap="$2" paddingHorizontal="$4" paddingBottom="$3">
        {QUEST_VIEWS.map((questView) => {
          const isActive = view === questView
          return (
            <Button
              key={questView}
              flex={1}
              size="$3"
              borderRadius="$4"
              borderWidth={1}
              borderColor={isActive ? '$soloCyan' : '$soloBorder'}
              backgroundColor={isActive ? '$soloBlue' : '$soloPanel'}
              onPress={() => setView(questView)}
            >
              <Text
                color={isActive ? '$soloBg' : '$soloTextMuted'}
                fontWeight="700"
                fontSize="$2"
                letterSpacing={1}
                textTransform="uppercase"
              >
                {t(`quest.list.tabs.${questView}`)}
              </Text>
            </Button>
          )
        })}
      </XStack>

      {isPending && <LoadingIndicator label={t('quest.list.loading')} />}

      {isError && (
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$5">
          <Text color="$soloDanger">{t('quest.list.failed')}</Text>
        </YStack>
      )}

      {quests && (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <YStack gap="$3">
            {quests.length === 0 && (
              <SystemPanel>
                <Text color="$soloTextMuted" textAlign="center">
                  {t(view === 'available' ? 'quest.list.empty' : 'quest.list.emptyCompletedOrExpired')}
                </Text>
              </SystemPanel>
            )}
            {quests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </YStack>
        </ScrollView>
      )}
    </YStack>
  )
}
