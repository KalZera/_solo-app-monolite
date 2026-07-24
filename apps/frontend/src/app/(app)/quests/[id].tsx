import { useLocalSearchParams } from 'expo-router'
import { QuestDetailScreen } from '@/modules/quest/screens/QuestDetailScreen'

export default function QuestDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <QuestDetailScreen questId={id} />
}
