import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Text } from './Text'
import { cn } from '../utils/cn'
import { colors } from '../theme/colors'

interface HexagonBadgeProps {
  value: number | ReactNode
  horizontal?: boolean
  size?: number
  fontSize?: number
  className?: string
  classNameLabel?: string
}

const SQRT_3 = Math.sqrt(3)
const STROKE_WIDTH = 2

// Font size shrinks as the digit count grows, so values up to 4 digits (e.g. 1000) still fit
// inside the hexagon without overflowing it — tuned against the reference mockup ("35").
const FONT_SCALE_BY_DIGITS: Record<number, number> = {
  1: 0.34,
  2: 0.34,
  3: 0.27,
  4: 0.21,
}

function fontSizeFor(digitCount: number, size: number): number {
  const scale = FONT_SCALE_BY_DIGITS[digitCount] ?? 0.17
  return Math.round(size * scale)
}

// A regular pointy-top hexagon built from a rectangle (its flat left/right sides) with a
// triangle glued to the top and bottom — the classic CSS/RN border-trick, no SVG involved.
function HexagonShape({ height, color }: { height: number; color: string }) {
  const width = (height * SQRT_3) / 2
  const rectHeight = height / 2
  const triangleHeight = height / 4
  const halfWidth = width / 2

  return (
    <View style={{ width, height }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: halfWidth,
          borderRightWidth: halfWidth,
          borderBottomWidth: triangleHeight,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
        }}
      />
      <View style={{ width, height: rectHeight, backgroundColor: color }} />
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: halfWidth,
          borderRightWidth: halfWidth,
          borderTopWidth: triangleHeight,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: color,
        }}
      />
    </View>
  )
}

/** Sci-fi hexagon frame with content centered inside — mirrors assets/componente-hexagon.png. */
export function HexagonBadge({
  value,
  horizontal = false,
  size = 96,
  fontSize,
  className,
  classNameLabel,
}: HexagonBadgeProps) {
  const label = typeof value === 'number' ? String(Math.trunc(value)) : '0'
  const fontSizeCalc = fontSize ? fontSize : fontSizeFor(label.length, size)
  const hexWidth = (size * SQRT_3) / 2

  return (
    <View
      className={cn('items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <View
        className="absolute items-center justify-center"
        style={[
          { width: hexWidth, height: size },
          horizontal ? { transform: [{ rotate: '90deg' }] } : null,
        ]}
      >
        <HexagonShape height={size} color={colors.primary} />
        <View
          className="absolute items-center justify-center"
          style={{ width: hexWidth, height: size }}
        >
          <HexagonShape height={size - STROKE_WIDTH * 2} color={colors.surface.base} />
        </View>
      </View>
      {typeof value === 'number' ? (
        <Text
          weight="bold"
          className={cn('absolute text-content', classNameLabel)}
          style={{ fontSize: fontSizeCalc }}
          numberOfLines={1}
        >
          {label}
        </Text>
      ) : (
        value
      )}
    </View>
  )
}
