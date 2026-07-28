import { useTranslation } from 'react-i18next'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { LoadingIndicator } from '@/shared/components/LoadingIndicator'
import { SystemPanel } from '@/shared/components/SystemPanel'
import { isCharacterNotFound, useCharacterProfile } from '../api/useCharacterProfile'
import { StatRow } from '../components/StatRow'

export function CharacterScreen() {
  const { t } = useTranslation()
  const { data: character, isPending, isError, error } = useCharacterProfile()

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} backgroundColor="$soloBg">
      <YStack flex={1} alignItems="center" padding="$5" paddingTop="$8" gap="$5">
        <Text color="$soloCyan" fontSize="$3" letterSpacing={4} textTransform="uppercase">
          {t('character.screen.statusWindow')}
        </Text>

        {isPending && <LoadingIndicator label={t('character.screen.loading')} />}

        {isCharacterNotFound(error) && (
          <Text color="$soloTextMuted" paddingTop="$8" textAlign="center">
            {t('character.screen.noHunter')}
          </Text>
        )}

        {isError && !isCharacterNotFound(error) && (
          <Text color="$soloDanger" paddingTop="$8">
            {t('character.screen.failed')}
          </Text>
        )}

        {character && (
          <>
            <SystemPanel width="100%" maxWidth={420} gap="$4">
              <YStack alignItems="center" gap="$1">
                <Text color="$soloText" fontSize={28} fontWeight="800" textAlign="center">
                  {character.name}
                </Text>
                <Text color="$soloTextMuted" fontSize="$3" textAlign="center">
                  {character.title} · {character.class.toUpperCase()}
                </Text>
              </YStack>

              <XStack justifyContent="space-around" borderTopWidth={1} borderColor="$soloBorder" paddingTop="$4">
                <YStack alignItems="center" gap="$1">
                  <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
                    {t('character.screen.level')}
                  </Text>
                  <Text color="$soloCyan" fontSize="$7" fontWeight="800">
                    {character.level}
                  </Text>
                </YStack>
                <YStack alignItems="center" gap="$1">
                  <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
                    {t('character.screen.rank')}
                  </Text>
                  <Text color="$soloCyan" fontSize="$7" fontWeight="800">
                    {character.rank}
                  </Text>
                </YStack>
                <YStack alignItems="center" gap="$1">
                  <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
                    {t('character.screen.power')}
                  </Text>
                  <Text color="$soloCyan" fontSize="$7" fontWeight="800">
                    {character.powerScore}
                  </Text>
                </YStack>
              </XStack>

              <YStack gap="$1.5">
                <XStack justifyContent="space-between">
                  <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
                    {t('character.screen.experience')}
                  </Text>
                  <Text color="$soloTextMuted" fontSize="$2">
                    {character.experience} XP
                  </Text>
                </XStack>
              </YStack>
            </SystemPanel>

            <SystemPanel width="100%" maxWidth={420} gap="$4">
              <Text color="$soloText" fontSize="$5" fontWeight="700">
                {t('character.screen.attributes')}
              </Text>
              <StatRow label={t('character.screen.stats.strength')} value={character.stats.strength} />
              <StatRow label={t('character.screen.stats.intelligence')} value={character.stats.intelligence} />
              <StatRow label={t('character.screen.stats.agility')} value={character.stats.agility} />
              <StatRow label={t('character.screen.stats.vitality')} value={character.stats.vitality} />
              <StatRow label={t('character.screen.stats.luck')} value={character.stats.luck} />
            </SystemPanel>
          </>
        )}
      </YStack>
    </ScrollView>
  )
}
