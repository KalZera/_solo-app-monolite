import { useMemo, useState } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from './Text'
import { FrameCorners } from './FrameCorners'
import { Calendar, ChevronLeft, ChevronRight } from './icons'
import { cn } from '../utils/cn'
import { colors } from '../theme/colors'

export interface DatePickerProps {
  value: Date | null
  onChange: (date: Date) => void
  label?: string
  placeholder?: string
  error?: string
  hint?: string
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  className?: string
}

const DAYS_PER_WEEK = 7
const WEEKS_PER_GRID = 6

function startOfDay(date: Date): Date {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Sun..Sat grid covering the full month, padded with the leading/trailing days that fill it. */
function buildMonthGrid(monthCursor: Date): Date[][] {
  const firstOfMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1)
  const gridStart = new Date(firstOfMonth)
  gridStart.setDate(gridStart.getDate() - firstOfMonth.getDay())

  const weeks: Date[][] = []
  const cursor = new Date(gridStart)
  for (let week = 0; week < WEEKS_PER_GRID; week++) {
    const days: Date[] = []
    for (let day = 0; day < DAYS_PER_WEEK; day++) {
      days.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(days)
  }
  return weeks
}

/**
 * "System window" calendar picker — an Input-styled trigger that opens a bottom sheet with
 * month navigation and a day grid. Purely presentational/self-contained (its own open/close
 * state); pair with a form via `value`/`onChange`, the same shape as a controlled `Input`.
 */
export function DatePicker({
  value,
  onChange,
  label,
  placeholder,
  error,
  hint,
  minDate,
  maxDate,
  disabled = false,
  className,
}: DatePickerProps) {
  const { t, i18n } = useTranslation()
  const insets = useSafeAreaInsets()
  const [visible, setVisible] = useState(false)
  const [monthCursor, setMonthCursor] = useState(() => startOfDay(value ?? new Date()))

  const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US'

  const weeks = useMemo(() => buildMonthGrid(monthCursor), [monthCursor])

  const monthLabel = useMemo(
    () => monthCursor.toLocaleDateString(locale, { month: 'long', year: 'numeric' }),
    [monthCursor, locale],
  )

  const weekdayLabels = useMemo(() => {
    const aSunday = new Date(2026, 1, 1) // 2026-02-01 is a Sunday
    return Array.from({ length: DAYS_PER_WEEK }, (_, index) => {
      const day = new Date(aSunday)
      day.setDate(aSunday.getDate() + index)
      return day.toLocaleDateString(locale, { weekday: 'short' })
    })
  }, [locale])

  const displayValue = value
    ? value.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  function isDayDisabled(day: Date): boolean {
    if (minDate && day.getTime() < startOfDay(minDate).getTime()) return true
    if (maxDate && day.getTime() > startOfDay(maxDate).getTime()) return true
    return false
  }

  function open() {
    if (disabled) return
    setMonthCursor(startOfDay(value ?? new Date()))
    setVisible(true)
  }

  function selectDay(day: Date) {
    if (isDayDisabled(day)) return
    onChange(day)
    setVisible(false)
  }

  function shiftMonth(delta: number) {
    setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1))
  }

  return (
    <View className={cn('gap-1.5', className)}>
      {label ? (
        <Text weight="semibold" className="text-xs uppercase tracking-widest text-content-muted">
          {label}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={open}
        className={cn(
          'h-12 flex-row items-center justify-between rounded-xl border bg-surface px-4',
          error ? 'border-danger' : 'border-line',
          disabled && 'opacity-50',
        )}
      >
        <Text
          weight="medium"
          className={cn('text-base', displayValue ? 'text-content' : 'text-content-muted')}
        >
          {displayValue ?? placeholder ?? t('common.selectDate')}
        </Text>
        <Calendar size={18} color={colors.contentMuted} />
      </Pressable>

      {error ? (
        <Text className="text-xs text-danger">{error}</Text>
      ) : hint ? (
        <Text className="text-xs text-content-muted">{hint}</Text>
      ) : null}

      <Modal
        transparent
        visible={visible}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setVisible(false)}
      >
        <Pressable onPress={() => setVisible(false)} className="flex-1 justify-end bg-black/75">
          <Pressable
            onPress={() => undefined}
            className="overflow-hidden rounded-t-2xl border-l border-r border-t border-primary/50"
            style={{
              shadowColor: colors.primary,
              shadowOpacity: 0.5,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: -4 },
              elevation: 12,
            }}
          >
            <LinearGradient
              colors={['#16323F', '#0F2634', '#0B1720']}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
            />
            <FrameCorners />

            <View className="items-center pt-2.5">
              <View className="h-1 w-10 rounded-full bg-primary/40" />
            </View>

            <View className="gap-4 p-5" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
              <View className="flex-row items-center justify-between">
                <Pressable
                  accessibilityRole="button"
                  onPress={() => shiftMonth(-1)}
                  className="h-9 w-9 items-center justify-center rounded-lg border border-line active:border-primary"
                >
                  <ChevronLeft size={18} color={colors.content} />
                </Pressable>
                <Text weight="bold" className="text-sm uppercase tracking-[2px] text-content">
                  {monthLabel}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => shiftMonth(1)}
                  className="h-9 w-9 items-center justify-center rounded-lg border border-line active:border-primary"
                >
                  <ChevronRight size={18} color={colors.content} />
                </Pressable>
              </View>

              <View className="flex-row">
                {weekdayLabels.map((weekdayLabel, index) => (
                  <View key={index} className="flex-1 items-center">
                    <Text className="text-[11px] uppercase text-content-muted">{weekdayLabel}</Text>
                  </View>
                ))}
              </View>

              <View className="gap-1.5">
                {weeks.map((week, weekIndex) => (
                  <View key={weekIndex} className="flex-row">
                    {week.map((day) => {
                      const inCurrentMonth = day.getMonth() === monthCursor.getMonth()
                      const selected = value ? isSameDay(day, value) : false
                      const isToday = isSameDay(day, new Date())
                      const dayDisabled = isDayDisabled(day)

                      return (
                        <View key={day.toISOString()} className="flex-1 items-center py-0.5">
                          <Pressable
                            accessibilityRole="button"
                            accessibilityState={{ selected, disabled: dayDisabled }}
                            disabled={dayDisabled}
                            onPress={() => selectDay(day)}
                            className={cn(
                              'h-9 w-9 items-center justify-center rounded-lg',
                              selected && 'border border-primary bg-primary/20',
                              !selected && isToday && 'border border-primary/50',
                              dayDisabled && 'opacity-30',
                            )}
                          >
                            <Text
                              weight={selected ? 'semibold' : 'medium'}
                              className={cn(
                                'text-sm',
                                inCurrentMonth ? 'text-content' : 'text-content-muted',
                                selected && 'text-primary-hover',
                              )}
                            >
                              {day.getDate()}
                            </Text>
                          </Pressable>
                        </View>
                      )
                    })}
                  </View>
                ))}
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => setVisible(false)}
                className="items-center rounded-lg border border-line py-3 active:bg-surface-raised"
              >
                <Text
                  weight="semibold"
                  className="text-sm uppercase tracking-[2px] text-content-muted"
                >
                  {t('common.close')}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
