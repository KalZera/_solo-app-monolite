import { Image as RNImage, Pressable, View } from 'react-native'
import type { GestureResponderHandlers, ImageStyle, StyleProp } from 'react-native'
import { Pencil, User } from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'
import { cn } from '@/shared/utils/cn'

interface AvatarRingProps {
  /** Diameter of the inner content disc — this is also the crop viewport. */
  disc: number
  uri?: string | null
  onEditPress?: () => void
  /** Pan gesture handlers (from useAvatarCrop) — when set, the disc becomes draggable. */
  panHandlers?: GestureResponderHandlers
  /** Pan/zoom transform for the image (from useAvatarCrop). When set, the image is repositionable. */
  previewStyle?: StyleProp<ImageStyle>
  className?: string
}

const RING_GLOW = {
  shadowColor: colors.primary,
  shadowOpacity: 0.55,
  shadowRadius: 22,
  shadowOffset: { width: 0, height: 0 },
  elevation: 12,
}

/**
 * Glowing "System" avatar disc: a bright cyan ring with faint inner rings and HUD tick marks,
 * holding the chosen image (or the default Hunter placeholder), plus a small edit button. When
 * `panHandlers`/`previewStyle` are provided the disc becomes an interactive crop area (drag + zoom).
 */
export function AvatarRing({
  disc,
  uri,
  onEditPress,
  panHandlers,
  previewStyle,
  className,
}: AvatarRingProps) {
  const outer = disc + 44
  const mid = outer - 16
  const editSize = Math.round(outer * 0.16)
  const tick = 'absolute bg-primary/50'

  return (
    <View
      className={cn('items-center justify-center', className)}
      style={{ width: outer, height: outer }}
    >
      {/* HUD ticks at N / S / E / W */}
      <View
        className={tick}
        style={{ width: 2, height: 10, top: -5, left: '50%', marginLeft: -1 }}
      />
      <View
        className={tick}
        style={{ width: 2, height: 10, bottom: -5, left: '50%', marginLeft: -1 }}
      />
      <View
        className={tick}
        style={{ height: 2, width: 10, left: -5, top: '50%', marginTop: -1 }}
      />
      <View
        className={tick}
        style={{ height: 2, width: 10, right: -5, top: '50%', marginTop: -1 }}
      />

      {/* Bright outer ring + glow */}
      <View
        className="items-center justify-center rounded-full border-2 border-primary"
        style={{ width: outer, height: outer, ...RING_GLOW }}
      >
        {/* Faint mid ring */}
        <View
          className="items-center justify-center rounded-full border border-primary/15"
          style={{ width: mid, height: mid }}
        >
          {/* Content disc — also the crop viewport */}
          <View
            className="items-center justify-center overflow-hidden rounded-full bg-surface-raised/50"
            style={{ width: disc, height: disc }}
            {...panHandlers}
          >
            {uri ? (
              <RNImage
                source={{ uri }}
                style={previewStyle ?? { width: disc, height: disc }}
                resizeMode="cover"
              />
            ) : (
              <User size={Math.round(disc * 0.42)} color={colors.contentMuted} />
            )}
          </View>
        </View>
      </View>

      {/* Edit button */}
      {onEditPress ? (
        <Pressable
          accessibilityRole="button"
          onPress={onEditPress}
          className="absolute items-center justify-center rounded-full border border-primary/60 bg-surface active:bg-surface-raised"
          style={{
            width: editSize,
            height: editSize,
            right: outer * 0.04,
            bottom: outer * 0.04,
            shadowColor: colors.primary,
            shadowOpacity: 0.5,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 0 },
            elevation: 8,
          }}
        >
          <Pencil size={Math.round(editSize * 0.42)} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  )
}
