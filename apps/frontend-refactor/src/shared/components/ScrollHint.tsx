import { useEffect, useState } from 'react'
import { Animated } from 'react-native'
import { ChevronDown } from './icons'
import { colors } from '../theme/colors'

interface ScrollHintProps {
  /** Diameter of the circular hint, in px. */
  size?: number
}

/**
 * "More below" affordance: a down-chevron inside a circle that continuously pulses, scaling
 * between 100% and 120% of its size. Purely decorative — render it over a scroll area while there
 * is more content, and unmount it once the end is reached (that's what makes the arrow disappear).
 */
export function ScrollHint({ size = 34 }: ScrollHintProps) {
  // Lazy state init keeps a single stable Animated.Value without reading a ref during render.
  const [scale] = useState(() => new Animated.Value(1))

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.2, duration: 600, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [scale])

  return (
    <Animated.View
      className="items-center justify-center rounded-full border border-primary/50 bg-surface-overlay"
      style={{ width: size, height: size, transform: [{ scale }] }}
    >
      <ChevronDown size={Math.round(size * 0.55)} color={colors.primary} />
    </Animated.View>
  )
}
