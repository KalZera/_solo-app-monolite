import { Image, View } from 'react-native'
import { Text } from './Text'
import { User } from './icons'
import { cn } from '../utils/cn'
import { colors } from '../theme/colors'

interface AvatarProps {
  uri?: string | null
  name?: string
  size?: number
  className?: string
}

function initials(name?: string): string {
  if (!name) return ''
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/** Square (crop-friendly) portrait with an image, initials, or icon fallback. */
export function Avatar({ uri, name, size = 64, className }: AvatarProps) {
  const dimensions = { width: size, height: size }

  return (
    <View
      className={cn(
        'items-center justify-center overflow-hidden rounded-2xl border border-line bg-surface-raised',
        className,
      )}
      style={dimensions}
    >
      {uri ? (
        <Image source={{ uri }} style={dimensions} resizeMode="cover" />
      ) : name ? (
        <Text weight="bold" className="text-content" style={{ fontSize: size * 0.36 }}>
          {initials(name)}
        </Text>
      ) : (
        <User size={size * 0.5} color={colors.contentMuted} />
      )}
    </View>
  )
}
