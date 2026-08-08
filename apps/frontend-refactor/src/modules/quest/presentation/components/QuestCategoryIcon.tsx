import { View } from 'react-native'
import {
  BookOpen,
  Heart,
  TrendingUp,
  User,
  Briefcase,
  Users,
  Gamepad2,
  type LucideIcon,
} from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'

// Keyed by the quest category name (lowercased) — mirrors the CATEGORY_NAMES seed on the
// backend and the quest.category.* i18n keys (see locales/en.json / pt.json).
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  estudo: BookOpen,
  saúde: Heart,
  carreira: TrendingUp,
  pessoal: User,
  trabalho: Briefcase,
  social: Users,
  hobby: Gamepad2,
}

const DEFAULT_CATEGORY_ICON = User

interface QuestCategoryIconProps {
  categoryName?: string | null
  size?: number
}

export function QuestCategoryIcon({ categoryName, size = 24 }: QuestCategoryIconProps) {
  const Icon = (categoryName && CATEGORY_ICONS[categoryName.toLowerCase()]) || DEFAULT_CATEGORY_ICON

  return (
    <View className="h-12 w-12 items-center justify-center rounded-full border-2 border-primary">
      <Icon size={size} color={colors.primary} />
    </View>
  )
}
