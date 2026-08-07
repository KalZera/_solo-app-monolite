import { View } from 'react-native'
import Svg, {
  Circle,
  Defs,
  Line,
  Polygon,
  RadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg'
import { colors } from '@/shared/theme/colors'

const W = 280
const H = 220
const CX = W / 2
const CY = 104
const R = 66
const LABEL_R = 90
const RINGS = [0.4, 0.7, 1]

export interface RadarStat {
  label: string
  value: number
}

function vertex(radius: number, index: number, total: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total
  return {
    x: CX + radius * Math.cos(angle),
    y: CY + radius * Math.sin(angle),
    cos: Math.cos(angle),
  }
}

function ringPoints(radius: number, total: number): string {
  return Array.from({ length: total }, (_, i) => {
    const p = vertex(radius, i, total)
    return `${p.x},${p.y}`
  }).join(' ')
}

/** Pentagon radar chart of the character's attributes (SVG). */
export function AttributeRadar({ stats }: { stats: RadarStat[] }) {
  const total = stats.length
  const max = Math.max(...stats.map((stat) => stat.value), 1)
  const dataPoints = stats
    .map((stat, i) => {
      const p = vertex(R * (stat.value / max), i, total)
      return `${p.x},${p.y}`
    })
    .join(' ')

  return (
    <View className="items-center">
      <Svg width={W} height={H}>
        <Defs>
          <RadialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.primaryHover} stopOpacity={0.5} />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity={0.12} />
          </RadialGradient>
        </Defs>

        {RINGS.map((ratio) => (
          <Polygon
            key={ratio}
            points={ringPoints(R * ratio, total)}
            fill="none"
            stroke={colors.line}
            strokeWidth={1}
          />
        ))}

        {stats.map((stat, i) => {
          const p = vertex(R, i, total)
          return (
            <Line
              key={stat.label}
              x1={CX}
              y1={CY}
              x2={p.x}
              y2={p.y}
              stroke={colors.line}
              strokeWidth={1}
            />
          )
        })}

        <Polygon
          points={dataPoints}
          fill="url(#radarFill)"
          stroke={colors.primaryHover}
          strokeWidth={2}
        />

        {stats.map((stat, i) => {
          const p = vertex(R * (stat.value / max), i, total)
          return <Circle key={stat.label} cx={p.x} cy={p.y} r={2.5} fill={colors.primaryHover} />
        })}

        {stats.map((stat, i) => {
          const p = vertex(LABEL_R, i, total)
          const anchor = Math.abs(p.cos) < 0.25 ? 'middle' : p.cos > 0 ? 'start' : 'end'
          return (
            <SvgText
              key={stat.label}
              x={p.x}
              y={p.y + 3}
              fill={colors.contentMuted}
              fontSize={9}
              fontFamily="Rajdhani_600SemiBold"
              textAnchor={anchor}
            >
              {stat.label.toUpperCase()}
            </SvgText>
          )
        })}
      </Svg>
    </View>
  )
}
